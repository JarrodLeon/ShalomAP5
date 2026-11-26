import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ReservaService from '../../services/ReservaService';
import UsuarioService from '../../services/UsuarioService';
import ServicioService from '../../services/ServicioService';
import { EstadoChip } from './EstadoChip';
import { mensajeError } from '../../utils/apiError';
import { fechaActualISO, sumarMinutos } from '../../utils/tiempo';
import { formatHora, formatMoneda } from '../../utils/formatters';
import { formatDuracion } from '../../utils/servicioFormat';

//Esquema de validación
const reservaSchema = yup.object({
  fecha: yup
    .string()
    .required('validation:fechaRequerida')
    .test('fecha-vigente', 'validation:fechaVigente', (valor) => !valor || valor >= fechaActualISO()),
  id_cliente: yup
    .number()
    .typeError('validation:clienteRequerido')
    .required('validation:clienteRequerido'),
  id_servicio: yup
    .number()
    .typeError('validation:servicioRequerido')
    .required('validation:servicioRequerido'),
  hora_inicio: yup.string().required('validation:horaInicioRequerida'),
  practica_previa: yup.string().required('validation:practicaRequerida'),
  condicion_medica: yup.string().required('validation:condicionRequerida'),
  objetivo: yup.string().required('validation:objetivoRequerido'),
});

