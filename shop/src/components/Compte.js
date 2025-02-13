import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Avatar, Button, Divider, CircularProgress } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { blue, teal, grey } from "@mui/material/colors";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Compte = ( {user , setUser}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("https://127.0.0.1:5000/abc/user/profil", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des informations de l'utilisateur:", error);
        setError("Erreur lors de la récupération des informations de l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await axios.post("https://127.0.0.1:5000/abc/user/logout", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="body1" color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        {/* Avatar avec ombre et effet de survol */}
        <Avatar
          sx={{
            bgcolor: blue[700],
            width: 100,
            height: 100,
            boxShadow: 3,
            "&:hover": { transform: "scale(1.1)", transition: "transform 0.3s" },
          }}
        >
          <AccountCircle fontSize="large" />
        </Avatar>

          <>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: grey[800] }}>{user.nom_utilisateur}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
            <Divider sx={{ width: "100%", my: 3 }} />

            {/* Boutons avec transitions */}
            <Button
              variant="contained"
              sx={{
                bgcolor: teal[500],
                "&:hover": { bgcolor: teal[700] },
                width: "100%",
                py: 1.5,
                mb: 2,
                borderRadius: 3,
                transition: "background-color 0.3s, transform 0.3s",
                "&:active": { transform: "scale(0.98)" },
              }}
            >
              Modifier le profil
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              sx={{
                width: "100%",
                py: 1.5,
                borderRadius: 3,
                transition: "background-color 0.3s, transform 0.3s",
                "&:hover": { bgcolor: grey[300] },
                "&:active": { transform: "scale(0.98)" },
              }}
            >
              Se déconnecter
            </Button>
          </>
        
      </Box>
    </Container>
  );
};

export default Compte;
