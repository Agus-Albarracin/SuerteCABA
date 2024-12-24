import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { v } from "../../styles/Variables";
import blanco from '../../assets/logo-suerte-white.png';
import negro from '../../assets/logo-suerte-black.png';
import home1 from "../../assets/home1.png";
import home2 from "../../assets/home2.png";
import { useNavigate } from 'react-router-dom';
import axiosD from "../../axiosDefault";
import { useAuth } from '../../Context';
import { FaUser, FaPowerOff, FaWhatsapp } from 'react-icons/fa';
import { BsCashCoin, BsFillBellFill, BsFillEnvelopeExclamationFill, BsFillGiftFill } from "react-icons/bs";
import ToggleTheme from '../buttontheme';
import { ThemeContext } from "../../App";
import { ModalsNotificacion, ModalsGifts } from '../ModalsNotificacion';
import { useSocket } from '../../ContextSocketio';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function NavBar() {
  const { setTheme, theme } = useContext(ThemeContext);
  const { socket } = useSocket();
  const { user, login, logoutUsers } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationsGift, setNotificationsGift] = useState([]);
  const [notificationCountGift, setNotificationCountGift] = useState(0);
  const [showNotificationModalGift, setShowNotificationModalGift] = useState(false);
  const [balance, setBalance] = useState(user ? user.balance : 0);

  
  useEffect(() => {
    
    if (user) {
      setBalance(user.balance);
    }
    
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

      // Escucha el evento de actualización de balance
      socket.on('balanceUpdated', (data) => {
        console.log('Balance update received');
        if (data.login === user?.login) {
          setBalance(Number(data.balance));
        }
      });

      return () => {
        socket.off('markNotification');
        socket.off('getNotification');
        socket.off('getNotificationGift');
        socket.off('balanceUpdated');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(loginData).then(() => {
      toast.success('Inicio de sesión exitoso');
      setShowLoginForm(false);
    }).catch((error) => {
      console.error('Login failed:', error);
      toast.error(`Error al iniciar sesión, ${error}`);
    });
  };

  const handleLogout = () => {
    setLoginData({ login: '', password: '' });
    setShowLoginForm(true);
    logoutUsers();
    toast.info('Sesión cerrada exitosamente');
  };

  const logoToUse = theme === "light" ? negro : blanco;
  const bgHome = theme === "light" ? home2 : home1;

  return (
    <NavContainer>
      <div className="nav-center">
      <Logo><img src={logoToUse} width={170} alt="logo"/></Logo>
      <div className="nav-left">
        {/* <span className="contacto">Contactanos</span> */}
        {/* <a href="mailto:support@example.com" className="contact-icon"><BsFillEnvelopeExclamationFill className='contact-i'/></a> */}
        {/* <a href="tel:+123456789" className="contact-icon"><FaWhatsapp className='contact-i' /></a> */}
        <div className="toggleButton" >
        <ToggleTheme />
        </div>
      </div>
        </div>

      <div className='nav-right'>
        {user ? (
          <div className='rightcont'>

            <UserInfoButton>
            {/* <span className="balance">${balance} ARS</span> */}
            <span className="balance">
  ${new Intl.NumberFormat('es-AR').format(balance)} ARS
</span>
            </UserInfoButton>
            {/* <UserInfoButton>

            <button className="deposito-button"><BsCashCoin />
              <span className='deposito-span'>&nbsp;&nbsp;DEPÓSITO</span>
            </button>
            </UserInfoButton> */}

            <UserNotifyButton>
              <button className="notification-button" onClick={toggleNotificationModal}>
                <BsFillBellFill />
                {notificationCount > 0 && <NotificationBadge>{notificationCount}</NotificationBadge>}

              </button>

            </UserNotifyButton>
            {showNotificationModal && (
        <ModalsNotificacion 
          notifications={notifications} 
          onClose={toggleNotificationModal}
        />
      )}

            <UserNotifyButton>
            <button className="notification-button" onClick={toggleNotificationModalGift}><BsFillGiftFill />
            {notificationCountGift > 0 && <NotificationBadge>{notificationCountGift}</NotificationBadge>}

      </button>
            </UserNotifyButton>
            {showNotificationModalGift && (
        <ModalsGifts 
          notificationsGift={notificationsGift} 
          onClose={toggleNotificationModalGift}
        />
      )}

             <UserInfoButton>
            <span className="username"><FaUser/>{user.login}</span>
            </UserInfoButton>
            <UserInfoButton>

            <button onClick={handleLogout} className="auth-button">
              <FaPowerOff />
            </button>
            </UserInfoButton>


          </div>
          
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
            ) : ( <>LOS PERMISOS NO CORRESPONDEN EN ESTA SESIÓN</> )}
          </>
        )}
      </div>



    </NavContainer>
  );
};

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


