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
            if (is_array($vResultado) && !empty($vResultado)) { //Si se encuentra la reserva
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
