import axios from 'axios';

//Definición para llamar al API de facturas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'factura';

class FacturaService {
  //Lista de facturas de la sucursal del encargado
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/factura
  getFacturas() {
    return axios.get(BASE_URL);
  }
  //Obtener una factura
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/factura/get/1
  getFacturaById(FacturaId) {
    return axios.get(BASE_URL + '/get/' + FacturaId);
  }
  //Encargado y sucursal (solo lectura) para el formulario
  getContexto() {
    return axios.get(BASE_URL + '/contexto');
  }
  //Registrar una factura nueva
  createFactura(Factura) {
    return axios.post(BASE_URL, JSON.stringify(Factura));
  }
  //Registrar (facturar) una factura proforma
  facturarProforma(Factura) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Factura),
    });
  }
}

export default new FacturaService();
