<?php
class FacturaModel
{
    //Conectarse a la BD
    public $enlace;

    //Constructor
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    //Obtener el historial de facturas de la sucursal del encargado (la más reciente primero)
    public function all($idEncargado)
    {
        try {
            $idEncargado = (int) $idEncargado;
            $vSQL = "SELECT f.id_factura, f.fecha_emision, f.total, u.nombre AS cliente
                     FROM factura f, usuario u
                     WHERE u.id_usuario = f.id_cliente
                     AND f.id_sucursal = (SELECT e.id_sucursal FROM usuario e
                                          WHERE e.id_usuario = $idEncargado AND e.id_rol = 2)
                     ORDER BY f.fecha_emision DESC;";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Obtener una factura completa (encabezado + líneas de detalle)
    public function get($id, $idEncargado)
    {
        try {
            $id = (int) $id;
            $idEncargado = (int) $idEncargado;
            //Encabezado: fecha, cliente y sucursal
            $vSql = "SELECT f.id_factura, f.fecha_emision, f.subtotal, f.porcentaje_impuesto,
                            f.impuesto, f.total, f.estado_factura,
                            u.identificacion AS cliente_identificacion,
                            u.nombre AS cliente_nombre,
                            s.nombre AS sucursal_nombre,
                            s.telefono AS sucursal_telefono,
                            s.direccion_exacta AS sucursal_direccion,
                            s.correo_electronico AS sucursal_correo
                     FROM factura f, usuario u, sucursal s
                     WHERE u.id_usuario = f.id_cliente
                     AND s.id_sucursal = f.id_sucursal
                     AND f.id_factura = $id
                     AND f.id_sucursal = (SELECT e.id_sucursal FROM usuario e
                                          WHERE e.id_usuario = $idEncargado AND e.id_rol = 2);";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (is_array($vResultado) && !empty($vResultado)) { //Si se encuentra la factura
                $vResultado = $vResultado[0];
                //Líneas de servicio (cada reserva asociada a la factura)
                $vSqlServicios = "SELECT 'Servicio' AS tipo, s.nombre AS descripcion, 1 AS cantidad,
                                         r.precio_servicio AS precio_unitario,
                                         r.precio_servicio AS subtotal,
                                         r.fecha_cita
                                  FROM reserva r, servicio s
                                  WHERE s.id_servicio = r.id_servicio
                                  AND r.id_factura = $id
                                  ORDER BY r.fecha_cita;";
                $servicios = $this->enlace->ExecuteSQL($vSqlServicios);
                //Líneas de producto
                $vSqlProductos = "SELECT 'Producto' AS tipo, p.nombre AS descripcion, d.cantidad,
                                         d.precio_unitario, d.subtotal_linea AS subtotal,
                                         d.talla, d.color_base, d.diseno_mangas, d.aplicaciones
                                  FROM factura_detalle_producto d, producto p
                                  WHERE p.id_producto = d.id_producto
                                  AND d.id_factura = $id
                                  ORDER BY d.id_detalle;";
                $productos = $this->enlace->ExecuteSQL($vSqlProductos);
                //Unir servicios y productos en una sola lista de líneas
                $lineas = [];
                if (is_array($servicios) && !empty($servicios)) {
                    $lineas = array_merge($lineas, $servicios);
                }
                if (is_array($productos) && !empty($productos)) {
                    $lineas = array_merge($lineas, $productos);
                }
                $vResultado->lineas = $lineas;
            }
            //Retornar la respuesta
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
