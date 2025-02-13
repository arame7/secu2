import React, {useState, useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";


// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Compte from "./components/Compte";
import Register from "./components/Signup";
import Cart from "./components/Cart.js";
import Detail from "./components/Details.js";
import Favori from "./components/Favori.js";
import PayerCommande from "./components/Payment.js";

// Admin pages
import Dashboard from "./admin/Dashboard";
import ProductManagement from "./admin/managements/ProductManagement";
import UserManagement from "./admin/managements/UserManagement";
import OrderManagement from "./admin/managements/OrderManagement";
import PaymentManagement from "./admin/managements/PaymentManagement";
import ProtectedRoute from "./ProtectedRoute";


function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const [panier, setPanier] = useState([]);
  const [user, setUser] = useState(null);

  
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
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Router>
      <div className="App">
        {!isAdminRoute && <Header panier={panier}  user = {user}/>}
        <Routes>
          <Route path="/" element={<Home panier={panier} setPanier={setPanier} user = {user} setUser={setUser}  />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/compte" element={<Compte user = {user} setUser={setUser} />} />
          <Route path="/panier" element={<Cart panier={panier} setPanier={setPanier} user={user}  setUser={setUser}/>} />
          <Route path="/produit/:produitId" element={<Detail />} />
          <Route path="/favoris" element={<Favori user={user} setUser={setUser} />} />
          <Route path="/PayerCommande" element={<PayerCommande  user={user}  />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées pour l'administrateur */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/produits" element={<ProductManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/commandes" element={<OrderManagement />} />
            <Route path="/admin/paiements" element={<PaymentManagement />} />
          </Route>
        </Routes>
        {!isAdminRoute && <Footer />}
      </div>
    </Router>
  );
}

export default App;
