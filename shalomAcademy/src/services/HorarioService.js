import axios from 'axios';

//Definición para llamar al API de horarios y bloqueos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'horario';

class HorarioService {
  //Horarios y bloqueos de una sucursal
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/horario/porSucursal/1
  getHorariosBySucursal(SucursalId) {
    return axios.get(BASE_URL + '/porSucursal/' + SucursalId);
  }
  //Obtener un horario o un bloqueo
  //localhost:81/ShalomAcademy_P5/apiShalomAcademy/horario/get/1
  getHorarioById(HorarioId) {
    return axios.get(BASE_URL + '/get/' + HorarioId);
  }
  //Crear un horario o un bloqueo (es_bloqueo: 0 o 1)
  createHorario(Horario) {
    return axios.post(BASE_URL, JSON.stringify(Horario));
  }
}

export default new HorarioService();
