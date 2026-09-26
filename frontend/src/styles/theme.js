import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0', // Azul corporativo
      light: '#5E92F3',
      dark: '#003c8f',
      contrastText: '#fff',
    },
    secondary: {
      main: '#009688', // Verde azulado profesional
      light: '#52c7b8',
      dark: '#00675b',
      contrastText: '#fff',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: '#F9A825',
      light: '#FFD54F',
      dark: '#F57F17',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#8E0000',
    },
    neutral: {
      main: '#607D8B',
      contrastText: '#fff',
    },
    background: {
      default: '#F3F6F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5F6368',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, fontSize: '2rem' },
    h5: { fontWeight: 600, fontSize: '1.5rem' },
    h6: { fontWeight: 600, fontSize: '1.25rem' },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
    caption: { fontSize: '0.75rem', color: '#6b7280' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.25s ease',
        },
        contained: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          background: '#1565C0',
          color: '#fff',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          background: '#fff',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.25s ease',
        },
      },
    },
  },
});

export default theme;
