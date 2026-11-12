<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/categoria
class categoria
{
    //GET Obtener las categorías de productos
    public function index()
    {
        try {
            $response = new Response();
            $categoriaM = new CategoriaModel();
            $result = $categoriaM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
