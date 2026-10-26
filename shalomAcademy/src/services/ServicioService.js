import axios from 'axios';

//Definición para llamar al API de servicios
const BASE_URL = import.meta.env.VITE_BASE_URL + 'servicio';

class ServicioService {
  //Lista de servicios
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/servicio
  getServicios() {
    return axios.get(BASE_URL);
  }
  //Obtener un servicio
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/servicio/get/1
  getServicioById(ServicioId) {
    return axios.get(BASE_URL + '/get/' + ServicioId);
  }
}

export default new ServicioService();
