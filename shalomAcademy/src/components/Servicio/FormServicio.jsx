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
    .required('validation:nombreRequerido')
    .min(2, 'validation:nombreMin'),
  descripcion: yup.string().required('validation:descripcionRequerida'),
  tarifa: yup
    .number()
    .typeError('validation:soloNumeros')
    .required('validation:tarifaRequerida')
    .min(0, 'validation:tarifaMin'),
  tiempo: yup
    .number()
    .typeError('validation:soloNumeros')
    .required('validation:tiempoRequerido')
    .positive('validation:tiempoPositivo'),
  unidad: yup.string().oneOf(['minutos', 'horas']).required('validation:unidadSeleccione'),
  modalidad: yup.string().required('validation:modalidadRequerida'),
  edad_recomendada: yup.string().required('validation:edadRequerida'),
});

//Formulario para crear y modificar un servicio (si la ruta trae un id, modifica)
export function FormServicio() {
  const { t } = useTranslation();
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
    const mensaje = !esEdicion && !imagen ? 'validation:imagenRequerida' : validarImagen(imagen);
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
                t('servicio:form.imageUploadError', { message: mensajeError(errorImagen) }),
                { duration: 6000, position: 'top-center' },
              );
              return navigate('/mantenimiento-servicios');
            }
          }
          toast.success(
            t(esEdicion ? 'servicio:form.modified' : 'servicio:form.created', { id: guardado.id_servicio, name: guardado.nombre }),
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

  if (error) return <p>{t('common:errorPrefix', { message: error.message })}</p>;
  if (noEncontrado) return <p>{t('servicio:form.notFound')}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Typography variant="h5" gutterBottom>
            {esEdicion ? t('servicio:form.editTitle') : t('servicio:form.createTitle')}
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
            name="tarifa"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="tarifa"
                label={t('servicio:form.rate')}
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                error={Boolean(errors.tarifa)}
                helperText={errors.tarifa ? t(errors.tarifa.message) : ' '}
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
        <Grid size={{ xs: 8, sm: 3 }}>
          {/* Tiempo del servicio, en horas o minutos */}
          <Controller
            name="tiempo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="tiempo"
                label={t('servicio:form.time')}
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.25' } }}
                error={Boolean(errors.tiempo)}
                helperText={errors.tiempo ? t(errors.tiempo.message) : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 3 }}>
          <FormControl fullWidth error={Boolean(errors.unidad)}>
            <InputLabel id="unidad-label">{t('servicio:form.unit')}</InputLabel>
            <Controller
              name="unidad"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="unidad-label" label={t('servicio:form.unit')} value={field.value}>
                  <MenuItem value="minutos">{t('servicio:form.minutes')}</MenuItem>
                  <MenuItem value="horas">{t('servicio:form.hours')}</MenuItem>
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.unidad ? t(errors.unidad.message) : ' '}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {/* Campo adicional 1: modalidad */}
          <FormControl fullWidth error={Boolean(errors.modalidad)}>
            <InputLabel id="modalidad-label">{t('servicio:form.modality')}</InputLabel>
            <Controller
              name="modalidad"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="modalidad-label" label={t('servicio:form.modality')} value={field.value}>
                  <MenuItem value="Individual">{t('servicio:modalidad.Individual')}</MenuItem>
                  <MenuItem value="Grupal">{t('servicio:modalidad.Grupal')}</MenuItem>
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.modalidad ? t(errors.modalidad.message) : ' '}
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
                label={t('servicio:form.age')}
                fullWidth
                error={Boolean(errors.edad_recomendada)}
                helperText={errors.edad_recomendada ? t(errors.edad_recomendada.message) : ' '}
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
