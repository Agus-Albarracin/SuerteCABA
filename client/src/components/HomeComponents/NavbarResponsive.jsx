import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { v } from "../../styles/Variables";
import blanco from '../../assets/logo-suerte-whitedorado.png';
import negro from '../../assets/logo-suerte-black.png';
import home1 from "../../assets/home1.png";
import home2 from "../../assets/home2.png";
import { useAuth } from '../../Context';
import { FaUser, FaPowerOff, FaWhatsapp } from 'react-icons/fa';
import { BsCashCoin, BsFillBellFill, BsFillEnvelopeExclamationFill, BsFillGiftFill } from "react-icons/bs";
import ToggleTheme from '../buttontheme';
import { ThemeContext } from "../../App";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalsNotificacionR, ModalsGiftsR } from '../ModalsNotificacionResponsive'
import axiosD from "../../axiosDefault"
import { useSocket } from '../../ContextSocketio';
import { useBalance } from '../../ContextBalance';


export function NavBarResponsive() {
  const { setTheme, theme } = useContext(ThemeContext);
  const { socket } = useSocket();
  const { balance, setBalance } = useBalance();


  const CambiarTheme = () => {
    setTheme((theme) => (theme === "dark" ? "light" : "dark"));
  };

  const logoToUse = theme === "light" ? negro : blanco;
  const bgHome = theme === "light" ? home2 : home1;

  const { user, login, logoutUsers } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({ login: '', password: '' });

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [notificationsGift, setNotificationsGift] = useState([]);
  const [notificationCountGift, setNotificationCountGift] = useState(0);
  const [showNotificationModalGift, setShowNotificationModalGift] = useState(false);
  const [balancePrev, setBalancePrev] = useState(0)

  useEffect(() =>{
    console.log("Estoy aca")
    if (user?.balance) {
      console.log("Se ejecuta setBalance")
      setBalance(user.balance);
    }


  },[user])

  useEffect(() => {

    if (user && balancePrev !== balance){
      fetchNotifications('gift');
      fetchNotifications('user');
    }
    console.log("Estoy en Socket")

    if (socket) {
      // Escucha el evento de actualización de balance
      setBalancePrev(balance)
      socket.on('balanceUpdated', (data) => {
      console.log(data)
        // Verificar si la actualización es para el usuario actual
        if (data.login === user?.login) {
      console.log("Se ejecuta setBalance desde el socket")
      console.log("Se muestra el balance antes de setearlo", data.balance)
          setBalance(data.balance);
          console.log("Se muestra el balance despues de setearlo", data.balance)
      

        }

      });
    }

    if (socket) {
      // Escucha el evento de notificación de usuario
      console.log("Escuchando el evento de getNotification")
      socket.on('getNotification', (data) => {
        console.log("muestra data", data.notification)
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
        socket.off('getNotification');
        socket.off('getNotificationGift');
        socket.off('balanceUpdated');
      };
    }
  }, [ socket,  setBalance, balance, notifications, notificationsGift]);


  const fetchNotifications = async (type) => {
    try {
      const response = await axiosD.get('/getnotifications', {
        headers: { 'user-login': user.login }
      });
      
      console.log("Se muestra la respuesta de las llamadas a las notificaciones", response.data)
  
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
      setNotificationCount(0);
      await markNotificationsAsRead('user');
    }
  };

  const toggleNotificationModalGift = async () => {
    setShowNotificationModalGift(!showNotificationModalGift);
    if (!showNotificationModalGift) {
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

  return (
    <NavContainer>
      <div className="nav-total">
        <div className='nav-logo'>
          <Logo><img src={logoToUse} width={170} alt="logo" /></Logo>
        </div>
        <div className="nav-contacto">
          {/* <a href="mailto:support@example.com" className="contact-icon"><BsFillEnvelopeExclamationFill className='contact-i' /></a> */}
          {/* <a href="tel:+123456789" className="contact-icon"><FaWhatsapp className='contact-i' /></a> */}
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
                {/* <span className="balance">${user.balance} ARS</span> */}
                <span className="balance">
  ${new Intl.NumberFormat('es-AR').format(balance)} ARS
</span>
              </UserInfoButton>
            </div>
          </div>
          <div className='fixed-bar'>
            {/* <UserInfoButton>
              <button className="deposito-button"><BsCashCoin />
                <span className='deposito-span'>&nbsp;&nbsp;DEPÓSITO</span>
              </button>
            </UserInfoButton> */}
            <UserInfoButton>
              <button className="notification-button" onClick={toggleNotificationModal}><BsFillBellFill />
              {notificationCount > 0 && <NotificationBadge>{notificationCount}</NotificationBadge>}
              </button>

            </UserInfoButton>
            <UserInfoButton>
              <button className="notification-button" onClick={toggleNotificationModalGift}><BsFillGiftFill />
              {notificationCountGift > 0 && <NotificationBadge>{notificationCountGift}</NotificationBadge>}
              </button>
            </UserInfoButton>
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
                  {showNotificationModal && (
        <ModalsNotificacionR
          notifications={notifications} 
          onClose={toggleNotificationModal}
        />
      )}
                  {showNotificationModalGift && (
        <ModalsGiftsR
          notificationsGift={notificationsGift} 
          onClose={toggleNotificationModalGift}
        />
      )}
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
top: 0px;
right: -5px;
z-index: 9999;
`;

const NavContainer = styled.nav`
  background-color: ${(props) => props.theme.navbarbgcolor2};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 1% 0px 1%;
  color: ${(props) => props.theme.text};
  min-width: 430px;

  .nav-total {
    display: flex;
    margin: 1%;
    flex-direction: row;
    align-items: center;
    width: 99%;
  }

  .nav-logo {
    flex: 1;
  }

  .nav-contacto {
    display: flex;
    flex: 1;
    margin-top: 2%;
    margin-left:5%;

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
    padding-bottom: 60px; /* espacio para la barra fija */
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

  }

  .login-form {
    display: flex;
    height: 40px;
    gap: 10px;
    margin-bottom: 1%;
    width: 100%;

    input {
    width: 30%;
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

    }
  }

  .user-info {
    display: flex;
    justify-content: space-between;
    width: 90%;
    padding: 10px;
  }

  .username {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  @media (max-width: 926px) {
  .user-info {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    width: 99%;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 99%;
    }

    .nav-logo {
      margin-bottom: 10px;
      flex: 0;
    }

    .nav-contacto {
      margin-bottom: 10px;
    }

    .nav-right {
      width: 99%;
      padding-bottom: 10px;
    }
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
      width: 93%;

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

@media (max-width: 429px) {
      .user-info {
    display: flex;
    justify-content: space-between;
    width:99%;
    padding: 10px;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 99%;
    }

        .login-form {
    input {
    width: 35%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

        button {
      width: 24%;
      font-size: 10px;

    }

    }
}

@media (max-width: 420px) {
      .user-info {
    display: flex;
    justify-content: space-between;
    width:99%;
    padding: 10px;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 99%;
    }

        .login-form {
    input {
    width: 33%;
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
    width: 93%;
    padding: 10px;
  }

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 95%;
    }

    .login-form {
    input {
    width: 30%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
  }


@media (max-width: 376px) {
    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 90%;
    }

      .user-info {
    display: flex;
    justify-content: space-between;
    width: 90%;
    padding: 10px;
  }

    .login-form {
    input {
    width: 29%;
      padding: 5px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
  }

@media (max-width: 361px) {
    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 86%;
    }
  .user-info {
    display: flex;
    justify-content: space-between;
    width: 85%;
    padding: 10px;
  }

    .login-form {
    input {
    width: 27%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid ${(props) => props.theme.inputborder};
    }

    }
  }

  @media (max-width: 321px) {
  padding: 0px 1% 0px 0%;

    .nav-total {
      align-items: flex-start;
      justify-content: space-between;
      width: 78%;
    }
  .user-info {
    display: flex;
    justify-content: space-between;
    width: 85%;
    padding: 10px;
  }

    .login-form {
    gap: 6px;
    input {
    width: 24%;
      padding: 3px;
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
  position: relative;
`;