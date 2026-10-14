<?php
//localhost:81/apiShalomAcademy/reserva
class reserva
{
    //Encargado que usa el sistema. Se define aquí en el Controlador:
    //NO viaja desde la aplicación, por lo que el usuario no puede manipularlo.
    //Solo verá las citas de la sucursal a la que pertenece.
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
            $response = new Response(); //Instanciar la clase de respuesta
            $reservaM = new ReservaModel(); //Instancia del modelo
            $result = $reservaM->get($id, $this->idEncargado); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
