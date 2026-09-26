import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, demoService } from '../services/Api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedIsDemo = localStorage.getItem('isDemo') === 'true';
      setIsDemo(storedIsDemo);

      if (token) {
        const userData = await authService.getProfile();
        if (userData.success) {
          setUser(userData.user);
        }
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isDemo');
      setIsDemo(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, isDemoMode = false) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (isDemoMode) {
          localStorage.setItem('isDemo', 'true');
          setIsDemo(true);
        } else {
          localStorage.removeItem('isDemo');
          setIsDemo(false);
        }
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Error en AuthContext login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Error de conexión',
        status: error.response?.status,
        statusCode: error.response?.status,
        data: error.response?.data
      };
    }
  };

  const loginAsDemo = async (email, password = 'password123') => {
    return await login(email, password, true);
  };

  const logout = async (options = { autoResetDemo: true }) => {
    const wasDemo = isDemo || localStorage.getItem('isDemo') === 'true';

    // Si era sesión demo y se solicita autoReset, restablecer datos en backend
    if (wasDemo && options.autoResetDemo !== false) {
      try {
        await demoService.resetDemo();
      } catch (err) {
        console.warn('No se pudo restablecer el demo automáticamente:', err);
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isDemo');
    setIsDemo(false);
    setUser(null);
  };

  const resetDemoData = async () => {
    try {
      const result = await demoService.resetDemo();
      return result;
    } catch (error) {
      console.error('Error al resetear demo:', error);
      return { success: false, error: error.message };
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return user.rol === roles;
  };

  const value = {
    user,
    isDemo,
    login,
    loginAsDemo,
    logout,
    resetDemoData,
    hasRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};