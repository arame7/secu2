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

const PaymentManagement = () => {
  const [paiements, setPaiements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch all paiements
  useEffect(() => {
    axios.get('https://127.0.0.1:5000/abc/payments/paiements')
      .then(response => {
        setPaiements(response.data);
      })
      .catch(error => {
        setSnackbarMessage('Erreur lors du chargement des paiements');
        setSnackbarOpen(true);
      });
  }, []);

  // Open dialog for paiement details
  const handleOpenDialog = (paiement) => {
    setSelectedPaiement(paiement);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPaiement(null);
  };

  // Annuler un paiement
  const handleAnnulerPaiement = (paiementId) => {
    axios.delete(`https://127.0.0.1:5000/abc/payments/annuler_paiement/${paiementId}`)
      .then(() => {
        setSnackbarMessage('Paiement annulé avec succès');
        setSnackbarOpen(true);
        setPaiements(paiements.filter(paiement => paiement.id !== paiementId)); // Remove the paiement from the list
      })
      .catch(error => {
        setSnackbarMessage('Erreur lors de l\'annulation du paiement');
        setSnackbarOpen(true);
      });
  };

  return (
    <AdminLayout>
      <Container>
        <h2>Gestion des Paiements</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Méthode de Paiement</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date de Création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paiements.map(paiement => (
              <TableRow key={paiement.id}>
                <TableCell>{paiement.id}</TableCell>
                <TableCell>{paiement.montant}</TableCell>
                <TableCell>{paiement.methode_paiement}</TableCell>
                <TableCell>{paiement.statut}</TableCell>
                <TableCell>{new Date(paiement.date_creation).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog(paiement)}
                  >
                    Détails
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleAnnulerPaiement(paiement.id)}
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
          <DialogTitle>Détails du Paiement</DialogTitle>
          <DialogContent>
            {selectedPaiement && (
              <div>
                <p><strong>Montant:</strong> {selectedPaiement.montant}</p>
                <p><strong>Méthode de Paiement:</strong> {selectedPaiement.methode_paiement}</p>
                <p><strong>Statut:</strong> {selectedPaiement.statut}</p>
                <p><strong>Date de Création:</strong> {new Date(selectedPaiement.date_creation).toLocaleString()}</p>
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

export default PaymentManagement;
