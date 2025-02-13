import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { grey, deepPurple } from "@mui/material/colors";

const Detail = () => {
  const { produitId } = useParams();
  const [produit, setProduit] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  // Fetch produit details
  useEffect(() => {
    axios
      .get(`https://127.0.0.1:5000/abc/products/produit/${produitId}`)
      .then((response) => {
        setProduit(response.data);
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors du chargement des détails du produit");
        setSnackbarOpen(true);
      });
  }, [produitId]);

  // Retourner à la page d'accueil
  const handleReturn = () => {
    navigate("/");
  };

  if (!produit) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Typography variant="h5" color="text.secondary">
          Chargement...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Bouton Retour stylisé */}
      <Button
        variant="contained"
        onClick={handleReturn}
        sx={{
          backgroundColor: deepPurple[500],
          "&:hover": { backgroundColor: deepPurple[700] },
          mb: 3,
          textTransform: "none",
          fontWeight: "bold",
        }}
      >
        ← Retour à l'accueil
      </Button>

      {/* Carte du produit */}
      <Card sx={{ maxWidth: 500, borderRadius: 3, boxShadow: 5, overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="300"
          image={produit.image_url ? `https://127.0.0.1:5000/abc/products/static${produit.image_url}` : "/placeholder.png"}
          alt={produit.nom}
          sx={{ objectFit: "cover" }}
        />
        <CardContent sx={{ bgcolor: grey[100], p: 3 }}>
          <Typography variant="h4" fontWeight="bold" color={deepPurple[700]} mb={2} textAlign="center">
            {produit.nom}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {produit.description}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="h6" fontWeight="bold" color={deepPurple[600]}>
              Prix : {produit.prix} FCFA
            </Typography>
            <Typography variant="body1" fontWeight="bold" color={produit.stock > 0 ? "green" : "red"}>
              {produit.stock > 0 ? `Stock : ${produit.stock}` : "Rupture de stock"}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar pour affichage des messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Detail;
