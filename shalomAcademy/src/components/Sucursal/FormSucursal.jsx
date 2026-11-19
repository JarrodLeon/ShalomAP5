import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import SucursalService from '../../services/SucursalService';
import UsuarioService from '../../services/UsuarioService';
import { mensajeError } from '../../utils/apiError';

//Esquema de validación
const sucursalSchema = yup.object({
  nombre: yup
    .string()
    .required('validation:nombreRequerido')
    .min(2, 'validation:nombreMin'),
  descripcion: yup.string().required('validation:descripcionRequerida'),
  telefono: yup
    .string()
    .required('validation:telefonoRequerido')
    .matches(/^[0-9]{4}-?[0-9]{4}$/, 'validation:telefonoFormato'),
  direccion_exacta: yup.string().required('validation:direccionRequerida'),
  correo_electronico: yup
    .string()
    .required('validation:correoRequerido')
    .email('validation:correoFormato'),
  //Relación de muchos: el valor por defecto es un arreglo
  encargados: yup.array().min(1, 'validation:encargadosMin'),
});

//Formulario para crear y modificar una sucursal (si la ruta trae un id, modifica)
export function FormSucursal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); //Id de la sucursal a modificar (no existe al crear)
  const esEdicion = Boolean(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      telefono: '',
      direccion_exacta: '',
      correo_electronico: '',
      encargados: [],
    },
    resolver: yupResolver(sucursalSchema),
  });

  const [error, setError] = useState('');
  const [noEncontrado, setNoEncontrado] = useState(false);

  //Lista de encargados que se pueden asignar (sin sucursal; al modificar, también los de esta sucursal)
  const [dataEncargados, setDataEncargados] = useState([]);
  const [loadedEncargados, setLoadedEncargados] = useState(false);
  useEffect(() => {
    UsuarioService.getEncargadosDisponibles(esEdicion ? id : '')
      .then((response) => {
        setDataEncargados(response.data);
        setLoadedEncargados(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoadedEncargados(true);
      });
  }, [esEdicion, id]);

  //Al modificar: cargar la sucursal y precargar los valores en el formulario
  useEffect(() => {
    if (!esEdicion) return;
    SucursalService.getSucursalById(id)
      .then((response) => {
        const sucursal = response.data;
        if (sucursal && sucursal.id_sucursal) {
          reset({
            nombre: sucursal.nombre,
            descripcion: sucursal.descripcion,
            telefono: sucursal.telefono,
            direccion_exacta: sucursal.direccion_exacta,
            correo_electronico: sucursal.correo_electronico,
            encargados: sucursal.encargados.map((encargado) => Number(encargado.id_usuario)),
          });
        } else {
          setNoEncontrado(true);
        }
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, [esEdicion, id, reset]);

  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  // Accion submit
  const onSubmit = (DataForm) => {
    const sucursal = esEdicion ? { ...DataForm, id_sucursal: Number(id) } : DataForm;
    const guardar = esEdicion
      ? SucursalService.updateSucursal(sucursal)
      : SucursalService.createSucursal(sucursal);
    guardar
      .then((response) => {
        const guardada = response.data;
        if (guardada && guardada.id_sucursal) {
          toast.success(
            t(esEdicion ? 'sucursal:form.modified' : 'sucursal:form.created', { id: guardada.id_sucursal, name: guardada.nombre }),
            { duration: 4000, position: 'top-center' },
          );
          //Redirección a la tabla de sucursales
          return navigate('/mantenimiento-sucursales');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(mensajeError(error), { duration: 5000, position: 'top-center' });
      });
  };

  if (error) return <p>{t('common:errorPrefix', { message: error.message })}</p>;
  if (!loadedEncargados) return <p>{t('common:loading')}</p>;
  if (noEncontrado) return <p>{t('sucursal:form.notFound')}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Typography variant="h5" gutterBottom>
            {esEdicion ? t('sucursal:form.editTitle') : t('sucursal:form.createTitle')}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="nombre"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="nombre"
                label={t('common:name')}
                fullWidth
                error={Boolean(errors.nombre)}
                helperText={errors.nombre ? t(errors.nombre.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="telefono"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="telefono"
                label={t('sucursal:form.phone')}
                fullWidth
                error={Boolean(errors.telefono)}
                helperText={errors.telefono ? t(errors.telefono.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="descripcion"
                label={t('common:description')}
                fullWidth
                multiline
                minRows={3}
                error={Boolean(errors.descripcion)}
                helperText={errors.descripcion ? t(errors.descripcion.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="direccion_exacta"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="direccion_exacta"
                label={t('sucursal:form.address')}
                fullWidth
                error={Boolean(errors.direccion_exacta)}
                helperText={errors.direccion_exacta ? t(errors.direccion_exacta.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="correo_electronico"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="correo_electronico"
                label={t('sucursal:form.email')}
                fullWidth
                error={Boolean(errors.correo_electronico)}
                helperText={errors.correo_electronico ? t(errors.correo_electronico.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          {/* Lista de usuarios encargados disponibles (se pueden seleccionar varios) */}
          <FormControl fullWidth error={Boolean(errors.encargados)}>
            <InputLabel id="encargados-label">{t('sucursal:form.managers')}</InputLabel>
            <Controller
              name="encargados"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="encargados-label"
                  label={t('sucursal:form.managers')}
                  multiple
                  value={field.value}
                  renderValue={(seleccionados) =>
                    dataEncargados
                      .filter((encargado) => seleccionados.includes(Number(encargado.id_usuario)))
                      .map((encargado) => encargado.nombre)
                      .join(', ')
                  }
                >
                  {dataEncargados.map((encargado) => (
                    <MenuItem key={encargado.id_usuario} value={Number(encargado.id_usuario)}>
                      <Checkbox checked={field.value.includes(Number(encargado.id_usuario))} />
                      <ListItemText primary={encargado.nombre} secondary={encargado.correo} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.encargados
                ? t(errors.encargados.message)
                : dataEncargados.length === 0
                  ? t('sucursal:form.noAvailable')
                  : ' '}
            </FormHelperText>
          </FormControl>
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
