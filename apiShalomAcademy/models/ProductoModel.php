<?php
class ProductoModel
{
    //Conectarse a la BD
    public $enlace;

    //Constructor
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    //Obtener el listado de productos
    public function all()
    {
        try {
            //Consulta SQL
            $vSQL = "SELECT p.id_producto, p.nombre, p.descripcion, p.precio,
                            p.imagen_url, p.stock_disponible, p.es_personalizable,
                            c.nombre_categoria
                     FROM producto p, categoria_producto c
                     WHERE c.id_categoria = p.id_categoria
                     ORDER BY c.nombre_categoria, p.nombre;";
            //Ejecutar la consulta y retornar la respuesta
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Obtener un producto por su id
    public function get($id)
    {
        try {
            $id = (int) $id; //Evita inyección SQL
            $vSql = "SELECT p.id_producto, p.nombre, p.descripcion, p.precio,
                            p.imagen_url, p.stock_disponible, p.es_personalizable,
                            c.nombre_categoria
                     FROM producto p, categoria_producto c
                     WHERE c.id_categoria = p.id_categoria
                     AND p.id_producto = $id;";
            //Ejecutar la consulta sql
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (is_array($vResultado) && !empty($vResultado)) { //Si se encuentra el producto
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
