import { CssBaseline, ThemeProvider } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { appTheme } from './themes/theme';
import { Layout } from './components/Layout/Layout';

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline enableColorScheme />
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  );
}
