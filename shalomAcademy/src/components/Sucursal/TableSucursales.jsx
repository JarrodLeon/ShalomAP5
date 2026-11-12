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
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import SucursalService from '../../services/SucursalService';
import { getComparator, stableSort } from '../../utils/tableUtils';
import { SortableTableHead } from '../Layout/SortableTableHead';

//Encabezados de la tabla
const headCells = [
  { id: 'nombre', numeric: false, label: 'Nombre' },
  { id: 'telefono', numeric: false, label: 'Teléfono' },
  { id: 'correo_electronico', numeric: false, label: 'Correo electrónico' },
  { id: 'direccion_exacta', numeric: false, label: 'Dirección exacta' },
  { id: 'cantidad_encargados', numeric: true, label: 'Encargados' },
  { id: 'acciones', numeric: false, label: 'Acciones', sortable: false },
];

//Componente tabla (mantenimiento de sucursales)
export default function TableSucursales() {
  const [data, setData] = useState([]); //Resultado de consumo del API, respuesta
  const [error, setError] = useState(''); //Error del API
  const [loaded, setLoaded] = useState(false); //Booleano para establecer sí se ha recibido respuesta

  //Llamar al API y obtener la lista de sucursales
  useEffect(() => {
    SucursalService.getSucursales()
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

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
          <Typography sx={{ flex: '1 1 auto' }} variant="h6" id="tableTitle" component="div">
            Mantenimiento Sucursales
          </Typography>
          {/* Crear sucursal */}
          <Button
            component={Link}
            to="/sucursal/crear/"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
          >
            Crear sucursal
          </Button>
        </Toolbar>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
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
                  <TableRow hover key={row.id_sucursal}>
                    <TableCell>{row.nombre}</TableCell>
                    <TableCell>{row.telefono}</TableCell>
                    <TableCell>{row.correo_electronico}</TableCell>
                    <TableCell>{row.direccion_exacta}</TableCell>
                    <TableCell align="right">{row.cantidad_encargados}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalle">
                        <IconButton component={Link} to={`/sucursal/${row.id_sucursal}`} color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modificar">
                        <IconButton
                          component={Link}
                          to={`/sucursal/editar/${row.id_sucursal}`}
                          color="secondary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No hay sucursales registradas.</TableCell>
                </TableRow>
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
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
          getItemAriaLabel={(type) =>
            ({
              first: 'Primera página',
              last: 'Última página',
              next: 'Página siguiente',
              previous: 'Página anterior',
            })[type]
          }
        />
      </Paper>
    </Box>
  );
}
