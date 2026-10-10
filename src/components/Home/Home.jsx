import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export function Home() {
  return (
    <Container sx={{ p: 2 }} maxWidth="sm">
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="text.primary"
        gutterBottom
      >
        Shalom Academy
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary">
        Centro de gimnasia rítmica y artística en Turrucares, Alajuela. Agenda
        tu clase de prueba, evaluación de nivel o clase privada.
      </Typography>
    </Container>
  );
}
