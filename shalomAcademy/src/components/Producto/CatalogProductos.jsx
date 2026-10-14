import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import ProductoService from '../../services/ProductoService';
import { ListCardProductos } from './ListCardProductos';

export function CatalogProductos() {
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener la lista de productos
  useEffect(() => {
    ProductoService.getProductos() //Llamar al servicio para obtener los productos
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

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ p: 2 }}>
        Nuestros productos
      </Typography>
      {/* Si hay datos, mostrar la lista de productos */}
      {data && <ListCardProductos data={data} />}
    </>
  );
}
