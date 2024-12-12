import React, { useState, useContext, useEffect, useRef } from 'react';
import styled, { useTheme, keyframes } from "styled-components";

import { v } from "../../styles/Variables";

import { useAuth } from '../../Context';
import { FaUser, FaPowerOff, FaWhatsapp} from 'react-icons/fa';
import { BsFillBellFill, BsFillEnvelopeExclamationFill, BsFillGiftFill  } from "react-icons/bs";
import ToggleTheme from '../buttontheme';
import {  toast } from 'react-toastify';
import { useSocket } from '../../ContextSocketio';
import { useBalance } from '../../ContextBalance';


export function NavBarAgentAdmin() {
  const { user, login, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({ login: '', password: '' });
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

  if (!user || user.rol === "Jugador") {
    return null; 
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

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
  
  return (
    <NavContainer>
      <div className="nav-left">

      </div>
      <div className='nav-right'>
        {user.rol !== "Jugador" ? (
          <div className='rightcont'>

            <UserInfoButton>
            {/* <span className="balance">${balance} ARS</span> */}
            <span className="balance">
  ${new Intl.NumberFormat('es-AR').format(adminBalance)} ARS
</span>
            </UserInfoButton>


             <UserInfoButton>
            <span className="username"><FaUser className='onlynavbar'/>{user.login}</span>
            </UserInfoButton>
            
            <UserInfoButton>

            <button onClick={handleLogout} className="auth-button">
              <FaPowerOff className='onlynavbar'/>
            </button>
            </UserInfoButton>

            <div className="toggleButton" >
            <ToggleTheme className='onlynavbar'/>
            </div>

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
            ) : ( <>404</> )}
          </>
        )}
      </div>
    </NavContainer>
  );
};

//region Animaciones

const fadeInFromLeft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-100px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
`;
const slideDown = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;


//endregion

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 5px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  color: ${(props) => props.theme.text};


  .nav-left {
    display: flex;
    align-items: center;

  }

  .rightcont{
  width: 350px;
  display: flex;
  justify-content: flex-end;
  background-color: ${(props) => props.theme.body}; 
  padding: 0px 5px;
  gap: 15px;
  border-radius: 5px;
  
  border: 1px solid rgb(50, 50, 50);

 
  box-shadow: 
   
}

  .nav-right {
    display: flex;
    align-items: center;
    gap: 20px;

  .notification-button{
  background-color: ${(props) => props.theme.body}; 
  border: none;
  color: ${(props) => props.theme.navcoloriconnoti}; 
  font-size: ${(props) => props.theme.fontmd};
  padding: 8px;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;   
      &:hover {
    color: ${(props) => props.theme.navbuttonhover}; 
    transform: scale(1.1); 
  }
    }

    .onlynavbar{
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  animation: ${slideDown} 1.5s ease-out;
        &:hover {
        filter: none
    color: ${(props) => props.theme.navbuttonhover}; 
    transform: scale(1.1); 
  }
    }

    .username {
      font-size: ${(props) => props.theme.fontxs};
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
      color: ${(props) => props.theme.navtext};

    }

    .auth-button {
      background: ${(props) => props.theme.body};
      border: none;
      color: ${(props) => props.theme.navcoloriconnoti}; 
      cursor: pointer;
      font-size: ${(props) => props.theme.fontmd};
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 50px;
      transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.4s ease; 
      
    &:hover {
        color: ${(props) => props.theme.navbuttonhover};
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
 
  .toggleButton{
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  animation: ${slideDown} 1.5s ease-out;
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
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  animation: ${slideDown} 1.5s ease-out;

  &:hover {
    color: ${(props) => props.theme.navbuttoncolor};
    transform: scale(1.1); /* Escala el botón al 105% de su tamaño original */
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