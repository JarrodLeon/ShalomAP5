import axios from 'axios';

//Definición para llamar al API de productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'producto';

class ProductoService {
  //Lista de productos
  //localhost:81/apiShalomAcademy/producto
  getProductos() {
    return axios.get(BASE_URL);
  }
  //Obtener un producto
  //localhost:81/apiShalomAcademy/producto/1
  getProductoById(ProductoId) {
    return axios.get(BASE_URL + '/' + ProductoId);
  }
}

export default new ProductoService();
