import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import SucursalService from '../../services/SucursalService';
import HorarioService from '../../services/HorarioService';
import { mensajeError } from '../../utils/apiError';

//Fecha actual en formato yyyy-mm-dd (la misma que entrega la entrada de fecha)
const fechaActual = () => new Date().toLocaleDateString('en-CA');

//Esquema de validación
const horarioSchema = yup.object({
  id_sucursal: yup
    .number()
    .typeError('Seleccione una sucursal')
    .required('La sucursal es requerida'),
  fecha: yup
    .string()
    .required('La fecha es requerida')
    .test('fecha-vigente', 'La fecha no puede ser anterior a la fecha actual', (valor) => !valor || valor >= fechaActual()),
  todo_dia: yup.boolean(),
  hora_inicio: yup.string().when('todo_dia', {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required('La hora de inicio es requerida'),
  }),
  hora_fin: yup
    .string()
    .when('todo_dia', {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required('La hora final es requerida'),
    })
    .test('rango-horas', 'La hora final debe ser mayor que la hora de inicio', function (valor) {
      const { hora_inicio, todo_dia } = this.parent;
      if (todo_dia || !valor || !hora_inicio) return true;
      return valor > hora_inicio;
    }),
  motivo: yup.string(),
});

FormHorario.propTypes = {
  esBloqueo: PropTypes.bool, //true: crea un bloqueo; false: crea un horario
};

//Formulario para crear un horario o un bloqueo
export function FormHorario({ esBloqueo = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tipo = esBloqueo ? 'Bloqueo' : 'Horario';

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id_sucursal: location.state?.sucursal ?? '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      todo_dia: false,
      motivo: '',
    },
    resolver: yupResolver(horarioSchema),
  });
  //Si el bloqueo es de todo el día, no se piden las horas
  const todoDia = watch('todo_dia');

  const [error, setError] = useState('');

  //Lista de sucursales
  const [dataSucursales, setDataSucursales] = useState([]);
  const [loadedSucursales, setLoadedSucursales] = useState(false);
  useEffect(() => {
    SucursalService.getSucursales()
      .then((response) => {
        setDataSucursales(response.data);
        setLoadedSucursales(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoadedSucursales(true);
      });
  }, []);

  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  // Accion submit
  const onSubmit = (DataForm) => {
    //El día completo se guarda como 00:00:00 a 23:59:59
    const horario = {
      id_sucursal: DataForm.id_sucursal,
      fecha: DataForm.fecha,
      hora_inicio: DataForm.todo_dia ? '00:00:00' : `${DataForm.hora_inicio}:00`,
      hora_fin: DataForm.todo_dia ? '23:59:59' : `${DataForm.hora_fin}:00`,
      es_bloqueo: esBloqueo ? 1 : 0,
      motivo: DataForm.motivo,
    };
    HorarioService.createHorario(horario)
      .then((response) => {
        const creado = response.data;
        if (creado && creado.id_horario) {
          toast.success(`${tipo} creado #${creado.id_horario} - ${creado.sucursal}`, {
            duration: 4000,
            position: 'top-center',
          });
          //Redirección al listado, con la sucursal usada
          return navigate('/horario', { state: { sucursal: Number(DataForm.id_sucursal) } });
        }
      })
      .catch((error) => {
        console.log(error);
        //Muestra el mensaje del API (sobreposiciones, fecha anterior a la actual, etc.)
        toast.error(mensajeError(error), { duration: 6000, position: 'top-center' });
      });
  };

  if (error) return <p>Error: {error.message}</p>;
  if (!loadedSucursales) return <p>Cargando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Typography variant="h5" gutterBottom>
            {esBloqueo ? 'Crear Bloqueo' : 'Crear Horario'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* Lista de sucursales */}
          <FormControl fullWidth error={Boolean(errors.id_sucursal)}>
            <InputLabel id="sucursal-label">Sucursal</InputLabel>
            <Controller
              name="id_sucursal"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="sucursal-label" label="Sucursal" value={field.value}>
                  {dataSucursales.map((sucursal) => (
                    <MenuItem key={sucursal.id_sucursal} value={Number(sucursal.id_sucursal)}>
                      {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.id_sucursal ? errors.id_sucursal.message : ' '}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="fecha"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="fecha"
                label="Fecha"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.fecha)}
                helperText={errors.fecha ? errors.fecha.message : ' '}
              />
            )}
          />
        </Grid>
        {esBloqueo && (
          <Grid size={12}>
            {/* Bloquear el día completo */}
            <Controller
              name="todo_dia"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={Boolean(field.value)} onChange={field.onChange} />}
                  label="Bloquear todo el día"
                />
              )}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="hora_inicio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="hora_inicio"
                label={esBloqueo ? 'Hora de inicio del bloqueo' : 'Hora de inicio del servicio'}
                type="time"
                fullWidth
                disabled={todoDia}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.hora_inicio)}
                helperText={errors.hora_inicio ? errors.hora_inicio.message : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="hora_fin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="hora_fin"
                label={esBloqueo ? 'Hora final del bloqueo' : 'Hora final del servicio'}
                type="time"
                fullWidth
                disabled={todoDia}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.hora_fin)}
                helperText={errors.hora_fin ? errors.hora_fin.message : ' '}
              />
            )}
          />
        </Grid>
        {esBloqueo && (
          <Grid size={12}>
            <Controller
              name="motivo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="motivo"
                  label="Motivo del bloqueo (opcional)"
                  fullWidth
                  error={Boolean(errors.motivo)}
                  helperText={errors.motivo ? errors.motivo.message : ' '}
                />
              )}
            />
          </Grid>
        )}
        <Grid size={12}>
          <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
            Guardar
          </Button>
          <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
