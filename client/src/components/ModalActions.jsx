import React, { useState } from 'react';
import Modal from 'react-modal';
import styled, { keyframes} from 'styled-components';
import { v } from "../styles/Variables";

import { AiOutlineClose, AiOutlineEdit, AiOutlineHistory, AiOutlineInfoCircle, AiOutlineUser, AiOutlineDelete } from 'react-icons/ai';
import { MdKey, MdManageAccounts, MdOutlineVisibility, MdOutlineVisibilityOff, MdExpandMore, MdFaceRetouchingOff, MdFace6  } from 'react-icons/md';
import axiosD from '../axiosDefault';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../Context';



export function ActionsModal({ isOpen, onClose, user: currentUser, onSuccess }) {
  const { user } = useAuth();
  const [activeAction, setActiveAction] = useState(null);
  const [formData, setFormData] = useState({
    nombre: currentUser.nombre || '',
    apellido: currentUser.apellido || '',
    login: currentUser.login || '',
    email: currentUser.email || '',
    confirmPassword: '',
    newPassword: '',
    rol: currentUser.rol || '',
    activo: currentUser.activo,
  });


  const [showButtons, setShowButtons] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fade, setFade] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatus, setShowConfirmStatus] = useState(false);
  const [status, setStatus] = useState(1)

  const confirmStatus = async () => {
    try {
      await axiosD.post('/statusUser', { userId: currentUser._id, status });
      toast.success(`Usuario ${status === 1 ? 'activado' : 'desactivado'} exitosamente`);
      onSuccess();
      setShowConfirmStatus(false);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
      console.error('Error al cambiar estado del usuario:', error);
      setShowConfirmStatus(false);
    }
  };

  // Función para manejar la activación
  const handleActivate = () => {
    setStatus(1); // Establecer el estado a 1 para activar
    setShowConfirmStatus(true); // Mostrar el modal de confirmación
  };

  // Función para manejar la desactivación
  const handleDeactivate = () => {
    setStatus(0); // Establecer el estado a 0 para desactivar
    setShowConfirmStatus(true); // Mostrar el modal de confirmación
  };

  const confirmDelete = async () => {
    try {
      await axiosD.post('/deleteUser', { id: currentUser._id });
      toast.success('Usuario eliminado exitosamente');
      onSuccess();
      setShowConfirmDelete(false);
      setShowButtons(false);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      toast.error('Error eliminando el usuario');
      console.error('Error al eliminar el usuario:', error);
      showConfirmDelete(false);
      setShowButtons(false);
    }
  };

  const handleInputChange = (e) => {
    
    const { name, value } = e.target;

    // Actualiza el estado
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleInputChangePass = (e) => {
    const { name, value } = e.target;
  
    console.group(`Cambio en el campo: ${name}`);
    console.groupEnd();
  
    // Actualiza el estado
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  

  const handleActionClick = (action) => {
    if (activeAction === action) {
      setFade(false);
      setTimeout(() => setActiveAction(null), 200);
    } else {

      if (fade) {
        setFade(false);setTimeout(() => { setActiveAction(action) ; setFade(true); }, 200);
      } else { setActiveAction(action); setFade(true); }
    }
  };

  const handleCancel = () => {
      setActiveAction(null);
      setShowButtons(false);
  };

  const handleOnClose = () => {
    onClose();
    setFade(false)
    setActiveAction(null);
    setShowButtons(false);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      switch (activeAction) {
        case 'edit':
          await axiosD.post('/editUser', {
            id: currentUser._id,
            nombre: formData.nombre,
            apellido: formData.apellido,
            login: formData.login,
            email: formData.email
          });
          toast.success('Usuario editado exitosamente');
          onSuccess();
          setShowButtons(false);
          break;
        case 'changePassword':
          if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            setShowButtons(false);
            return;
          }
          await axiosD.post('/changePassword', {
            id: currentUser._id,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword 
          });
          toast.success('Contraseña cambiada exitosamente');
          onSuccess();
          setShowButtons(false);
          break;
        case 'changePermission':
          await axiosD.post('/changePermission', {
            id: currentUser._id,
            rol: formData.rol
          });


          toast.success('Permisos cambiados exitosamente');
          onSuccess();
          setShowButtons(false);
          break;
        case 'deleteUser':
          await axiosD.post('/deleteUser', { id: currentUser._id });
          toast.success('Usuario eliminado exitosamente');
          onSuccess();
          setShowButtons(false);
          break;
        default:
          break;
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      toast.error('Error en el envío del formulario');
      console.error('Error en el envío del formulario:', error);
      setShowButtons(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setShowButtons(e.target.checked);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getDecimalValue = (decimalObject) => {
    return decimalObject && decimalObject.$numberDecimal ? parseFloat(decimalObject.$numberDecimal) : null;
  };

  const [selectedIndex, setSelectedIndex] = useState(null);

  const toggleDetails = (index) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const renderMovements = () => {
  
    const allMovements = [
      ...currentUser.movimientos.map(m => ({
        tipo: m.type,
        fecha: m.date,
        monto: m.monto,
        usuarioResponsable: m.nameResponsable,
        usuarioReceptor: m.nameReceptor,
        balanceAntes: getDecimalValue(m.balanceAntes),
        balanceDespues: getDecimalValue(m.balanceDespues),
        detalle: null 
      })),
      ...currentUser.session ? [
        {
          tipo: currentUser.session.loginTime ? 'inicio de sesión' : 'fin de sesión',
          fecha: currentUser.session.loginTime || currentUser.session.logoutTime,
          monto: null,
          usuarioResponsable: null,
          usuarioReceptor: null,
          balanceAntes: null,
          balanceDespues: null,
          detalle: {
            label: 'Duración de la sesión',
            value: `${currentUser.session.duration ? (currentUser.session.duration / 1000) : 'N/A'} segundos`
          }
        }
      ] : [],
      ...currentUser.changes.map(change => ({
        tipo: 'cambio de datos',
        fecha: change.date,
        monto: null,
        usuarioResponsable: null,
        usuarioReceptor: null,
        balanceAntes: null,
        balanceDespues: null,
        detalle: {
          campo: `Cambios en: ${change.field}`,
          oldValue: `Valor Anterior: ${change.oldValue}`,
          newValue: `Nuevo Valor: ${change.newValue}`
        }
      })),
      ...currentUser.passwordChanges.map(pwChange => ({
        tipo: 'cambio de contraseña',
        fecha: pwChange.date,
        monto: null,
        usuarioResponsable: null,
        usuarioReceptor: null,
        balanceAntes: null,
        balanceDespues: null,
        detalle: {
          label: 'Contraseña Anterior',
          value: pwChange.oldPassword
        }
      }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) 
      .slice(0, 5); 
    
    if (allMovements.length === 0) {
      return <p>No hay movimientos recientes.</p>;  
    }



//region BOXMOV


    return (
      <BoxMov>
              {allMovements.map((movimiento, index) => (
        <DivMov key={index} className="movement-item">
          <div className="movement-header">
          <div>
            <p><strong>Fecha y Hora:</strong> {new Date(movimiento.fecha).toLocaleString()}</p>
            <p><strong>Tipo:</strong> {movimiento.tipo}</p>
          </div>
          </div>
          <Divider />
          <div className='movement-header-div-button'>
            <button className={`movement-header-button buttonMovement ${selectedIndex === index ? 'rotate' : ''}`}
             onClick={() => toggleDetails(index)}>
              
           {selectedIndex === index ?<AiOutlineClose />  :<MdExpandMore />  }
        </button>
            </div>
          {selectedIndex === index && (
          <div className="movement-details">
            {movimiento.tipo === 'deposito' || movimiento.tipo === 'retiro' ? (
              <div className="details">
                <div className="details-item">
                  <div className="details-label"><strong>Monto de {movimiento.tipo}:</strong></div>
                  <div className="details-value">${movimiento.monto}</div>
                </div>
                <div className="details-item">
                  <div className="details-label"><strong>Saldo Antes:</strong></div>
                  <div className="details-value">${movimiento.balanceAntes}</div>
                </div>
                <div className="details-item">
                  <div className="details-label"><strong>Saldo Después:</strong></div>
                  <div className="details-value">${movimiento.balanceDespues}</div>
                </div>
                <div className="details-item">
                  <div className="details-label"><strong>Responsable:</strong></div>
                  <div className="details-value">{movimiento.usuarioResponsable}</div>
                </div>
                <div className="details-item">
                  <div className="details-label"><strong>Usuario:</strong></div>
                  <div className="details-value">{movimiento.usuarioReceptor}</div>
                </div>
              </div>
            ) : (
              <div className="details">
                                {movimiento.detalle && Object.entries(movimiento.detalle).map(([key, value], idx) => (
                                  
                  <div key={idx} className="details-item">
                    <div className="details-value">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </DivMov>
      ))}
      </BoxMov>
    );
  };



//region MODAL
  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={handleOnClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="header">
        <span><AiOutlineUser className="iconuser" /> {currentUser.login}</span>
        <AiOutlineClose className="close-button" onClick={handleOnClose} />
      </div>
      <Divider />

      <div className="icon-list">
        <div className="icon-item" onClick={() => handleActionClick('edit')}>
           <div className="icon-span-div">
          <AiOutlineEdit className="icon" />
          <span className="icon-label">Editar</span>

          </div>
          <div className='icon-div-rotate'>
          <MdExpandMore className={`expand-icon ${activeAction === 'edit' ? 'rotate' : ''}`}  />
          </div>
        </div>
        {activeAction === 'edit' && (
          <Box isVisible={activeAction === 'edit'} fade={fade}>
            <form onSubmit={handleSubmit}>
              {/* <label>
                Nombre:
                <Input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Apellido:
                <Input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                />
              </label> */}
              <label>
                Login:
                <Input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleInputChange}
                />
              </label>
              {/* <label>
                Email:
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </label> */}
              <label>
                <input
                  type="checkbox"
                  onChange={handleCheckboxChange}
                />
                Quiero realizar estos cambios
              </label>
              {showButtons && (
                <>
                  <Button type="submit">Guardar</Button>
                  <Button type="button" onClick={handleCancel}>Cancelar</Button>
                </>
              )}
            </form>
          </Box>
        )}

        <div className="icon-item" onClick={() => handleActionClick('changePassword')}>
           <div className="icon-span-div">
          <MdKey className="icon" />
          <span className="icon-label">Cambiar Clave</span>

          </div>
          <div className='icon-div-rotate'>
          <MdExpandMore className={`expand-icon ${activeAction === 'changePassword' ? 'rotate' : ''}`} />

          </div>
        </div>
        {activeAction === 'changePassword' && (
          <Box isVisible={activeAction === 'changePassword'} fade={fade}>
            <form onSubmit={handleSubmit}>
              <label>
                Nueva Contraseña:
                <div className='divShow'>
                <Input
                  type={showPassword ? 'text' : 'password'} // Toggle visibility
                  name="newPassword"
                  value={formData.newPassword || ''}
                  onChange={handleInputChangePass}
                />
                  {showPassword ? <MdOutlineVisibilityOff className='buttonShow' onClick={togglePasswordVisibility} /> : <MdOutlineVisibility className='buttonShow' onClick={togglePasswordVisibility} />}
                </div>

              </label>
              <label>
                Confirmar Contraseña:
                <div className='divShow'>

                <Input
                  type={showPassword ? 'text' : 'password'} // Toggle visibility
                  name="confirmPassword"
                  value={formData.confirmPassword || ''}
                  onChange={handleInputChangePass}
                />
                  {showPassword ? <MdOutlineVisibilityOff className='buttonShow' onClick={togglePasswordVisibility} /> : <MdOutlineVisibility className='buttonShow' onClick={togglePasswordVisibility} />}
                  </div>

              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={handleCheckboxChange}
                />
                Quiero realizar estos cambios
              </label>
              {showButtons && (
                <>
                  <Button type="submit">Guardar</Button>
                  <Button type="button" onClick={handleCancel}>Cancelar</Button>
                </>
              )}
            </form>
          </Box>
        )}

{user?.rol !== 'Agente' && (
  <div className="icon-item" onClick={() => handleActionClick('changePermission')}>
    <div className="icon-span-div">
      <MdManageAccounts className="icon" />
      <span className="icon-label">Cambiar Permiso</span>
    </div>
    <div className="icon-div-rotate">
      <MdExpandMore className={`expand-icon ${activeAction === 'changePermission' ? 'rotate' : ''}`} />
    </div>
  </div>
)}

        {activeAction === 'changePermission' && (
          <Box isVisible={activeAction === 'changePermission'} fade={fade}>
            <form onSubmit={handleSubmit}>
              <label>
                Rol:
                <Select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                >
                  <option value="Admin">Admin</option>
                  <option value="Agente">Agente</option>
                  <option value="Jugador">Jugador</option>
                </Select>
              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={handleCheckboxChange}
                />
                Quiero realizar estos cambios
              </label>
              {showButtons && (
                <>
                  <Button type="submit">Guardar</Button>
                  <Button type="button" onClick={handleCancel}>Cancelar</Button>
                </>
              )}
            </form>
          </Box>
        )}

        {/* <div className="icon-item" onClick={() => handleActionClick('recentMovements')}>
           <div className="icon-span-div">
          <AiOutlineHistory className="icon" />
          <span className="icon-label">Movimientos Recientes</span>

          </div>
          <div className='icon-div-rotate'>
          <MdExpandMore className={`expand-icon ${activeAction === 'recentMovements' ? 'rotate' : ''}`} />

          </div>
        </div>
        {activeAction === 'recentMovements' && (
          <Box isVisible={activeAction === 'recentMovements'} fade={fade}>
            {renderMovements()}
            </Box>
        )} */}

        <div className="icon-item" onClick={() => handleActionClick('info')}>
           <div className="icon-span-div">
          <AiOutlineInfoCircle className="icon" />
          <span className="icon-label">Información</span>

          </div>
          <div className='icon-div-rotate'>
          <MdExpandMore className={`expand-icon ${activeAction === 'info' ? 'rotate' : ''}`} />

          </div>
        </div>
        {activeAction === 'info' && (
          <Box isVisible={activeAction === 'info'} fade={fade}>
            <InfoSection>
  <p><strong>ID:</strong> {currentUser._id}</p>
  {/* <p><strong>Nombre:</strong> {currentUser.nombre}</p> */}
  {/* <p><strong>Apellido:</strong> {currentUser.apellido}</p> */}
  <p><strong>Login:</strong> {currentUser.login}</p>
  {/* <p><strong>Email:</strong> {currentUser.email}</p> */}
  <p><strong>Rol:</strong> {currentUser.rol}</p>
  <p><strong>Saldo: $</strong> {getDecimalValue(currentUser.balance)}</p>
  </InfoSection>
          </Box>
        )}
  {user.rol === "Super" && (
  <div className="icon-item" onClick={() => setShowConfirmDelete(true)}>
    <div className="icon-span-div">
      <AiOutlineDelete className="icon" />
      <span className="icon-label">Eliminar Usuario</span>
    </div>
  </div>
)}

{showConfirmDelete && (
  <div className="confirm-delete-modal">
    <p>¿Estás seguro de que quieres eliminar este usuario?</p>
    <div className="modal-buttons">
      <Button onClick={confirmDelete}>Confirmar</Button>
      <Button onClick={() => setShowConfirmDelete(false)}>Cancelar</Button>
    </div>
  </div>
)}

{ user.rol === "Super" && currentUser.activo ===  1 ? (
        (
          <div className="icon-item" onClick={handleDeactivate}>
            <div className="icon-span-div">
              <MdFaceRetouchingOff className="icon" />
              <span className="icon-label">Desactivar Usuario</span>
            </div>
          </div>
        )
      ) : (
        currentUser.activo === 0 && (
          <div className="icon-item" onClick={handleActivate}>
            <div className="icon-span-div">
              <MdFace6 className="icon" />
              <span className="icon-label">Activar Usuario</span>
            </div>
          </div>
        )
      )}


        {showConfirmStatus && (
          <div className="confirm-delete-modal">
            <p>¿Estás seguro de que quieres {status === 1 ? 'activar' : 'desactivar'} este usuario?</p>
            <div className="modal-buttons">
              <Button onClick={confirmStatus}>Confirmar</Button>
              <Button onClick={() => setShowConfirmStatus(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>



    </StyledModal>
  );
}

  //#region MODAL STYLES

 //region Animaciones
 const fadeIn = keyframes`
 from {
   opacity: 0;
   transform: translateY(20px);
 }
 to {
   opacity: 1;
   transform: translateY(0);
 }
`;

const fadeOut = keyframes`
 from {
   opacity: 1;
   transform: translateY(0);
 }
 to {
   opacity: 0;
   transform: translateY(20px);
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

const sliderLeft = keyframes`
0% {
  transform: translateX(50%);
  opacity: 0;
}
70% {
  transform: translateX(0);
  opacity: 1;
}
`;

  const StyledModal = styled(Modal)`
  &.modal {
    position: absolute; /* Cambiado de absolute a fixed */
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${props => props.theme.body};
    color: ${props => props.theme.text};
    padding: 20px;
    border: 1px solid ${props => props.theme.bg5};
    width: 600px;
    max-width: 90%;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.7); /* Ajuste del color de la sombra */
    max-height: 80vh; /* Añadido para permitir scroll en el contenido del modal */
    overflow-y: auto; /* Añadido para permitir el scroll si el contenido es demasiado largo */
  }

  span{
   display:flex;
   flex-direction: center;
   font-size: ${props => props.theme.fontlg}
   transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .close-button {
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
    
    .iconuser {
      font-size: ${props => props.theme.fontlg};
      color: ${props => props.theme.bg4};
      animation: ${slideDown} 0.5s ease-out;
      filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));

    }
  }

  .icon-list {
    display: flex;
    flex-direction: column;
    gap: 30px;

    .icon-item {
      cursor: pointer;

      .icon-span-div{
      display: flex;
      flex-direction: center;
      }
      
      .icon-div-rotate{
       display: flex;
       justify-content: end;
       margin-top: -20px;
      }

       .expand-icon {
         border: none;
         background-color: ${props => props.theme.bgtabbutton};
         border-radius: 10px;
         cursor: pointer;
         color: white;
         transition: transform 0.3s ease;
         box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
         animation: ${sliderLeft} 0.5s ease-out;

       
       }
       .rotate {transform: rotate(-90deg); }



      .icon {
        margin-right: 10px;
        margin-top: -1px;
        color: ${props => props.theme.primary};
        font-size: ${props => props.theme.fontlg};
      animation: ${slideDown} 0.6s ease-out;
        filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));
      }

      .icon-label {
        color: ${props => props.theme.bgiconactive};
        font-size: ${props => props.theme.fontmd};
        transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
        animation: ${slideDown} 0.5s ease-out;
        &:hover {
        color: ${props => props.theme.primary};
        transform: scale(1.0);
      }


      
      }
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.bg3};
  margin: ${v.lgSpacing} 0;
`;


//region BOX

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 30px;
  background-color: ${props => props.theme.bgbox};
  color: ${props => props.theme.tabbuttoncolor};
  border: none;
  border-radius: 4px;
  padding: 30px;
  cursor: pointer;
  animation: ${sliderLeft} 1s ease-out;
  filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));
  transition:background-color 0.3s ease, color 0.3s;

  opacity: ${props => (props.fade === true ? 1 : 0)};
  transition: opacity 0.3s ease;


  .divShow{
  display: flex;
  flex-direction: row;
  align-items: center;
  }

  .buttonShow{
  border: none;
  border-radius: 4px;
  padding: 1px;
  margin: -20px;
  background-color: ${props => props.theme.bgtabbutton};
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
  border: 0px solid rgb(50, 50, 50);
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
  }

`;


const DivMov = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 30px;
  background-color: transparent; 
  color: ${props => props.theme.tabbuttoncolor};
  border: none;
  border-radius: 4px;
  padding: 20px; /* Sin padding para que los contenedores ocupen todo el espacio */
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  animation: ${sliderLeft} 1s ease-out;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.7); /* Ajuste del color de la sombra */
  max-height: 80vh; /* Añadido para permitir scroll en el contenido del modal */
  overflow-y: auto; /* Añadido para permitir el scroll si el contenido es demasiado largo */

   strong{
   color: ${props => props.theme.bg3}
   }

  .movement-item {
    margin: 10px 0;
    width: 100%; /* Ocupa todo el ancho disponible */
  }

  .movement-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px; /* Espacio entre el header y los detalles */

  }


  .movement-header-div-button{
  display: flex;
  justify-content: flex-end;
  }

  .movement-header-button{
  display: flex;
  border: none;
  border-radius: 50%;
  margin-bottom: 20px;
  padding: 7px;
  background-color: ${props => props.theme.bgtabbutton};
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
    transform: scale(0.9);
    box-shadow: none;
  }
  }

.buttonMovement {
  transition: transform 0.4s ease;
}

.buttonMovement.rotate {
  transform: rotate(-90deg);
}


  .movement-details {
    display: flex;
    flex-direction: column;
    padding: 15px;
    max-width: 300px;
    width: 290px;
    gap: 20px; 
    border-radius: 5px;
    border: 1px solid red;
      background-color: transparent;
      transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
      animation: ${sliderLeft} 1.5s ease-out;
      box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
      font-size: ${props => props.theme.fontxs};
      color: ${props => props.theme.textprimary};

  }

  .details-item {
    display: flex;
    justify-content: space-between; /* Distribuir el espacio entre la etiqueta y el valor */
    padding: 5px; /* Espacio dentro de cada celda */
    width: 100%; 

  }

  .details-label {
    font-weight: bold;
  }

  .details-value {
    text-align: right; 
  }
`;


const Input = styled.input`
  display: flex;
  flex-direction: center;
  width: 100%;
  padding: 2px;
  margin: 5px 0;
  background-color: transparent;
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.bg5};
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background-color: transparent;
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.bg5};
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  option{
  color: #000;
  }

`;

const Button = styled.button`
  border: none;
  border-radius: 4px;
  padding: 4px;
  margin: 25px 15px 0px 0px;
  background-color: ${props => props.theme.bgtabbutton};
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.4s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;


  /* Sombra secundaria para suavidad */
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
    transform: scale(0.9);
    box-shadow: none;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  color: ${props => props.theme.text};
   
  gap: 10px;
  p {
    margin: 0;
    strong{
     color:${props => props.theme.bg3};
    }
  }
`;

const BoxMov = styled.div`
  background-color: transparent;
`;

