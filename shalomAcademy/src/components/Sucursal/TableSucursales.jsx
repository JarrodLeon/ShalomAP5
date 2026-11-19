/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
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
  { id: 'nombre', numeric: false, label: 'common:name' },
  { id: 'telefono', numeric: false, label: 'sucursal:table.phone' },
  { id: 'correo_electronico', numeric: false, label: 'sucursal:table.email' },
  { id: 'direccion_exacta', numeric: false, label: 'sucursal:table.address' },
  { id: 'cantidad_encargados', numeric: true, label: 'sucursal:table.managers' },
  { id: 'acciones', numeric: false, label: 'common:actions', sortable: false },
];

//Componente tabla (mantenimiento de sucursales)
export default function TableSucursales() {
  const { t } = useTranslation();
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

  if (!loaded) return <p>{t('common:loading')}</p>;
  if (error) return <p>{t('common:errorPrefix', { message: error.message })}</p>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
          <Typography sx={{ flex: '1 1 auto' }} variant="h6" id="tableTitle" component="div">
            {t('sucursal:table.title')}
          </Typography>
          {/* Crear sucursal */}
          <Button
            component={Link}
            to="/sucursal/crear/"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
          >
            {t('sucursal:table.create')}
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
                      <Tooltip title={t('common:viewDetail')}>
                        <IconButton component={Link} to={`/sucursal/${row.id_sucursal}`} color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common:modify')}>
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
                  <TableCell colSpan={6}>{t('sucursal:table.empty')}</TableCell>
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
          labelRowsPerPage={t('common:table.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) => t('common:table.displayedRows', { from, to, count })}
          getItemAriaLabel={(type) => t(`common:table.${type}`)}
        />
      </Paper>
    </Box>
  );
}
