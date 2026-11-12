import axios from 'axios';

//Definición para llamar al API de productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'producto';

class ProductoService {
  //Lista de productos
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/producto
  getProductos() {
    return axios.get(BASE_URL);
  }
  //Obtener un producto
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/producto/get/1
  getProductoById(ProductoId) {
    return axios.get(BASE_URL + '/get/' + ProductoId);
  }
  //Crear un producto
  createProducto(Producto) {
    return axios.post(BASE_URL, JSON.stringify(Producto));
  }
  //Actualizar un producto
  updateProducto(Producto) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Producto),
    });
  }
}

export default new ProductoService();
