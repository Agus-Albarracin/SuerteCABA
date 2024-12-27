import React, { useState, useContext, useEffect } from 'react';
import styled, { useTheme, keyframes } from "styled-components";

import { v } from "../../styles/Variables";

import { useAuth } from '../../Context';
import { ThemeContext } from "../../App";
import blanco from '../../assets/logo-suerte-whitedorado.png';
import negro from '../../assets/logo-suerte-blackdorado.png';

import { MdMenu } from "react-icons/md";
import { AiOutlineClose  } from "react-icons/ai";
import axiosD from "../../axiosDefault";

import { FaUser, FaPowerOff, FaWhatsapp} from 'react-icons/fa';
import { BsFillBellFill,  BsFillGiftFill,  } from "react-icons/bs";
import ToggleTheme from '../buttontheme';
import { useSidebar } from '../../ContextSidebar';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../ContextSocketio';
import { useBalance } from '../../ContextBalance';

import { ModalsNotificacionR, ModalsGiftsR } from '../ModalsNotificacionResponsive';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  MdOutlineRequestQuote, MdGroup } from "react-icons/md";


export function NavBarAgentAdminResposive() {


  const { user, login, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const { setTheme, theme } = useContext(ThemeContext);
  const [responsiveMode, setResponsiveMode] = useState(window.innerWidth <= 768);
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationsGift, setNotificationsGift] = useState([]);
  const [notificationCountGift, setNotificationCountGift] = useState(0);
  const [showNotificationModalGift, setShowNotificationModalGift] = useState(false);


  const { socket } = useSocket();
  const { adminBalance, setAdminBalance } = useBalance();

    useEffect(() => {
      if (user && !adminBalance) {
        setAdminBalance(user.balance);
      }

      if (socket) {
        // Escucha el evento de actualización de balance
        socket.on('balanceUpdatedAdmin', (data) => {
    
          // Verificar si la actualización es para el usuario actual
          if (data.login === user?.login) {
            setAdminBalance(data.balance); 
          }
        });

    
        return () => {
          socket.off('balanceUpdatedAdmin');
        };
      }
    }, [socket, user, setAdminBalance, adminBalance]);



  useEffect(() => { 
    
    if (socket) {

      socket.on('markNotification', (data) => {
        console.log("notificación");
    });

   
      // Escucha el evento de notificación de usuario
      socket.on('getNotification', (data) => {
        console.log('User Notification received');
        setNotifications(prevNotifications => {
          const updatedNotifications = [...data.notifications, ...prevNotifications]
            .sort((a, b) => b.date - a.date);

          const newNotifications = updatedNotifications.filter(notification => !notification.seen);
          setNotificationCount(newNotifications.length);

          return updatedNotifications;
        });
      });

      // Escucha el evento de notificación de regalos
      socket.on('getNotificationGift', (data) => {
        setNotificationsGift(prevNotifications => {
          const updatedNotifications = [...data.notifications, ...prevNotifications]
            .sort((a, b) => b.date - a.date);

          const newGifts = updatedNotifications.filter(notification => !notification.seen);
          setNotificationCountGift(newGifts.length);

          return updatedNotifications;
        });
      });

      return () => {
        socket.off('markNotification');
        socket.off('getNotification');
        socket.off('getNotificationGift');
      };
    }
  }, [socket, user]);

  useEffect(() => {
    if (user) {
      fetchNotifications('user');
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchNotifications('gift');
    }
  }, [user]);

  const fetchNotifications = async (type) => {
    try {
      const response = await axiosD.get('/getnotifications', {
        headers: { 'user-login': user.login }
      });
  
  
      const notifications = type === 'user' ? response.data.userNotifications : response.data.giftNotifications;
  
      if (!notifications || !Array.isArray(notifications)) {
        throw new Error('Notifications is not an array');
      }
  
      const filteredNotifications = notifications.filter(notification => notification.type === type);
  
      if (type === 'user') {
        setNotifications(filteredNotifications);
        const newNotifications = filteredNotifications.filter(notification => !notification.seen);
        setNotificationCount(newNotifications.length);
      } else if (type === 'gift') {
        setNotificationsGift(filteredNotifications);
        const newGifts = filteredNotifications.filter(notification => !notification.seen);
        setNotificationCountGift(newGifts.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error al obtener las notificaciones.');
    }
  };

  const toggleNotificationModal = async () => {
    setShowNotificationModal(!showNotificationModal);
  
    if (!showNotificationModal) {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        seen: true,
      }));
  
      setNotifications(updatedNotifications);
      setNotificationCount(0);
  
      await markNotificationsAsRead('user');
    }
  };

  const toggleNotificationModalGift = async () => {
    setShowNotificationModalGift(!showNotificationModalGift);
  
    if (!showNotificationModalGift) {
      const updatedNotificationsGift = notificationsGift.map(notification => ({
        ...notification,
        seen: true,
      }));
  
      setNotificationsGift(updatedNotificationsGift);
      setNotificationCountGift(0);
  
      await markNotificationsAsRead('gift');
    }
  };


  const markNotificationsAsRead = async (type) => {
    try {
      await axiosD.post('/marknotificationsasread', { type }, {
        headers: {
          'user-login': user.login
        }
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Error al marcar las notificaciones como leídas.');
    }
  };


  if (!user || user.rol === "Jugador") {
    return null;
  }
  

  const handleSubmit = (e) => {
    e.preventDefault();
    login(loginData).then(() => {
      setShowLoginForm(false);
    }).catch((error) => {
      console.error('Login failed:', error);
    });
  };

  const handleLogout = () => {
    setLoginData({ login: '', password: '' });
    logout();
    toast.info('Sesión cerrada exitosamente');
  };
  

const CambiarTheme = () => {
  setTheme((theme) => (theme === "dark" ? "light" : "dark"));
};
const logoToUse = theme === "light" ? negro : blanco;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleNavigateToVistas = () => {
    navigate('/vistas');
  };

  const handleNavigateToFin = () => {
    navigate('/finanzas');
  };



  return (
    <NavContainer isOpen={sidebarOpen}>
      <div className="nav-total">
        <div className='nav-logo'>
          <Logo><img src={logoToUse} width={170} alt="logo" /></Logo>
        </div>
        <div className="nav-contacto">
          {/* <a href="mailto:support@example.com" className="contact-icon"><BsFillEnvelopeExclamationFill className='contact-i' /></a>
          <a href="tel:+123456789" className="contact-icon"><FaWhatsapp className='contact-i' /></a> */}
        </div>
        <ToggleTheme />
      </div>

      {user ? (
        <>
          <div className='nav-right'>
            <div className='user-info'>

              <UserInfoButton>
                <span className="username"><FaUser />{user.login}</span>
              </UserInfoButton>
              <UserInfoButton>
                {/* <span className="balance">${balance} ARS</span> */}
                <span className="balance">
  ${new Intl.NumberFormat('es-AR').format(adminBalance)} ARS
</span>
              </UserInfoButton>
            </div>
          </div>
          <div className='fixed-bar'>
          <UserInfoButton>
              {responsiveMode && (
               <ResponsiveMenuButton onClick={handleSidebarToggle}>
        {sidebarOpen && responsiveMode ? <AiOutlineClose /> : <MdMenu />}

               </ResponsiveMenuButton>)}

          </UserInfoButton>

        {user.rol === "Super" ? (
          <>

              <UserInfoButtonSuper  >
                <button className="notification-button-super" onClick={handleNavigateToVistas}><MdGroup /></button>
              </UserInfoButtonSuper>
              <UserInfoButtonSuper>
                <button className="notification-button-super"  onClick={handleNavigateToFin}><MdOutlineRequestQuote /></button>
              </UserInfoButtonSuper>
          </>
        ) : 
        (
<>
  <UserNotifyButton>
    <button className="notification-button" onClick={toggleNotificationModal}>
      <BsFillBellFill />
      {notificationCount > 0 && <NotificationBadge>{notificationCount}</NotificationBadge>}
    </button>
  </UserNotifyButton>

  {showNotificationModal && (
    <DivContNotify>
      <ModalContent>
        <ModalsNotificacionR 
          notifications={notifications} 
          onClose={toggleNotificationModal}
        />
      </ModalContent>
    </DivContNotify>
  )}

  <UserNotifyButton>
    <button className="notification-button">
      <BsFillGiftFill />
      {notificationCountGift > 0 && <NotificationBadge>{notificationCountGift}</NotificationBadge>}
    </button>
  </UserNotifyButton>

  {showNotificationModalGift && (
    <DivContNotify>
      <ModalContent>
        <ModalsGiftsR 
          notificationsGift={notificationsGift} 
          onClose={toggleNotificationModalGift}
        />
      </ModalContent>
    </DivContNotify>
  )}
</>
        )
        }

 

            <UserInfoButton>
              <button onClick={handleLogout} className="auth-button">
                <FaPowerOff />
              </button>
            </UserInfoButton>
          </div>
        </>
      ) : (
        <>
          {showLoginForm ? (
            <form onSubmit={handleSubmit} className="login-form">
              <input
                type="text"
                name="login"
                value={loginData.login}
                onChange={handleChange}
                placeholder="Usuario"
                required
              />
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                required
              />
              <button type="submit" className="auth-button">Iniciar sesión</button>
            </form>
          ) : (<p>LOS PERMISOS NO CORRESPONDEN EN ESTA SESIÓN</p>)}
        </>
      )}
    </NavContainer>
  );
};

const DivContNotify = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 0%;
  display: flex;
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /* Centra verticalmente */
  z-index: 1000; /* Asegura que el modal esté sobre el resto del contenido */
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
`;

const ModalContent = styled.div`
  position: relative;
  padding: 20px;
  border-radius: 8px;
  z-index: 1100; /* Asegura que el contenido del modal esté por encima */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const NotificationBadge = styled.div`
  background: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  position: absolute;
  top: 10px;
  right: 0px;
  z-index: 999;
`;

const NavContainer = styled.nav`
  background-color: ${(props) => props.theme.navbarbgcolor2};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 1% 0px 1%;
  color: ${(props) => props.theme.text};
  min-width: 430px;


  @media (max-width: 768px) {
  padding: 0px 1% 0px 2%;

}
  .nav-total {
    display: flex;
    margin: 1%;
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .nav-logo {
    flex: 1;
  }

  .nav-contacto {
    display: flex;
    flex: 1;
    margin-top: 2%;
    margin-left:5%;
    padding-right: 13%;

    align-items: center;
    justify-content: flex-start;

    .contact-icon {
      color: ${(props) => props.theme.navcolorcontact};
      font-size: 1.2rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 2rem;
      height: 2rem;
      border-radius: 17px;
      transition: background-color 0.3s ease, transform 0.3s ease, color 0.4s ease;

      &:hover {
        background-color: ${(props) => props.theme.navbuttonhover};
        color: ${(props) => props.theme.navcolorhover};
        border-radius: 25px;
        transform: scale(1.2);
      }
    }

    .contacto {
      font-size: ${(props) => props.theme.fontxs};
      margin-right: 15px;
    }
  }

  .nav-right {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-bottom: 20px; 
  }

  .fixed-bar {
    display: flex;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${(props) => props.theme.navbarbgcolor2};
    border-top: 1px solid ${(props) => props.theme.navbordercolor};
    padding: 10px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    z-index: 10;
    display: flex;
    justify-content: space-around;
    gap: 10px;

    button {
      background-color: transparent; 
      border: none;
      color: ${(props) => props.theme.navcoloriconnoti};
      font-size: ${(props) => props.theme.fontlg};
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.4s ease;

      &:hover {
        color: ${(props) => props.theme.navbuttonhover}; 
        box-shadow: 0 0 10px ${(props) => props.theme.boxshadow};
        transform: scale(1.1); 
      }
    }

    .deposito-button {
      background-color: ${(props) => props.theme.navbuttonhover}; 
      color: ${(props) => props.theme.navbutton}; 
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      transition: color 0.3s ease, box-shadow 0.3s;

      &:hover {
        background-color: ${(props) => props.theme.navbuttonhover}; 
        color: ${(props) => props.theme.navcolorhover}; 
        box-shadow: 0 0 20px red;
      }
    }
  }

  .notification-button, .auth-button {
    background-color: transparent; 
    border: none;
    color: ${(props) => props.theme.navcoloriconnoti};
    font-size: ${(props) => props.theme.fontlg};
    padding: 12px;
    border-radius: 100px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: ${(props) => props.theme.navbuttonhover}; 
      color: ${(props) => props.theme.navcolorhover};
    }
  }

  .login-form {
    display: flex;
    height: 40px;
    gap: 10px;
    margin-bottom: 1%;
    width: 100%;

    input {
    width: 35%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    button {
      width: 24%;
      font-size: 12px;
      background-color: ${(props) => props.theme.buttonbg};
      color: ${(props) => props.theme.buttontext};
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.buttontext};
      cursor: pointer;
      transition: background-color 0.3s ease;
      text-align: center;
      display: inline-block;

      &:hover {
        background-color: ${(props) => props.theme.buttonhover};
      }
    }
  }

  .user-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 10px;
  }

  .username {
    display: flex;
    align-items: center;
    gap: 5px;
  }
      @media (max-width: 480px) {
    .user-info {
    display: flex;
    justify-content: space-between;
    padding: 10px;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
    }

    .nav-logo {
      margin-bottom: 10px;
    }

    .nav-contacto {
      margin-bottom: 10px;
    }

    .nav-right {
      padding-bottom: 10px;
    }
  }

@media (max-width: 428px) {
      .user-info {
    display: flex;
    justify-content: space-between;
    width:90%;
    padding: 10px;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 92%;
    }

        .login-form {
    input {
    width: 28%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
}

@media (max-width: 420px) {
      .user-info {
    display: flex;
    justify-content: space-between;
    width:86%;
    padding: 10px;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 88%;
    }

        .login-form {
    input {
    width: 28%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
}


@media (max-width: 391px) {

  .user-info {
    display: flex;
    justify-content: space-between;
    width: 82%;
    padding: 10px;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 84%;
    }

    .login-form {
    input {
    width: 26%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
  }


@media (max-width: 375px) {
    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 80%;
    }

      .user-info {
    display: flex;
    justify-content: space-between;
    width: 78%;
    padding: 10px;
  }

    .login-form {
    input {
    width: 23%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
  }

@media (max-width: 361px) {
    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 78%;
    }
  .user-info {
    display: flex;
    justify-content: space-between;
    width: 75%;
    padding: 10px;
  }

    .login-form {
    input {
    width: 23%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
  }
`;

const Logo = styled.div`
  display: flex;
  justify-content: center;
`;

const UserInfoButton = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const UserNotifyButton = styled.div`
  color: ${(props) => props.theme.navcolor};
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.5s ease, transform 0.3s ease; /* Añadido transform para la transición */
  font-size: ${(props) => props.theme.fontsm};
  position: relative; /* Asegúrate de que este contenedor sea relativo */
`;

const ResponsiveMenuButton = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) => props.theme.bgtgderecha};
  box-shadow: 0 0 4px ${(props) => props.theme.boxshadow};
  transform: ${({ isOpen }) => (isOpen ? `initial` : `rotate(180deg)`)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    font-size: 24px;
    color: ${(props) => props.theme.text};
  }

  @media (max-width: 480px) {
    display: flex; 
  }
`;


//region Stlyed Super

const UserInfoButtonSuper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .notification-button-super{
  svg{
  margin-top: 6px;
  font-size: 1.70rem
  }
  }
`;