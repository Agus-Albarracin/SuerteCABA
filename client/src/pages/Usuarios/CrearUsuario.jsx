import styled, { keyframes } from "styled-components";
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBarAgentAdminResposive } from '../../components/HomeComponents/NavbarAgentAdminResponsive';
import axiosD from "../../axiosDefault";
import toast, { Toaster } from 'react-hot-toast';
import bar from "../../assets/1.jpg"
import wab from "../../assets/2.png"

import { ThemeContext } from "../../App";
import { useAuth } from '../../Context';


export function CrearUsuario() {

  const [isResponsive, setIsResponsive] = useState(false);

  const { setTheme, theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const bgsidebar = theme === "light" ? wab : bar;
  useEffect(() => {
    // Función que verifica el tamaño de la pantalla
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 768); 
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Limpia el listener al desmontar el componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  const [formData, setFormData] = useState({
    login: '',
    balance: "0.00",
    currency: 'ARS',
    nombre: '',
    apellido: '',
    password: '',
    confirmPassword: '', 
    email: '',
    rol: '',
    supervisor: user.login,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (isButtonDisabled) return; 
    setIsButtonDisabled(true); 

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/;
    const balanceRegex = /^\d+(\.\d{2})?$/;
    const nameRegex = /^[A-Za-z]+$/;

    const trimmedFormData = {
      ...formData,
      login: formData.login.trim(),
      nombre: capitalize(formData.nombre.trim()),
      apellido: capitalize(formData.apellido.trim()),
      password: formData.password.trim(),
      email: formData.email.trim(),
    };

    if (trimmedFormData.login === '') {
      toast.error('El campo Login no puede estar vacío.');
      setIsButtonDisabled(false);
      return;
    }

    if (!passwordRegex.test(trimmedFormData.password)) {
      toast.error('La contraseña debe tener al menos 6 caracteres, incluyendo letras y números.');
      setIsButtonDisabled(false);
      return;
    }

    if (trimmedFormData.password !== trimmedFormData.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      setIsButtonDisabled(false);
      return;
    }
    
    if (trimmedFormData.rol === '') {
      toast.error('El campo Rol es obligatorio.');
      setIsButtonDisabled(false);
      return;
    }

    try {
      const response = await axiosD.post('/createUser', trimmedFormData);

      const showToast = async () => {
        await toast.promise(
          Promise.resolve(response.data),
          {
            loading: 'Cargando...',
            success: 'Se creó el Usuario correctamente!',
            error: response.data.error,
          }
        );
      };

      await showToast();
      setTimeout(() => {
        navigate('/vistas');
      }, 1500);
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error(error.response?.data?.error || 'Error al crear usuario');
    }finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 2000);
    }
    
  };

  const handleCancel = () => {
    navigate('/vistas');
  }

  return (
   <>
  <Container bgImage={bgsidebar}>
{isResponsive ? <NavBarAgentAdminResposive /> : null}

      <div><Toaster/></div>
      <h2 className="usuarios-title">Crear Usuarios.</h2>
      <form onSubmit={handleSubmit} className="usuarios-form">
        <div className="form-group">
          <label htmlFor="login">Usuario</label>
          <input
            type="text"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className="form-control"
          />
        </div>

<div className="form-group">
  <label htmlFor="rol">Rol</label>
  <select
    id="rol"
    name="rol"
    value={formData.rol}
    onChange={handleChange}
    className="form-control"
  >
    <option value="">Seleccione un rol</option>
    {user?.rol === 'Agente' ? (
      <option value="Jugador">Jugador</option>
    ) : (
      <>
        <option value="Admin">Admin</option>
        <option value="Agente">Agente</option>
        <option value="Jugador">Jugador</option>
      </>
    )}
  </select>
</div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-buttons">
          <button type="button" className="usuarios-cancel" onClick={handleCancel}>Cancelar</button>
          <button type="submit" className="usuarios-submit">Crear usuario</button>
        </div>

      </form>
    </Container>
    </> 
  );
}

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

const sliderLeft = keyframes`
  0% {
    transform: translateX(50%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const Container = styled.div`
  color: ${(props) => props.theme.text};
  background: url(${(props) => props.bgImage}) no-repeat center center;
  background-size: cover; 
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 1080px;


  .usuarios-title {
    margin-top: 5%;
    font-size: 17px;
    margin-bottom: 25px;
    animation: ${sliderLeft} 1s ease-out;

  }

  .usuarios-form {
    width: 100%;
    max-width: 450px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;

    .form-group {
    animation: ${slideDown} 1s ease-out;


      label {
        display: block;
        margin-bottom: 1px;
        font-weight: bold;
        font-size: 16px;
        animation: ${slideDown} 0.5s ease-out;

      }

      .form-control {
        width: 100%;
        padding: 5px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        transition: border-color 0.3s ease;
        animation: ${slideDown} 0.8s ease-out;


        &:focus {
          outline: none;
          border-color: ${(props) => props.theme.primary};
        }
      }
    }

  
  .form-buttons{
    grid-column: span 2;
    display: flex;
    justify-content: space-between;
        animation: ${slideDown} 0.7s ease-out;

  }

  .usuarios-submit,
  .usuarios-cancel {
    flex: 1;
    max-width: 48%;
    background-color: ${(props) => props.theme.primary};
    text-align: center;
    color: #fff;
    border: none;
    padding: 8px 0px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
      background-color: ${(props) => props.theme.primaryDark};
      transform: scale(0.9);
    }
  }

  .usuarios-cancel {
    background-color: ${(props) => props.theme.gray500};

    &:hover {
      background-color: ${(props) => props.theme.primaryDark};
    }
  }

@media (max-width: 768px) {
width: 79%;
margin-left: 0%;
margin-right: 11%;
  
  .usuarios-title {
    margin-top: 5%;
    font-size: 17px;
    margin-bottom: 25px;
  }

      .usuarios-form {
      grid-template-columns: 1fr !important;
      }



      .form-group {
      animation: ${slideDown} 1s ease-out;

      label {
        display: block;
        margin-bottom: 1px;
        font-weight: bold;
        font-size: 12px;
        animation: ${slideDown} 0.5s ease-out;
      }

      .form-control {
        width: 100%;
        padding: 5px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        transition: border-color 0.3s ease;
        animation: ${slideDown} 0.8s ease-out;

        &:focus {
          outline: none;
          border-color: ${(props) => props.theme.primary};
        }
      }
    }
  }


`;
