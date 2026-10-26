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
import TableFacturas from './components/Factura/TableFacturas';
import { DetailFactura } from './components/Factura/DetailFactura';
import TableReservas from './components/Reserva/TableReservas';
import { DetailReserva } from './components/Reserva/DetailReserva';
import { CatalogServicios } from './components/Servicio/CatalogServicios';
import { DetailServicio } from './components/Servicio/DetailServicio';
import TableServicios from './components/Servicio/TableServicios';

const rutas = createBrowserRouter(
  [
    {
      element: <App />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '*',
          element: <PageNotFound />,
        },
        {
          path: '/catalogo-productos/',
          element: <CatalogProductos />,
        },
        {
          path: '/producto/:id',
          element: <DetailProducto />,
        },
        {
          path: '/mantenimiento-productos',
          element: <TableProductos />,
        },
        { path: '/catalogo-servicios/', 
          element: <CatalogServicios /> 
        },
        { path: '/servicio/:id', 
          element: <DetailServicio /> 
        },
        { path: '/mantenimiento-servicios', 
          element: <TableServicios /> 
        },
        {
          path: '/factura',
          element: <TableFacturas />,
        },
        {
          path: '/factura/:id',
          element: <DetailFactura />,
        },
        {
          path: '/reserva',
          element: <TableReservas />,
        },
        {
          path: '/reserva/:id',
          element: <DetailReserva />,
        },
      ],
    },
  ],
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
);