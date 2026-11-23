<?php
/**
 * Traducción de los mensajes de validación del API.
 * El frontend envía el idioma activo en el encabezado Accept-Language ('es' o 'en').
 * Los modelos lanzan los mensajes en español; los controladores los pasan por traducir()
 * antes de responder. Si el idioma no es inglés, o el mensaje no está en el diccionario,
 * se devuelve el mensaje original.
 */
class MensajesModel
{
    private static $en = array(
        // Productos
        'El nombre es requerido' => 'The name is required',
        'La descripción es requerida' => 'The description is required',
        'El precio debe ser un número mayor a cero' => 'The price must be a number greater than zero',
        'El stock debe ser un número igual o mayor a cero' => 'The stock must be a number equal to or greater than zero',
        'La categoría es requerida' => 'The category is required',
        'La categoría seleccionada no existe' => 'The selected category does not exist',
        'El producto a modificar no es válido' => 'The product to update is not valid',
        // Servicios
        'La tarifa debe ser un número igual o mayor a cero' => 'The rate must be a number equal to or greater than zero',
        'El tiempo del servicio debe ser mayor a cero' => 'The service time must be greater than zero',
        'La modalidad debe ser Individual o Grupal' => 'The modality must be Individual or Group',
        'La edad recomendada es requerida' => 'The recommended age is required',
        'El servicio a modificar no es válido' => 'The service to update is not valid',
        // Sucursales
        'El teléfono es requerido' => 'The phone number is required',
        'La dirección exacta es requerida' => 'The exact address is required',
        'El correo electrónico es requerido' => 'The email is required',
        'El correo electrónico no tiene un formato válido' => 'The email does not have a valid format',
        'Seleccione al menos un encargado' => 'Select at least one manager',
        'Ya existe una sucursal con ese nombre' => 'A branch with that name already exists',
        'Algún usuario seleccionado no es un encargado disponible' => 'One of the selected users is not an available manager',
        'La sucursal a modificar no es válida' => 'The branch to update is not valid',
        // Horarios y bloqueos
        'La sucursal es requerida' => 'The branch is required',
        'La sucursal seleccionada no existe' => 'The selected branch does not exist',
        'La fecha es requerida' => 'The date is required',
        'La hora de inicio es requerida' => 'The start time is required',
        'La hora final es requerida' => 'The end time is required',
        'La hora final debe ser mayor que la hora de inicio' => 'The end time must be later than the start time',
        'La fecha no puede ser anterior a la fecha actual' => 'The date cannot be earlier than the current date',
        'Sobreposición de horarios: el rango indicado se cruza con otro horario registrado en esa sucursal' => 'Schedule overlap: the indicated range overlaps another schedule registered at that branch',
        'Sobreposición de bloqueos: el rango indicado se cruza con otro bloqueo registrado en esa sucursal' => 'Block overlap: the indicated range overlaps another block registered at that branch',
        'Sobreposición de horarios con bloqueos: el bloqueo se cruza con un horario registrado en esa sucursal' => 'Schedule and block overlap: the block overlaps a schedule registered at that branch',
        'Sobreposición de horarios con bloqueos: el horario se cruza con un bloqueo registrado en esa sucursal' => 'Schedule and block overlap: the schedule overlaps a block registered at that branch',
        // Reservas y facturas (Avance 5)
        'El encargado no tiene una sucursal asignada' => 'The manager has no assigned branch',
        'El cliente es requerido' => 'The client is required',
        'El cliente seleccionado no es válido' => 'The selected client is not valid',
        'El servicio es requerido' => 'The service is required',
        'El servicio seleccionado no existe' => 'The selected service does not exist',
        'El producto seleccionado no existe' => 'The selected product does not exist',
        'La hora de inicio ya pasó' => 'The start time has already passed',
        'La reserva debe terminar el mismo día' => 'The reservation must end on the same day',
        'El horario solicitado no está dentro del horario de la sucursal' => 'The requested time is outside the branch schedule',
        'El horario solicitado corresponde a un bloqueo de la sucursal' => 'The requested time falls within a branch block',
        'Ya existe una reserva en ese horario' => 'There is already a reservation at that time',
        'Indique si ha practicado gimnasia antes' => 'Indicate whether the client has practiced gymnastics before',
        'La condición médica es requerida (escriba Ninguna si no tiene)' => 'The medical condition is required (write None if there is none)',
        'El objetivo es requerido' => 'The goal is required',
        'Debe agregar al menos una línea de detalle' => 'You must add at least one detail line',
        'La línea de detalle no es válida' => 'The detail line is not valid',
        'La cantidad debe ser un número entero mayor a cero' => 'The quantity must be a whole number greater than zero',
        'No hay stock suficiente para uno de los productos seleccionados' => 'There is not enough stock for one of the selected products',
        'La factura seleccionada no existe' => 'The selected invoice does not exist',
        'La factura seleccionada no es una proforma' => 'The selected invoice is not a proforma',
        // Imágenes
        'El tipo de imagen no es válido' => 'The image type is not valid',
        'El registro de la imagen no es válido' => 'The image record is not valid',
        'No se recibió ninguna imagen' => 'No image was received',
        'La imagen no puede superar los 2 MB' => 'The image cannot exceed 2 MB',
        'No se pudo recibir la imagen, intente de nuevo' => 'The image could not be received, please try again',
        'Solo se permiten imágenes jpeg, jpg, png o gif' => 'Only jpeg, jpg, png or gif images are allowed',
        'No se pudo guardar la imagen en el servidor' => 'The image could not be saved on the server',
    );

    //Idioma solicitado por el cliente ('es' por defecto)
    public static function idioma()
    {
        if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            return strtolower(substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2));
        }
        return 'es';
    }

    //Devuelve el mensaje en el idioma del cliente
    public static function traducir($mensaje)
    {
        if (self::idioma() === 'en' && isset(self::$en[$mensaje])) {
            return self::$en[$mensaje];
        }
        return $mensaje;
    }
}
