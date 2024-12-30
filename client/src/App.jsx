import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useNavigate} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AuthProvider, useAuth } from './Context';
import { Sidebar } from "./components/Sidebar";
import { SidebarResponsive } from "./components/SidebarResponsive";
import { Home } from "./pages/Home";
import { LoginOffice } from "./pages/LoginOffice";
import { MyRoutes } from "./routers/routes";
import { MyRoutesAgent } from "./routers/routesAgent";
import styled from "styled-components";
import { Light, Dark } from "./styles/Themes";
import { SocketProvider } from './ContextSocketio';
import { BalanceProvider } from './ContextBalance';
import { ThemeProviderButton } from './ContextTheme';
import { buttonStyle } from './styles/buttonStyle';
import { SidebarProvider, useSidebar } from './ContextSidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {LoginHome} from "./components/HomeComponents/LoginHome"

export const ThemeContext = React.createContext(null);

function App() {
  const [theme, setTheme] = useState("dark");
  const themeStyle = theme === "dark" ? Dark : Light;

  const { user, setUser, logout } = useAuth();
  const [arrowOpen, setArrowOpen] = useState(true);

  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [isResponsive, setIsResponsive] = useState(false);

    // useEffect para escuchar cambios en el tamaño de la pantalla
    useEffect(() => {
      const mediaQuery = window.matchMedia("(max-width: 480px)");
      // Definir la función que actualiza el estado de responsivo
      const handleResize = (e) => {
        setIsResponsive(e.matches);
      };
      // Agregar el listener de media query
      mediaQuery.addListener(handleResize);
      // Ejecutar la función una vez en el montaje del componente
      handleResize(mediaQuery);
      // Limpieza del listener en desmontaje
      return () => mediaQuery.removeListener(handleResize);
    }, []);


  const gridLayout = useMemo(() => {
    return user ? (user.rol === "Jugador" ? "auto 0px" : "60px auto") : "auto 0px";
  }, [user]);
  
  const gridLayoutResponse = useMemo(() => {
    return user ? (user.rol === "Jugador" ? null : "0px auto") : "auto 0px";
  }, [user]);
  
  const gridLayoutActive = useMemo(() => {
    return user ? (user.rol === "Jugador" ? "" : "200px auto") : "";
  }, [user]);
  
  const not = useMemo(() => {
    return !user ? "auto 0px" : "60px auto";
  }, [user]);
  

  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>
      <ThemeProvider theme={themeStyle}>
      <BalanceProvider>
      <SocketProvider>
        <BrowserRouter>
          <Container
            not={not}
            gridLayout={gridLayout}
            gridLayoutResponse={gridLayoutResponse}
            gridLayoutActive={gridLayoutActive}
            className={sidebarOpen ? "sidebarState active" : ""}
          >
            <Routes>
              {/* Ruta para Home */}
              <Route path="/" element={<LoginHome />} />
                {/* Ruta para LoginOffice */}
  {!user || (user.rol !== "Super" && user.rol !== "Admin" && user.rol !== "Agente" && user.rol !== "Jugador") ? (
    <Route path="/Admin" element={<LoginOffice />} />
  ) : null}

  {/* Rutas para el rol Jugador */}
  {user ? (
  user.rol === "Jugador" ? (
    <Route path="/home" element={<Home />} /> // Si el usuario tiene el rol "Jugador", muestra la ruta de /home
  ) : (
    <Route path="*" element={<LoginHome />} /> // Si el usuario no es "Jugador", redirige
  )
) : (
  <Route path="*" element={<LoginHome />} /> // Si no hay usuario (no está autenticado), muestra el componente HomeLogin
)}
  
              {/* Ruta para LoginOffice */}
              { !user || (user.rol !== "Super" && user.rol !== "Admin" && user.rol !== "Agente") ? (
                <Route path="/Admin" element={<LoginOffice />} />
              ) : null }
              {/* Rutas privadas basadas en el rol */}
              {user && (user.rol === "Super" || user.rol === "Admin" || user.rol === "Agente") ? (
                <>
                  <Route path="/*" element={
                    <>
                    {!isResponsive ? (
                      <Sidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        arrowOpen={arrowOpen}
                        setArrowOpen={setArrowOpen}
                        userRole={user.rol} 
                      />) :
                      (
                        <SidebarResponsive
                          sidebarOpen={sidebarOpen}
                          setSidebarOpen={setSidebarOpen}
                          arrowOpen={arrowOpen}
                          setArrowOpen={setArrowOpen}
                          userRole={user.rol} 
                        />)
                    }
                      {user.rol === "Super" || user.rol === "Admin" ? <MyRoutes /> : <MyRoutesAgent />}
                    </>
                  } />
                </>
              ) : null}
            </Routes>
          </Container>
        </BrowserRouter>
       </SocketProvider>
       </BalanceProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}



const Container = styled.div`
  display: grid;
  grid-template-columns: ${({ gridLayout, not }) => gridLayout || not};
  background: ${({ theme }) => theme.bgtotal};
  transition: all 0.3s;
  color: ${({ theme }) => theme.text};
  min-height: 100vh;  
  overflow-x: hidden;
  width: 100%;      

  &.active {
  grid-template-columns: ${({ gridLayoutActive }) => gridLayoutActive};
  }

  @media (max-width: 480px) {
    grid-template-columns: ${({ gridLayoutResponse }) => gridLayoutResponse};
  }

`;


const WrappedApp = () => (
  <ThemeProviderButton>
  <AuthProvider>
  <ToastContainer />
  <SidebarProvider>
    <App />
  </SidebarProvider>
  </AuthProvider>
  </ThemeProviderButton>
);

export default WrappedApp;