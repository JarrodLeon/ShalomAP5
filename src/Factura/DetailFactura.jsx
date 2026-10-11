import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import FacturaService from '../../services/FacturaService';
import {
  formatFecha,
  formatFechaHora,
  formatMoneda,
  numeroFactura,
} from '../../utils/formatters';

//Texto con las opciones elegidas en un producto personalizado
function personalizacion(linea) {
  return [
    linea.talla && `Talla ${linea.talla}`,
    linea.color_base,
    linea.diseno_mangas,
    linea.aplicaciones,
  ]
    .filter(Boolean)
    .join(' · ');
}

//Componente para mostrar el detalle de una factura (formato de factura)
export function DetailFactura() {
  const routeParams = useParams(); //Obtener el id de la factura desde la ruta
  const navigate = useNavigate(); //Función para volver a la página anterior

  const [data, setData] = useState(null); //Resultado de consumo del API, respuesta
  const [error, setError] = useState(''); //Error del API
  const [loaded, setLoaded] = useState(false); //Booleano para establecer sí se ha recibido respuesta

  //Llamar al API y obtener una factura
  useEffect(() => {
    FacturaService.getFacturaById(routeParams.id)
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
      {data && data.id_factura && (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          {/* ---------- Sector encabezado: sucursal, fecha y cliente ---------- */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="h5" color="primary" gutterBottom>
                {data.sucursal_nombre}
              </Typography>
              <Typography variant="body2">Tel: {data.sucursal_telefono}</Typography>
              <Typography variant="body2">{data.sucursal_direccion}</Typography>
              <Typography variant="body2">{data.sucursal_correo}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="h5" component="h1">
                Factura N° {numeroFactura(data.id_factura)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Fecha: {formatFechaHora(data.fecha_emision)}
              </Typography>
              <Chip label={data.estado_factura} size="small" color="secondary" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Cliente
          </Typography>
          <Typography>Identificación: {data.cliente_identificacion}</Typography>
          <Typography>Nombre: {data.cliente_nombre}</Typography>

          {/* ---------- Sector detalle: servicios y/o productos ---------- */}
          <TableContainer sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.lineas.map((linea, indice) => (
                  <TableRow key={indice}>
                    <TableCell>{linea.tipo}</TableCell>
                    <TableCell>
                      {linea.descripcion}
                      {linea.fecha_cita && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Cita del {formatFecha(linea.fecha_cita)}
                        </Typography>
                      )}
                      {personalizacion(linea) && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {personalizacion(linea)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{linea.cantidad}</TableCell>
                    <TableCell align="right">{formatMoneda(linea.precio_unitario)}</TableCell>
                    <TableCell align="right">{formatMoneda(linea.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ---------- Sector totales ---------- */}
          <Box sx={{ mt: 3, ml: 'auto', maxWidth: 320 }}>
            <Grid container spacing={1}>
              <Grid size={6}>
                <Typography>Subtotal</Typography>
              </Grid>
              <Grid size={6} sx={{ textAlign: 'right' }}>
                <Typography>{formatMoneda(data.subtotal)}</Typography>
              </Grid>
              <Grid size={6}>
                <Typography>IVA ({Number(data.porcentaje_impuesto)}%)</Typography>
              </Grid>
              <Grid size={6} sx={{ textAlign: 'right' }}>
                <Typography>{formatMoneda(data.impuesto)}</Typography>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={6}>
                <Typography variant="h6">Total a pagar</Typography>
              </Grid>
              <Grid size={6} sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="primary">
                  {formatMoneda(data.total)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
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
