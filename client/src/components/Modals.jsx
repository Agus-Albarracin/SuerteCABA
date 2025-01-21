import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import styled, { useTheme, keyframes } from "styled-components";
import { v } from "../styles/Variables";
import { AiOutlineClose  } from "react-icons/ai";
import axiosD from '../axiosDefault';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

export function DepositModal({ isOpen, onClose, user, adminData, onSuccess, resetA}) {

  const [amount, setAmount] = useState(0);
  const [bonus, setBonus] = useState('');
  const [isBonus, setIsBonus] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount(0); // Resetear el monto cuando el modal se cierra
    }
  }, [isOpen]);

  useEffect(() => {

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Evita el envío automático del formulario
        handleDeposit();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, amount]);

  



  const setAmountAction = (newAmount) => {
    setAmount(prevAmount => prevAmount + newAmount); // Suma el nuevo monto
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Asegúrate de que el valor ingresado sea un número
    setAmount(value === '' ? '' : parseFloat(value));
  };



  const handleDeposit = async () => {
    const parsedAmount = parseFloat(amount);
    const parsedBonus = parseFloat(bonus) || 0;
  
    // Rehabilitar el botón después de 2 segundos
    setButtonDisabled(true);
  
  
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Monto inválido.");
      return;
    }
  
    if (isBonus && (parsedBonus < 0 || isNaN(parsedBonus))) {
      toast.error("El porcentaje de bonificación no puede ser negativo.");
      return;
    }
  
    try {
      // Enviar el depósito inmediatamente
      const depositResponse = await axiosD.post('/deposit', {
        adminId: adminData._id,
        userId: user._id,
        amount: parsedAmount,
        bonus: isBonus ? parsedBonus : 0,
        supervisor: adminData._id,
      });
      
      onClose(); // Cierra el modal aquí
      toast.success(`Se ha realizado un depósito desde ${adminData.login} de $${parsedAmount} en la cuenta ${user.login}.`);
      setButtonDisabled(false);
  
      // Cerrar el modal inmediatamente después de enviar el depósito
  
      // Preparar las solicitudes adicionales para que se ejecuten en segundo plano
      const notifyPromise = axiosD.post('/sendnotifies', {
        login: user.login,
        title: 'Depósito exitoso',
        amount: parsedAmount,
        message: user.rol === 'Jugador'
          ? `Se ha realizado un depósito de $${parsedAmount} en tu cuenta.`
          : `Se ha realizado un depósito desde ${adminData.login} de $${parsedAmount} en la cuenta ${user.login}.`,
        type: 'user',
      });
  
      const addFinPromise = axiosD.post('/addFin', {
        fecha: new Date(),
        monto: parsedAmount,
        tipo: 'deposito',
        supervisor: adminData._id,
        rol: user.rol,
      });
  
      // Ejecutar las promesas en segundo plano
      Promise.all([notifyPromise, addFinPromise]).catch(error => {
        console.error('Error al enviar notificaciones o agregar a finanzas', error);
      });
  
      setTimeout(onClose, 1000); // Si quieres mantener esta línea, asegúrate de que `onClose` no se llame nuevamente innecesariamente.
  
    } catch (error) {
      
      console.error('Error al realizar el depósito', error);
      toast.error("Error al realizar el depósito!");
  
      // También cerrar el modal en caso de error, si eso es lo que deseas
      onClose();
    }
  };


  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
      shouldCloseOnOverlayClick={true}
    >
      <div className='conth3yX'>
        <h3>Deposita Saldo</h3>
        <AiOutlineClose className='buttonX' onClick={resetA} />
      </div>
      <Divider />
      <InfoContainer>
        <div className='infouno'>
          <p>{adminData.rol} :</p>
          <p className='plogin'>{adminData.login}</p>
          {/* <p>${parseFloat(adminData.balance).toFixed(2)}</p> */}
          <p>${adminData.balance ? new Intl.NumberFormat('es-AR').format(parseFloat(adminData.balance).toFixed(2)) : '0.00'}</p>

        </div>
      </InfoContainer>
      <InfoContainer>
        <div className='infodos'>
          <p>{user.rol} :</p>
          <p className='plogin'> {user.login}</p>
          {/* <p>$ {parseFloat(user.balance).toFixed(2)}</p> */}
          <p>${user.balance ? new Intl.NumberFormat('es-AR').format(parseFloat(user.balance).toFixed(2)) : '0.00'}</p>
        </div>
      </InfoContainer>
      <div>
        <span>Monto</span>
        <input
          type="number"
          value={amount === 0 ? "" : amount}
          onChange={handleInputChange}
          placeholder="Monto a depositar"
          className='inputmonto'
        />
      </div>

      <div className='contbuttons'>
      <button className="button-monto" onClick={() => setAmountAction(1000)}>$1.000</button>
        <button className="button-monto" onClick={() => setAmountAction(5000)}>$5.000</button>
        <button className="button-monto" onClick={() => setAmountAction(10000)}>$10.000</button>
        <button className="button-monto" onClick={() => setAmountAction(50000)}>$50.000</button>
        <button className="button-monto" onClick={() => setAmount(0)}>Limpiar</button>
      </div>
      {adminData.rol === "Super" && ( 
      <div className='contboni'>
        <div className="contbutton-sino">
        <span>Es bonificado?</span>
        <div className="contbutton-sino">
          <button
            className={`button-sino ${isBonus ? 'active' : ''}`}
            onClick={() => setIsBonus(true)}
          >
            SI
          </button>
          <button
            className={`button-sino ${!isBonus ? 'active' : ''}`}
            onClick={() => setIsBonus(false)}
          >
            NO
          </button>
        </div>
        </div>
        <div>
        <span>Bonificación (%)</span>
        {isBonus && (
          <input
            type="number"
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
            placeholder="Porcentaje de bonificación"
            className='inputmonto'
          />
        )}
      </div>
      </div>
      )}
      <div className="actionbutton">
      <button className="deposit-button" onClick={handleDeposit} disabled={isButtonDisabled}>Depositar</button>
      <button className="cancel-button" onClick={resetA}>Cancelar</button>
      </div>
    </StyledModal>
  );
}


