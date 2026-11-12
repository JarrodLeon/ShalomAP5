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
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import ServicioService from '../../services/ServicioService';
import ImageService from '../../services/ImageService';
import { ImageUpload } from '../Form/ImageUpload';
import { validarImagen } from '../../utils/validarImagen';
import { mensajeError } from '../../utils/apiError';

//Esquema de validación
const servicioSchema = yup.object({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: yup.string().required('La descripción es requerida'),
  tarifa: yup
    .number()
    .typeError('Solo acepta números')
    .required('La tarifa es requerida')
    .min(0, 'La tarifa no puede ser negativa'),
  tiempo: yup
    .number()
    .typeError('Solo acepta números')
    .required('El tiempo es requerido')
    .positive('El tiempo debe ser mayor a cero'),
  unidad: yup.string().oneOf(['minutos', 'horas']).required('Seleccione la unidad'),
  modalidad: yup.string().required('La modalidad es requerida'),
  edad_recomendada: yup.string().required('La edad recomendada es requerida'),
});

//Formulario para crear y modificar un servicio (si la ruta trae un id, modifica)
export function FormServicio() {
  const navigate = useNavigate();
  const { id } = useParams(); //Id del servicio a modificar (no existe al crear)
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
      tarifa: '',
      tiempo: '',
      unidad: 'minutos',
      modalidad: '',
      edad_recomendada: '',
    },
    resolver: yupResolver(servicioSchema),
  });

  const [error, setError] = useState('');
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [imagenActual, setImagenActual] = useState('');
  const [imagenError, setImagenError] = useState('');

  //Al modificar: cargar el servicio y precargar los valores en el formulario
  useEffect(() => {
    if (!esEdicion) return;
    ServicioService.getServicioById(id)
      .then((response) => {
        const servicio = response.data;
        if (servicio && servicio.id_servicio) {
          //El API guarda minutos: se muestra en horas cuando es un número exacto de horas
          const minutos = Number(servicio.tiempo_servicio);
          const enHoras = minutos % 60 === 0;
          reset({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            tarifa: servicio.tarifa,
            tiempo: enHoras ? minutos / 60 : minutos,
            unidad: enHoras ? 'horas' : 'minutos',
            modalidad: servicio.modalidad,
            edad_recomendada: servicio.edad_recomendada,
          });
          setImagenActual(servicio.imagen_url || '');
        } else {
          setNoEncontrado(true);
        }
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, [esEdicion, id, reset]);

  //Validación de la imagen: es requerida al crear
  const validarImagenFormulario = () => {
    const mensaje = !esEdicion && !imagen ? 'La imagen es requerida' : validarImagen(imagen);
    setImagenError(mensaje);
    return mensaje === '';
  };
  const handleImagen = (file) => {
    setImagen(file);
    setImagenError(validarImagen(file));
  };

  const onError = (errors, e) => {
    console.log(errors, e);
    validarImagenFormulario();
  };

  // Accion submit
  const onSubmit = (DataForm) => {
    if (!validarImagenFormulario()) return;
    //El tiempo se envía siempre en minutos
    const servicio = {
      nombre: DataForm.nombre,
      descripcion: DataForm.descripcion,
      tarifa: DataForm.tarifa,
      tiempo_servicio: Math.round(DataForm.unidad === 'horas' ? DataForm.tiempo * 60 : DataForm.tiempo),
      modalidad: DataForm.modalidad,
      edad_recomendada: DataForm.edad_recomendada,
    };
    const guardar = esEdicion
      ? ServicioService.updateServicio({ ...servicio, id_servicio: Number(id) })
      : ServicioService.createServicio(servicio);
    guardar
      .then(async (response) => {
        const guardado = response.data;
        if (guardado && guardado.id_servicio) {
          //Subir la imagen seleccionada
          if (imagen) {
            try {
              const formData = new FormData();
              formData.append('file', imagen);
              formData.append('tipo', 'servicio');
              formData.append('id', guardado.id_servicio);
              await ImageService.createImage(formData);
            } catch (errorImagen) {
              toast.error(
                `Servicio guardado, pero la imagen no se pudo subir: ${mensajeError(errorImagen)}`,
                { duration: 6000, position: 'top-center' },
              );
              return navigate('/mantenimiento-servicios');
            }
          }
          toast.success(
            `Servicio ${esEdicion ? 'modificado' : 'creado'} #${guardado.id_servicio} - ${guardado.nombre}`,
            { duration: 4000, position: 'top-center' },
          );
          return navigate('/mantenimiento-servicios');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(mensajeError(error), { duration: 5000, position: 'top-center' });
      });
  };

  if (error) return <p>Error: {error.message}</p>;
  if (noEncontrado) return <p>Servicio no encontrado</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Typography variant="h5" gutterBottom>
            {esEdicion ? 'Modificar Servicio' : 'Crear Servicio'}
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
            name="tarifa"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="tarifa"
                label="Tarifa (₡)"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                error={Boolean(errors.tarifa)}
                helperText={errors.tarifa ? errors.tarifa.message : ' '}
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
        <Grid size={{ xs: 8, sm: 3 }}>
          {/* Tiempo del servicio, en horas o minutos */}
          <Controller
            name="tiempo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="tiempo"
                label="Tiempo de servicio"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.25' } }}
                error={Boolean(errors.tiempo)}
                helperText={errors.tiempo ? errors.tiempo.message : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3 }}>
          <FormControl fullWidth error={Boolean(errors.unidad)}>
            <InputLabel id="unidad-label">Unidad</InputLabel>
            <Controller
              name="unidad"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="unidad-label" label="Unidad" value={field.value}>
                  <MenuItem value="minutos">Minutos</MenuItem>
                  <MenuItem value="horas">Horas</MenuItem>
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.unidad ? errors.unidad.message : ' '}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {/* Campo adicional 1: modalidad */}
          <FormControl fullWidth error={Boolean(errors.modalidad)}>
            <InputLabel id="modalidad-label">Modalidad</InputLabel>
            <Controller
              name="modalidad"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="modalidad-label" label="Modalidad" value={field.value}>
                  <MenuItem value="Individual">Individual</MenuItem>
                  <MenuItem value="Grupal">Grupal</MenuItem>
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.modalidad ? errors.modalidad.message : ' '}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {/* Campo adicional 2: edad recomendada */}
          <Controller
            name="edad_recomendada"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="edad_recomendada"
                label="Edad recomendada"
                fullWidth
                error={Boolean(errors.edad_recomendada)}
                helperText={errors.edad_recomendada ? errors.edad_recomendada.message : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          {/* Insertar o modificar la imagen */}
          <ImageUpload
            file={imagen}
            onChange={handleImagen}
            currentImage={imagenActual}
            error={imagenError}
          />
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
