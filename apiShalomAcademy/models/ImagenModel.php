<?php
class ImagenModel
{
    private $upload_path = 'uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif');
    //Entidades que tienen imagen: tabla y llave primaria (el nombre del archivo se guarda en imagen_url)
    private $entidades = array(
        'producto' => array('tabla' => 'producto', 'pk' => 'id_producto'),
        'servicio' => array('tabla' => 'servicio', 'pk' => 'id_servicio'),
    );

    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Subir (o reemplazar) la imagen de un producto o de un servicio
     * @param $tipo 'producto' o 'servicio'
     * @param $id identificador del registro
     * @param $file archivo recibido en $_FILES['file']
     */
    public function uploadFile($tipo, $id, $file)
    {
        if (!isset($this->entidades[$tipo])) {
            throw new InvalidArgumentException('El tipo de imagen no es válido');
        }
        $id = (int) $id;
        if ($id <= 0) {
            throw new InvalidArgumentException('El registro de la imagen no es válido');
        }
        if (empty($file) || empty($file['name'])) {
            throw new InvalidArgumentException('No se recibió ninguna imagen');
        }
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE || $file['size'] > 2000000) {
            throw new InvalidArgumentException('La imagen no puede superar los 2 MB');
        }
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new InvalidArgumentException('No se pudo recibir la imagen, intente de nuevo');
        }
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->valid_extensions) || @getimagesize($file['tmp_name']) === false) {
            throw new InvalidArgumentException('Solo se permiten imágenes jpeg, jpg, png o gif');
        }
        try {
            $tabla = $this->entidades[$tipo]['tabla'];
            $pk = $this->entidades[$tipo]['pk'];
            //Nombre único para el archivo
            $fileName = $tipo . '-' . uniqid() . '.' . $extension;
            if (!move_uploaded_file($file['tmp_name'], $this->upload_path . $fileName)) {
                throw new InvalidArgumentException('No se pudo guardar la imagen en el servidor');
            }
            //Guardar el nombre del archivo en la BD
            $this->enlace->executeSQL_DML("UPDATE $tabla SET imagen_url = '$fileName' WHERE $pk = $id;");
            $vResultado = new stdClass();
            $vResultado->imagen_url = $fileName;
            return $vResultado;
        } catch (InvalidArgumentException $e) {
            throw $e;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
