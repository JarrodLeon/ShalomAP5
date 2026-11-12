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

    /**
     * Listar productos
     * @return $vResultado - Lista de objetos
     */
    public function all()
    {
        try {
            $vSQL = "SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.id_categoria,
                            p.imagen_url, p.stock_disponible, p.es_personalizable,
                            c.nombre_categoria
                     FROM producto p, categoria_producto c
                     WHERE c.id_categoria = p.id_categoria
                     ORDER BY c.nombre_categoria, p.nombre;";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener un producto
     * @param $id del producto
     * @return $vResultado - Objeto producto
     */
    public function get($id)
    {
        try {
            $id = (int) $id; //Evita inyección SQL
            $vSql = "SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.id_categoria,
                            p.imagen_url, p.stock_disponible, p.es_personalizable,
                            c.nombre_categoria
                     FROM producto p, categoria_producto c
                     WHERE c.id_categoria = p.id_categoria
                     AND p.id_producto = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if ((is_array($vResultado) && !empty($vResultado))) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Valida los datos del producto en el servidor (la validación del formulario no es suficiente)
     */
    private function validar($objeto)
    {
        if (!isset($objeto->nombre) || trim($objeto->nombre) === '') {
            throw new InvalidArgumentException('El nombre es requerido');
        }
        if (!isset($objeto->descripcion) || trim($objeto->descripcion) === '') {
            throw new InvalidArgumentException('La descripción es requerida');
        }
        if (!isset($objeto->precio) || !is_numeric($objeto->precio) || $objeto->precio <= 0) {
            throw new InvalidArgumentException('El precio debe ser un número mayor a cero');
        }
        if (!isset($objeto->stock_disponible) || !is_numeric($objeto->stock_disponible) || $objeto->stock_disponible < 0) {
            throw new InvalidArgumentException('El stock debe ser un número igual o mayor a cero');
        }
        if (!isset($objeto->id_categoria) || !is_numeric($objeto->id_categoria)) {
            throw new InvalidArgumentException('La categoría es requerida');
        }
        $idCategoria = (int) $objeto->id_categoria;
        $existe = $this->enlace->ExecuteSQL("SELECT COUNT(*) AS total FROM categoria_producto WHERE id_categoria = $idCategoria;");
        if (empty($existe) || (is_array($existe) && (int) $existe[0]->total === 0)) {
            throw new InvalidArgumentException('La categoría seleccionada no existe');
        }
    }

    /**
     * Crear producto
     * @param $objeto producto a insertar
     * @return $this->get($idProducto) - Objeto producto
     */
    public function create($objeto)
    {
        $this->validar($objeto);
        try {
            $nombre = addslashes(trim($objeto->nombre));
            $descripcion = addslashes(trim($objeto->descripcion));
            $idCategoria = (int) $objeto->id_categoria;
            $precio = number_format((float) $objeto->precio, 2, '.', '');
            $stock = (int) $objeto->stock_disponible;
            $personalizable = !empty($objeto->es_personalizable) ? 1 : 0;

            $sql = "INSERT INTO producto (nombre, descripcion, id_categoria, precio, stock_disponible, es_personalizable)
                    VALUES ('$nombre', '$descripcion', $idCategoria, $precio, $stock, $personalizable);";
            //Ejecutar la consulta y obtener el último id insertado
            $idProducto = $this->enlace->executeSQL_DML_last($sql);
            return $this->get($idProducto);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Actualizar producto (la imagen se actualiza aparte, con ImagenModel)
     * @param $objeto producto a actualizar
     * @return $this->get($id) - Objeto producto
     */
    public function update($objeto)
    {
        if (!isset($objeto->id_producto) || !is_numeric($objeto->id_producto)) {
            throw new InvalidArgumentException('El producto a modificar no es válido');
        }
        $this->validar($objeto);
        try {
            $id = (int) $objeto->id_producto;
            $nombre = addslashes(trim($objeto->nombre));
            $descripcion = addslashes(trim($objeto->descripcion));
            $idCategoria = (int) $objeto->id_categoria;
            $precio = number_format((float) $objeto->precio, 2, '.', '');
            $stock = (int) $objeto->stock_disponible;
            $personalizable = !empty($objeto->es_personalizable) ? 1 : 0;

            $sql = "UPDATE producto SET nombre = '$nombre', descripcion = '$descripcion',
                           id_categoria = $idCategoria, precio = $precio,
                           stock_disponible = $stock, es_personalizable = $personalizable
                    WHERE id_producto = $id;";
            $this->enlace->executeSQL_DML($sql);
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
