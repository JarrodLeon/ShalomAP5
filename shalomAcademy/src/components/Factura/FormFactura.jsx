import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
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
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FacturaService from '../../services/FacturaService';
import UsuarioService from '../../services/UsuarioService';
import ServicioService from '../../services/ServicioService';
import ProductoService from '../../services/ProductoService';
import { mensajeError } from '../../utils/apiError';
import { fechaActualISO } from '../../utils/tiempo';
import { formatFecha, formatMoneda, numeroFactura } from '../../utils/formatters';

//Porcentaje de impuesto (IVA). El API calcula los montos otra vez con el mismo porcentaje
const IVA = 13;
const redondear = (numero) => Math.round((numero + Number.EPSILON) * 100) / 100;

//Esquema de validación
const facturaSchema = yup.object({
  id_cliente: yup
    .number()
    .typeError('validation:clienteRequerido')
    .required('validation:clienteRequerido'),
  //Relación de muchos con más campos: un arreglo de objetos
  lineas: yup
    .array()
    .of(
      yup.object({
        tipo: yup.string().required(),
        id_item: yup
          .number()
          .typeError('validation:itemRequerido')
          .required('validation:itemRequerido'),
        cantidad: yup
          .number()
          .typeError('validation:cantidadRequerida')
          .required('validation:cantidadRequerida')
          .integer('validation:cantidadEntera')
          .min(1, 'validation:cantidadMin'),
      }),
    )
    .min(1, 'validation:lineasMin'),
});

