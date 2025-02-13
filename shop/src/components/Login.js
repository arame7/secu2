import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importation du CSS de React Toastify

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook pour la redirection

  // Regex pour valider l'email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation email
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }

    // Vérification du mot de passe
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://127.0.0.1:5000/abc/user/connexion", { 
      
      email:email,
      
      mot_de_passe :password });

      // Stockage du token
      localStorage.setItem("token", response.data.access_token);
      
      // Récupération du statut d'administrateur
      localStorage.setItem('est_admin', response.data.est_admin);

      // Succès
      toast.success("Connexion réussie !");
      

      // Redirection après connexion réussie
      if ( response.data.est_admin === true) {
        navigate("/admin"); // Redirection vers la page d'administration
      } else {
        navigate("/"); // Redirection vers la page de compte utilisateur
      }
    } catch (error) {
      // Gestion des erreurs
      toast.error(error.response?.data?.message || "Échec de la connexion. Vérifiez vos informations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Connexion
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={email && !emailRegex.test(email)}
            helperText={email && !emailRegex.test(email) ? "Adresse email invalide" : ""}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={password && password.length < 6}
            helperText={password && password.length < 6 ? "Mot de passe trop court (min 6 caractères)" : ""}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2 }}
            disabled={loading} // Désactiver le bouton pendant le chargement
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
          </Button>
        </form>

        <Typography align="center" sx={{ mt: 2 }}>
          Pas encore inscrit ? <Link to="/register">Créer un compte</Link>
        </Typography>
      </Box>

      {/* Ajout du ToastContainer pour afficher les notifications */}
      <ToastContainer />
    </Container>
  );
};

export default Login;
