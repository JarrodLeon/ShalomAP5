/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import { esVerdadero, formatMoneda } from '../../utils/formatters';
import { getComparator, stableSort } from '../../utils/tableUtils';
import { SortableTableHead } from '../Layout/SortableTableHead';

//Encabezados de la tabla
const headCells = [
  { id: 'nombre', numeric: false, label: 'Nombre' },
  { id: 'nombre_categoria', numeric: false, label: 'Categoría' },
  { id: 'precio', numeric: true, label: 'Precio' },
  { id: 'stock_disponible', numeric: true, label: 'Stock' },
  { id: 'es_personalizable', numeric: false, label: 'Personalizable' },
  { id: 'detail', numeric: false, label: 'Detalle', sortable: false },
];

//Componente tabla (mantenimiento de productos)
export default function TableProductos() {
  //Datos a cargar en la tabla
  const [data, setData] = useState([]); //Resultado de consumo del API, respuesta
  const [error, setError] = useState(''); //Error del API
  const [loaded, setLoaded] = useState(false); //Booleano para establecer sí se ha recibido respuesta

  //Llamar al API y obtener la lista de productos
  useEffect(() => {
    ProductoService.getProductos() //Llamar al servicio para obtener los productos
      .then((response) => {
        setData(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, []);

  const [order, setOrder] = useState('asc'); //Orden de ordenamiento, 'asc' o 'desc'
  const [orderBy, setOrderBy] = useState('nombre'); //Propiedad por la cual se ordena
  const [page, setPage] = useState(0); //Página actual
  const [dense, setDense] = useState(false); //Densidad de la tabla
  const [rowsPerPage, setRowsPerPage] = useState(5); //Número de filas por página

  //Cambiar el orden al hacer clic en un encabezado
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  //Cambiar de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  //Cambiar cantidad de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  //Cambiar densidad
  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  //Evita un salto de diseño al llegar a la última página con datos vacíos
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      {data && data.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Toolbar>
              <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                Mantenimiento Productos
              </Typography>
            </Toolbar>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
                <SortableTableHead
                  headCells={headCells}
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {stableSort(data, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow hover key={row.id_producto}>
                        <TableCell>{row.nombre}</TableCell>
                        <TableCell>{row.nombre_categoria}</TableCell>
                        <TableCell align="right">{formatMoneda(row.precio)}</TableCell>
                        <TableCell align="right">{row.stock_disponible}</TableCell>
                        <TableCell>{esVerdadero(row.es_personalizable) ? 'Sí' : 'No'}</TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalle">
                            <IconButton component={Link} to={`/producto/${row.id_producto}`} color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Paginación */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Paper>
          <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label="Espaciado"
          />
        </Box>
      )}
    </>
  );
}
