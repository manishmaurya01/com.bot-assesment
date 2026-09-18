import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronize user profile on initial app load if token exists
  useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch {
          // Token may be invalid/expired, let interceptor handle refresh or clear
        }
      }
      setLoading(false);
    };

    syncUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await API.post('/auth/signup', { name, email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch {
      // Continue cleanup anyway
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const verifyEmail = async (email, code) => {
    const { data } = await API.post('/auth/verify-email', { email, code });
    if (user) {
      const updatedUser = { ...user, isVerified: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return data;
  };

  const resendVerification = async (email) => {
    const { data } = await API.post('/auth/resend-verification', { email });
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await API.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await API.post('/auth/reset-password', { token, password });
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);