<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/horario
class horario
{
    //GET localhost:81/.../horario/porSucursal/1 - horarios y bloqueos de la sucursal 1
    public function porSucursal($idSucursal)
    {
        try {
            $response = new Response();
            $horarioM = new HorarioModel();
            $result = $horarioM->porSucursal($idSucursal);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET localhost:81/.../horario/get/1 - detalle de un horario o bloqueo
    public function get($id)
    {
        try {
            $response = new Response();
            $horarioM = new HorarioModel();
            $result = $horarioM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST Crear un horario o un bloqueo
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $horarioM = new HorarioModel();
            $result = $horarioM->create($inputJSON);
            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            //Mensajes de validación: sobreposiciones, fecha anterior a la actual, etc.
            http_response_code(400);
            echo json_encode(array('status' => 400, 'result' => $e->getMessage()), JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
