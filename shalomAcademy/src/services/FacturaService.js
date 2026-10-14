import axios from 'axios';

//Definición para llamar al API de facturas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'factura';

class FacturaService {
  //Lista de facturas de la sucursal del encargado
  //localhost:81/apiShalomAcademy/factura
  getFacturas() {
    return axios.get(BASE_URL);
  }
  //Obtener una factura
  //localhost:81/apiShalomAcademy/factura/1
  getFacturaById(FacturaId) {
    return axios.get(BASE_URL + '/get/' + FacturaId);
  }
}

export default new FacturaService();
