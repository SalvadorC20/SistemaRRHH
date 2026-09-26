import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  AdminPanelSettings,
  Business,
  School,
  SupportAgent,
  CheckCircleOutline,
  RocketLaunch,
  AutoMode,
  ArrowForward,
  LockOpen
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { demoService } from '../../services/Api';

const ROLE_ICONS = {
  ADMIN_RRHH: <AdminPanelSettings fontSize="large" sx={{ color: '#1976d2' }} />,
  DIRECTIVO: <Business fontSize="large" sx={{ color: '#7b1fa2' }} />,
  DOCENTE: <School fontSize="large" sx={{ color: '#2e7d32' }} />,
  PERSONAL_APOYO: <SupportAgent fontSize="large" sx={{ color: '#ed6c02' }} />
};

const ROLE_COLORS = {
  ADMIN_RRHH: { primary: '#1976d2', light: '#e3f2fd', border: '#90caf9' },
  DIRECTIVO: { primary: '#7b1fa2', light: '#f3e5f5', border: '#ce93d8' },
  DOCENTE: { primary: '#2e7d32', light: '#e8f5e9', border: '#a5d6a7' },
  PERSONAL_APOYO: { primary: '#ed6c02', light: '#fff3e0', border: '#ffcc80' }
};

const DemoSelectorModal = ({ open, onClose, onSelectRole, loadingRole }) => {
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadDemoAccounts();
    }
  }, [open]);

  const loadDemoAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await demoService.getDemoRoles();
      if (response && response.data) {
        setDemoAccounts(response.data);
      }
    } catch (err) {
      console.error('Error al cargar roles demo:', err);
      setError('No se pudieron cargar los roles dinámicos, usando configuración de respaldo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loadingRole ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          background: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
        }
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #003B5A 0%, #0A3D62 50%, #1a5276 100%)',
          color: 'white',
          p: { xs: 2.5, sm: 3 },
          position: 'relative'
        }}
      >
        <IconButton
          onClick={onClose}
          disabled={Boolean(loadingRole)}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <RocketLaunch sx={{ color: '#FFD700', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            Modo Demostración / Acceso para Reclutadores
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 650, fontSize: '0.92rem' }}>
          Selecciona cualquiera de los roles disponibles para ingresar de inmediato con 1 solo clic. 
          Al cerrar la sesión, <strong>todos los datos y cambios realizados se restablecen automáticamente</strong> al estado inicial limpio.
        </Typography>
      </Box>

      {/* Contenido Principal */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={44} sx={{ color: '#003B5A', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Preparando entorno y roles de prueba...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {demoAccounts.map((account, index) => {
              const colors = ROLE_COLORS[account.roleKey] || {
                primary: '#003B5A',
                light: '#e8f4f8',
                border: '#b0bec5'
              };
              const isSelectedLoading = loadingRole === account.roleKey;

              return (
                <Grid item xs={12} sm={6} key={account.roleKey}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    style={{ height: '100%' }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        borderColor: colors.border,
                        transition: 'all 0.25s ease-in-out',
                        '&:hover': {
                          borderColor: colors.primary,
                          boxShadow: `0 8px 24px ${colors.border}`,
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Cabecera de Tarjeta */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 2,
                                bgcolor: colors.light,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {ROLE_ICONS[account.roleKey] || <LockOpen sx={{ color: colors.primary }} />}
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                                {account.roleName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {account.user?.nombre} {account.user?.apellido} ({account.user?.puesto})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Descripción */}
                        <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.85rem' }}>
                          {account.description}
                        </Typography>

                        {/* Puntos destacados */}
                        {account.highlights && (
                          <Box sx={{ mb: 2.5, flexGrow: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Funcionalidades Clave:
                            </Typography>
                            <List dense disablePadding sx={{ mt: 0.5 }}>
                              {account.highlights.map((h, i) => (
                                <ListItem key={i} disableGutters sx={{ py: 0.2, alignItems: 'flex-start' }}>
                                  <ListItemIcon sx={{ minWidth: 22, mt: 0.3 }}>
                                    <CheckCircleOutline sx={{ fontSize: 15, color: colors.primary }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={h}
                                    primaryTypographyProps={{
                                      variant: 'caption',
                                      color: '#334155',
                                      fontSize: '0.8rem',
                                      lineHeight: 1.3
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Botón de Entrada */}
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={Boolean(loadingRole)}
                          onClick={() => onSelectRole(account)}
                          endIcon={
                            isSelectedLoading ? (
                              <CircularProgress size={18} sx={{ color: 'white' }} />
                            ) : (
                              <ArrowForward fontSize="small" />
                            )
                          }
                          sx={{
                            mt: 'auto',
                            py: 1,
                            bgcolor: colors.primary,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: colors.primary,
                              filter: 'brightness(0.9)'
                            }
                          }}
                        >
                          {isSelectedLoading ? 'Ingresando...' : `Ingresar como ${account.roleName.split(' ')[0]}`}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>

      {/* Pie del modal */}
      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f1f5f9', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoMode sx={{ color: '#003B5A', fontSize: 18 }} />
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
            Restauración automática al cerrar sesión
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          disabled={Boolean(loadingRole)}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            color: '#475569',
            borderColor: '#cbd5e1'
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DemoSelectorModal;
