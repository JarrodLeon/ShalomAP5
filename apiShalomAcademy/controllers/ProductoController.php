<?php
//localhost:81/apiShalomAcademy/producto
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
            $response = new Response(); //Instanciar la clase de respuesta
            $productoM = new ProductoModel(); //Instancia del modelo
            $result = $productoM->get($id); //Acción del modelo a ejecutar
            $response->toJSON($result); //Dar respuesta
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
