import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Grid, Paper, Link } from "@mui/material";
import { blue, teal, yellow } from "@mui/material/colors";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message envoyé :", form);
    // Logique d'envoi (ex. via email, API)
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={4}>
        Contactez-nous
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {/* Formulaire de contact */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Nom"
                name="name"
                fullWidth
                margin="normal"
                value={form.name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={handleChange}
                required
              />
              <TextField
                label="Message"
                name="message"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                value={form.message}
                onChange={handleChange}
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2, backgroundColor: teal[500], "&:hover": { backgroundColor: yellow[700] } }}
              >
                Envoyer
              </Button>
            </form>
          </Paper>
        </Grid>
        
        {/* Informations de contact */}
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: "center", color: blue[900] }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Informations de Contact
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
              <EmailIcon color="primary" sx={{ mr: 1 }} />
              <Link href="mailto:contact@eshop.com" underline="none" color={blue[900]}>
                contact@eshop.com
              </Link>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
              <PhoneIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">(123) 456-7890</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;
