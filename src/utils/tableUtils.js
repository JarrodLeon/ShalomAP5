//Funciones de ordenamiento para las tablas (basadas en el ejemplo de MUI)

//Convierte a número cuando el valor es numérico, para ordenar bien montos y cantidades
function valor(dato) {
  const numero = Number(dato);
  return dato !== '' && dato !== null && !Number.isNaN(numero) ? numero : dato;
}

//Ordenar descendente
function descendingComparator(a, b, orderBy) {
  if (valor(b[orderBy]) < valor(a[orderBy])) {
    return -1;
  }
  if (valor(b[orderBy]) > valor(a[orderBy])) {
    return 1;
  }
  return 0;
}

//Comparar para ordenar
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

//Ordenar estable: si dos elementos son iguales conserva el orden original
export function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
