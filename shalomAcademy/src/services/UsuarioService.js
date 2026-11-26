import axios from 'axios';

//Definición para llamar al API de usuarios
const BASE_URL = import.meta.env.VITE_BASE_URL + 'usuario';

class UsuarioService {
  //Encargados sin sucursal (y, al modificar, los de la sucursal indicada)
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/usuario/encargadosDisponibles/1
  getEncargadosDisponibles(SucursalId = '') {
    return axios.get(BASE_URL + '/encargadosDisponibles/' + SucursalId);
  }
  //Clientes (nombre y email) para las reservas y facturas
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/usuario/clientes
  getClientes() {
    return axios.get(BASE_URL + '/clientes');
  }
}

export default new UsuarioService();
