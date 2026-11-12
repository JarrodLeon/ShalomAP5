import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import HorarioService from '../../services/HorarioService';
import { esVerdadero, formatFecha, formatHora } from '../../utils/formatters';
import { Dato } from '../Layout/Dato';

//Componente para mostrar el detalle de un horario o de un bloqueo
export function DetailHorario() {
  const routeParams = useParams(); //Obtener el id del registro desde la ruta
  const navigate = useNavigate(); //Función para volver a la página anterior

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener el horario o bloqueo
  useEffect(() => {
    HorarioService.getHorarioById(routeParams.id)
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

  const esBloqueo = data ? esVerdadero(data.es_bloqueo) : false;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_horario && (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {esBloqueo ? 'Detalle del bloqueo' : 'Detalle del horario'}
          </Typography>
          <Dato etiqueta="Tipo">{esBloqueo ? 'Bloqueo' : 'Horario de servicio'}</Dato>
          <Dato etiqueta="Sucursal">{data.sucursal}</Dato>
          <Dato etiqueta="Fecha">{formatFecha(data.fecha)}</Dato>
          <Dato etiqueta="Día de la semana">{data.dia_semana}</Dato>
          <Dato etiqueta="Hora de inicio">{formatHora(data.hora_inicio)}</Dato>
          <Dato etiqueta="Hora final">{formatHora(data.hora_fin)}</Dato>
          {esBloqueo && <Dato etiqueta="Motivo">{data.motivo ? data.motivo : 'Sin motivo'}</Dato>}
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
