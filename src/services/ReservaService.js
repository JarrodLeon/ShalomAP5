import axios from 'axios';

//Definición para llamar al API de reservas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'reserva';

class ReservaService {
  //Lista de reservas de la sucursal del encargado
  //localhost:81/apiShalomAcademy/reserva
  getReservas() {
    return axios.get(BASE_URL);
  }
  //Obtener una reserva
  //localhost:81/apiShalomAcademy/reserva/1
  getReservaById(ReservaId) {
    return axios.get(BASE_URL + '/' + ReservaId);
  }
}

export default new ReservaService();
