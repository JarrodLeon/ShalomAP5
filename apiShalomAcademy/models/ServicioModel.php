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

    //Obtener el listado de servicios
    public function all()
    {
        try {
            //Consulta SQL
            $vSQL = "SELECT id_servicio, nombre, descripcion, tarifa, tiempo_servicio,
                            modalidad, edad_recomendada
                     FROM servicio
                     ORDER BY id_servicio;";
            //Ejecutar la consulta y retornar la respuesta
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Obtener un servicio por su id
    public function get($id)
    {
        try {
            $id = (int) $id; //Evita inyección SQL
            $vSql = "SELECT id_servicio, nombre, descripcion, tarifa, tiempo_servicio,
                            modalidad, edad_recomendada
                     FROM servicio
                     WHERE id_servicio = $id;";
            //Ejecutar la consulta sql
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (is_array($vResultado) && !empty($vResultado)) { //Si se encuentra el servicio
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
