import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import AdminLayout from '../AdminLayout';

const OrderManagement = () => {
  const [commandes, setCommandes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch all commandes
  useEffect(() => {
    axios.get('https://127.0.0.1:5000/abc/orders/commandes_admin')
      .then(response => {
        setCommandes(response.data);
      })
      .catch(error => {
        setSnackbarMessage('Erreur lors du chargement des commandes');
        setSnackbarOpen(true);
      });
  }, []);

  // Open dialog for commande details
  const handleOpenDialog = (commande) => {
    setSelectedCommande(commande);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommande(null);
  };

  // Annuler une commande
  const handleAnnulerCommande = (commandeId) => {
    axios.delete(`https://127.0.0.1:5000/abc/orders/annuler_commande/${commandeId}`)
      .then(() => {
        setSnackbarMessage('Commande annulée avec succès');
        setSnackbarOpen(true);
        setCommandes(commandes.filter(commande => commande.id !== commandeId)); // Remove the commande from the list
      })
      .catch(error => {
        setSnackbarMessage('Erreur lors de l\'annulation de la commande');
        setSnackbarOpen(true);
      });
  };

  return (
    <AdminLayout>
      <Container>
        <h2>Gestion des Commandes</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom Client</TableCell>
              <TableCell>Email Client</TableCell>
              <TableCell>Téléphone Client</TableCell>
              <TableCell>Adresse Livraison</TableCell>
              <TableCell>Total Prix</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commandes.map(commande => (
              <TableRow key={commande.id}>
                <TableCell>{commande.id}</TableCell>
                <TableCell>{commande.nom_client}</TableCell>
                <TableCell>{commande.email_client}</TableCell>
                <TableCell>{commande.tel_client}</TableCell>
                <TableCell>{commande.adresse_livraison}</TableCell>
                <TableCell>{commande.total_prix}</TableCell>
                <TableCell>{commande.statut}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog(commande)}
                  >
                    Détails
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleAnnulerCommande(commande.id)}
                    startIcon={<DeleteIcon />}
                  >
                    Annuler
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Détails de la Commande</DialogTitle>
          <DialogContent>
            {selectedCommande && (
              <div>
                <p><strong>Nom Client:</strong> {selectedCommande.nom_client}</p>
                <p><strong>Email Client:</strong> {selectedCommande.email_client}</p>
                <p><strong>Téléphone Client:</strong> {selectedCommande.tel_client}</p>
                <p><strong>Adresse Livraison:</strong> {selectedCommande.adresse_livraison}</p>
                <p><strong>Total Prix:</strong> {selectedCommande.total_prix}</p>
                <p><strong>Statut:</strong> {selectedCommande.statut}</p>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default OrderManagement;
