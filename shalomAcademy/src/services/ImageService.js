import axios from 'axios';

//Definición para llamar al API de imágenes
const BASE_URL = import.meta.env.VITE_BASE_URL + 'imagen';

class ImageService {
  //Subir o reemplazar la imagen de un producto o servicio
  //formData: file (la imagen), tipo ('producto' o 'servicio') e id
  createImage(formData) {
    return axios.post(BASE_URL, formData);
  }
}

export default new ImageService();
