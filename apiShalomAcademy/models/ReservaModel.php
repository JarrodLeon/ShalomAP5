<?php
class ReservaModel
{
    //Conectarse a la BD
    public $enlace;

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
     * Datos de solo lectura para el formulario: encargado, sucursal y estado inicial con su color
     */
    public function contexto($idEncargado)
    {
        $idEncargado = (int) $idEncargado;
        $this->sucursalDelEncargado($idEncargado);
        try {
            $r = $this->enlace->ExecuteSQL("SELECT u.nombre AS encargado, s.id_sucursal, s.nombre AS sucursal
                                            FROM usuario u, sucursal s
                                            WHERE s.id_sucursal = u.id_sucursal AND u.id_usuario = $idEncargado;");
            $contexto = $r[0];
            //Estado inicial de toda reserva: Pendiente (1)
            $estado = $this->enlace->ExecuteSQL("SELECT nombre_estado, color_hex FROM estado_reserva WHERE id_estado = 1;");
            $contexto->estado = $estado[0]->nombre_estado;
            $contexto->color_estado = $estado[0]->color_hex;
            return $contexto;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Obtener el historial de citas de la sucursal del encargado (la más reciente primero)
    public function all($idEncargado)
    {
        try {
            $idEncargado = (int) $idEncargado;
            $vSQL = "SELECT r.id_reserva, r.fecha_cita, r.hora_inicio, r.hora_fin,
                            u.nombre AS cliente,
                            s.nombre AS servicio,
                            e.nombre_estado, e.color_hex
                     FROM reserva r, usuario u, servicio s, estado_reserva e
                     WHERE u.id_usuario = r.id_cliente
                     AND s.id_servicio = r.id_servicio
                     AND e.id_estado = r.id_estado
                     AND r.id_sucursal = (SELECT enc.id_sucursal FROM usuario enc
                                          WHERE enc.id_usuario = $idEncargado AND enc.id_rol = 2)
                     ORDER BY r.fecha_cita DESC, r.hora_inicio DESC;";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Obtener el detalle de una cita (solo si pertenece a la sucursal del encargado)
    public function get($id, $idEncargado)
    {
        try {
            $id = (int) $id;
            $idEncargado = (int) $idEncargado;
            $vSql = "SELECT r.id_reserva, r.fecha_creacion, r.fecha_cita,
                            r.hora_inicio, r.hora_fin, r.precio_servicio,
                            r.practica_previa, r.condicion_medica, r.objetivo,
                            r.id_factura,
                            u.nombre AS cliente,
                            su.nombre AS sucursal,
                            s.nombre AS servicio,
                            e.nombre_estado, e.color_hex
                     FROM reserva r, usuario u, sucursal su, servicio s, estado_reserva e
                     WHERE u.id_usuario = r.id_cliente
                     AND su.id_sucursal = r.id_sucursal
                     AND s.id_servicio = r.id_servicio
                     AND e.id_estado = r.id_estado
                     AND r.id_reserva = $id
                     AND r.id_sucursal = (SELECT enc.id_sucursal FROM usuario enc
                                          WHERE enc.id_usuario = $idEncargado AND enc.id_rol = 2);";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Cantidad de registros que devuelve una consulta COUNT(*)
    private function contar($sql)
    {
        $r = $this->enlace->ExecuteSQL($sql);
        return empty($r) ? 0 : (int) $r[0]->total;
    }

    /**
     * Valida los datos de la reserva y calcula la hora final con el tiempo del servicio.
     * Lanza InvalidArgumentException con el mensaje para el usuario.
     * @return array con los datos ya validados
     */
    private function validar($objeto, $idSucursal)
    {
        //--- Cliente ---
        if (!isset($objeto->id_cliente) || !is_numeric($objeto->id_cliente)) {
            throw new InvalidArgumentException('El cliente es requerido');
        }
        $idCliente = (int) $objeto->id_cliente;
        if ($this->contar("SELECT COUNT(*) AS total FROM usuario WHERE id_usuario = $idCliente AND id_rol = 1;") === 0) {
            throw new InvalidArgumentException('El cliente seleccionado no es válido');
        }
        //--- Servicio ---
        if (!isset($objeto->id_servicio) || !is_numeric($objeto->id_servicio)) {
            throw new InvalidArgumentException('El servicio es requerido');
        }
        $idServicio = (int) $objeto->id_servicio;
        $servicio = $this->enlace->ExecuteSQL("SELECT tarifa, tiempo_servicio FROM servicio WHERE id_servicio = $idServicio;");
        if (empty($servicio)) {
            throw new InvalidArgumentException('El servicio seleccionado no existe');
        }
        //--- Fecha (no anterior a la fecha actual) ---
        if (!isset($objeto->fecha) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $objeto->fecha)) {
            throw new InvalidArgumentException('La fecha es requerida');
        }
        $partes = explode('-', $objeto->fecha);
        if (!checkdate((int) $partes[1], (int) $partes[2], (int) $partes[0])) {
            throw new InvalidArgumentException('La fecha es requerida');
        }
        $zona = new DateTimeZone('America/Costa_Rica');
        $ahora = new DateTime('now', $zona);
        if ($objeto->fecha < $ahora->format('Y-m-d')) {
            throw new InvalidArgumentException('La fecha no puede ser anterior a la fecha actual');
        }
        //--- Hora: la hora final se calcula con el tiempo del servicio (no la envía el cliente) ---
        if (!isset($objeto->hora_inicio) || !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $objeto->hora_inicio)) {
            throw new InvalidArgumentException('La hora de inicio es requerida');
        }
        $horaInicio = strlen($objeto->hora_inicio) === 5 ? $objeto->hora_inicio . ':00' : $objeto->hora_inicio;
        $inicio = new DateTime($objeto->fecha . ' ' . $horaInicio, $zona);
        if ($inicio < $ahora) {
            throw new InvalidArgumentException('La hora de inicio ya pasó');
        }
        $fin = clone $inicio;
        $fin->modify('+' . (int) $servicio[0]->tiempo_servicio . ' minutes');
        if ($fin->format('Y-m-d') !== $objeto->fecha) {
            throw new InvalidArgumentException('La reserva debe terminar el mismo día');
        }
        $horaFin = $fin->format('H:i:s');
        //--- Debe estar dentro del horario de la sucursal ---
        $dentro = $this->contar("SELECT COUNT(*) AS total FROM horario
                                 WHERE id_sucursal = $idSucursal AND fecha = '$objeto->fecha' AND es_bloqueo = 0
                                 AND hora_inicio <= '$horaInicio' AND hora_fin >= '$horaFin';");
        if ($dentro === 0) {
            throw new InvalidArgumentException('El horario solicitado no está dentro del horario de la sucursal');
        }
        //--- No puede corresponder a un bloqueo ---
        $bloqueo = $this->contar("SELECT COUNT(*) AS total FROM horario
                                  WHERE id_sucursal = $idSucursal AND fecha = '$objeto->fecha' AND es_bloqueo = 1
                                  AND hora_inicio < '$horaFin' AND hora_fin > '$horaInicio';");
        if ($bloqueo > 0) {
            throw new InvalidArgumentException('El horario solicitado corresponde a un bloqueo de la sucursal');
        }
        //--- Las citas no pueden sobreponerse (se ignoran las canceladas (5) y las de no asistió (6)) ---
        $cruce = $this->contar("SELECT COUNT(*) AS total FROM reserva
                                WHERE id_sucursal = $idSucursal AND fecha_cita = '$objeto->fecha'
                                AND id_estado NOT IN (5, 6)
                                AND hora_inicio < '$horaFin' AND hora_fin > '$horaInicio';");
        if ($cruce > 0) {
            throw new InvalidArgumentException('Ya existe una reserva en ese horario');
        }
        //--- Preguntas para el cliente ---
        if (!isset($objeto->practica_previa) || !in_array((int) $objeto->practica_previa, array(0, 1), true)
            || $objeto->practica_previa === '') {
            throw new InvalidArgumentException('Indique si ha practicado gimnasia antes');
        }
        if (!isset($objeto->condicion_medica) || trim($objeto->condicion_medica) === '') {
            throw new InvalidArgumentException('La condición médica es requerida (escriba Ninguna si no tiene)');
        }
        if (!isset($objeto->objetivo) || trim($objeto->objetivo) === '') {
            throw new InvalidArgumentException('El objetivo es requerido');
        }
        return array(
            'id_cliente' => $idCliente,
            'id_servicio' => $idServicio,
            'fecha' => $objeto->fecha,
            'hora_inicio' => $horaInicio,
            'hora_fin' => $horaFin,
            'tarifa' => (float) $servicio[0]->tarifa,
            'practica_previa' => (int) $objeto->practica_previa,
            'condicion_medica' => addslashes(trim($objeto->condicion_medica)),
            'objetivo' => addslashes(trim($objeto->objetivo)),
        );
    }

    /**
     * Registrar una reserva (la hace el encargado) y crear su factura proforma
     * @param $objeto fecha, id_cliente, id_servicio, hora_inicio y las preguntas
     * @param $idEncargado encargado definido en el controlador
     * @return $this->get($idReserva) - incluye id_factura (la proforma)
     */
    public function create($objeto, $idEncargado)
    {
        $idSucursal = $this->sucursalDelEncargado($idEncargado);
        $d = $this->validar($objeto, $idSucursal);
        try {
            $idEncargado = (int) $idEncargado;
            $tarifa = number_format($d['tarifa'], 2, '.', '');
            //Estado inicial: Pendiente (1)
            $sql = "INSERT INTO reserva (id_cliente, id_encargado, id_sucursal, id_servicio, id_estado, fecha_cita,
                                         hora_inicio, hora_fin, precio_servicio, practica_previa, condicion_medica, objetivo)
                    VALUES ({$d['id_cliente']}, $idEncargado, $idSucursal, {$d['id_servicio']}, 1, '{$d['fecha']}',
                            '{$d['hora_inicio']}', '{$d['hora_fin']}', $tarifa, {$d['practica_previa']},
                            '{$d['condicion_medica']}', '{$d['objetivo']}');";
            $idReserva = $this->enlace->executeSQL_DML_last($sql);
            //Factura proforma con la cita: cliente, sucursal, servicio (cantidad 1) y montos
            $facturaM = new FacturaModel();
            $idFactura = $facturaM->crearProforma($d['id_cliente'], $idSucursal, $idEncargado, $d['id_servicio'], $d['tarifa']);
            $this->enlace->executeSQL_DML("UPDATE reserva SET id_factura = $idFactura WHERE id_reserva = $idReserva;");
            return $this->get($idReserva, $idEncargado);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
