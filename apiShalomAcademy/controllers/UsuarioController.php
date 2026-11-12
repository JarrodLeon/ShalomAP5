<?php
//localhost:81/ShalomAcademy_P5/apiShalomAcademy/usuario
class usuario
{
    //GET localhost:81/.../usuario/encargadosDisponibles/ (al crear)
    //GET localhost:81/.../usuario/encargadosDisponibles/1 (al modificar la sucursal 1)
    public function encargadosDisponibles($idSucursal = 0)
    {
        try {
            $response = new Response();
            $usuarioM = new UsuarioModel();
            $result = $usuarioM->encargadosDisponibles($idSucursal);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
