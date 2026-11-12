import axios from 'axios';

//Definición para llamar al API de categorías de productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'categoria';

class CategoriaService {
  //Lista de categorías
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/categoria
  getCategorias() {
    return axios.get(BASE_URL);
  }
}

export default new CategoriaService();
