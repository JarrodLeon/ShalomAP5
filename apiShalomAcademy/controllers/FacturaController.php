<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/factura
class factura
{
    //Encargado que usa el sistema.
    private $idEncargado = 2;

    //GET Obtener el historial de facturas de la sucursal del encargado
    public function index()
    {
        try {
            $response = new Response(); //Instanciar la clase de respuesta
            $facturaM = new FacturaModel(); //Instancia del modelo
            $result = $facturaM->all($this->idEncargado); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET Obtener una factura por su id
    public function get($id)
    {
        try {
            $response = new Response();
            $facturaM = new FacturaModel();
            $result = $facturaM->get($id, $this->idEncargado);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET localhost:81/.../factura/contexto - nombre del encargado y de su sucursal (solo lectura)
    public function contexto()
    {
        try {
            $response = new Response();
            $facturaM = new FacturaModel();
            $result = $facturaM->contexto($this->idEncargado);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->validacion($e);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST Registrar una factura
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $facturaM = new FacturaModel();
            $result = $facturaM->create($inputJSON, $this->idEncargado);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->validacion($e);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //PUT Registrar (facturar) una factura proforma
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $facturaM = new FacturaModel();
            $result = $facturaM->facturar($inputJSON, $this->idEncargado);
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
