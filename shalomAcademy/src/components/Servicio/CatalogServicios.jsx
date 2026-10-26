import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import ServicioService from '../../services/ServicioService';
import { normalizar } from '../../utils/servicioFormat';
import { ListCardServicios } from './ListCardServicios';

export function CatalogServicios() {
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);
  //Texto del filtro por nombre
  const [filtro, setFiltro] = useState('');

  //Llamar al API y obtener la lista de servicios
  useEffect(() => {
    ServicioService.getServicios() //Llamar al servicio para obtener los servicios
      .then((response) => {
        setData(response.data); //Almacenar la respuesta en el estado
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error); //Mostrar el error en consola
        setError(error); //Almacenar el error en el estado
        setLoaded(true);
      });
  }, []);

  if (!loaded) return <p>Cargando..</p>; //Si no se ha cargado, mostrar mensaje de carga
  if (error) return <p>Error: {error.message}</p>; //Si hay un error, mostrar mensaje de error

  //Servicios que coinciden con el nombre escrito en el filtro
  const filtrados = data
    ? data.filter((servicio) => normalizar(servicio.nombre).includes(normalizar(filtro)))
    : [];

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ p: 2 }}>
        Nuestros servicios
      </Typography>
      {/* Filtro por nombre */}
      <Box sx={{ px: 2 }}>
        <TextField
          label="Buscar por nombre"
          variant="outlined"
          size="small"
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
          sx={{ width: { xs: '100%', sm: 360 } }}
        />
      </Box>
      {filtrados.length > 0 ? (
        <ListCardServicios data={filtrados} />
      ) : (
        <Typography sx={{ p: 2 }}>No se encontraron servicios con ese nombre.</Typography>
      )}
    </>
  );
}
