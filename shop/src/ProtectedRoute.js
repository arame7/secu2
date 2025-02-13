import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const estAdmin = localStorage.getItem('est_admin');
  
  if (estAdmin !== 'true') {
    return <Navigate to="/" />; // Rediriger vers la page d'accueil si l'utilisateur n'est pas un administrateur
  }

  return <Outlet />; // Rendre le composant enfant si l'utilisateur est un administrateur
};

export default ProtectedRoute;
