import axios from 'axios';

//Definición para llamar al API de sucursales
const BASE_URL = import.meta.env.VITE_BASE_URL + 'sucursal';

class SucursalService {
  //Lista de sucursales
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/sucursal
  getSucursales() {
    return axios.get(BASE_URL);
  }
  //Obtener una sucursal (incluye sus encargados)
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/sucursal/get/1
  getSucursalById(SucursalId) {
    return axios.get(BASE_URL + '/get/' + SucursalId);
  }
  //Crear una sucursal
  createSucursal(Sucursal) {
    return axios.post(BASE_URL, JSON.stringify(Sucursal));
  }
  //Actualizar una sucursal
  updateSucursal(Sucursal) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Sucursal),
    });
  }
}

export default new SucursalService();
