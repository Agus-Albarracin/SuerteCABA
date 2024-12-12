import styled, { keyframes } from "styled-components";
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBarAgentAdminResposive } from '../../components/HomeComponents/NavbarAgentAdminResponsive';
import axiosD from "../../axiosDefault";
import toast, { Toaster } from 'react-hot-toast';
import bar from "../../assets/1.png";
import wab from "../../assets/2.png";
import { ThemeContext } from "../../App";
import { useAuth } from '../../Context';

export function CrearUsuarioModal({ isOpen, onClose }) {
  const [isResponsive, setIsResponsive] = useState(false);
  const { setTheme, theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const bgsidebar = theme === "light" ? wab : bar;

  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 768); 
    };

    window.addEventListener("resize", handleResize);
    handleResize();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
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
      return;
    }

    if (!passwordRegex.test(trimmedFormData.password)) {
      toast.error('La contraseña debe tener al menos 6 caracteres, incluyendo letras y números.');
      return;
    }

    if (trimmedFormData.password !== trimmedFormData.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    
    if (trimmedFormData.rol === '') {
      toast.error('El campo Rol es obligatorio.');
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
    }
    
  };


  return (
    <ModalContainer isOpen={isOpen}>
      <ModalContent>
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
          <button type="button" className="usuarios-cancel" onClick={onClose}>Cancelar</button>
          <button type="submit" className="usuarios-submit">Crear usuario</button>
        </div>

      </form>
      </ModalContent>
    </ModalContainer>
  );
}


const slideDown = keyframes`
  0% {
    transform: translateY(-30px);
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

const ModalContainer = styled.div`
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000; // Asegúrate de que el modal esté por encima de otros elementos
`;



const ModalContent = styled.div`
  background: #f1f1f1;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 300px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  animation: ${slideDown} 0.3s ease-out;

 .usuarios-title {
    margin-top: 5%;
    font-size: 17px;
    margin-bottom: 20px;
    animation: ${sliderLeft} 1s ease-out;
    color: red;
  }

  label {
    display: block;
    margin-bottom: 1px;
    font-weight: bold;
    font-size: 16px;
    animation: ${slideDown} 0.5s ease-out;
    color: #000;

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


  .form-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    animation: ${slideDown} 0.7s ease-out;

  }

  .usuarios-submit,
  .usuarios-cancel {
    background-color: ${(props) => props.theme.primary};
    color: #fff;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    &:hover {
      background-color: ${(props) => props.theme.primaryDark};
      transform: scale(0.9);
    }
  }

`;



