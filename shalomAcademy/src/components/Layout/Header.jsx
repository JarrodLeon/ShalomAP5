import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Tooltip from '@mui/material/Tooltip';

export default function Header() {
  //Gestión menu usuario
  const [anchorElUser, setAnchorEl] = useState(null);
  //Gestión menu principal
  const [anchorElPrincipal, setAnchorElPrincipal] = useState(null);

  //Abierto menu usuario
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  //Cerrado menu usuario
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  //Abierto menu principal
  const handleOpenPrincipalMenu = (event) => {
    setAnchorElPrincipal(event.currentTarget);
  };
  //Cerrado menu principal
  const handleClosePrincipalMenu = () => {
    setAnchorElPrincipal(null);
  };

  //Lista enlaces menu usuario
  const userItems = [
    { name: 'Login', link: '/user/login', login: false },
    { name: 'Registrarse', link: '/user/create', login: false },
    { name: 'Logout', link: '/user/logout', login: true },
  ];

  //Lista enlaces menu principal
  const navItems = [
    { name: 'Productos', link: '/catalogo-productos/' }, //Enlace página catálogo de productos
    { name: 'Mantenimiento Productos', link: '/mantenimiento-productos' }, //Enlace página mantenimiento de productos
    { name: 'Servicios', link: '/catalogo-servicios/' }, //Enlace página catálogo de servicios
    { name: 'Mantenimiento Servicios', link: '/mantenimiento-servicios' }, //Enlace página mantenimiento de servicios
    { name: 'Reservas', link: '/reserva' }, //Enlace página historial de reservas
    { name: 'Facturas', link: '/factura' }, //Enlace página historial de facturación
  ];

  //Identificador menu principal
  const menuIdPrincipal = 'menu-appbar';

  //Menu Principal
  const menuPrincipal = (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      {navItems &&
        navItems.map((item, index) => {
          return (
            <Button key={index} component={Link} to={item.link} color="secondary">
              <Typography textAlign="center">{item.name}</Typography>
            </Button>
          );
        })}
    </Box>
  );

  //Menu Principal responsivo
  const menuPrincipalMobile = navItems.map((page, index) => (
    <MenuItem key={index} component={Link} to={page.link} onClick={handleClosePrincipalMenu}>
      <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
    </MenuItem>
  ));

  //Identificador menu usuario
  const userMenuId = 'user-menu';

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
        {userItems.map((setting, index) => {
          return (
            <MenuItem key={index} component={Link} to={setting.link} onClick={handleUserMenuClose}>
              <Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        color="primaryLight"
        sx={{ backgroundColor: 'primaryLight.main' }}
      >
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
          {/* Enlace página inicio */}
          {menuPrincipal}
          <Box sx={{ flexGrow: 1 }} />
          <div>{userMenu}</div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
