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
  //Crear un servicio
  createServicio(Servicio) {
    return axios.post(BASE_URL, JSON.stringify(Servicio));
  }
  //Actualizar un servicio
  updateServicio(Servicio) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Servicio),
    });
  }
}

export default new ServicioService();
