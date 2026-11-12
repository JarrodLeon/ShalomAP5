<?php
class SucursalModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }

    /**
     * Listar sucursales con la cantidad de encargados asignados
     */
    public function all()
    {
        try {
            $vSQL = "SELECT s.id_sucursal, s.nombre, s.descripcion, s.telefono,
                            s.direccion_exacta, s.correo_electronico,
                            (SELECT COUNT(*) FROM usuario u
                             WHERE u.id_rol = 2 AND u.id_sucursal = s.id_sucursal) AS cantidad_encargados
                     FROM sucursal s
                     ORDER BY s.nombre;";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener una sucursal con sus encargados
     * @param $id de la sucursal
     */
    public function get($id)
    {
        try {
            $id = (int) $id; //Evita inyección SQL
            $vSql = "SELECT id_sucursal, nombre, descripcion, telefono,
                            direccion_exacta, correo_electronico
                     FROM sucursal
                     WHERE id_sucursal = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
                //Encargados asignados a la sucursal
                $sqlEncargados = "SELECT id_usuario, nombre, correo
                                  FROM usuario
                                  WHERE id_rol = 2 AND id_sucursal = $id
                                  ORDER BY nombre;";
                $encargados = $this->enlace->ExecuteSQL($sqlEncargados);
                $vResultado->encargados = !empty($encargados) ? $encargados : array();
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Valida los datos de la sucursal en el servidor
     * @param $idSucursal 0 al crear; el id al modificar
     */
    private function validar($objeto, $idSucursal)
    {
        foreach (array('nombre' => 'El nombre', 'descripcion' => 'La descripción', 'telefono' => 'El teléfono',
                       'direccion_exacta' => 'La dirección exacta', 'correo_electronico' => 'El correo electrónico') as $campo => $texto) {
            if (!isset($objeto->$campo) || trim($objeto->$campo) === '') {
                throw new InvalidArgumentException($texto . ' es requerido');
            }
        }
        if (!filter_var($objeto->correo_electronico, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('El correo electrónico no tiene un formato válido');
        }
        if (!isset($objeto->encargados) || !is_array($objeto->encargados) || count($objeto->encargados) === 0) {
            throw new InvalidArgumentException('Seleccione al menos un encargado');
        }
        //Nombre único
        $nombre = addslashes(trim($objeto->nombre));
        $repetido = $this->enlace->ExecuteSQL("SELECT COUNT(*) AS total FROM sucursal WHERE nombre = '$nombre' AND id_sucursal <> $idSucursal;");
        if (!empty($repetido) && (int) $repetido[0]->total > 0) {
            throw new InvalidArgumentException('Ya existe una sucursal con ese nombre');
        }
        //Los encargados deben ser de rol encargado y estar libres (o ya pertenecer a esta sucursal)
        $ids = array_map('intval', $objeto->encargados);
        $lista = implode(',', $ids);
        $validos = $this->enlace->ExecuteSQL("SELECT COUNT(*) AS total FROM usuario
                                              WHERE id_rol = 2 AND id_usuario IN ($lista)
                                              AND (id_sucursal IS NULL OR id_sucursal = $idSucursal);");
        if (empty($validos) || (int) $validos[0]->total !== count(array_unique($ids))) {
            throw new InvalidArgumentException('Algún usuario seleccionado no es un encargado disponible');
        }
    }

    /**
     * Crear sucursal y asignarle los encargados seleccionados
     * @return $this->get($idSucursal)
     */
    public function create($objeto)
    {
        $this->validar($objeto, 0);
        try {
            $nombre = addslashes(trim($objeto->nombre));
            $descripcion = addslashes(trim($objeto->descripcion));
            $telefono = addslashes(trim($objeto->telefono));
            $direccion = addslashes(trim($objeto->direccion_exacta));
            $correo = addslashes(trim($objeto->correo_electronico));

            $sql = "INSERT INTO sucursal (nombre, descripcion, telefono, direccion_exacta, correo_electronico)
                    VALUES ('$nombre', '$descripcion', '$telefono', '$direccion', '$correo');";
            $idSucursal = $this->enlace->executeSQL_DML_last($sql);
            //--- Encargados ---
            foreach ($objeto->encargados as $idEncargado) {
                $idEncargado = (int) $idEncargado;
                $this->enlace->executeSQL_DML("UPDATE usuario SET id_sucursal = $idSucursal WHERE id_usuario = $idEncargado AND id_rol = 2;");
            }
            return $this->get($idSucursal);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Actualizar sucursal y la lista de encargados asignados
     * @return $this->get($id)
     */
    public function update($objeto)
    {
        if (!isset($objeto->id_sucursal) || !is_numeric($objeto->id_sucursal)) {
            throw new InvalidArgumentException('La sucursal a modificar no es válida');
        }
        $id = (int) $objeto->id_sucursal;
        $this->validar($objeto, $id);
        try {
            $nombre = addslashes(trim($objeto->nombre));
            $descripcion = addslashes(trim($objeto->descripcion));
            $telefono = addslashes(trim($objeto->telefono));
            $direccion = addslashes(trim($objeto->direccion_exacta));
            $correo = addslashes(trim($objeto->correo_electronico));

            $sql = "UPDATE sucursal SET nombre = '$nombre', descripcion = '$descripcion',
                           telefono = '$telefono', direccion_exacta = '$direccion',
                           correo_electronico = '$correo'
                    WHERE id_sucursal = $id;";
            $this->enlace->executeSQL_DML($sql);
            //--- Encargados ---
            //Liberar los encargados actuales de la sucursal
            $this->enlace->executeSQL_DML("UPDATE usuario SET id_sucursal = NULL WHERE id_rol = 2 AND id_sucursal = $id;");
            //Asignar los encargados seleccionados
            foreach ($objeto->encargados as $idEncargado) {
                $idEncargado = (int) $idEncargado;
                $this->enlace->executeSQL_DML("UPDATE usuario SET id_sucursal = $id WHERE id_usuario = $idEncargado AND id_rol = 2;");
            }
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
