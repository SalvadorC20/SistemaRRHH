import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordDialog from '../Auth/ChangePasswordDialog';

const UserMenu = ({ anchorEl, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    onClose();
    await logout({ autoResetDemo: true });
    navigate('/login');
  };

  const handleProfile = () => {
    onClose();
    navigate('/mi-perfil'); // O la ruta que tengas para el perfil
  };

  const handleChangePassword = () => {
    onClose();
    setChangePasswordOpen(true);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        onClick={onClose}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mi Perfil</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleChangePassword}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cambiar Contraseña</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>

      <ChangePasswordDialog 
        open={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)} 
      />
    </>
  );
};

export default UserMenu;