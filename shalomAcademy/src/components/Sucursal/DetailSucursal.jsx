import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import SucursalService from '../../services/SucursalService';
import { Dato } from '../Layout/Dato';

//Componente para mostrar el detalle de una sucursal
export function DetailSucursal() {
  const routeParams = useParams(); //Obtener los parámetros de la ruta, en este caso el id de la sucursal
  const navigate = useNavigate(); //Función para volver a la página anterior

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener una sucursal
  useEffect(() => {
    SucursalService.getSucursalById(routeParams.id)
      .then((response) => {
        setData(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [routeParams.id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_sucursal && (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Detalle de la sucursal
          </Typography>
          <Dato etiqueta="Nombre">{data.nombre}</Dato>
          <Dato etiqueta="Descripción">{data.descripcion}</Dato>
          <Dato etiqueta="Teléfono">{data.telefono}</Dato>
          <Dato etiqueta="Dirección exacta">{data.direccion_exacta}</Dato>
          <Dato etiqueta="Correo electrónico">{data.correo_electronico}</Dato>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            Encargados:
          </Typography>
          {data.encargados.length > 0 ? (
            <List dense>
              {data.encargados.map((encargado) => (
                <ListItem key={encargado.id_usuario}>
                  <ListItemText primary={encargado.nombre} secondary={encargado.correo} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Esta sucursal no tiene encargados asignados.</Typography>
          )}
        </Paper>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
      </Box>
    </Container>
  );
}
