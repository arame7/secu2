import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../AdminLayout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    axios.get('https://127.0.0.1:5000/abc/user')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Erreur lors du chargement des utilisateurs:', error));
  }, []);

  // Supprimer un utilisateur
  const handleDelete = (id) => {
    setUserToDelete(id);
    setOpenDialog(true);
  };

  // Confirmer la suppression de l'utilisateur
  const handleConfirmDelete = () => {
    axios.delete(`https://127.0.0.1:5000/abc/user/${userToDelete}`)
      .then(() => {
        setSnackbarMessage('Utilisateur supprimé avec succès!');
        setSnackbarOpen(true);
        setUsers(users.filter(user => user.id !== userToDelete));
        setOpenDialog(false);
      })
      .catch(error => console.error('Erreur lors de la suppression de l\'utilisateur:', error));
  };

  // Fermer le Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Fermer le dialogue de confirmation
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserToDelete(null);
  };

  return (
    <AdminLayout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Gestion des Utilisateurs
        </Typography>
        <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nom d'utilisateur</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Téléphone</strong></TableCell>
                <TableCell><strong>Adresse</strong></TableCell>
                <TableCell><strong>Est Admin</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.nom_utilisateur}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.tel}</TableCell>
                  <TableCell>{user.adresse}</TableCell>
                  <TableCell>{user.est_admin ? 'Oui' : 'Non'}</TableCell>
                  <TableCell>
                    <IconButton color="secondary" onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirmer la suppression"}
          </DialogTitle>
          <DialogContent>
            <DialogContent>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
            </DialogContent>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Annuler
            </Button>
            <Button onClick={handleConfirmDelete} color="primary" autoFocus>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default UserManagement;
