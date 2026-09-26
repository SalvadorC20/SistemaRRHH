import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, hasRole } = useAuth();

  console.log('ProtectedRoute - User:', user); // Debug
  console.log('ProtectedRoute - Required Role:', requiredRole); // Debug
  console.log('ProtectedRoute - Has Role:', requiredRole ? hasRole(requiredRole) : 'No required'); // Debug

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - Redirigiendo a login'); // Debug
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    console.log('ProtectedRoute - Redirigiendo a unauthorized'); // Debug
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;