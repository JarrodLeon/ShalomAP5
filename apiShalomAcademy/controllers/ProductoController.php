<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/producto
class producto
{
    //GET Obtener el listado de productos
    public function index()
    {
        try {
            $response = new Response(); //Instanciar la clase de respuesta
            $productoM = new ProductoModel(); //Instancia del modelo
            $result = $productoM->all(); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET Obtener un producto por su id
    public function get($id)
    {
        try {
            $response = new Response();
            $productoM = new ProductoModel();
            $result = $productoM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST Crear un producto
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener el json enviado
            $inputJSON = $request->getJSON();
            $productoM = new ProductoModel();
            $result = $productoM->create($inputJSON);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->validacion($e);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //PUT Actualizar un producto
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $productoM = new ProductoModel();
            $result = $productoM->update($inputJSON);
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
