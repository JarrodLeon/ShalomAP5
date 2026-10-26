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
import TextField from '@mui/material/TextField';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import ServicioService from '../../services/ServicioService';
import { formatMoneda } from '../../utils/formatters';
import { formatDuracion, normalizar } from '../../utils/servicioFormat';
import { getComparator, stableSort } from '../../utils/tableUtils';
import { SortableTableHead } from '../Layout/SortableTableHead';

//Encabezados de la tabla
const headCells = [
  { id: 'nombre', numeric: false, label: 'Nombre' },
  { id: 'edad_recomendada', numeric: false, label: 'Edad recomendada' },
  { id: 'modalidad', numeric: false, label: 'Modalidad' },
  { id: 'tiempo_servicio', numeric: true, label: 'Duración' },
  { id: 'tarifa', numeric: true, label: 'Tarifa' },
  { id: 'detail', numeric: false, label: 'Detalle', sortable: false },
];

//Componente tabla (mantenimiento de servicios)
export default function TableServicios() {
  //Datos a cargar en la tabla
  const [data, setData] = useState([]); //Resultado de consumo del API, respuesta
  const [error, setError] = useState(''); //Error del API
  const [loaded, setLoaded] = useState(false); //Booleano para establecer sí se ha recibido respuesta

  //Llamar al API y obtener la lista de servicios
  useEffect(() => {
    ServicioService.getServicios() //Llamar al servicio para obtener los servicios
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
  const [rowsPerPage, setRowsPerPage] = useState(5); //Número de filas por página
  const [filtro, setFiltro] = useState(''); //Texto del filtro por nombre

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
  //Cambiar el filtro y volver a la primera página
  const handleChangeFiltro = (event) => {
    setFiltro(event.target.value);
    setPage(0);
  };

  //Servicios que coinciden con el nombre escrito en el filtro
  const filtrados = data.filter((servicio) =>
    normalizar(servicio.nombre).includes(normalizar(filtro)),
  );

  //Evita un salto de diseño al llegar a la última página con datos vacíos
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filtrados.length) : 0;

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      {data && data.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
              <Typography sx={{ flex: '1 1 auto' }} variant="h6" id="tableTitle" component="div">
                Mantenimiento Servicios
              </Typography>
              {/* Filtro por nombre */}
              <TextField
                label="Buscar por nombre"
                variant="outlined"
                size="small"
                value={filtro}
                onChange={handleChangeFiltro}
              />
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
                  {stableSort(filtrados, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow hover key={row.id_servicio}>
                        <TableCell>{row.nombre}</TableCell>
                        <TableCell>{row.edad_recomendada}</TableCell>
                        <TableCell>{row.modalidad}</TableCell>
                        <TableCell align="right">{formatDuracion(row.tiempo_servicio)}</TableCell>
                        <TableCell align="right">{formatMoneda(row.tarifa)}</TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalle">
                            <IconButton
                              component={Link}
                              to={`/servicio/${row.id_servicio}`}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filtrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>No se encontraron servicios con ese nombre.</TableCell>
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
              count={filtrados.length}
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
      )}
    </>
  );
}
