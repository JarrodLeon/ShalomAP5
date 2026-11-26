<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/reserva
class reserva
{
    //Encargado  
    private $idEncargado = 2;

    //GET Obtener el historial de reservas de la sucursal del encargado
    public function index()
    {
        try {
            $response = new Response(); //Instanciar la clase de respuesta
            $reservaM = new ReservaModel(); //Instancia del modelo
            $result = $reservaM->all($this->idEncargado); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET Obtener una reserva por su id
    public function get($id)
    {
        try {
            $response = new Response();
            $reservaM = new ReservaModel();
            $result = $reservaM->get($id, $this->idEncargado);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET localhost:81/.../reserva/contexto - encargado, sucursal y estado inicial (solo lectura)
    public function contexto()
    {
        try {
            $response = new Response();
            $reservaM = new ReservaModel();
            $result = $reservaM->contexto($this->idEncargado);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->validacion($e);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST Registrar una reserva (crea también su factura proforma)
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $reservaM = new ReservaModel();
            $result = $reservaM->create($inputJSON, $this->idEncargado);
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
        echo json_encode(array('status' => 400, 'result' => MensajesModel::traducir($e->getMessage())), JSON_UNESCAPED_UNICODE);
    }
}
