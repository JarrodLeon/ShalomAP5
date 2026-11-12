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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import ProductoService from '../../services/ProductoService';
import CategoriaService from '../../services/CategoriaService';
import ImageService from '../../services/ImageService';
import { ImageUpload } from '../Form/ImageUpload';
import { validarImagen } from '../../utils/validarImagen';
import { mensajeError } from '../../utils/apiError';

//Esquema de validación
const productoSchema = yup.object({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: yup.string().required('La descripción es requerida'),
  id_categoria: yup
    .number()
    .typeError('Seleccione una categoría')
    .required('La categoría es requerida'),
  precio: yup
    .number()
    .typeError('Solo acepta números')
    .required('El precio es requerido')
    .positive('El precio debe ser mayor a cero'),
  stock_disponible: yup
    .number()
    .typeError('Solo acepta números')
    .required('El stock es requerido')
    .integer('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  es_personalizable: yup.boolean(),
});

//Formulario para crear y modificar un producto (si la ruta trae un id, modifica)
export function FormProducto() {
  const navigate = useNavigate();
  const { id } = useParams(); //Id del producto a modificar (no existe al crear)
  const esEdicion = Boolean(id);

  const {
    control, //register
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    //Los nombres coinciden con los que necesita el API
    defaultValues: {
      nombre: '',
      descripcion: '',
      id_categoria: '',
      precio: '',
      stock_disponible: '',
      es_personalizable: false,
    },
    // Asignación de validaciones
    resolver: yupResolver(productoSchema),
  });

  //Gestión de errores
  const [error, setError] = useState('');
  const [noEncontrado, setNoEncontrado] = useState(false);
  //Imagen: archivo seleccionado, imagen guardada y mensaje de validación
  const [imagen, setImagen] = useState(null);
  const [imagenActual, setImagenActual] = useState('');
  const [imagenError, setImagenError] = useState('');

  //Lista de categorías (entrada de selección)
  const [dataCategorias, setDataCategorias] = useState([]);
  const [loadedCategorias, setLoadedCategorias] = useState(false);
  useEffect(() => {
    CategoriaService.getCategorias()
      .then((response) => {
        setDataCategorias(response.data);
        setLoadedCategorias(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoadedCategorias(true);
      });
  }, []);

  //Al modificar: cargar el producto y precargar los valores en el formulario
  useEffect(() => {
    if (!esEdicion) return;
    ProductoService.getProductoById(id)
      .then((response) => {
        const producto = response.data;
        if (producto && producto.id_producto) {
          reset({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            id_categoria: Number(producto.id_categoria),
            precio: producto.precio,
            stock_disponible: producto.stock_disponible,
            es_personalizable: Number(producto.es_personalizable) === 1,
          });
          setImagenActual(producto.imagen_url || '');
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

  // Si ocurre error al realizar el submit
  const onError = (errors, e) => {
    console.log(errors, e);
    validarImagenFormulario();
  };

  // Accion submit
  const onSubmit = (DataForm) => {
    if (!validarImagenFormulario()) return;
    const producto = {
      ...DataForm,
      es_personalizable: DataForm.es_personalizable ? 1 : 0,
    };
    //Crear o actualizar el producto
    const guardar = esEdicion
      ? ProductoService.updateProducto({ ...producto, id_producto: Number(id) })
      : ProductoService.createProducto(producto);
    guardar
      .then(async (response) => {
        const guardado = response.data;
        if (guardado && guardado.id_producto) {
          //Subir la imagen seleccionada
          if (imagen) {
            try {
              const formData = new FormData();
              formData.append('file', imagen);
              formData.append('tipo', 'producto');
              formData.append('id', guardado.id_producto);
              await ImageService.createImage(formData);
            } catch (errorImagen) {
              toast.error(
                `Producto guardado, pero la imagen no se pudo subir: ${mensajeError(errorImagen)}`,
                { duration: 6000, position: 'top-center' },
              );
              return navigate('/mantenimiento-productos');
            }
          }
          toast.success(
            `Producto ${esEdicion ? 'modificado' : 'creado'} #${guardado.id_producto} - ${guardado.nombre}`,
            { duration: 4000, position: 'top-center' },
          );
          //Redirección a la tabla de mantenimiento
          return navigate('/mantenimiento-productos');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(mensajeError(error), { duration: 5000, position: 'top-center' });
      });
  };

  if (error) return <p>Error: {error.message}</p>;
  if (!loadedCategorias) return <p>Cargando...</p>;
  if (noEncontrado) return <p>Producto no encontrado</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12}>
          <Typography variant="h5" gutterBottom>
            {esEdicion ? 'Modificar Producto' : 'Crear Producto'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* Controlador y entrada de formulario nombre */}
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
          {/* Lista de categorías */}
          <FormControl fullWidth error={Boolean(errors.id_categoria)}>
            <InputLabel id="categoria-label">Categoría</InputLabel>
            <Controller
              name="id_categoria"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="categoria-label" label="Categoría" value={field.value}>
                  {dataCategorias.map((categoria) => (
                    <MenuItem key={categoria.id_categoria} value={Number(categoria.id_categoria)}>
                      {categoria.nombre_categoria}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText sx={{ color: '#d32f2f' }}>
              {errors.id_categoria ? errors.id_categoria.message : ' '}
            </FormHelperText>
          </FormControl>
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="precio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="precio"
                label="Precio (₡)"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                error={Boolean(errors.precio)}
                helperText={errors.precio ? errors.precio.message : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {/* Campo adicional 1: stock disponible */}
          <Controller
            name="stock_disponible"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="stock_disponible"
                label="Stock disponible"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '1' } }}
                error={Boolean(errors.stock_disponible)}
                helperText={errors.stock_disponible ? errors.stock_disponible.message : ' '}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {/* Campo adicional 2: producto personalizable */}
          <Controller
            name="es_personalizable"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={Boolean(field.value)} onChange={field.onChange} />}
                label="Producto personalizable"
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
