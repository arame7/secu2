import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Snackbar,
  Alert,
  Box,
  IconButton,
  Card,
  CardMedia,
} from "@mui/material";
import { yellow, teal, red } from "@mui/material/colors";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";

const Cart = ({ panier, setPanier, user, setUser }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios
        .get("https://127.0.0.1:5000/abc/cart/panier", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setPanier(response.data.items);
        })
        .catch(() => {
          setSnackbarMessage("Erreur lors du chargement du panier");
          setSnackbarOpen(true);
        });
    }
  }, [user, setPanier]);

  const handleQuantityChange = (index, increment) => {
    const newPanier = [...panier];
    newPanier[index].quantite += increment;
    if (newPanier[index].quantite > 0) {
      updatePanierItem(newPanier[index]);
    } else {
      removePanierItem(newPanier[index].id);
    }
  };

  const handleRemoveProduct = (index) => {
    const produit = panier[index];
    removePanierItem(produit.id);
  };

  const updatePanierItem = (produit) => {
    axios
      .put(
        `https://127.0.0.1:5000/abc/cart/modifier_quantite_panier/${produit.id}`,
        { quantite: produit.quantite },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        setPanier((prevPanier) =>
          prevPanier.map((item) =>
            item.id === produit.id ? response.data : item
          )
        );
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors de la mise à jour du panier");
        setSnackbarOpen(true);
      });
  };

  const removePanierItem = (panierId) => {
    axios
      .delete(
        `https://127.0.0.1:5000/abc/cart/supprimer_du_panier/${panierId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then(() => {
        setPanier((prevPanier) =>
          prevPanier.filter((item) => item.id !== panierId)
        );
      })
      .catch(() => {
        setSnackbarMessage(
          "Erreur lors de la suppression du produit du panier"
        );
        setSnackbarOpen(true);
      });
  };

  const total = panier.reduce(
    (sum, produit) => sum + produit.produit.prix * produit.quantite,
    0
  );

  const handlePasserCommande = () => {
    if (panier.length === 0) {
      setSnackbarMessage("Votre panier est vide !");
      setSnackbarOpen(true);
      return;
    }

    axios
      .post(
        "https://127.0.0.1:5000/abc/cart/creer_commande",{},

        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        setSnackbarMessage("Commande passée avec succès !");
        setSnackbarOpen(true);
        setPanier([]);
        navigate("/PayerCommande", { state: { commandeId: response.data.id, totalPrix: total } });
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors de la commande.");
        setSnackbarOpen(true);
      });
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={3}>
        <ShoppingCartIcon sx={{ fontSize: 35, mr: 1 }} />
        Votre Panier
      </Typography>

      {panier.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Votre panier est vide.
        </Typography>
      ) : (
        <Table>
          <TableHead sx={{ backgroundColor: teal[100] }}>
            <TableRow>
              <TableCell align="center">Image</TableCell>
              <TableCell>Produit</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {panier.map((produit, index) => (
              <TableRow key={index} hover>
                <TableCell align="center">
                  <Card sx={{ width: 80, height: 80, borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      image={
                        produit.produit.image_url
                          ? `https://127.0.0.1:5000/abc/products/static${produit.produit.image_url}`
                          : "/placeholder.png"
                      }
                      alt={produit.produit.nom}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Card>
                </TableCell>
                <TableCell>{produit.produit.nom}</TableCell>
                <TableCell>{produit.produit.prix} FCFA</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleQuantityChange(index, 1)}
                  >
                    <AddIcon />
                  </IconButton>
                  {produit.quantite}
                  <IconButton
                    color="secondary"
                    onClick={() => handleQuantityChange(index, -1)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    sx={{ color: red[500] }}
                    onClick={() => handleRemoveProduct(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {panier.length > 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Total : {total.toLocaleString()} FCFA
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: teal[500],
              "&:hover": { backgroundColor: yellow[700] },
              mt: 2,
            }}
            onClick={handlePasserCommande}
          >
            Passer la commande
          </Button>
        </Box>
      )}

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
    </Container>
  );
};

export default Cart;
