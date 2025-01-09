import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { v } from "../../styles/Variables";
import blanco from '../../assets/logo-suerte-whitedorado.png';
import negro from '../../assets/logo-suerte-blackdorado.png';
import bgsuerte from '../../assets/bgsuerte.png';
import { useAuth } from '../../Context';
import { FaUser, FaPowerOff, FaWhatsapp} from 'react-icons/fa';
import { BsCashCoin, BsFillBellFill, BsFillEnvelopeExclamationFill, BsFillGiftFill  } from "react-icons/bs";
import ToggleTheme from '../buttontheme';
import { ThemeContext } from "../../App";

import { useNavigate } from 'react-router-dom';
import iconomayores from '../../assets/icon18.png';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function LoginHome() {
  const { setTheme, theme } = useContext(ThemeContext);
  const navigate = useNavigate(); // Hook para redirigir
  const CambiarTheme = () => {
    setTheme((theme) => (theme === "dark" ? "light" : "dark"));
  };

  const logoToUse = theme === "light" ? negro : blanco;


  const { user, login, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({ login: '', password: ''});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value});
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(loginData);
      setShowLoginForm(false);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(`Error al inciar sesión, ${error}`); 
    }
  };

  const handleLogout = () => {
    setLoginData({ login: '', password: '' })
    setShowLoginForm(true);
    logout();
    toast.info('Sesión cerrada exitosamente'); 
  };

  return (
    <NavContainer>

      <div className="nav-left">
        <div>
        {/* <span className="contacto">Contactanos</span>
        <a href="mailto:support@example.com" className="contact-icon"><BsFillEnvelopeExclamationFill className='contact-i'/></a>
        <a href="tel:+123456789" className="contact-icon"><FaWhatsapp className='contact-i' /></a> */}
        </div>
        <ToggleTheme />
      </div>

      <div className="nav-center">
      <Logo><img src={logoToUse}  alt="logo"/></Logo>

        </div>


      <div className='nav-right'>
        {user && user.rol !== "Jugador" ? (
          <div className='rightcont'>
                        
            <UserInfoButton>
            <span className="balance">${balance} ARS</span>
            </UserInfoButton>
            
            <UserInfoButton>
            <button className="deposito-button"><BsCashCoin />
              <span className='deposito-span'>&nbsp;&nbsp;DEPÓSITO</span>
            </button>
            </UserInfoButton>


            <UserInfoButton>
            <button className="notification-button"><BsFillBellFill /></button>
            </UserInfoButton>

            <UserInfoButton>
            <button className="notification-button"><BsFillGiftFill /></button>
            </UserInfoButton>

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
          <div className="loginOfficeForm">
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
          </div>
        )}
      </div>
      <MyDiv>
        <LogoMayores><img src={iconomayores}  alt="logo"/></LogoMayores>
        <span><strong>Sitio exclusivo</strong> para personas mayores de 18 años
        <br />
        Juga responsablemente</span>
      </MyDiv>
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  color: ${(props) => props.theme.text};
  min-height: 1080px;

  .nav-left {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    align-items: center;

    div{
    display: flex;
    flex-direction: row;
    align-items: center;
    }



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
    }

    .contacto {
      font-size: ${(props) => props.theme.fontxs};
      margin-right: 15px;
    }
    
  }

  .rightcont{
    width: 650px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    background-color: transparent;
    padding: 0px 10px;
    gap:15px;
    border-radius: 5px;


  }

  .nav-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

  .nav-right {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    form{
    display:flex;
    flex-direction: column;
    }




    .auth-button {
      background-image: url(${bgsuerte});
      background-size: cover;
      background-position: center;
      color: #000; 
      cursor: pointer;
      font-size: ${(props) => props.theme.fontlg};
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 50px;
    }

    .login-form {
      display: flex;
      align-items: center;
      margin: 50px;
      gap: 10px;

      input {
        width: 250px;
        padding: 5px;
        font-size: 16px;
        border: 1px solid ${(props) => props.theme.gray400};
        border-radius: 5px;
      }
      button {
      margin: 30px;
        font-size: ${(props) => props.theme.fontxs};
      }
    }
  }



  @media (max-width: 480px) {
    flex-direction: column;

    .nav-right .login-form {
      flex-direction: column;
      align-items: flex-start;
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
margin-top: 5%;
img{
width: 250px;
}

@media (max-width: 768px) {
margin-top: 10%;
    display: flex;
    justify-content: center;
    align-items: center; 
}

@media (max-width: 480px) {
margin-top: 10%;

    display: flex;
    justify-content: center;
    align-items: center; 
}


`;


const MyDiv = styled.div`
  display: flex;
  flex-direction: column;  
  justify-content: center;  
  align-items: center;  
  text-align: center;  
  margin-left: auto;
  margin-right: auto;
  width: 70%; 
`;

//region Logo
const LogoMayores = styled.div`
padding: 5px;
margin-top: 5%;
img{
width: 50px;
}

@media (max-width: 768px) {
margin-top: 10%;
    display: flex;
    justify-content: center;
    align-items: center; 
}

@media (max-width: 480px) {
margin-top: 10%;

    display: flex;
    justify-content: center;
    align-items: center; 
}


`;