import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Tooltip from '@mui/material/Tooltip';

export default function Header() {
  //Gestión menu usuario
  const [anchorElUser, setAnchorEl] = useState(null);
  //Gestión menu principal (pantallas pequeñas)
  const [anchorElPrincipal, setAnchorElPrincipal] = useState(null);
  //Gestión menu de mantenimientos
  const [anchorElMant, setAnchorElMant] = useState(null);

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

  //Lista enlaces menu usuario
  const userItems = [
    { name: 'Iniciar sesión', link: '/user/login', login: false },
    { name: 'Registrarse', link: '/user/create', login: false },
    { name: 'Cerrar sesión', link: '/user/logout', login: true },
  ];

  //Lista enlaces menu principal
  const navItems = [
    { name: 'Productos', link: '/catalogo-productos/' }, //Catálogo de productos
    { name: 'Servicios', link: '/catalogo-servicios/' }, //Catálogo de servicios
    { name: 'Reservas', link: '/reserva' }, //Historial de reservas
    { name: 'Facturas', link: '/factura' }, //Historial de facturación
  ];

  //Lista enlaces menu de mantenimientos
  const mantItems = [
    { name: 'Productos', link: '/mantenimiento-productos' },
    { name: 'Servicios', link: '/mantenimiento-servicios' },
    { name: 'Sucursales', link: '/mantenimiento-sucursales' },
    { name: 'Horarios y bloqueos', link: '/horario' },
  ];

  //Identificadores de menus
  const menuIdPrincipal = 'menu-appbar';
  const menuIdMant = 'menu-mantenimientos';
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
        <Typography textAlign="center">Mantenimiento</Typography>
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
        <Typography sx={{ textAlign: 'center' }}>Mantenimiento {page.name}</Typography>
      </MenuItem>
    )),
  ];

  //Menu Usuario
  const userMenu = (
    <Box sx={{ flexGrow: 0 }}>
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
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
          <Tooltip title="Shalom Academy">
            <IconButton
              size="large"
              edge="end"
              component="a"
              href="/"
              aria-label="Shalom Academy"
              color="primary"
            >
              <SportsGymnasticsIcon />
            </IconButton>
          </Tooltip>
          {menuPrincipal}
          <Box sx={{ flexGrow: 1 }} />
          <div>{userMenu}</div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
