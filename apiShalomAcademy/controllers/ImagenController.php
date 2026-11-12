<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/imagen
class imagen
{
    //POST Subir o reemplazar la imagen de un producto o servicio
    //Recibe un formulario (FormData) con: file (la imagen), tipo ('producto' o 'servicio') e id
    public function create()
    {
        try {
            $response = new Response();
            $imagenM = new ImagenModel();
            $tipo = isset($_POST['tipo']) ? $_POST['tipo'] : '';
            $id = isset($_POST['id']) ? $_POST['id'] : 0;
            $file = isset($_FILES['file']) ? $_FILES['file'] : null;
            $result = $imagenM->uploadFile($tipo, $id, $file);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(array('status' => 400, 'result' => $e->getMessage()), JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
