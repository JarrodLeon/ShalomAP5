import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { Home } from './components/Home/Home';
import { PageNotFound } from './components/Home/PageNotFound';
import { CatalogProductos } from './components/Producto/CatalogProductos';
import { DetailProducto } from './components/Producto/DetailProducto';
import TableProductos from './components/Producto/TableProductos';
import { FormProducto } from './components/Producto/FormProducto';
import { CatalogServicios } from './components/Servicio/CatalogServicios';
import { DetailServicio } from './components/Servicio/DetailServicio';
import TableServicios from './components/Servicio/TableServicios';
import { FormServicio } from './components/Servicio/FormServicio';
import TableSucursales from './components/Sucursal/TableSucursales';
import { DetailSucursal } from './components/Sucursal/DetailSucursal';
import { FormSucursal } from './components/Sucursal/FormSucursal';
import { ListHorarios } from './components/Horario/ListHorarios';
import { DetailHorario } from './components/Horario/DetailHorario';
import { FormHorario } from './components/Horario/FormHorario';
import TableFacturas from './components/Factura/TableFacturas';
import { DetailFactura } from './components/Factura/DetailFactura';
import TableReservas from './components/Reserva/TableReservas';
import { DetailReserva } from './components/Reserva/DetailReserva';

const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '*', element: <PageNotFound /> },
      //Productos
      { path: '/catalogo-productos/', element: <CatalogProductos /> },
      { path: '/producto/:id', element: <DetailProducto /> },
      { path: '/mantenimiento-productos', element: <TableProductos /> },
      { path: '/producto/crear/', element: <FormProducto /> },
      { path: '/producto/editar/:id', element: <FormProducto /> },
      //Servicios
      { path: '/catalogo-servicios/', element: <CatalogServicios /> },
      { path: '/servicio/:id', element: <DetailServicio /> },
      { path: '/mantenimiento-servicios', element: <TableServicios /> },
      { path: '/servicio/crear/', element: <FormServicio /> },
      { path: '/servicio/editar/:id', element: <FormServicio /> },
      //Sucursales
      { path: '/mantenimiento-sucursales', element: <TableSucursales /> },
      { path: '/sucursal/:id', element: <DetailSucursal /> },
      { path: '/sucursal/crear/', element: <FormSucursal /> },
      { path: '/sucursal/editar/:id', element: <FormSucursal /> },
      //Horarios y bloqueos
      { path: '/horario', element: <ListHorarios /> },
      { path: '/horario/:id', element: <DetailHorario /> },
      { path: '/horario/crear/', element: <FormHorario /> },
      { path: '/bloqueo/crear/', element: <FormHorario esBloqueo /> },
      //Facturas
      { path: '/factura', element: <TableFacturas /> },
      { path: '/factura/:id', element: <DetailFactura /> },
      //Reservas
      { path: '/reserva', element: <TableReservas /> },
      { path: '/reserva/:id', element: <DetailReserva /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
);