//Formulario con formato de factura. Sirve para registrar una factura nueva
//y para facturar una proforma (si la ruta trae un id, precarga la proforma)
export function FormFactura() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); //Id de la proforma a facturar (no existe al registrar una factura nueva)
  const esProforma = Boolean(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { id_cliente: '', lineas: [] },
    resolver: yupResolver(facturaSchema),
  });
  //Líneas de detalle: agregar y borrar
  const { fields, append, remove } = useFieldArray({ control, name: 'lineas' });
  //Valores en tiempo real, para calcular subtotales e impuestos mientras el usuario cambia datos
  const lineasValores = useWatch({ control, name: 'lineas' }) || [];
  const idCliente = useWatch({ control, name: 'id_cliente' });

  const [error, setError] = useState('');
  const [contexto, setContexto] = useState(null); //Encargado y sucursal (solo lectura)
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proformaInvalida, setProformaInvalida] = useState(false);
  const [numeroProforma, setNumeroProforma] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Cargar los datos de solo lectura, las listas y, si es una proforma, su información
  useEffect(() => {
    const peticiones = [
      FacturaService.getContexto(),
      UsuarioService.getClientes(),
      ServicioService.getServicios(),
      ProductoService.getProductos(),
    ];
    if (esProforma) peticiones.push(FacturaService.getFacturaById(id));
    Promise.all(peticiones)
      .then(([resContexto, resClientes, resServicios, resProductos, resFactura]) => {
        setContexto(resContexto.data);
        setClientes(resClientes.data);
        setServicios(resServicios.data);
        setProductos(resProductos.data);
        if (esProforma) {
          const factura = resFactura.data;
          if (factura && factura.id_factura && factura.estado_factura === 'Proforma') {
            //Precargar cliente y líneas registradas en la proforma
            reset({
              id_cliente: Number(factura.id_cliente),
              lineas: factura.lineas.map((linea) => ({
                tipo: linea.tipo,
                id_item: Number(linea.tipo === 'Servicio' ? linea.id_servicio : linea.id_producto),
                cantidad: Number(linea.cantidad),
              })),
            });
            setNumeroProforma(numeroFactura(factura.id_factura));
          } else {
            setProformaInvalida(true);
          }
        }
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(mensajeError(error));
        setLoaded(true);
      });
  }, [esProforma, id, reset]);

  //Lista de servicios o de productos según el tipo de la línea
  const itemsDe = (tipo) => (tipo === 'Servicio' ? servicios : productos);
  const idDe = (tipo, item) => Number(tipo === 'Servicio' ? item.id_servicio : item.id_producto);
  const precioDe = (tipo, idItem) => {
    const item = itemsDe(tipo).find((i) => idDe(tipo, i) === Number(idItem));
    return item ? Number(tipo === 'Servicio' ? item.tarifa : item.precio) : 0;
  };

  //Cálculos de cada línea y de la factura
  const calculos = lineasValores.map((linea) => {
    const cantidad = Number(linea?.cantidad) || 0;
    const subtotal = redondear(precioDe(linea?.tipo, linea?.id_item) * cantidad);
    const impuesto = redondear((subtotal * IVA) / 100);
    return { precio: precioDe(linea?.tipo, linea?.id_item), subtotal, impuesto, total: redondear(subtotal + impuesto) };
  });
  const subtotalFactura = redondear(calculos.reduce((suma, c) => suma + c.subtotal, 0));
  const impuestoFactura = redondear(calculos.reduce((suma, c) => suma + c.impuesto, 0));
  const totalFactura = redondear(calculos.reduce((suma, c) => suma + c.total, 0)); //Suma de los totales de línea

  const clienteSeleccionado = clientes.find((c) => Number(c.id_usuario) === Number(idCliente));
  const errorLineas = errors.lineas?.message || errors.lineas?.root?.message;

  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  // Accion submit
  const onSubmit = (DataForm) => {
    //No se envían precios, encargado ni sucursal: el API los obtiene y calcula
    const factura = {
      id_cliente: DataForm.id_cliente,
      lineas: DataForm.lineas.map((linea) => ({
        tipo: linea.tipo,
        id_item: linea.id_item,
        cantidad: linea.cantidad,
      })),
    };
    const guardar = esProforma
      ? FacturaService.facturarProforma({ ...factura, id_factura: Number(id) })
      : FacturaService.createFactura(factura);
    guardar
      .then((response) => {
        const guardada = response.data;
        if (guardada && guardada.id_factura) {
          toast.success(
            t(esProforma ? 'factura:form.invoiced' : 'factura:form.created', {
              number: numeroFactura(guardada.id_factura),
            }),
            { duration: 5000, position: 'top-center' },
          );
          //Redirección al historial de facturas
          return navigate('/factura');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(mensajeError(error), { duration: 6000, position: 'top-center' });
      });
  };

  if (error) return <p>{t('common:errorPrefix', { message: error })}</p>;
  if (!loaded) return <p>{t('common:loading')}</p>;
  if (proformaInvalida) return <p>{t('factura:form.notProforma')}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Paper sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {esProforma ? t('factura:form.titleProforma', { number: numeroProforma }) : t('factura:form.title')}
        </Typography>

        {/* ---------- Encabezado: fecha, sucursal, cliente y encargado ---------- */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1">
              {t('factura:form.date', { date: formatFecha(fechaActualISO()) })}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {/* Sucursal del encargado: solo lectura */}
            <TextField
              label={t('factura:form.branch')}
              value={contexto ? contexto.sucursal : ''}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {/* Lista de clientes (al facturar una proforma viene precargado) */}
            <FormControl fullWidth size="small" error={Boolean(errors.id_cliente)}>
              <InputLabel id="cliente-label">{t('factura:form.client')}</InputLabel>
              <Controller
                name="id_cliente"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="cliente-label"
                    label={t('factura:form.client')}
                    value={field.value}
                    disabled={esProforma}
                  >
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
            {clienteSeleccionado && (
              <Box>
                <Typography variant="body2">{t('factura:form.clientName', { name: clienteSeleccionado.nombre })}</Typography>
                <Typography variant="body2">{t('factura:form.clientEmail', { email: clienteSeleccionado.correo })}</Typography>
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {/* Encargado que registra la factura: solo lectura */}
            <TextField
              label={t('factura:form.manager')}
              value={contexto ? contexto.encargado : ''}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ---------- Detalle: líneas de producto y servicio ---------- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('factura:form.details')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => append({ tipo: 'Servicio', id_item: '', cantidad: 1 })}
          >
            {t('factura:form.addService')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => append({ tipo: 'Producto', id_item: '', cantidad: 1 })}
          >
            {t('factura:form.addProduct')}
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('factura:form.type')}</TableCell>
                <TableCell sx={{ minWidth: 220 }}>{t('factura:form.item')}</TableCell>
                <TableCell align="right">{t('factura:form.price')}</TableCell>
                <TableCell>{t('factura:form.quantity')}</TableCell>
                <TableCell align="right">{t('factura:form.subtotal')}</TableCell>
                <TableCell align="right">{t('factura:form.tax')}</TableCell>
                <TableCell align="right">{t('factura:form.lineTotal')}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => {
                const linea = lineasValores[index];
                const calculo = calculos[index] || { precio: 0, subtotal: 0, impuesto: 0, total: 0 };
                const tipo = linea?.tipo || field.tipo;
                return (
                  <TableRow key={field.id}>
                    <TableCell>{t(`factura:tipo.${tipo}`, { defaultValue: tipo })}</TableCell>
                    <TableCell>
                      {/* Producto o servicio: al seleccionarlo aparece su precio */}
                      <FormControl fullWidth size="small" error={Boolean(errors.lineas?.[index]?.id_item)}>
                        <Controller
                          name={`lineas.${index}.id_item`}
                          control={control}
                          render={({ field: f }) => (
                            <Select {...f} value={f.value} displayEmpty>
                              {itemsDe(tipo).map((item) => (
                                <MenuItem key={idDe(tipo, item)} value={idDe(tipo, item)}>
                                  {item.nombre}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        <FormHelperText sx={{ color: '#d32f2f' }}>
                          {errors.lineas?.[index]?.id_item ? t(errors.lineas[index].id_item.message) : ' '}
                        </FormHelperText>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">{formatMoneda(calculo.precio)}</TableCell>
                    <TableCell>
                      {/* Cantidad: solo números; con 0 la línea se elimina */}
                      <Controller
                        name={`lineas.${index}.cantidad`}
                        control={control}
                        render={({ field: f }) => (
                          <TextField
                            {...f}
                            type="number"
                            size="small"
                            sx={{ width: 100 }}
                            slotProps={{ htmlInput: { min: 0, step: 1 } }}
                            onChange={(event) => {
                              const valor = event.target.value;
                              if (valor !== '' && Number(valor) === 0) {
                                remove(index);
                              } else {
                                f.onChange(valor);
                              }
                            }}
                            error={Boolean(errors.lineas?.[index]?.cantidad)}
                            helperText={errors.lineas?.[index]?.cantidad ? t(errors.lineas[index].cantidad.message) : ' '}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell align="right">{formatMoneda(calculo.subtotal)}</TableCell>
                    <TableCell align="right">{formatMoneda(calculo.impuesto)}</TableCell>
                    <TableCell align="right">{formatMoneda(calculo.total)}</TableCell>
                    <TableCell>
                      {/* Eliminar la línea */}
                      <Tooltip title={t('factura:form.deleteLine')}>
                        <IconButton color="warning" onClick={() => remove(index)} aria-label={t('factura:form.deleteLine')}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {fields.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>{t('factura:form.noLines')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <FormHelperText sx={{ color: '#d32f2f' }}>{errorLineas ? t(errorLineas) : ' '}</FormHelperText>

        {/* ---------- Totales en tiempo real ---------- */}
        <Box sx={{ mt: 2, ml: 'auto', maxWidth: 340 }}>
          <Grid container spacing={1}>
            <Grid size={6}>
              <Typography>{t('factura:form.subtotal')}</Typography>
            </Grid>
            <Grid size={6} sx={{ textAlign: 'right' }}>
              <Typography>{formatMoneda(subtotalFactura)}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography>{t('factura:detail.tax', { percent: IVA })}</Typography>
            </Grid>
            <Grid size={6} sx={{ textAlign: 'right' }}>
              <Typography>{formatMoneda(impuestoFactura)}</Typography>
            </Grid>
            <Grid size={12}>
              <Divider />
            </Grid>
            <Grid size={6}>
              <Typography variant="h6">{t('factura:form.total')}</Typography>
            </Grid>
            <Grid size={6} sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary">
                {formatMoneda(totalFactura)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
            {t('common:save')}
          </Button>
          <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate(-1)}>
            {t('common:cancel')}
          </Button>
        </Box>
      </Paper>
    </form>
  );
}
