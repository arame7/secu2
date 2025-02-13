import React, { useState, useEffect } from "react";
import { Container, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, CircularProgress, Button } from "@mui/material";
import { teal, grey } from "@mui/material/colors";
import PaymentIcon from "@mui/icons-material/Payment";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PendingOrders = ({ user }) => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios
        .get("https://127.0.0.1:5000/abc/orders/commandes_en_attente", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setCommandes(response.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handlePay = (commandeId, totalPrix) => {
    navigate("/PayerCommande", { state: { commandeId, totalPrix } });
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={3} color={teal[700]}>
        Commandes en Attente
      </Typography>
      {commandes.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Aucune commande en attente.
        </Typography>
      ) : (
        <List>
          {commandes.map((commande) => (
            <ListItem
              key={commande.id}
              sx={{
                borderBottom: "1px solid #ddd",
                bgcolor: grey[100],
                borderRadius: 2,
                mb: 2,
                boxShadow: 2,
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <ListItemText
                primary={`Commande #${commande.id}`}
                secondary={`Total: ${commande.total_prix} FCFA - Date: ${new Date(commande.date_creation).toLocaleString()}`}
              />
              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  onClick={() => handlePay(commande.id, commande.total_prix)}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  Payer
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default PendingOrders;
