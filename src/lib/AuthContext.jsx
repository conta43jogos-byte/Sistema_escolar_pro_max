import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Erro ao inicializar autenticação:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const user = { id: '1', email, name: email.split('@')[0] };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/');
      return user;
    } catch (err) {
      setAuthError(err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const register = async (userData) => {
    try {
      const user = { id: '1', ...userData };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      setAuthError(err);
      throw err;
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  const checkUserAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setAuthError({ type: 'auth_required' });
    }
  }, []);

  const value = {
    user,
    isLoading,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    authChecked,
    login,
    logout,
    register,
    navigateToLogin,
    checkUserAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
