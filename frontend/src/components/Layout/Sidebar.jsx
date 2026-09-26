import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  RequestQuote as PermisosIcon,
  Schedule as AsistenciaIcon,
  Assessment as EvaluacionesIcon,
  School as CapacitacionesIcon,
  Payment as NominasIcon,
  Analytics as ReportesIcon,
  AccessTime as HorariosIcon,
  Folder as FolderIcon,
  PersonAdd as RegisterIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';


const Sidebar = ({ open, onClose }) => {
  const { hasRole, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = React.useState({});

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['ADMIN_RRHH', 'DIRECTIVO', 'DOCENTE', 'PERSONAL_APOYO']
    },
    {
      text: 'Empleados',
      icon: <PeopleIcon />,
      path: '/empleados',
      roles: ['ADMIN_RRHH'],
      subItems: [
        { text: 'Lista de Empleados', path: '/empleados' },
        { text: 'Agregar Empleado', path: '/empleados/nuevo' },
        { text: 'Registrar Usuario', path: '/empleados/registrar', icon: <RegisterIcon sx={{ fontSize: 18 }} /> }
      ]
    },
    {
      text: 'Permisos',
      icon: <PermisosIcon />,
      path: '/permisos',
      roles: ['ADMIN_RRHH', 'DIRECTIVO', 'DOCENTE', 'PERSONAL_APOYO'],
      subItems: [
        { text: 'Mis Permisos', path: '/permisos', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Solicitar Permiso', path: '/permisos/solicitar', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Gestionar Permisos', path: '/permisos/gestion', roles: ['ADMIN_RRHH', 'DIRECTIVO'] }
      ]
    },
    {
      text: 'Asistencia',
      icon: <AsistenciaIcon />,
      path: '/asistencia',
      roles: ['ADMIN_RRHH', 'DIRECTIVO', 'DOCENTE', 'PERSONAL_APOYO'],
      subItems: [
        { text: 'Mi Asistencia', path: '/asistencia', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Registrar Asistencia', path: '/asistencia/registrar', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Reporte General', path: '/asistencia/reportes', roles: ['ADMIN_RRHH', 'DIRECTIVO'] }
      ]
    },
    {
      text: 'Evaluaciones',
      icon: <EvaluacionesIcon />,
      path: '/evaluaciones',
      roles: ['ADMIN_RRHH', 'DIRECTIVO', 'DOCENTE', 'PERSONAL_APOYO'],
      subItems: [
        { text: 'Mis Evaluaciones', path: '/evaluaciones', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Nueva Evaluación', path: '/evaluaciones/nueva', roles: ['ADMIN_RRHH', 'DIRECTIVO'] },
        { text: 'Gestionar Evaluaciones', path: '/evaluaciones/gestion', roles: ['ADMIN_RRHH', 'DIRECTIVO'] }
      ]
    },
    
    {
      text: 'Capacitaciones',
      icon: <CapacitacionesIcon />,
      path: '/capacitaciones',
      roles: ['ADMIN_RRHH', 'DOCENTE', 'PERSONAL_APOYO'],
      subItems: [
        { text: 'Mis Capacitaciones', path: '/capacitaciones', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Nueva Capacitación', path: '/capacitaciones/nueva', roles: ['ADMIN_RRHH'] },
        { text: 'Gestionar Capacitaciones', path: '/capacitaciones/gestion', roles: ['ADMIN_RRHH'] }
      ]
    },
    {
      text: 'Nóminas',
      icon: <NominasIcon />,
      path: '/nominas',
      roles: ['ADMIN_RRHH', 'DOCENTE', 'PERSONAL_APOYO'],
      subItems: [
        { text: 'Mis Nóminas', path: '/nominas', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Gestionar Nóminas', path: '/nominas/gestion', roles: ['ADMIN_RRHH'] },
        { text: 'Generar Nómina', path: '/nominas/generar', roles: ['ADMIN_RRHH'] }
      ]
    },
    {
      text: 'Horarios',
      icon: <HorariosIcon />,
      path: '/horarios/mis-horarios',
      roles: ['ADMIN_RRHH', 'DOCENTE', 'PERSONAL_APOYO'],
      subItems: [
        { text: 'Mis Horarios', path: '/horarios/mis-horarios', roles: ['DOCENTE', 'PERSONAL_APOYO'] },
        { text: 'Planificación', path: '/horarios/planificacion', roles: ['ADMIN_RRHH'] }
      ]
    },
    {
      text: 'Reportes Avanzados',
      icon: <ReportesIcon />,
      path: '/reportes/asistencia',
      roles: ['ADMIN_RRHH', 'DIRECTIVO'],
      subItems: [
        { text: 'Reporte Asistencia', path: '/reportes/asistencia' },
        { text: 'Reporte Nómina', path: '/reportes/nomina' },
        { text: 'Reporte Desempeño', path: '/reportes/desempeno' }
      ]
    }
  ];

  const handleToggleSection = (text) => {
    setOpenSections(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const isItemActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSubItemActive = (path) => {
    return location.pathname === path;
  };

  const filteredMenuItems = menuItems.filter(item => hasRole(item.roles));

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          marginTop: isDemo ? '106px' : '64px',
          height: isDemo ? 'calc(100% - 106px)' : 'calc(100% - 64px)',
          overflowX: 'hidden',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '4px',
          },
        },
      }}
    >
      <List sx={{ pt: 0 }}>
        {filteredMenuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              component={Button}
              onClick={() =>
                item.subItems
                  ? handleToggleSection(item.text)
                  : handleNavigation(item.path)
              }
              selected={isItemActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textTransform: 'none',
                justifyContent: 'flex-start',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{
                color: 'inherit',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.subItems && (
                openSections[item.text] ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItem>

            {item.subItems && (
              <Collapse in={openSections[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems
                    .filter(subItem => !subItem.roles || hasRole(subItem.roles))
                    .map((subItem) => (
                      <ListItem
                        key={subItem.text}
                        component={Button}
                        sx={{
                          pl: 4,
                          width: '100%',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          textTransform: 'none',
                          justifyContent: 'flex-start',
                          color: 'inherit',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                            },
                          },
                        }}
                        onClick={() => handleNavigation(subItem.path)}
                        selected={isSubItemActive(subItem.path)}
                      >
                        {subItem.icon && (
                          <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: 30
                          }}>
                            {subItem.icon}
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={subItem.text}
                          sx={{
                            '& .MuiTypography-root': {
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
