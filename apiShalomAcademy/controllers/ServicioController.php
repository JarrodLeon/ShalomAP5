<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/servicio
class servicio
{
    //GET Obtener el listado de servicios
    public function index()
    {
        try {
            $response = new Response(); //Instanciar la clase de respuesta
            $servicioM = new ServicioModel(); //Instancia del modelo
            $result = $servicioM->all(); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET Obtener un servicio por su id
    public function get($id)
    {
        try {
            $response = new Response(); //Instanciar la clase de respuesta
            $servicioM = new ServicioModel(); //Instancia del modelo
            $result = $servicioM->get($id); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
