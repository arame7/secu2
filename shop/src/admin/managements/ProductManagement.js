import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent as DialogContentMUI,
  DialogActions,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import AdminLayout from "../AdminLayout";

const ProductManagement = () => {
  const [produits, setProduits] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prix: "",
    description: "",
    stock: "",
    imageUrl: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch all products
  useEffect(() => {
    axios
      .get("https://127.0.0.1:5000/abc/products/produits")
      .then((response) => setProduits(response.data))
      .catch(() => {
        setSnackbarMessage("Erreur lors du chargement des produits");
        setSnackbarOpen(true);
      });
  }, []);

  // Dropzone for image upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const data = new FormData();
      data.append("file", file);

      axios
        .post("https://127.0.0.1:5000/abc/products/upload", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          setFormData((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
          setSnackbarMessage("Image téléchargée avec succès!");
          setSnackbarOpen(true);
        })
        .catch(() => {
          setSnackbarMessage("Erreur lors du téléchargement de l'image");
          setSnackbarOpen(true);
        });
    },
  });

  // Add new product
  const handleAddProduct = () => {
    axios
      .post("https://127.0.0.1:5000/abc/products/ajouter_produit", formData)
      .then((response) => {
        setSnackbarMessage("Produit ajouté avec succès");
        setSnackbarOpen(true);
        setProduits([...produits, response.data]); // Update the list with the new product
        setFormData({
          nom: "",
          prix: "",
          description: "",
          stock: "",
          imageUrl: "",
        }); // Reset form
        setOpenDialog(false); // Close the dialog
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors de l'ajout du produit");
        setSnackbarOpen(true);
      });
  };

  // Edit product
  const handleEditProduct = () => {
    axios
      .put(
        `https://127.0.0.1:5000/abc/products/modifier_produit/${editingProduct}`,
        formData
      )
      .then((response) => {
        setSnackbarMessage("Produit modifié avec succès");
        setSnackbarOpen(true);
        setProduits(
          produits.map((produit) =>
            produit.id === editingProduct ? response.data : produit
          )
        );
        setFormData({
          nom: "",
          prix: "",
          description: "",
          stock: "",
          imageUrl: "",
        }); // Reset form
        setOpenDialog(false); // Close the dialog
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors de la modification du produit");
        setSnackbarOpen(true);
      });
  };

  // Delete product
  const handleDeleteProduct = (produitId) => {
    axios
      .delete(`https://127.0.0.1:5000/abc/products/supprimer_produit/${produitId}`)
      .then(() => {
        setSnackbarMessage("Produit supprimé avec succès");
        setSnackbarOpen(true);
        setProduits(produits.filter((produit) => produit.id !== produitId)); // Remove the product from the list
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors de la suppression du produit");
        setSnackbarOpen(true);
      });
  };

  // Open dialog for adding/editing product
  const handleOpenDialog = (produit = null) => {
    if (produit) {
      setFormData(produit);
      setEditingProduct(produit.id);
    } else {
      setFormData({
        nom: "",
        prix: "",
        description: "",
        stock: "",
        imageUrl: "",
      });
      setEditingProduct(null);
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  return (
    <AdminLayout>
      <div>
        <h2>Gestion des produits</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          style={{ marginBottom: "20px" }}
        >
          Ajouter un produit
        </Button>
        <Grid container spacing={3}>
          {produits.map((produit) => (
            <Grid item xs={12} sm={6} md={4} key={produit.id}>
              <Card sx={{ maxWidth: 345, margin: "auto" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={produit.image_url ? `https://127.0.0.1:5000${produit.image_url}` : "/placeholder.png"}
                  alt={produit.nom}
                  style={{ objectFit: "cover" }}
                />
                <CardContent>
                  <h3>{produit.nom}</h3>
                  <p>{produit.description}</p>
                  <p><strong>Prix:</strong> {produit.prix} FCFA</p>
                  <p><strong>Stock:</strong> {produit.stock}</p>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOpenDialog(produit)}
                    startIcon={<EditIcon />}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteProduct(produit.id)}
                    startIcon={<DeleteIcon />}
                  >
                    Supprimer
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {editingProduct ? "Modifier un produit" : "Ajouter un produit"}
          </DialogTitle>
          <DialogContentMUI>
            <TextField
              label="Nom"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Prix"
              value={formData.prix}
              onChange={(e) =>
                setFormData({ ...formData, prix: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Stock"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <div
              {...getRootProps()}
              style={{
                border: "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <input {...getInputProps()} />
              <p>
                Glissez-déposez une image ou cliquez pour sélectionner un
                fichier
              </p>
            </div>
            <div>
              {formData.imageUrl && (
                <img src={formData.imageUrl} alt="Produit" width="100" />
              )}
            </div>
          </DialogContentMUI>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Annuler
            </Button>
            <Button
              onClick={editingProduct ? handleEditProduct : handleAddProduct}
              color="primary"
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
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
      </div>
    </AdminLayout>
  );
};

export default ProductManagement;