//region WITHDRAWMODAL
export function WithdrawModal({ isOpen, onClose, user, adminData, onSucces, resetA }) {
  const [amount, setAmount] = useState(0);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount(0); // Resetear el monto cuando el modal se cierra
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Evita el envío automático del formulario
        handleWithdraw();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, amount]);

  const setAmountAction = (newAmount) => {
    setAmount(prevAmount => prevAmount + newAmount); // Suma el nuevo monto
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Asegúrate de que el valor ingresado sea un número
    setAmount(value === '' ? 0 : parseFloat(value));
  };

  const handleWithdraw = async () => {
    const parsedAmount = parseFloat(amount);

    setButtonDisabled(true);


    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Monto inválido.");
      return;
    }

    try {
      // Enviar el retiro inmediatamente
      const withdrawResponse = await axiosD.post('/retiro', {
        adminId: adminData._id,
        userId: user._id,
        amount: parsedAmount,
        supervisor: adminData._id,
      });
      onClose(); // Cierra el modal aquí


      toast.success(`Se ha realizado un retiro desde ${adminData.login} de $${parsedAmount} en la cuenta ${user.login}.`);
      setButtonDisabled(false);
      
      // Cerrar el modal inmediatamente después de enviar el retiro

      // Preparar las solicitudes adicionales para que se ejecuten en segundo plano
      const notifyPromise = axiosD.post('/sendnotifies', {
        login: user.login,
        title: 'Retiro exitoso',
        message: user.rol === 'Jugador'
          ? `Se ha realizado un retiro de $${parsedAmount} en tu cuenta.`
          : `Se ha realizado un retiro desde ${adminData.login} de $${parsedAmount} en la cuenta ${user.login}.`,
        type: 'user',
      });

      const addFinPromise = axiosD.post('/addFin', {
        fecha: new Date(),
        monto: parsedAmount,
        tipo: 'retiro',
        supervisor: adminData._id,
        rol: user.rol,
      });

      // Ejecutar las promesas en segundo plano
      Promise.all([notifyPromise, addFinPromise]).catch(error => {
        console.error('Error al enviar notificaciones o agregar a finanzas', error);
      });

    } catch (error) {
      console.error('Error al realizar el retiro', error);
      toast.error("Error al realizar el retiro!");

      // También cerrar el modal en caso de error, si eso es lo que deseas
      onClose();
    }
  };


  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
      shouldCloseOnOverlayClick={true}
    >
      <div className='conth3yX'>
        <h3>Extraer Saldo</h3>
        <AiOutlineClose className='buttonX' onClick={resetA} />
      </div>
      <Divider />
      <InfoContainer>
        <div className='infouno'>
          <p>{adminData.rol} :</p>
          <p className='plogin'>{adminData.login}</p>
          {/* <p>${parseFloat(adminData.balance).toFixed(2)}</p> */}
          <p>${adminData.balance ? new Intl.NumberFormat('es-AR').format(parseFloat(adminData.balance).toFixed(2)) : '0.00'}</p>

        </div>
      </InfoContainer>
      <InfoContainer>
        <div className='infodos'>
          <p>{user.rol} :</p>
          <p className='plogin'>{user.login}</p>
          {/* <p>${parseFloat(user.balance).toFixed(2)}</p> */}
          <p>${user.balance ? new Intl.NumberFormat('es-AR').format(parseFloat(user.balance).toFixed(2)) : '0.00'}</p>

        </div>
      </InfoContainer>
      <div>
        <span>Monto</span>
        <input
          type="number"
          value={amount === 0 ? "" : amount}
          onChange={handleInputChange} 
          placeholder="Monto a extraer"
          className='inputmonto'
        />
      </div>
      <div className='contbuttons'>
      <button className="button-monto" onClick={() => setAmountAction(1000)}>$1.000</button>
        <button className="button-monto" onClick={() => setAmountAction(5000)}>$5.000</button>
        <button className="button-monto" onClick={() => setAmountAction(10000)}>$10.000</button>
        <button className="button-monto" onClick={() => setAmountAction(50000)}>$50.000</button>
        <button className="button-monto" onClick={() => setAmount(0)}>Limpiar</button>
        
      </div>
      <div className="actionbutton">

      <button className="deposit-button" onClick={handleWithdraw} disabled={isButtonDisabled}>Extraer</button>
      <button className="cancel-button" onClick={resetA}>Cancelar</button>
      </div>
    </StyledModal>
  );
}

  //#region MODAL STYLES

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

    
  const StyledModal = styled(Modal)`
    &.modal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: ${props => props.theme.body};
      color: ${props => props.theme.text};
      padding: 20px;
      border: 1px solid ${props => props.theme.bg5};
      width: 550px;
      max-width: 90%;
      border-radius: 8px;
      box-shadow: 0 0 15px #b38600;
      
      h3{
      text-shadow: 12px 12px 12px rgba(0, 0, 0);
      
      }

      h2 {
        margin-bottom: 5px;
        font-size: ${props => props.theme.fontxs};
      }

      p {
        margin-bottom: 10px;
        font-size: ${props => props.theme.fontxs};
      }
      
      span{
        font-size: ${props => props.theme.fontxs};
      }

      input {
        width: calc(100% - 20px);
        padding: 5px;
        margin-bottom: 10px;
        font-size: ${props => props.theme.fontxs};
        border: 1px solid ${props => props.theme.gray500};
        border-radius: 4px;
      }


      .inputmonto{
      background-color: ${props => props.theme.bgAlpha};
      color: ${props => props.theme.text};
      box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
      transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
      animation: ${slideDown} 0.5s ease-out;

      }

      .contboni {
      padding: 10px;
      margin-bottom: 50px; 
      font-size: ${props => props.theme.fontmd};
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        margin-right: 10px;
      }
    }

    .contbutton-sino {
      display: flex;
      align-items: center;
    }

    .button-sino {
      border: 1px solid #b38600;
      background-color: transparent;
      transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
      animation: ${slideDown} 0.5s ease-out;
      box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
      color: ${props => props.theme.textprimary};
      padding: 4px 20px;
      font-size: ${props => props.theme.fontxs};
      flex: 1;
      text-align: center;
      border-radius: 4px;
      margin: 0; 
      &:not(:last-child) {
        border-right: none; 
      }
      &:first-child {
        border-radius: 4px 0 0 4px;
      }
      &:last-child {
        border-radius: 0 4px 4px 0;
      }
      &:hover {
        background-color: ${props => props.theme.bg4};
      }
      
      &.active {
        background-color: ${props => props.theme.primary};
        color: ${props => props.theme.textsecondary};
      }
    }
  }
      .conth3yX{
      display: flex;
      justify-content: space-between;
      }

      .buttonX{
      font-size: ${props => props.theme.fontxl};
      color: ${props => props.theme.bg4};
      cursor: pointer;
      border-radius: 50%;
      padding: 5px;
      transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
      border: 0px solid rgb(50, 50, 50);
      animation: ${slideDown} 0.5s ease-out;
      box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
          &:hover {
    transform: scale(0.9);
    box-shadow: none;
  }
      }

      .contbuttons{
      padding: 10px;
      margin-bottom: 30px;    
      }


      .button-monto{
      border: 1px solid #b38600;
      background-color: transparent;
      transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
      animation: ${slideDown} 0.5s ease-out;
      box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
      font-size: ${props => props.theme.fontxs};
      color: ${props => props.theme.textprimary};
      &:hover{
      background-color: ${props => props.theme.bg4};
      }

      }
  

      button {
        font-size: ${props => props.theme.fontxs};
        margin-right: 10px;
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
}
        
.actionbutton{
  display: flex;
  justify-content: flex-end;
        .deposit-button {
        transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
        border: 0px solid rgb(50, 50, 50);
        animation: ${slideDown} 0.5s ease-out;
        box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

        background-color: ${props => props.theme.primary};
        color: ${props => props.theme.textsecondary};
        &:hover{
                margin-right: 12px;
                transform: scale(0.9);
                box-shadow: none;
                }
        }

        .cancel-button {
        transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
        border: 0px solid rgb(50, 50, 50);
        animation: ${slideDown} 0.5s ease-out;
        box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
        background-color: ${props => props.theme.gray700};
        color: ${props => props.theme.textsecondary};

        &:hover{
                transform: scale(0.9);
                box-shadow: none;
                }
        }

      }
}   

  &.modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 1000;
    }
  
    @media (max-width: 480px) {
      position: absolute;
      top: 1%;
      background-color: ${props => props.theme.body};
      color: ${props => props.theme.text};
      padding: 20px;
      border: 1px solid ${props => props.theme.bg5};
      width: 200px;
      max-width: 90%;
      border-radius: 8px;
  }
  `;

  const InfoContainer = styled.div`
  font-size: ${props => props.theme.fontmd};
  margin-bottom: 20px;
  border-radius: 10px;
  transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
  border: 1px solid rgb(50, 50, 50);
  animation: ${slideDown} 0.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  .infouno, .infodos {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    h2, h4, p {
      margin: 0;
      padding: 7px 7px;
    }
  }
  .plogin{
  background-color: #b38600;
  color: white;
  }
  

`;
const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.bg3};
  margin: ${v.lgSpacing} 0;
`;
//#endregion