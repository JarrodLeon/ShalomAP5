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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import ReservaService from '../../services/ReservaService';
import { formatFecha, rangoHoras } from '../../utils/formatters';
import { getComparator, stableSort } from '../../utils/tableUtils';
import { SortableTableHead } from '../Layout/SortableTableHead';
import { EstadoChip } from './EstadoChip';

//Encabezados de la tabla (máximo 4 campos + el enlace al detalle)
const headCells = [
  { id: 'fecha_cita', numeric: false, label: 'Fecha y hora' },
  { id: 'cliente', numeric: false, label: 'Cliente' },
  { id: 'servicio', numeric: false, label: 'Servicio' },
  { id: 'nombre_estado', numeric: false, label: 'Estado' },
  { id: 'detail', numeric: false, label: 'Detalle', sortable: false },
];

//Historial de reservas (citas) del encargado
export default function TableReservas() {
  const [data, setData] = useState([]); //Resultado de consumo del API, respuesta
  const [error, setError] = useState(''); //Error del API
  const [loaded, setLoaded] = useState(false); //Booleano para establecer sí se ha recibido respuesta

  //Llamar al API y obtener la lista de reservas
  useEffect(() => {
    ReservaService.getReservas() //Llamar al servicio para obtener las reservas
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

  const [order, setOrder] = useState('desc'); //Más reciente primero
  const [orderBy, setOrderBy] = useState('fecha_cita');
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
    <>
      {data && data.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Toolbar>
              <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                Historial de Reservas
              </Typography>
            </Toolbar>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-labelledby="tableTitle">
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
                      <TableRow hover key={row.id_reserva}>
                        <TableCell>
                          {formatFecha(row.fecha_cita)}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {rangoHoras(row.hora_inicio, row.hora_fin)}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.cliente}</TableCell>
                        <TableCell>{row.servicio}</TableCell>
                        <TableCell>
                          <EstadoChip nombre={row.nombre_estado} color={row.color_hex} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalle">
                            <IconButton component={Link} to={`/reserva/${row.id_reserva}`} color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={5} />
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
        </Box>
      )}
    </>
  );
}
