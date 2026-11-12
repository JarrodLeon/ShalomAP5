<?php
class HorarioModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    /**
     * Horarios y bloqueos de una sucursal (la tabla horario guarda ambos; es_bloqueo los distingue)
     * @param $idSucursal sucursal seleccionada
     * @return objeto con dos listas: horarios y bloqueos
     */
    public function porSucursal($idSucursal)
    {
        try {
            $idSucursal = (int) $idSucursal; //Evita inyección SQL
            $base = "SELECT id_horario, id_sucursal, dia_semana, fecha, hora_inicio, hora_fin, es_bloqueo, motivo
                     FROM horario
                     WHERE id_sucursal = $idSucursal AND es_bloqueo = ";
            $orden = " ORDER BY fecha, hora_inicio;";
            $horarios = $this->enlace->ExecuteSQL($base . "0" . $orden);
            $bloqueos = $this->enlace->ExecuteSQL($base . "1" . $orden);

            $vResultado = new stdClass();
            $vResultado->horarios = !empty($horarios) ? $horarios : array();
            $vResultado->bloqueos = !empty($bloqueos) ? $bloqueos : array();
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener un horario o un bloqueo
     * @param $id del registro
     */
    public function get($id)
    {
        try {
            $id = (int) $id;
            $vSql = "SELECT h.id_horario, h.id_sucursal, s.nombre AS sucursal, h.dia_semana,
                            h.fecha, h.hora_inicio, h.hora_fin, h.es_bloqueo, h.motivo
                     FROM horario h, sucursal s
                     WHERE s.id_sucursal = h.id_sucursal
                     AND h.id_horario = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Cantidad de registros de la sucursal, en la fecha, que se cruzan con el rango (1 = bloqueos, 0 = horarios)
    private function cantidadCruces($idSucursal, $fecha, $inicio, $fin, $esBloqueo)
    {
        $sql = "SELECT COUNT(*) AS total FROM horario
                WHERE id_sucursal = $idSucursal AND fecha = '$fecha' AND es_bloqueo = $esBloqueo
                AND hora_inicio < '$fin' AND hora_fin > '$inicio';";
        $r = $this->enlace->ExecuteSQL($sql);
        return empty($r) ? 0 : (int) $r[0]->total;
    }

    /**
     * Valida el horario o bloqueo. Lanza InvalidArgumentException con el mensaje para el usuario.
     */
    private function validar($objeto, $esBloqueo)
    {
        if (!isset($objeto->id_sucursal) || !is_numeric($objeto->id_sucursal)) {
            throw new InvalidArgumentException('La sucursal es requerida');
        }
        $idSucursal = (int) $objeto->id_sucursal;
        $existe = $this->enlace->ExecuteSQL("SELECT COUNT(*) AS total FROM sucursal WHERE id_sucursal = $idSucursal;");
        if (empty($existe) || (int) $existe[0]->total === 0) {
            throw new InvalidArgumentException('La sucursal seleccionada no existe');
        }
        if (!isset($objeto->fecha) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $objeto->fecha)) {
            throw new InvalidArgumentException('La fecha es requerida');
        }
        foreach (array('hora_inicio' => 'La hora de inicio', 'hora_fin' => 'La hora final') as $campo => $texto) {
            if (!isset($objeto->$campo) || !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $objeto->$campo)) {
                throw new InvalidArgumentException($texto . ' es requerida');
            }
        }
        $inicio = strlen($objeto->hora_inicio) === 5 ? $objeto->hora_inicio . ':00' : $objeto->hora_inicio;
        $fin = strlen($objeto->hora_fin) === 5 ? $objeto->hora_fin . ':00' : $objeto->hora_fin;
        if ($fin <= $inicio) {
            throw new InvalidArgumentException('La hora final debe ser mayor que la hora de inicio');
        }
        //La fecha debe ser vigente (no anterior a la fecha actual)
        $hoy = (new DateTime('now', new DateTimeZone('America/Costa_Rica')))->format('Y-m-d');
        if ($objeto->fecha < $hoy) {
            throw new InvalidArgumentException('La fecha no puede ser anterior a la fecha actual');
        }
        $tipo = $esBloqueo ? 1 : 0;
        //Sobreposición entre registros del mismo tipo
        if ($this->cantidadCruces($idSucursal, $objeto->fecha, $inicio, $fin, $tipo) > 0) {
            throw new InvalidArgumentException($esBloqueo
                ? 'Sobreposición de bloqueos: el rango indicado se cruza con otro bloqueo registrado en esa sucursal'
                : 'Sobreposición de horarios: el rango indicado se cruza con otro horario registrado en esa sucursal');
        }
        //Sobreposición entre horarios y bloqueos
        if ($this->cantidadCruces($idSucursal, $objeto->fecha, $inicio, $fin, $esBloqueo ? 0 : 1) > 0) {
            throw new InvalidArgumentException($esBloqueo
                ? 'Sobreposición de horarios con bloqueos: el bloqueo se cruza con un horario registrado en esa sucursal'
                : 'Sobreposición de horarios con bloqueos: el horario se cruza con un bloqueo registrado en esa sucursal');
        }
    }

    /**
     * Crear horario o bloqueo
     * @param $objeto datos del registro (es_bloqueo 0 = horario, 1 = bloqueo)
     * @return $this->get($idHorario)
     */
    public function create($objeto)
    {
        $esBloqueo = !empty($objeto->es_bloqueo) ? 1 : 0;
        $this->validar($objeto, $esBloqueo);
        try {
            $idSucursal = (int) $objeto->id_sucursal;
            $fecha = $objeto->fecha;
            $inicio = strlen($objeto->hora_inicio) === 5 ? $objeto->hora_inicio . ':00' : $objeto->hora_inicio;
            $fin = strlen($objeto->hora_fin) === 5 ? $objeto->hora_fin . ':00' : $objeto->hora_fin;
            //El día de la semana se calcula a partir de la fecha
            $dias = array(1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo');
            $dia = $dias[(int) date('N', strtotime($fecha))];
            $motivo = ($esBloqueo && isset($objeto->motivo) && trim($objeto->motivo) !== '')
                ? "'" . addslashes(trim($objeto->motivo)) . "'" : 'NULL';

            $sql = "INSERT INTO horario (id_sucursal, dia_semana, fecha, hora_inicio, hora_fin, es_bloqueo, motivo)
                    VALUES ($idSucursal, '$dia', '$fecha', '$inicio', '$fin', $esBloqueo, $motivo);";
            $idHorario = $this->enlace->executeSQL_DML_last($sql);
            return $this->get($idHorario);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
