import React from "react";
import { Box, Typography, Link, Container } from "@mui/material";
import { blue, yellow } from "@mui/material/colors";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: blue[900],
        color: "white",
        py: 3,
        textAlign: "center",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1">
          © {new Date().getFullYear()} E-Shop - Tous droits réservés.
        </Typography>
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 3 }}>
          <Link href="/mentions-legales" sx={{ color: "white", textDecoration: "none", "&:hover": { color: yellow[400] } }}>
            Mentions Légales
          </Link>
          <Link href="/politique-confidentialite" sx={{ color: "white", textDecoration: "none", "&:hover": { color: yellow[400] } }}>
            Politique de Confidentialité
          </Link>
          <Link href="/contact" sx={{ color: "white", textDecoration: "none", "&:hover": { color: yellow[400] } }}>
            Contact
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
