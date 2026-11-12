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
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: yup.string().required('La descripción es requerida'),
  telefono: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^[0-9]{4}-?[0-9]{4}$/, 'Debe tener 8 dígitos (ej. 2441-1010)'),
  direccion_exacta: yup.string().required('La dirección exacta es requerida'),
  correo_electronico: yup
    .string()
    .required('El correo electrónico es requerido')
    .email('El correo electrónico no tiene un formato válido'),
  //Relación de muchos: el valor por defecto es un arreglo
  encargados: yup.array().min(1, 'Seleccione al menos un encargado'),
});

//Formulario para crear y modificar una sucursal (si la ruta trae un id, modifica)
export function FormSucursal() {
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
            `Sucursal ${esEdicion ? 'modificada' : 'creada'} #${guardada.id_sucursal} - ${guardada.nombre}`,
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

  if (error) return <p>Error: {error.message}</p>;
  if (!loadedEncargados) return <p>Cargando...</p>;
  if (noEncontrado) return <p>Sucursal no encontrada</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Typography variant="h5" gutterBottom>
            {esEdicion ? 'Modificar Sucursal' : 'Crear Sucursal'}
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
                label="Nombre"
                fullWidth
                error={Boolean(errors.nombre)}
                helperText={errors.nombre ? errors.nombre.message : ' '}
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
                label="Número de teléfono"
                fullWidth
                error={Boolean(errors.telefono)}
                helperText={errors.telefono ? errors.telefono.message : ' '}
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
                label="Descripción"
                fullWidth
                multiline
                minRows={3}
                error={Boolean(errors.descripcion)}
                helperText={errors.descripcion ? errors.descripcion.message : ' '}
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
                label="Dirección exacta"
                fullWidth
                error={Boolean(errors.direccion_exacta)}
                helperText={errors.direccion_exacta ? errors.direccion_exacta.message : ' '}
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
                label="Correo electrónico"
                fullWidth
                error={Boolean(errors.correo_electronico)}
                helperText={errors.correo_electronico ? errors.correo_electronico.message : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          {/* Lista de usuarios encargados disponibles (se pueden seleccionar varios) */}
          <FormControl fullWidth error={Boolean(errors.encargados)}>
            <InputLabel id="encargados-label">Encargados</InputLabel>
            <Controller
              name="encargados"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="encargados-label"
                  label="Encargados"
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
                ? errors.encargados.message
                : dataEncargados.length === 0
                  ? 'No hay usuarios encargados sin sucursal asignada'
                  : ' '}
            </FormHelperText>
          </FormControl>
        </Grid>
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
