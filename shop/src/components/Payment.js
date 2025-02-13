import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { yellow, teal } from "@mui/material/colors";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Payment = ({ user }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [methodePaiement, setMethodePaiement] = useState("");
  const [montant, setMontant] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const commandeId = location.state?.commandeId;
  const totalPrix = location.state?.totalPrix;

  useEffect(() => {
    if (!commandeId) {
      setSnackbarMessage("ID de commande manquant");
      setSnackbarOpen(true);
      navigate("/"); // Redirect to home or another appropriate page
    }
    if (totalPrix) {
      setMontant(totalPrix.toString());
    }
  }, [commandeId, navigate, totalPrix]);

  const handlePayment = () => {
    if (!methodePaiement || !montant) {
      setSnackbarMessage("Veuillez remplir tous les champs");
      setSnackbarOpen(true);
      return;
    }

    axios
      .post(
        `https://127.0.0.1:5000/abc/cart/effectuer_paiement/${commandeId}`,
        {
          methode_paiement: methodePaiement,
          montant: parseFloat(montant),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        setSnackbarMessage("Paiement effectué avec succès !");
        setSnackbarOpen(true);
        navigate("/"); // Redirect to home or another appropriate page
      })
      .catch(() => {
        setSnackbarMessage("Erreur lors du paiement");
        setSnackbarOpen(true);
      });
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={3}>
        Effectuer le Paiement
      </Typography>

      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: "400px",
          margin: "0 auto",
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          label="Méthode de Paiement"
          value={methodePaiement}
          onChange={(e) => setMethodePaiement(e.target.value)}
          required
        />
        <TextField
          label="Montant"
          type="number"
          disabled
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          required
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: teal[500],
            "&:hover": { backgroundColor: yellow[700] },
            mt: 2,
          }}
          onClick={handlePayment}
        >
          Effectuer le Paiement
        </Button>
      </Box>

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

export default Payment;
