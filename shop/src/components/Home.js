import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { blue, teal, grey } from "@mui/material/colors";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import { Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PendingOrders from "./PandingOrders"; // Import the PendingOrders component

const Home = ({ panier, setPanier, user, setUser }) => {
  const [produits, setProduits] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://127.0.0.1:5000/abc/products/produits")
      .then((response) => {
        setProduits(response.data);
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors du chargement des produits");
        setSnackbarOpen(true);
      });
  }, []);

  const handleOpenDialog = (produit) => {
    setSelectedProduit(produit);
    setQuantite(1);
    setDialogOpen(true);
  };

  const handleAddPanier = () => {
    if (quantite < 1) {
      setSnackbarMessage("Veuillez entrer une quantité valide");
      setSnackbarOpen(true);
      return;
    }

    if (quantite > selectedProduit.stock) {
      setSnackbarMessage(
        "La quantité sélectionnée dépasse le stock disponible"
      );
      setSnackbarOpen(true);
      return;
    }

    axios
      .post(
        `https://127.0.0.1:5000/abc/cart/ajouter_au_panier/${selectedProduit.id}`,
        { quantite },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setSnackbarMessage("Produit ajouté au panier avec succès");
        setSnackbarOpen(true);
        setDialogOpen(false);
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors de l'ajout au panier");
        setSnackbarOpen(true);
      });
  };

  const handleViewDetails = (produitId) => {
    navigate(`/produit/${produitId}`);
  };

  const handleAddFavori = async (produitId) => {
    try {
      await axios.post(
        `https://127.0.0.1:5000/abc/products/ajouter_favori/${produitId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSnackbarMessage("Produit ajouté aux favoris avec succès");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris:", error);
      setSnackbarMessage("Erreur lors de l'ajout aux favoris");
      setSnackbarOpen(true);
    }
  };

  const handleAddCommentaire = async (produitId) => {
    try {
      const response = await axios.post(
        `https://127.0.0.1:5000/abc/products/ajouter_commentaire/${produitId}`,
        { contenu: "Ceci est un commentaire" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSnackbarMessage("Commentaire ajouté avec succès");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      setSnackbarMessage("Erreur lors de l'ajout du commentaire");
      setSnackbarOpen(true);
    }
  };

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

      {/* Liste des produits */}
      <Container sx={{ py: 5 }}>
        {/* Bouton pour voir ces favoris */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/favoris")}
        >
          Favoris
        </Button>

        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          mb={3}
          color={teal[700]}
        >
          Nos Produits
        </Typography>
        <Grid container spacing={4}>
          {produits.map((produit) => (
            <Grid item key={produit.id} xs={12} sm={6} md={4} lg={3}>
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
                    produit.image_url
                      ? `https://127.0.0.1:5000/abc/products/static${produit.image_url}`
                      : "/placeholder.png"
                  }
                  alt={produit.nom}
                  sx={{ objectFit: "cover", borderRadius: "10px 10px 0 0" }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color={blue[700]}>
                    {produit.nom}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mt={1}>
                    💰 {produit.prix} FCFA
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpenDialog(produit)}
                    >
                      <AddShoppingCartIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(produit.id)}
                    >
                      <Visibility />
                    </IconButton>

                    {user && (
                      <>
                        <IconButton
                          color="error"
                          onClick={() => handleAddFavori(produit.id)}
                        >
                          <FavoriteIcon />
                        </IconButton>
                        <IconButton
                          color="warning"
                          onClick={() => handleAddCommentaire(produit.id)}
                        >
                          <CommentIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Boîte de dialogue pour choisir la quantité */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold", color: blue[700] }}>
          🛒 Choisir la quantité
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {selectedProduit?.nom} - {selectedProduit?.prix} FCFA
          </Typography>
          <TextField
            type="number"
            label="Quantité"
            value={quantite}
            onChange={(e) =>
              setQuantite(Math.max(1, parseInt(e.target.value) || 1))
            }
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            color="secondary"
            sx={{ textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddPanier}
            color="primary"
            variant="contained"
            startIcon={<ShoppingCartCheckoutIcon />}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Ajouter au panier
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Liste des commandes en attente */}
      <PendingOrders user={user} />
    </Box>
  );
};

export default Home;