//Formulario para que el encargado registre una reserva
//El encargado y su sucursal los define el API (controlador); aquí solo se muestran
export function FormReserva() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    //Los nombres coinciden con los que necesita el API
    defaultValues: {
      fecha: '',
      id_cliente: '',
      id_servicio: '',
      hora_inicio: '',
      practica_previa: '',
      condicion_medica: '',
      objetivo: '',
    },
    resolver: yupResolver(reservaSchema),
  });

  const [error, setError] = useState('');
  const [contexto, setContexto] = useState(null); //Encargado, sucursal y estado inicial
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loaded, setLoaded] = useState(false);

  //Cargar los datos que el usuario necesita seleccionar y los de solo lectura
  useEffect(() => {
    Promise.all([ReservaService.getContexto(), UsuarioService.getClientes(), ServicioService.getServicios()])
      .then(([resContexto, resClientes, resServicios]) => {
        setContexto(resContexto.data);
        setClientes(resClientes.data);
        setServicios(resServicios.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(mensajeError(error));
        setLoaded(true);
      });
  }, []);

  //Valores que cambian la información que se muestra: cliente, servicio y hora de inicio
  const idCliente = watch('id_cliente');
  const idServicio = watch('id_servicio');
  const horaInicio = watch('hora_inicio');
  const clienteSeleccionado = clientes.find((c) => Number(c.id_usuario) === Number(idCliente));
  const servicioSeleccionado = servicios.find((s) => Number(s.id_servicio) === Number(idServicio));
  //Hora final = hora de inicio + tiempo del servicio
  const fin =
    servicioSeleccionado && horaInicio ? sumarMinutos(horaInicio, servicioSeleccionado.tiempo_servicio) : null;

  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  // Accion submit
  const onSubmit = (DataForm) => {
    //No se envía el encargado, la sucursal, el estado ni la hora final: los define el API
    const reserva = {
      fecha: DataForm.fecha,
      id_cliente: DataForm.id_cliente,
      id_servicio: DataForm.id_servicio,
      hora_inicio: `${DataForm.hora_inicio}:00`,
      practica_previa: Number(DataForm.practica_previa),
      condicion_medica: DataForm.condicion_medica,
      objetivo: DataForm.objetivo,
    };
    ReservaService.createReserva(reserva)
      .then((response) => {
        const creada = response.data;
        if (creada && creada.id_reserva) {
          toast.success(t('reserva:form.created', { id: creada.id_reserva, invoice: creada.id_factura }), {
            duration: 5000,
            position: 'top-center',
          });
          //Redirección al historial de citas
          return navigate('/reserva');
        }
      })
      .catch((error) => {
        console.log(error);
        //Muestra el mensaje del API (horario, bloqueo, sobreposición, etc.)
        toast.error(mensajeError(error), { duration: 6000, position: 'top-center' });
      });
  };

  if (error) return <p>{t('common:errorPrefix', { message: error })}</p>;
  if (!loaded) return <p>{t('common:loading')}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Typography variant="h5" gutterBottom>
            {t('reserva:form.title')}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* Fecha: no puede ser anterior a la actual */}
          <Controller
            name="fecha"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="fecha"
                label={t('reserva:form.date')}
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: fechaActualISO() } }}
                error={Boolean(errors.fecha)}
                helperText={errors.fecha ? t(errors.fecha.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* Sucursal del encargado: solo lectura */}
          <TextField
            id="sucursal"
            label={t('reserva:form.branch')}
            value={contexto ? contexto.sucursal : ''}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
            helperText=" "
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* Lista de clientes */}
          <FormControl fullWidth error={Boolean(errors.id_cliente)}>
            <InputLabel id="cliente-label">{t('reserva:form.client')}</InputLabel>
            <Controller
              name="id_cliente"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="cliente-label" label={t('reserva:form.client')} value={field.value}>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id_usuario} value={Number(cliente.id_usuario)}>
                      {cliente.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.id_cliente ? t(errors.id_cliente.message) : ' '}
            </FormHelperText>
          </FormControl>
          {/* Información del cliente seleccionado */}
          {clienteSeleccionado && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">{t('reserva:form.clientName', { name: clienteSeleccionado.nombre })}</Typography>
              <Typography variant="body2">{t('reserva:form.clientEmail', { email: clienteSeleccionado.correo })}</Typography>
            </Box>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* Lista de servicios */}
          <FormControl fullWidth error={Boolean(errors.id_servicio)}>
            <InputLabel id="servicio-label">{t('reserva:form.service')}</InputLabel>
            <Controller
              name="id_servicio"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="servicio-label" label={t('reserva:form.service')} value={field.value}>
                  {servicios.map((servicio) => (
                    <MenuItem key={servicio.id_servicio} value={Number(servicio.id_servicio)}>
                      {servicio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.id_servicio ? t(errors.id_servicio.message) : ' '}
            </FormHelperText>
          </FormControl>
          {/* Tiempo requerido por el servicio seleccionado */}
          {servicioSeleccionado && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                {t('reserva:form.requiredTime', { time: formatDuracion(servicioSeleccionado.tiempo_servicio) })}
              </Typography>
              <Typography variant="body2">
                {t('reserva:form.rate', { rate: formatMoneda(servicioSeleccionado.tarifa) })}
              </Typography>
            </Box>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="hora_inicio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="hora_inicio"
                label={t('reserva:form.startTime')}
                type="time"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.hora_inicio)}
                helperText={errors.hora_inicio ? t(errors.hora_inicio.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* Hora final: se calcula con el tiempo del servicio, solo lectura */}
          <TextField
            id="hora_fin"
            label={t('reserva:form.endTime')}
            value={fin ? formatHora(`${fin.hora}:00`) : ''}
            fullWidth
            slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
            error={Boolean(fin && fin.cruza)}
            helperText={fin && fin.cruza ? t('reserva:form.crossesMidnight') : ' '}
          />
        </Grid>
        <Grid size={12}>
          <Typography variant="h6" gutterBottom>
            {t('reserva:form.questions')}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {/* Pregunta 1 */}
          <FormControl fullWidth error={Boolean(errors.practica_previa)}>
            <InputLabel id="practica-label">{t('reserva:form.q1')}</InputLabel>
            <Controller
              name="practica_previa"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="practica-label" label={t('reserva:form.q1')} value={field.value}>
                  <MenuItem value="1">{t('common:yes')}</MenuItem>
                  <MenuItem value="0">{t('common:no')}</MenuItem>
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.practica_previa ? t(errors.practica_previa.message) : ' '}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {/* Pregunta 2 */}
          <Controller
            name="condicion_medica"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="condicion_medica"
                label={t('reserva:form.q2')}
                fullWidth
                error={Boolean(errors.condicion_medica)}
                helperText={errors.condicion_medica ? t(errors.condicion_medica.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {/* Pregunta 3 */}
          <Controller
            name="objetivo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="objetivo"
                label={t('reserva:form.q3')}
                fullWidth
                error={Boolean(errors.objetivo)}
                helperText={errors.objetivo ? t(errors.objetivo.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          {/* Estado inicial con su color: no es editable */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t('reserva:form.status')}:
            </Typography>
            {contexto && <EstadoChip nombre={contexto.estado} color={contexto.color_estado} />}
          </Box>
        </Grid>
        <Grid size={12}>
          <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
            {t('common:save')}
          </Button>
          <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate(-1)}>
            {t('common:cancel')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
