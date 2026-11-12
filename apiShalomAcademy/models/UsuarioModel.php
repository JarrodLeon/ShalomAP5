<?php
class UsuarioModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    /**
     * Usuarios de tipo encargado (rol 2) que se pueden asignar a una sucursal:
     * los que no tienen sucursal y, al modificar, los que ya pertenecen a esa sucursal.
     * @param $idSucursal sucursal que se está modificando (0 al crear)
     */
    public function encargadosDisponibles($idSucursal = 0)
    {
        try {
            $idSucursal = (int) $idSucursal; //Evita inyección SQL
            $vSQL = "SELECT id_usuario, nombre, correo
                     FROM usuario
                     WHERE id_rol = 2
                     AND (id_sucursal IS NULL OR id_sucursal = $idSucursal)
                     ORDER BY nombre;";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
