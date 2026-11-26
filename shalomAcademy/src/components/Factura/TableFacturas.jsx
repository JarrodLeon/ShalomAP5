/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import FacturaService from '../../services/FacturaService';
import { formatFechaHora, formatMoneda, numeroFactura } from '../../utils/formatters';
import { normalizar } from '../../utils/servicioFormat';
import { getComparator, stableSort } from '../../utils/tableUtils';
import { SortableTableHead } from '../Layout/SortableTableHead';

//Encabezados de la tabla
const headCells = [
  { id: 'id_factura', numeric: false, label: 'factura:table.number' },
  { id: 'fecha_emision', numeric: false, label: 'factura:table.date' },
  { id: 'cliente', numeric: false, label: 'factura:table.client' },
  { id: 'estado_factura', numeric: false, label: 'factura:table.status' },
  { id: 'total', numeric: true, label: 'factura:table.total' },
  { id: 'acciones', numeric: false, label: 'common:actions', sortable: false },
];

//Color del estado de la factura (Proforma, Facturada o Anulada)
const colorEstado = { Proforma: 'warning', Completada: 'success', Anulada: 'default' };

//Historial de facturación del encargado
export default function TableFacturas() {
  const { t } = useTranslation();
  const [data, setData] = useState([]); //Resultado de consumo del API, respuesta
  const [error, setError] = useState(''); //Error del API
  const [loaded, setLoaded] = useState(false); //Booleano para establecer sí se ha recibido respuesta

  //Llamar al API y obtener la lista de facturas
  useEffect(() => {
    FacturaService.getFacturas() //Llamar al servicio para obtener las facturas
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
  const [orderBy, setOrderBy] = useState('fecha_emision');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  //Filtros: por cliente y/o por fecha de emisión
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

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
  const handleFiltroCliente = (event) => {
    setFiltroCliente(event.target.value);
    setPage(0);
  };
  const handleFiltroFecha = (event) => {
    setFiltroFecha(event.target.value);
    setPage(0);
  };

  //Facturas que cumplen los filtros (los dos son opcionales y se pueden combinar)
  const filtrados = data.filter(
    (factura) =>
      normalizar(factura.cliente).includes(normalizar(filtroCliente)) &&
      (!filtroFecha || factura.fecha_emision.slice(0, 10) === filtroFecha),
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filtrados.length) : 0;

  if (!loaded) return <p>{t('common:loading')}</p>;
  if (error) return <p>{t('common:errorPrefix', { message: error.message })}</p>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
          <Typography sx={{ flex: '1 1 auto' }} variant="h6" id="tableTitle" component="div">
            {t('factura:table.title')}
          </Typography>
          {/* Filtro por cliente */}
          <TextField
            label={t('factura:table.filterClient')}
            variant="outlined"
            size="small"
            value={filtroCliente}
            onChange={handleFiltroCliente}
          />
          {/* Filtro por fecha */}
          <TextField
            label={t('factura:table.filterDate')}
            type="date"
            variant="outlined"
            size="small"
            value={filtroFecha}
            onChange={handleFiltroFecha}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          {/* Registrar factura */}
          <Button
            component={Link}
            to="/factura/crear/"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
          >
            {t('factura:table.create')}
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
              {stableSort(filtrados, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id_factura}>
                    <TableCell>{numeroFactura(row.id_factura)}</TableCell>
                    <TableCell>{formatFechaHora(row.fecha_emision)}</TableCell>
                    <TableCell>{row.cliente}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={colorEstado[row.estado_factura] || 'default'}
                        label={t(`factura:estados.${row.estado_factura}`, { defaultValue: row.estado_factura })}
                      />
                    </TableCell>
                    <TableCell align="right">{formatMoneda(row.total)}</TableCell>
                    <TableCell>
                      <Tooltip title={t('factura:table.viewInvoice')}>
                        <IconButton component={Link} to={`/factura/${row.id_factura}`} color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {/* Solo las proformas se pueden facturar */}
                      {row.estado_factura === 'Proforma' && (
                        <Tooltip title={t('factura:table.invoiceAction')}>
                          <IconButton
                            component={Link}
                            to={`/factura/facturar/${row.id_factura}`}
                            color="secondary"
                          >
                            <ReceiptLongIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>{t('factura:table.noResults')}</TableCell>
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
          labelRowsPerPage={t('common:table.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) => t('common:table.displayedRows', { from, to, count })}
          getItemAriaLabel={(type) => t(`common:table.${type}`)}
        />
      </Paper>
    </Box>
  );
}
