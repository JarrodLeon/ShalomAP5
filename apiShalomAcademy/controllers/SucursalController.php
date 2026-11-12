<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/sucursal
class sucursal
{
    //GET Obtener el listado de sucursales
    public function index()
    {
        try {
            $response = new Response();
            $sucursalM = new SucursalModel();
            $result = $sucursalM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET Obtener una sucursal por su id (incluye sus encargados)
    public function get($id)
    {
        try {
            $response = new Response();
            $sucursalM = new SucursalModel();
            $result = $sucursalM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST Crear una sucursal
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $sucursalM = new SucursalModel();
            $result = $sucursalM->create($inputJSON);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->validacion($e);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //PUT Actualizar una sucursal
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $sucursalM = new SucursalModel();
            $result = $sucursalM->update($inputJSON);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->validacion($e);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //Respuesta cuando los datos no cumplen las validaciones (código 400 con el mensaje para el usuario)
    private function validacion($e)
    {
        http_response_code(400);
        echo json_encode(array('status' => 400, 'result' => $e->getMessage()), JSON_UNESCAPED_UNICODE);
    }
}
