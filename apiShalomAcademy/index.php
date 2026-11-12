<?php
// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";

/***--- Agregar todos los modelos*/
require_once "models/ProductoModel.php";
require_once "models/ReservaModel.php";
require_once "models/FacturaModel.php";
require_once "models/ServicioModel.php";
require_once "models/CategoriaModel.php";
require_once "models/UsuarioModel.php";
require_once "models/SucursalModel.php";
require_once "models/HorarioModel.php";
require_once "models/ImagenModel.php";


/***--- Agregar todos los controladores*/
require_once "controllers/ProductoController.php";
require_once "controllers/ReservaController.php";
require_once "controllers/FacturaController.php";
require_once "controllers/ServicioController.php";
require_once "controllers/CategoriaController.php";
require_once "controllers/UsuarioController.php";
require_once "controllers/SucursalController.php";
require_once "controllers/HorarioController.php";
require_once "controllers/ImagenController.php";



//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();


