import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Snackbar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { Alert } from '@mui/material';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);  // To track errors
  const [success, setSuccess] = useState(false);  // To track successful logout

  const handleLogout = () => {
    axios.post('https://127.0.0.1:5000/abc/user/logout',{}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,  // Envoie le token JWT dans les headers
      },
    })
    .then(() => {
      localStorage.removeItem('token');  // Enlève le token du localStorage après la déconnexion
      setSuccess(true);  // Affiche un message de succès
      navigate('/');  // Redirige vers la page d'accueil
    })
    .catch(error => {
      console.error('Erreur lors de la déconnexion:', error);
      setError('Une erreur s\'est produite lors de la déconnexion.');  // Gère l'erreur
    });
  };
  
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1, textAlign: 'center' }}>
            Tableau de Bord Admin
          </Typography>
          <Button color="inherit" component={Link} to="/admin/users" startIcon={<PeopleIcon />} aria-label="Gestion des utilisateurs">
            Utilisateurs
          </Button>
          <Button color="inherit" component={Link} to="/admin/produits" startIcon={<InventoryIcon />} aria-label="Gestion des produits">
            Produits
          </Button>
          <Button color="inherit" component={Link} to="/admin/commandes" startIcon={<ShoppingCartIcon />} aria-label="Gestion des commandes">
            Commandes
          </Button>
          <Button color="inherit" component={Link} to="/admin/paiements" startIcon={<PaymentIcon />} aria-label="Gestion des paiements">
            Paiements
          </Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} aria-label="Se déconnecter">
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>
      
      {/* Feedback notification */}
      <Container style={{ marginTop: '20px' }}>
        {children}
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Déconnexion réussie !
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminLayout;
