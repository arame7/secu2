import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Assurez-vous d'importer le CSS

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tel, setTel] = useState("");
  const [adresse, setAdresse] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Champ pour la confirmation

  const navigate = useNavigate();
  // Regex pour valider l'email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Regex pour valider le mot de passe (min 8 caractères, incluant majuscule, minuscule, chiffre et caractère spécial)
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification si les mots de passe correspondent
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    // Vérification de l'email avec regex
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer un email valide.");
      return;
    }

    // Vérification du mot de passe avec regex
    if (!passwordRegex.test(password)) {
      toast.error(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial."
      );
      return;
    }

    try {
      const response = await axios.post(
        "https://127.0.0.1:5000/abc/user/inscription",
        {
          nom_utilisateur: name,
          email: email,
          mot_de_passe: password,
          tel: tel,
          adresse: adresse,
        }
      );
  
      toast.success("Inscription réussie !");
      navigate('/login');

      
    } catch (err) {
      toast.error(
        err.response?.data?.description || "Une erreur est survenue."
      );
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Inscription
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom"
            variant="outlined"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Numero de telephone"
            variant="outlined"
            margin="normal"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Adresse"
            variant="outlined"
            margin="normal"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email" // Cela active la validation de base du navigateur pour l'email
            error={!emailRegex.test(email)} // Affichage de l'erreur si l'email est invalide
            helperText={!emailRegex.test(email) && "Email invalide"} // Aide utilisateur
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
            error={!passwordRegex.test(password)} // Affichage de l'erreur si le mot de passe est invalide
            helperText={
              !passwordRegex.test(password) &&
              "Mot de passe trop faible. Il doit comporter 8 caractères, une majuscule, un chiffre et un caractère spécial."
            }
          />
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={confirmPassword && password !== confirmPassword} // Affichage de l'erreur si les mots de passe ne correspondent pas
            helperText={
              confirmPassword &&
              password !== confirmPassword &&
              "Les mots de passe ne correspondent pas."
            }
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2 }}
          >
            S'inscrire
          </Button>
        </form>

        <Typography align="center" sx={{ mt: 2 }}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </Typography>
      </Box>

      {/* Ajouter ToastContainer pour afficher les notifications */}
      <ToastContainer />
    </Container>
  );
};

export default Register;
