import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import logo from '../../assets/logo.jpeg';

export function PageNotFound() {
  const { t } = useTranslation();
  return (
    <Container component="main" sx={{ mt: 8, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={4}>
          <Box
            component="img"
            sx={{ borderRadius: '4%', maxWidth: '100%', height: 'auto' }}
            alt={t('layout:notFound.imageAlt')}
            src={logo}
          />
        </Grid>
        <Grid size={8}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            {t('layout:notFound.title')}
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary">
            {t('layout:notFound.text')}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
