<?php
class CategoriaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    //Listar las categorías predeterminadas de productos
    public function all()
    {
        try {
            $vSQL = "SELECT id_categoria, nombre_categoria
                     FROM categoria_producto
                     ORDER BY nombre_categoria;";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
