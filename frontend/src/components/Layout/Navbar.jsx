// src/components/layout/Navbar.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import UserMenu from './UserMenu';
import DemoBanner from './DemoBanner';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleUserMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <DemoBanner />
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onToggleSidebar}
          sx={{
            mr: 2,
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(21,101,192,0.1)',
              transform: 'scale(1.1)',
              transition: 'all 0.2s ease',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            color: 'primary.main',
            letterSpacing: 0.5,
          }}
        >
          Sistema de Gestión de Recursos Humanos
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ textAlign: 'right', mr: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              {user?.rol}
            </Typography>
          </Box>

          <IconButton
            onClick={handleUserMenuOpen}
            size="large"
            sx={{
              color: 'primary.main',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                backgroundColor: 'rgba(21,101,192,0.08)',
              },
            }}
          >
            <AccountCircle />
          </IconButton>
        </Box>

        <UserMenu anchorEl={anchorEl} onClose={handleUserMenuClose} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
