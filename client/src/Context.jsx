import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosD from './axiosDefault';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from './components/LoadingScreen'


const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userToken = localStorage.getItem('talgibravi-istazo');
    const adminToken = localStorage.getItem('talgibravi-istazo-ceofis');
    let token = userToken || adminToken;

    if (token) {
      axiosD.post('/validateToken', { token })
        .then(response => {
          const { login, rol, balance, _id, usuariosCreados } = response.data;
          setUser({ login, rol, balance, _id, usuariosCreados });
        })
        .catch(error => {
          console.error('Error en la validación del token:', error);

          // Esperar antes de eliminar el token para evitar fallos por problemas de red
          setTimeout(() => {
            handleTokenExpiration();
          }, 3000);
        })
        .finally(() => {
          setIsLoading(false); // Marcar que la carga ha terminado
        });
    } else {
      setIsLoading(false);
    }

    // Verificación del token cada 20 minutos (1200000ms)
    const tokenCheckInterval = setInterval(() => {
      console.log("Verificando acceso en el servidor...");

      const userToken = localStorage.getItem('talgibravi-istazo');
      const adminToken = localStorage.getItem('talgibravi-istazo-ceofis');
      let token = userToken || adminToken;

      if (token) {
        axiosD.post('/validateToken', { token })
          .catch(error => {
            console.error('Token ha expirado:', error);
            handleTokenExpiration();
          });
      }
    }, 1200000);

    return () => clearInterval(tokenCheckInterval);

  }, []);

  const handleTokenExpiration = () => {
    const userToken = localStorage.getItem('talgibravi-istazo');
    const adminToken = localStorage.getItem('talgibravi-istazo-ceofis');

    if (adminToken) {
      localStorage.removeItem('talgibravi-istazo-ceofis');
    }
    if (userToken) {
      localStorage.removeItem('talgibravi-istazo');
    }

    if (user?.rol !== "Jugador") {
      logout();
      window.location.href = '/admin';
    } else {
      logoutUsers();
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  

  const login = async (loginData) => {
    try {
      const response = await axiosD.post('/login', loginData);
      const { token, login, rol, balance, _id } = response.data;
      localStorage.setItem('talgibravi-istazo', token);

      if (rol !== 'Jugador') {
      toast.error('Permisos insuficientes: este usuario pertenece al área de Admin.');

      // Redirigir a la página de Admin
      setTimeout(() => {
        window.location.href = '/admin'; // Redirección directa
      }, 2000);

      return; // Detener el flujo de la función
    }
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

      localStorage.setItem('talgibravi-istazo-ceofis', token);
      setUser({ login, rol, balance, _id, usuariosCreados, activo});

              // Función para manejar los cambios en el localStorage
              const handleStorageChange = (event) => {
                // Verificar si el cambio es en el token
                if (event.key === 'talgibravi-istazo-ceofis') {
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
    localStorage.removeItem('talgibravi-istazo-ceofis');
    setUser(null);
    window.location.href = '/admin';
  };

  const logoutUsers = () => {
    localStorage.removeItem('talgibravi-istazo');
    localStorage.removeItem('talgibravi-istazo-ceofis');
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