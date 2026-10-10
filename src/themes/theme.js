import { createTheme } from '@mui/material/styles';

// Paleta tomada del logo de Shalom Academy (rosado, celeste y amarillo suave)
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#D6457F' },
    secondary: { main: '#3A9BC1' },
    primaryLight: { main: '#F8E3A0', contrastText: '#2B2B2B' },
  },
});
