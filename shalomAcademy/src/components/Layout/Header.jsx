import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LanguageIcon from '@mui/icons-material/Language';
import { Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Tooltip from '@mui/material/Tooltip';

export default function Header() {
  //t: traduce textos; i18n: permite cambiar el idioma activo
  const { t, i18n } = useTranslation();
  //Idioma activo ('es' o 'en')
  const idiomaActivo = i18n.resolvedLanguage || 'es';

  //Gestión menu usuario
  const [anchorElUser, setAnchorEl] = useState(null);
  //Gestión menu principal (pantallas pequeñas)
  const [anchorElPrincipal, setAnchorElPrincipal] = useState(null);
  //Gestión menu de mantenimientos
  const [anchorElMant, setAnchorElMant] = useState(null);
  //Gestión menu de idioma
  const [anchorElIdioma, setAnchorElIdioma] = useState(null);

  //Abierto/cerrado menu usuario
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  //Abierto/cerrado menu principal
  const handleOpenPrincipalMenu = (event) => {
    setAnchorElPrincipal(event.currentTarget);
  };
  const handleClosePrincipalMenu = () => {
    setAnchorElPrincipal(null);
  };
  //Abierto/cerrado menu de mantenimientos
  const handleOpenMantMenu = (event) => {
    setAnchorElMant(event.currentTarget);
  };
  const handleCloseMantMenu = () => {
    setAnchorElMant(null);
  };
  //Abierto/cerrado menu de idioma
  const handleOpenIdiomaMenu = (event) => {
    setAnchorElIdioma(event.currentTarget);
  };
  const handleCloseIdiomaMenu = () => {
    setAnchorElIdioma(null);
  };
  //Cambiar el idioma: i18next lo guarda en localStorage (persistencia) y toda la interfaz se actualiza
  const cambiarIdioma = (codigo) => {
    i18n.changeLanguage(codigo);
    handleCloseIdiomaMenu();
  };

  //Lista de idiomas disponibles
  const idiomas = [
    { codigo: 'es', nombre: t('layout:header.spanish') },
    { codigo: 'en', nombre: t('layout:header.english') },
  ];

  //Lista enlaces menu usuario
  const userItems = [
    { name: t('layout:header.login'), link: '/user/login', login: false },
    { name: t('layout:header.register'), link: '/user/create', login: false },
    { name: t('layout:header.logout'), link: '/user/logout', login: true },
  ];

  //Lista enlaces menu principal
  const navItems = [
    { name: t('layout:header.products'), link: '/catalogo-productos/' }, //Catálogo de productos
    { name: t('layout:header.services'), link: '/catalogo-servicios/' }, //Catálogo de servicios
    { name: t('layout:header.reservations'), link: '/reserva' }, //Historial de reservas
    { name: t('layout:header.invoices'), link: '/factura' }, //Historial de facturación
  ];

  //Lista enlaces menu de mantenimientos
  const mantItems = [
    { name: t('layout:header.maintProducts'), link: '/mantenimiento-productos' },
    { name: t('layout:header.maintServices'), link: '/mantenimiento-servicios' },
    { name: t('layout:header.maintBranches'), link: '/mantenimiento-sucursales' },
    { name: t('layout:header.maintSchedules'), link: '/horario' },
  ];

  //Identificadores de menus
  const menuIdPrincipal = 'menu-appbar';
  const menuIdMant = 'menu-mantenimientos';
  const menuIdIdioma = 'menu-idioma';
  const userMenuId = 'user-menu';

  //Menu Principal
  const menuPrincipal = (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      {navItems.map((item, index) => (
        <Button key={index} component={Link} to={item.link} color="secondary">
          <Typography textAlign="center">{item.name}</Typography>
        </Button>
      ))}
      {/* Menu desplegable de mantenimientos */}
      <Button
        color="secondary"
        aria-controls={menuIdMant}
        aria-haspopup="true"
        endIcon={<ArrowDropDownIcon />}
        onClick={handleOpenMantMenu}
      >
        <Typography textAlign="center">{t('layout:header.maintenance')}</Typography>
      </Button>
      <Menu
        id={menuIdMant}
        anchorEl={anchorElMant}
        open={Boolean(anchorElMant)}
        onClose={handleCloseMantMenu}
      >
        {mantItems.map((item, index) => (
          <MenuItem key={index} component={Link} to={item.link} onClick={handleCloseMantMenu}>
            <Typography sx={{ textAlign: 'center' }}>{item.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  //Menu Principal responsivo (incluye los mantenimientos)
  const menuPrincipalMobile = [
    ...navItems.map((page, index) => (
      <MenuItem key={`nav-${index}`} component={Link} to={page.link} onClick={handleClosePrincipalMenu}>
        <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
      </MenuItem>
    )),
    ...mantItems.map((page, index) => (
      <MenuItem key={`mant-${index}`} component={Link} to={page.link} onClick={handleClosePrincipalMenu}>
        <Typography sx={{ textAlign: 'center' }}>
          {t('layout:header.mobileMaintenance', { name: page.name })}
        </Typography>
      </MenuItem>
    )),
  ];

  //Menu de selección de idioma
  const menuIdioma = (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title={t('layout:header.language')}>
        <IconButton
          size="large"
          aria-label={t('layout:header.language')}
          aria-controls={menuIdIdioma}
          aria-haspopup="true"
          onClick={handleOpenIdiomaMenu}
          color="inherit"
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id={menuIdIdioma}
        anchorEl={anchorElIdioma}
        open={Boolean(anchorElIdioma)}
        onClose={handleCloseIdiomaMenu}
      >
        {idiomas.map((idioma) => (
          <MenuItem
            key={idioma.codigo}
            selected={idioma.codigo === idiomaActivo}
            onClick={() => cambiarIdioma(idioma.codigo)}
          >
            <Typography sx={{ textAlign: 'center' }}>{idioma.nombre}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  //Menu Usuario
  const userMenu = (
    <Box sx={{ flexGrow: 0 }}>
      <IconButton
        size="large"
        edge="end"
        aria-label={t('layout:header.account')}
        aria-controls={userMenuId}
        aria-haspopup="true"
        onClick={handleUserMenuOpen}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        sx={{ mt: '45px' }}
        id={userMenuId}
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
      >
        {userItems.map((setting, index) => (
          <MenuItem key={index} component={Link} to={setting.link} onClick={handleUserMenuClose}>
            <Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primaryLight" sx={{ backgroundColor: 'primaryLight.main' }}>
        <Toolbar>
          {/* Botón del menú principal (solo en pantallas pequeñas) */}
          <IconButton
            size="large"
            color="inherit"
            aria-controls={menuIdPrincipal}
            aria-haspopup="true"
            sx={{ mr: 2, display: { xs: 'inline-flex', md: 'none' } }}
            onClick={handleOpenPrincipalMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id={menuIdPrincipal}
            anchorEl={anchorElPrincipal}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            open={Boolean(anchorElPrincipal)}
            onClose={handleClosePrincipalMenu}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {menuPrincipalMobile}
          </Menu>
          {/* Enlace página inicio */}
          <Tooltip title={t('layout:header.home')}>
            <IconButton
              size="large"
              edge="end"
              component="a"
              href="/"
              aria-label={t('layout:header.home')}
              color="primary"
            >
              <SportsGymnasticsIcon />
            </IconButton>
          </Tooltip>
          {menuPrincipal}
          <Box sx={{ flexGrow: 1 }} />
          {/* Selector de idioma */}
          {menuIdioma}
          <div>{userMenu}</div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
