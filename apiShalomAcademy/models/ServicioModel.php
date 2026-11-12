<?php
class ServicioModel
{
    //Conectarse a la BD
    public $enlace;

    //Constructor
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    /**
     * Listar servicios
     * @return $vResultado - Lista de objetos
     */
    public function all()
    {
        try {
            $vSQL = "SELECT id_servicio, nombre, descripcion, tarifa, tiempo_servicio,
                            modalidad, edad_recomendada, imagen_url
                     FROM servicio
                     ORDER BY id_servicio;";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener un servicio
     * @param $id del servicio
     * @return $vResultado - Objeto servicio
     */
    public function get($id)
    {
        try {
            $id = (int) $id; //Evita inyección SQL
            $vSql = "SELECT id_servicio, nombre, descripcion, tarifa, tiempo_servicio,
                            modalidad, edad_recomendada, imagen_url
                     FROM servicio
                     WHERE id_servicio = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (is_array($vResultado) && !empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Valida los datos del servicio en el servidor
     */
    private function validar($objeto)
    {
        if (!isset($objeto->nombre) || trim($objeto->nombre) === '') {
            throw new InvalidArgumentException('El nombre es requerido');
        }
        if (!isset($objeto->descripcion) || trim($objeto->descripcion) === '') {
            throw new InvalidArgumentException('La descripción es requerida');
        }
        if (!isset($objeto->tarifa) || !is_numeric($objeto->tarifa) || $objeto->tarifa < 0) {
            throw new InvalidArgumentException('La tarifa debe ser un número igual o mayor a cero');
        }
        //El tiempo siempre se guarda en minutos (el formulario convierte las horas)
        if (!isset($objeto->tiempo_servicio) || !is_numeric($objeto->tiempo_servicio) || $objeto->tiempo_servicio <= 0) {
            throw new InvalidArgumentException('El tiempo del servicio debe ser mayor a cero');
        }
        if (!isset($objeto->modalidad) || !in_array($objeto->modalidad, array('Individual', 'Grupal'))) {
            throw new InvalidArgumentException('La modalidad debe ser Individual o Grupal');
        }
        if (!isset($objeto->edad_recomendada) || trim($objeto->edad_recomendada) === '') {
            throw new InvalidArgumentException('La edad recomendada es requerida');
        }
    }

    /**
     * Crear servicio
     * @param $objeto servicio a insertar
     * @return $this->get($idServicio) - Objeto servicio
     */
    public function create($objeto)
    {
        $this->validar($objeto);
        try {
            $nombre = addslashes(trim($objeto->nombre));
            $descripcion = addslashes(trim($objeto->descripcion));
            $tarifa = number_format((float) $objeto->tarifa, 2, '.', '');
            $tiempo = (int) round((float) $objeto->tiempo_servicio);
            $modalidad = addslashes($objeto->modalidad);
            $edad = addslashes(trim($objeto->edad_recomendada));

            $sql = "INSERT INTO servicio (nombre, descripcion, tarifa, tiempo_servicio, modalidad, edad_recomendada)
                    VALUES ('$nombre', '$descripcion', $tarifa, $tiempo, '$modalidad', '$edad');";
            $idServicio = $this->enlace->executeSQL_DML_last($sql);
            return $this->get($idServicio);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Actualizar servicio (la imagen se actualiza aparte, con ImagenModel)
     * @param $objeto servicio a actualizar
     * @return $this->get($id) - Objeto servicio
     */
    public function update($objeto)
    {
        if (!isset($objeto->id_servicio) || !is_numeric($objeto->id_servicio)) {
            throw new InvalidArgumentException('El servicio a modificar no es válido');
        }
        $this->validar($objeto);
        try {
            $id = (int) $objeto->id_servicio;
            $nombre = addslashes(trim($objeto->nombre));
            $descripcion = addslashes(trim($objeto->descripcion));
            $tarifa = number_format((float) $objeto->tarifa, 2, '.', '');
            $tiempo = (int) round((float) $objeto->tiempo_servicio);
            $modalidad = addslashes($objeto->modalidad);
            $edad = addslashes(trim($objeto->edad_recomendada));

            $sql = "UPDATE servicio SET nombre = '$nombre', descripcion = '$descripcion',
                           tarifa = $tarifa, tiempo_servicio = $tiempo,
                           modalidad = '$modalidad', edad_recomendada = '$edad'
                    WHERE id_servicio = $id;";
            $this->enlace->executeSQL_DML($sql);
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
