import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, InputBase, Box, Badge } from "@mui/material";
import { ShoppingCart, AccountCircle, Search } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { blue, teal, green, yellow } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";

// Styles personnalisés
const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: teal[500],
  "&:hover": { backgroundColor: green[700] },
  marginLeft: theme.spacing(2),
  width: "30%",
  display: "flex",
  alignItems: "center",
  padding: "5px 10px",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#fff",
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const NavLink = styled(Typography)(({ theme }) => ({
  color: "white",
  textDecoration: "none",
  cursor: "pointer",
  "&:hover": { color: yellow[400] },
}));

const Header = ({ panier, user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    // Logique de recherche ici (par exemple, redirection vers une page de résultats de recherche)
    navigate(`/search?query=${searchQuery}`);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: blue[900] }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography
          variant="h6"
          onClick={() => navigate("/")}
          sx={{ cursor: "pointer", fontWeight: "bold", color: "white" }}
        >
          E-Shop
        </Typography>

        {/* Barre de recherche */}
        <SearchBar>
          <Search sx={{ color: "#fff" }} />
          <StyledInputBase
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
          />
        </SearchBar>

        {/* Navigation & icônes */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[
            { label: "Accueil", path: "/" },
            { label: "Boutique", path: "/boutique" },
            { label: "Promotions", path: "/promotions" },
            { label: "Contact", path: "/contact" },
          ].map(({ label, path }) => (
            <NavLink key={label} onClick={() => navigate(path)}>
              {label}
            </NavLink>
          ))}

          {/* Icône Profil */}
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => navigate("/compte")} sx={{ color: "white", "&:hover": { color: teal[500] } }}>
                <AccountCircle fontSize="large" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <NavLink onClick={() => navigate("/login")} sx={{ color: "white", textDecoration: "none", "&:hover": { color: yellow[400] } }}>
                Se connecter
              </NavLink>
              <NavLink onClick={() => navigate("/register")} sx={{ color: "white", textDecoration: "none", "&:hover": { color: yellow[400] } }}>
                S'inscrire
              </NavLink>
            </Box>
          )}

          {/* Icône Panier */}
          <IconButton onClick={() => navigate("/panier")} sx={{ color: "white", "&:hover": { color: teal[500] } }}>
            <Badge badgeContent={panier.length} color="primary" sx={{ "& .MuiBadge-badge": { backgroundColor: yellow[500], color: blue[900] } }}>
              <ShoppingCart fontSize="large" />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
