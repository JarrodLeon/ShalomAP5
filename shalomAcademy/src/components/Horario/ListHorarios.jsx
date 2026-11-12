import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link, useLocation } from 'react-router-dom';
import SucursalService from '../../services/SucursalService';
import HorarioService from '../../services/HorarioService';
import { formatFecha, rangoHoras } from '../../utils/formatters';

//Un bloqueo de día completo se guarda de 00:00:00 a 23:59:59
function esTodoElDia(row) {
  return row.hora_inicio === '00:00:00' && row.hora_fin === '23:59:59';
}

//Listado de horarios y bloqueos de la sucursal seleccionada
export function ListHorarios() {
  const location = useLocation();

  const [error, setError] = useState('');
  //Lista de sucursales para seleccionar
  const [dataSucursales, setDataSucursales] = useState([]);
  const [loadedSucursales, setLoadedSucursales] = useState(false);
  //Sucursal seleccionada (si viene de un formulario, se conserva la que se usó)
  const [sucursalId, setSucursalId] = useState(location.state?.sucursal ?? '');
  //Horarios y bloqueos de la sucursal seleccionada
  const [resultado, setResultado] = useState({ sucursal: null, data: null });

  useEffect(() => {
    SucursalService.getSucursales()
      .then((response) => {
        setDataSucursales(response.data);
        //Si no hay una sucursal seleccionada, se toma la primera
        if (response.data.length > 0) {
          setSucursalId((actual) => actual || Number(response.data[0].id_sucursal));
        }
        setLoadedSucursales(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoadedSucursales(true);
      });
  }, []);

  //Cada vez que cambia la sucursal se consultan sus horarios y bloqueos
  useEffect(() => {
    if (!sucursalId) return;
    HorarioService.getHorariosBySucursal(sucursalId)
      .then((response) => {
        setResultado({ sucursal: sucursalId, data: response.data });
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, [sucursalId]);

  const cargandoHorarios = resultado.sucursal !== sucursalId;

  if (error) return <p>Error: {error.message}</p>;
  if (!loadedSucursales) return <p>Cargando...</p>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Mantenimiento Horarios
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
        {/* Selección de la sucursal */}
        <FormControl sx={{ minWidth: 260 }} size="small">
          <InputLabel id="sucursal-label">Sucursal</InputLabel>
          <Select
            labelId="sucursal-label"
            label="Sucursal"
            value={sucursalId}
            onChange={(event) => setSucursalId(event.target.value)}
          >
            {dataSucursales.map((sucursal) => (
              <MenuItem key={sucursal.id_sucursal} value={Number(sucursal.id_sucursal)}>
                {sucursal.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          component={Link}
          to="/horario/crear/"
          state={{ sucursal: sucursalId }}
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
        >
          Crear horario
        </Button>
        <Button
          component={Link}
          to="/bloqueo/crear/"
          state={{ sucursal: sucursalId }}
          variant="outlined"
          color="secondary"
          startIcon={<AddIcon />}
        >
          Crear bloqueo
        </Button>
      </Box>

      {cargandoHorarios && sucursalId && <p>Cargando horarios...</p>}

      {!cargandoHorarios && resultado.data && (
        <>
          {/* Horarios de la sucursal */}
          <Typography variant="h6" gutterBottom>
            Horarios
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Día</TableCell>
                  <TableCell>Horario de servicio</TableCell>
                  <TableCell>Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultado.data.horarios.map((row) => (
                  <TableRow hover key={row.id_horario}>
                    <TableCell>{formatFecha(row.fecha)}</TableCell>
                    <TableCell>{row.dia_semana}</TableCell>
                    <TableCell>{rangoHoras(row.hora_inicio, row.hora_fin)}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalle">
                        <IconButton component={Link} to={`/horario/${row.id_horario}`} color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {resultado.data.horarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>La sucursal no tiene horarios registrados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Bloqueos de la sucursal */}
          <Typography variant="h6" gutterBottom>
            Bloqueos
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Día</TableCell>
                  <TableCell>Rango bloqueado</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultado.data.bloqueos.map((row) => (
                  <TableRow hover key={row.id_horario}>
                    <TableCell>{formatFecha(row.fecha)}</TableCell>
                    <TableCell>{row.dia_semana}</TableCell>
                    <TableCell>
                      {esTodoElDia(row) ? 'Todo el día' : rangoHoras(row.hora_inicio, row.hora_fin)}
                    </TableCell>
                    <TableCell>{row.motivo ? row.motivo : 'Sin motivo'}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalle">
                        <IconButton component={Link} to={`/horario/${row.id_horario}`} color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {resultado.data.bloqueos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>La sucursal no tiene bloqueos registrados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