const NavContainer = styled.nav`
  background-color:${(props) => props.theme.navbarbgcolor2};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 50px 0px 25px; 
  color: ${(props) => props.theme.text};
  position: relative;


  .nav-left {
    display: flex;
    align-items: center;
    justify-content: center;

    .contact-icon {
      color: ${(props) => props.theme.navcolorcontact}; 
      margin-right: 15px;
      font-size: 20px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 17px;
      transition: background-color 0.3s ease, transform 0.3s ease, color 0.4s ease; /* Añadido transform a la transición */
    
    &:hover {
      background-color: ${(props) => props.theme.navbuttonhover};
      color: ${(props) => props.theme.navcolorhover}; /* Fondo de los botones en hover */
      border-radius: 25px;
      transform: scale(1.2); /* Escala el icono al 110% de su tamaño original */
    }
    }

    .contacto {
      font-size: ${(props) => props.theme.fontxs};
      margin-right: 15px;
    }
    
  }

  .rightcont{
    background-color: ${(props) => props.theme.navbarbgcolor2};
    width: 650px;
    display: flex;
    justify-content: end;
    padding: 0px 10px;
    gap:15px;
    border-radius: 5px;     
  }

  .nav-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 50px;
}

  .nav-right {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 20px;

  .notification-button{
  background-color: transparent; 
  border: none;
  color: ${(props) => props.theme.navcoloriconnoti}; 
  font-size: ${(props) => props.theme.fontlg};
  padding: 12px;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.4s ease; 
  
  &:hover {
    color: ${(props) => props.theme.navbuttonhover}; 
  }
    }

.deposito-button {
  background-color: ${(props) => props.theme.navbuttonhover}; 
  border: none;
  color: ${(props) => props.theme.navbutton}; 
  font-size: 12px;
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden; 
  transition: color 0.3s ease, box-shadow 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.navbuttonhover}; 
    color: ${(props) => props.theme.navcolorhover}; 
    box-shadow: 0 0 20px red;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 100%;
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.navhovertrans}; 
    transition: left 0.5s ease; 
    z-index: 0;
  }

  &:hover:before {
    left: 0;
  }
}

    .username {
      font-size: ${(props) => props.theme.fontmd};
      display: flex;
      align-items: center;
      gap: 5px;
      color: ${(props) => props.theme.navtext};
    }

    .balance {
      display: flex;
      align-items: center;
      font-size: ${(props) => props.theme.fontxs};
      gap: 5px;
      color: ${(props) => props.theme.navtext}
    }

    .auth-button {
      background: transparent;
      border: none;
      color: ${(props) => props.theme.navcoloriconnoti}; 
      cursor: pointer;
      font-size: ${(props) => props.theme.fontlg};
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 50px;
      transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.4s ease; 
      
    &:hover {
        box-shadow: 0 0 10px ${(props) => props.theme.boxshadow};
        transform: scale(1.1);
      }
    }

    .login-form {
      display: flex;
      align-items: center;
      gap: 10px;

      input {
        padding: 5px;
        font-size: ${(props) => props.theme.fontxs};
        border: 1px solid ${(props) => props.theme.gray400};
        border-radius: 5px;
      }
      button {
        font-size: ${(props) => props.theme.fontxs};
      }
    }
  }


  @media (max-width: 970px) {
  display: contents;
}
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;

    .nav-right .login-form {
      display: grid;
      grid-template-columns: 30% 30% 30%;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 20px;
      gap: 10px;
    }

  }
`;

const UserInfoButton = styled.div`
  color: ${(props) => props.theme.navcolor};
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.5s ease, transform 0.3s ease; 
  font-size: ${(props) => props.theme.fontsm};

  &:hover {
    color: ${(props) => props.theme.navbuttoncolor};
    transform: scale(1.15);
  }

  .balance {
    margin: 0;
  }

  .username {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

//region Logo
const Logo = styled.div`
padding: 5px;
margin-top: 3px;
font-size: ${(props) => props.theme.fontxs};
`;