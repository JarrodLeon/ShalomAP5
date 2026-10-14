<?php
//localhost:81/apiShalomAcademy/factura
class factura
{
    //Encargado que usa el sistema. Se define aquí en el Controlador:
    //NO viaja desde la aplicación, por lo que el usuario no puede manipularlo.
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
            $response = new Response(); //Instanciar la clase de respuesta
            $facturaM = new FacturaModel(); //Instancia del modelo
            $result = $facturaM->get($id, $this->idEncargado); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
