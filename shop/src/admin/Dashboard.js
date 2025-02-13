import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
 
} from '@mui/material';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import AdminLayout from './AdminLayout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('https://127.0.0.1:5000/abc/user/stats')
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(() => {
        setSnackbarMessage('Erreur lors du chargement des statistiques');
        setSnackbarOpen(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '20%' }}>
        <CircularProgress />
        <Typography>Chargement des données...</Typography>
      </Container>
    );
  }

  return (
    <AdminLayout>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Utilisateurs</Typography>
              <Typography variant="h3">{stats?.nombre_utilisateurs}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Visites</Typography>
              <Typography variant="h3">{stats?.nombre_visites}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Produits</Typography>
              <Typography variant="h3">{stats?.nombre_produits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Commandes</Typography>
              <Typography variant="h3">{stats?.nombre_commandes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5">Produits les plus commandés</Typography>
              <Bar
                data={{
                  labels: stats?.produits_les_plus_commandes.map((p) => p.nom),
                  datasets: [
                    {
                      label: 'Quantité',
                      data: stats?.produits_les_plus_commandes.map((p) => p.total_quantite),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                  ],
                }}
                options={{ responsive: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5">Répartition des Commandes</Typography>
              <Pie
                data={{
                  labels: ['Confirmées', 'En attente', 'Annulées'],
                  datasets: [
                    {
                      label: 'Commandes',
                      data: [stats?.commandes_confirmees, stats?.commandes_attente, stats?.commandes_annulees],
                      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default Dashboard;
