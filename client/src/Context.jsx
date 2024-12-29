import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosD from './axiosDefault';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('talgibravi-istazo');
    if (token) {
      axiosD.post('/validateToken', { token })
        .then(response => {
          const { login, rol, balance, _id, usuariosCreados} = response.data;
          setUser({ login, rol, balance, _id, usuariosCreados });
        })
        .catch(error => {
          console.error('Token validation failed:', error);
          localStorage.removeItem('talgibravi-istazo');
          if(rol === "Jugador"){
          logoutUsers();
          window.location.href = '/'; 
          }else{
            logout();
            window.location.href = '/admin'; 
          }
        });
    }

        const tokenCheckInterval = setInterval(() => {
          console.log("Se está verificando el acceso desde el servidor")
          const token = localStorage.getItem('talgibravi-istazo');
          if (token) {
            axiosD.post('/validateToken', { token })
              .catch(error => {
                console.error('Token has expired:', error);
                logout(); 
              });
          }
        }, 1200000); 
    
        return () => clearInterval(tokenCheckInterval);

  },[]);
  

  const login = async (loginData) => {
    try {
      const response = await axiosD.post('/login', loginData);
      const { token, login, rol, balance, _id } = response.data;
      localStorage.setItem('talgibravi-istazo', token);
      setUser({ login, rol, balance, _id });
    } catch (error) {
      console.error('Error during login:', error.response?.data || error.message);
      throw error.response?.data?.error || error.message;
    }
  };

  const loginOffice = async (loginData) => {
    try {
      console.log("Se envio")
      const response = await axiosD.post('/loginOffice', loginData);
      const { token, login, rol, balance, _id, usuariosCreados, activo } = response.data;

      if(rol === "Jugador"){
        logout();
      }

      localStorage.setItem('talgibravi-istazo', token);
      setUser({ login, rol, balance, _id, usuariosCreados, activo});

              // Función para manejar los cambios en el localStorage
              const handleStorageChange = (event) => {
                // Verificar si el cambio es en el token
                if (event.key === 'talgibravi-istazo') {
                  console.log("cambio el token", event.key)
                  logout();
                }
              };
          
              // Agregar listener para cambios en el localStorage
              window.addEventListener('storage', handleStorageChange);
              // Limpiar listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

    } catch (error) {
      console.error('Error during login:', error.response?.data || error.message);
      throw error.response?.data?.error || error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem('talgibravi-istazo');
    setUser(null);
    window.location.href = '/admin';
  };

  const logoutUsers = () => {
    localStorage.removeItem('talgibravi-istazo');
    localStorage.removeItem('hasReloaded');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginOffice, logout, logoutUsers }}>
      {children}
    </AuthContext.Provider>
  );
};