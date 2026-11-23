<?php
class FacturaModel
{
    //Conectarse a la BD
    public $enlace;
    //Porcentaje de impuesto (IVA)
    const IVA = 13.00;

    //Constructor
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    //Sucursal a la que pertenece el encargado (el encargado se define en el controlador)
    private function sucursalDelEncargado($idEncargado)
    {
        $idEncargado = (int) $idEncargado;
        $r = $this->enlace->ExecuteSQL("SELECT id_sucursal FROM usuario
                                        WHERE id_usuario = $idEncargado AND id_rol = 2 AND id_sucursal IS NOT NULL;");
        if (empty($r)) {
            throw new InvalidArgumentException('El encargado no tiene una sucursal asignada');
        }
        return (int) $r[0]->id_sucursal;
    }

    /**
     * Datos de solo lectura para el formulario: nombre del encargado y de su sucursal
     */
    public function contexto($idEncargado)
    {
        $idEncargado = (int) $idEncargado;
        $this->sucursalDelEncargado($idEncargado);
        try {
            $vSQL = "SELECT u.nombre AS encargado, s.id_sucursal, s.nombre AS sucursal
                     FROM usuario u, sucursal s
                     WHERE s.id_sucursal = u.id_sucursal AND u.id_usuario = $idEncargado;";
            $r = $this->enlace->ExecuteSQL($vSQL);
            return $r[0];
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Historial de facturas de la sucursal del encargado (la más reciente primero)
    public function all($idEncargado)
    {
        try {
            $idEncargado = (int) $idEncargado;
            $vSQL = "SELECT f.id_factura, f.fecha_emision, f.total, f.estado_factura, u.nombre AS cliente
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

    //Obtener una factura completa (encabezado + líneas de servicio y de producto)
    public function get($id, $idEncargado)
    {
        try {
            $id = (int) $id;
            $idEncargado = (int) $idEncargado;
            $vSql = "SELECT f.id_factura, f.fecha_emision, f.subtotal, f.porcentaje_impuesto,
                            f.impuesto, f.total, f.estado_factura, f.id_sucursal,
                            u.id_usuario AS id_cliente,
                            u.identificacion AS cliente_identificacion,
                            u.nombre AS cliente_nombre,
                            u.correo AS cliente_correo,
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
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
                //Líneas de servicio
                $vSqlServicios = "SELECT 'Servicio' AS tipo, d.id_servicio, s.nombre AS descripcion, d.cantidad,
                                         d.precio_unitario, d.subtotal_linea AS subtotal,
                                         (SELECT r.fecha_cita FROM reserva r
                                          WHERE r.id_factura = d.id_factura AND r.id_servicio = d.id_servicio
                                          ORDER BY r.id_reserva LIMIT 1) AS fecha_cita
                                  FROM factura_detalle_servicio d, servicio s
                                  WHERE s.id_servicio = d.id_servicio
                                  AND d.id_factura = $id
                                  ORDER BY d.id_detalle_servicio;";
                $servicios = $this->enlace->ExecuteSQL($vSqlServicios);
                //Líneas de producto
                $vSqlProductos = "SELECT 'Producto' AS tipo, d.id_producto, p.nombre AS descripcion, d.cantidad,
                                         d.precio_unitario, d.subtotal_linea AS subtotal,
                                         d.talla, d.color_base, d.diseno_mangas, d.aplicaciones
                                  FROM factura_detalle_producto d, producto p
                                  WHERE p.id_producto = d.id_producto
                                  AND d.id_factura = $id
                                  ORDER BY d.id_detalle;";
                $productos = $this->enlace->ExecuteSQL($vSqlProductos);
                $lineas = array();
                if (!empty($servicios)) {
                    $lineas = array_merge($lineas, $servicios);
                }
                if (!empty($productos)) {
                    $lineas = array_merge($lineas, $productos);
                }
                $vResultado->lineas = $lineas;
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //El cliente debe existir y ser de rol cliente
    private function validarCliente($idCliente)
    {
        if (!isset($idCliente) || !is_numeric($idCliente)) {
            throw new InvalidArgumentException('El cliente es requerido');
        }
        $idCliente = (int) $idCliente;
        $r = $this->enlace->ExecuteSQL("SELECT COUNT(*) AS total FROM usuario WHERE id_usuario = $idCliente AND id_rol = 1;");
        if (empty($r) || (int) $r[0]->total === 0) {
            throw new InvalidArgumentException('El cliente seleccionado no es válido');
        }
        return $idCliente;
    }

    /**
     * Valida las líneas de detalle y calcula los montos en el servidor
     * (los precios se leen de la BD; nunca se confía en los que envía el cliente).
     * Cada línea: tipo ('Servicio' o 'Producto'), id_item y cantidad.
     * @return array con las líneas de servicio y producto y los totales
     */
    private function prepararLineas($lineas)
    {
        if (!isset($lineas) || !is_array($lineas) || count($lineas) === 0) {
            throw new InvalidArgumentException('Debe agregar al menos una línea de detalle');
        }
        $servicios = array();
        $productos = array();
        $pedidoPorProducto = array(); //Cantidad total pedida de cada producto (para validar el stock)
        $subtotal = 0;
        $impuesto = 0;
        foreach ($lineas as $linea) {
            if (!isset($linea->tipo) || !isset($linea->id_item) || !is_numeric($linea->id_item)) {
                throw new InvalidArgumentException('La línea de detalle no es válida');
            }
            if (!isset($linea->cantidad) || !is_numeric($linea->cantidad)
                || (int) $linea->cantidad != $linea->cantidad || (int) $linea->cantidad <= 0) {
                throw new InvalidArgumentException('La cantidad debe ser un número entero mayor a cero');
            }
            $cantidad = (int) $linea->cantidad;
            $idItem = (int) $linea->id_item;

            if ($linea->tipo === 'Servicio') {
                $r = $this->enlace->ExecuteSQL("SELECT tarifa FROM servicio WHERE id_servicio = $idItem;");
                if (empty($r)) {
                    throw new InvalidArgumentException('El servicio seleccionado no existe');
                }
                $precio = (float) $r[0]->tarifa;
                $servicios[] = array('id' => $idItem, 'cantidad' => $cantidad, 'precio' => $precio);
            } elseif ($linea->tipo === 'Producto') {
                $r = $this->enlace->ExecuteSQL("SELECT precio, stock_disponible FROM producto WHERE id_producto = $idItem;");
                if (empty($r)) {
                    throw new InvalidArgumentException('El producto seleccionado no existe');
                }
                $pedidoPorProducto[$idItem] = (isset($pedidoPorProducto[$idItem]) ? $pedidoPorProducto[$idItem] : 0) + $cantidad;
                if ((int) $r[0]->stock_disponible < $pedidoPorProducto[$idItem]) {
                    throw new InvalidArgumentException('No hay stock suficiente para uno de los productos seleccionados');
                }
                $precio = (float) $r[0]->precio;
                $productos[] = array('id' => $idItem, 'cantidad' => $cantidad, 'precio' => $precio);
            } else {
                throw new InvalidArgumentException('La línea de detalle no es válida');
            }
            $subtotalLinea = round($precio * $cantidad, 2);
            $subtotal += $subtotalLinea;
            //Impuesto de cada línea; el impuesto de la factura es la suma de los de las líneas
            $impuesto += round($subtotalLinea * self::IVA / 100, 2);
        }
        $subtotal = round($subtotal, 2);
        $impuesto = round($impuesto, 2);
        return array(
            'servicios' => $servicios,
            'productos' => $productos,
            'subtotal' => $subtotal,
            'impuesto' => $impuesto,
            'total' => round($subtotal + $impuesto, 2),
        );
    }

    //Guarda las líneas de detalle de una factura (y descuenta el stock de los productos)
    private function guardarLineas($idFactura, $calculo)
    {
        foreach ($calculo['servicios'] as $s) {
            $precio = number_format($s['precio'], 2, '.', '');
            $sub = number_format($s['precio'] * $s['cantidad'], 2, '.', '');
            $this->enlace->executeSQL_DML("INSERT INTO factura_detalle_servicio
                (id_factura, id_servicio, cantidad, precio_unitario, subtotal_linea)
                VALUES ($idFactura, {$s['id']}, {$s['cantidad']}, $precio, $sub);");
        }
        foreach ($calculo['productos'] as $p) {
            $precio = number_format($p['precio'], 2, '.', '');
            $sub = number_format($p['precio'] * $p['cantidad'], 2, '.', '');
            $this->enlace->executeSQL_DML("INSERT INTO factura_detalle_producto
                (id_factura, id_producto, cantidad, precio_unitario, subtotal_linea)
                VALUES ($idFactura, {$p['id']}, {$p['cantidad']}, $precio, $sub);");
            $this->enlace->executeSQL_DML("UPDATE producto SET stock_disponible = stock_disponible - {$p['cantidad']}
                                           WHERE id_producto = {$p['id']};");
        }
    }

    /**
     * Crear la factura proforma de una cita (se llama al registrar la reserva)
     * @return id de la factura proforma
     */
    public function crearProforma($idCliente, $idSucursal, $idEncargado, $idServicio, $precio)
    {
        try {
            $idCliente = (int) $idCliente;
            $idSucursal = (int) $idSucursal;
            $idEncargado = (int) $idEncargado;
            $idServicio = (int) $idServicio;
            $subtotal = round((float) $precio, 2);
            $impuesto = round($subtotal * self::IVA / 100, 2);
            $total = round($subtotal + $impuesto, 2);

            $sql = "INSERT INTO factura (id_cliente, id_sucursal, id_encargado, fecha_emision, subtotal,
                                         porcentaje_impuesto, impuesto, total, estado_factura)
                    VALUES ($idCliente, $idSucursal, $idEncargado, NOW(),
                            " . number_format($subtotal, 2, '.', '') . ", " . number_format(self::IVA, 2, '.', '') . ",
                            " . number_format($impuesto, 2, '.', '') . ", " . number_format($total, 2, '.', '') . ", 'Proforma');";
            $idFactura = $this->enlace->executeSQL_DML_last($sql);
            $sub = number_format($subtotal, 2, '.', '');
            $this->enlace->executeSQL_DML("INSERT INTO factura_detalle_servicio
                (id_factura, id_servicio, cantidad, precio_unitario, subtotal_linea)
                VALUES ($idFactura, $idServicio, 1, $sub, $sub);");
            return $idFactura;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Registrar una factura nueva (varios productos y/o servicios)
     * @param $objeto id_cliente y lineas [{tipo, id_item, cantidad}]
     * @param $idEncargado encargado definido en el controlador
     */
    public function create($objeto, $idEncargado)
    {
        $idSucursal = $this->sucursalDelEncargado($idEncargado);
        $idCliente = $this->validarCliente(isset($objeto->id_cliente) ? $objeto->id_cliente : null);
        $calculo = $this->prepararLineas(isset($objeto->lineas) ? $objeto->lineas : null);
        try {
            $idEncargado = (int) $idEncargado;
            $sql = "INSERT INTO factura (id_cliente, id_sucursal, id_encargado, fecha_emision, subtotal,
                                         porcentaje_impuesto, impuesto, total, estado_factura)
                    VALUES ($idCliente, $idSucursal, $idEncargado, NOW(),
                            " . number_format($calculo['subtotal'], 2, '.', '') . ", " . number_format(self::IVA, 2, '.', '') . ",
                            " . number_format($calculo['impuesto'], 2, '.', '') . ", " . number_format($calculo['total'], 2, '.', '') . ", 'Completada');";
            $idFactura = $this->enlace->executeSQL_DML_last($sql);
            $this->guardarLineas($idFactura, $calculo);
            return $this->get($idFactura, $idEncargado);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Registrar (facturar) una factura proforma: reemplaza sus líneas por las del formulario,
     * recalcula los montos, pasa la factura a Completada (facturada) y cierra las citas asociadas
     * @param $objeto id_factura y lineas [{tipo, id_item, cantidad}]
     */
    public function facturar($objeto, $idEncargado)
    {
        $idSucursal = $this->sucursalDelEncargado($idEncargado);
        if (!isset($objeto->id_factura) || !is_numeric($objeto->id_factura)) {
            throw new InvalidArgumentException('La factura seleccionada no existe');
        }
        $idFactura = (int) $objeto->id_factura;
        $existe = $this->enlace->ExecuteSQL("SELECT estado_factura FROM factura
                                             WHERE id_factura = $idFactura AND id_sucursal = $idSucursal;");
        if (empty($existe)) {
            throw new InvalidArgumentException('La factura seleccionada no existe');
        }
        if ($existe[0]->estado_factura !== 'Proforma') {
            throw new InvalidArgumentException('La factura seleccionada no es una proforma');
        }
        $calculo = $this->prepararLineas(isset($objeto->lineas) ? $objeto->lineas : null);
        try {
            $idEncargado = (int) $idEncargado;
            //Las líneas de la proforma se reemplazan por las que quedaron en el formulario
            $this->enlace->executeSQL_DML("DELETE FROM factura_detalle_servicio WHERE id_factura = $idFactura;");
            $this->enlace->executeSQL_DML("DELETE FROM factura_detalle_producto WHERE id_factura = $idFactura;");
            $this->guardarLineas($idFactura, $calculo);
            $this->enlace->executeSQL_DML("UPDATE factura SET fecha_emision = NOW(), id_encargado = $idEncargado,
                    subtotal = " . number_format($calculo['subtotal'], 2, '.', '') . ",
                    impuesto = " . number_format($calculo['impuesto'], 2, '.', '') . ",
                    total = " . number_format($calculo['total'], 2, '.', '') . ",
                    estado_factura = 'Completada'
                    WHERE id_factura = $idFactura;");
            //La cita facturada queda Completada (4) si seguía abierta: Pendiente (1), Confirmada (2), Reprogramada (3) o Vencida (7)
            $this->enlace->executeSQL_DML("UPDATE reserva SET id_estado = 4
                                           WHERE id_factura = $idFactura AND id_estado IN (1, 2, 3, 7);");
            return $this->get($idFactura, $idEncargado);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
