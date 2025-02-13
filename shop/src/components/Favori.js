import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { blue, teal, grey } from "@mui/material/colors";

const Favori = ({ user, setUser }) => {
  const [favoris, setFavoris] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  
  useEffect(() => {
    axios
      .get("https://127.0.0.1:5000/abc/products/favoris", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setFavoris(response.data);
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors du chargement des favoris");
        setSnackbarOpen(true);
      });
  }, []);

  return (
    <Box>
      {/* Bannière d'accueil */}
      <Box
        sx={{
          backgroundColor: blue[800],
          color: "white",
          textAlign: "center",
          py: 5,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          🛍️ Bienvenue sur E-Shop
        </Typography>
        <Typography variant="h4" fontWeight="bold" color="orange">
          {user?.nom_utilisateur || "Identifiez-vous"}
        </Typography>
        <Typography variant="h6" mt={1}>
          Découvrez nos meilleures offres et promotions !
        </Typography>
      </Box>

      {/* Liste des favoris */}
      <Container sx={{ py: 5 }}>
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          mb={3}
          color={teal[700]}
        >
          Vos Favoris
        </Typography>
        <Grid container spacing={4}>
          {favoris.map((favori) => (
            <Grid item key={favori.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 4,
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": { transform: "scale(1.05)" },
                  bgcolor: grey[100],
                }}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={
                    favori.image_url
                      ? `https://127.0.0.1:5000/abc/products/static${favori.image_url}`
                      : "/placeholder.png"
                  }
                  alt={favori.nom}
                  sx={{ objectFit: "cover", borderRadius: "10px 10px 0 0" }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color={blue[700]}>
                    {favori.nom}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mt={1}>
                    💰 {favori.prix} FCFA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Favori;
