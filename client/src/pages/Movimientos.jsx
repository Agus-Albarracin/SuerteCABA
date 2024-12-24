import React, { useState, useContext, useEffect } from 'react';
import axiosD from '../axiosDefault';
import {styled, keyframes} from 'styled-components';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { MdExpandMore } from 'react-icons/md';
import { NavBarAgentAdmin } from "../components/HomeComponents/NavbarAgentAdmin";
import { NavBarAgentAdminResposive } from '../components/HomeComponents/NavbarAgentAdminResponsive';
import bar from "../assets/1.jpg"
import wab from "../assets/2.png"
import { ThemeContext } from "../App";
import { useAuth } from '../Context';
import { useAsync } from 'react-select/async';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import bgest from "../assets/bgest.png"
import bgest2 from "../assets/bgest2.png"
import PulseLoader from "react-spinners/PulseLoader";
import HashLoader from "react-spinners/HashLoader";


export function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [userMov, setUserMov] = useState(null);
  const [users, setUsers] = useState('');
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBalance, setTotalBalance] = useState(0);
  const [dateOfday, setDateOfday] = useState({});
  const [movsUser, setMovsUser] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [isResponsive, setIsResponsive] = useState(false);
  const [isResponsiveTable, setIsResponsiveTable] = useState(false);
  const [isResponsiveButtons, setIsResponsiveButtons] = useState(false);

  const [loading, setLoading] = useState(false);

 
  const [startDate, setStartDate] = useState(false);
  const [endDate, setEndDate] = useState(false)

  const { user } = useAuth();
  const { setTheme, theme } = useContext(ThemeContext);

  const bgsidebar = theme === "light" ? wab : bar;
  const bgForEst = theme === "light" ? bgest2 : bgest;
  const bgDiv = theme === "light" ? "#f1f1f1" : "#333";
  const bgText = theme === "light" ? "#000" : "#fff";



  useEffect(() => {

    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 768);
      setIsResponsiveTable(window.innerWidth <= 926);
      setIsResponsiveButtons(window.innerWidth <= 1000);


    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearchChange = (e) => {
    setUsers(e.target.value);
    setMovimientos([]);
    setUserMov(null);
    setError('');
    setExpandedIndex(null);
    setTotalBalance(0);
    setTotalAmount(0);    
    setMovsUser("");
    setDateOfday(null);
    setSelectedDate(null);
  };

 
  const [admins, setAdmins] = useState([]);
  const [openRows, setOpenRows] = useState({});
  
  const filterAdmins = (data) => {
  
    if (user.rol === 'Super') {
      return data.filter(user => user.rol === 'Admin' || user.rol === 'Agente');
    } else if (user.rol === 'Admin') {
      return data.filter(user => user.rol === 'Admin' || user.rol === 'Agente');
    } else if (user.rol === 'Agente') {
      return data.filter(user => user.rol === 'Jugador');
    }
    return [];
  };
  
  const [filterRol, setFilterRol] = useState('');
  const [filterDirectos, setFilterDirectos] = useState('');
  const [errorByRol, setErrorByRol] = useState('');
  
  useEffect(() => {
    const userId = user._id;
  
    const handleGetAdmins = async () => {
      try {
        const response = await axiosD.get('/getEstAdmins', {
          params: { userId: userId },
        });
        if (response.data && response.data.status === 'success') {
          const admins = response.data.data; 
  
          if (Array.isArray(admins)) {
            admins.forEach(admin => {
              
              setAdmins(prevAdmins => {
                // Solo añadir si no está ya en el array
                const exists = prevAdmins.some(existingAdmin => existingAdmin._id === admin._id);
                return exists ? prevAdmins : [...prevAdmins, admin];
              });
            });
          } else {
            console.error("La respuesta no es un array:", admins);
            setAdmins([]);
          }
        } else {
          console.error("La respuesta no contiene datos válidos:", response.data);
          setAdmins([]);
        }
      } catch (error) {
        console.error("Error al obtener los administradores:", error);
      }
    };
  
    handleGetAdmins();
  }, [user !== user]);
  
  
  
  const generateColorByDepth = (depth) => {
    const hue = (depth * 137.508) % 360; // Usamos un número irracional para evitar repetición
    return `hsl(${hue}, 70%, 60%)`; // Genera un color único en el espectro HSL
  };
  
  const RoleIndicator = ({ depth }) => {
    const color = generateColorByDepth(depth);
  
    return (
      <span
        style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: '5px',
        }}
      ></span>
    );
  };
  
  const [selectedUser, setSelectedUser] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUserFinanzas, setSelectedUserFinanzas] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  useEffect(() => {
    if (currentUser) {
      handleSearch(currentUser);
    }
  }, [currentUser]);
  
  const renderUserHierarchy = (EstUser, depth = 0) => {
    if (!EstUser) return null;

    const filterStatus = (users) => {
      return showAllUsers ? users : users.filter(user => user.activo === 1);
    };
    let filteredSubUsers = filterAdmins(EstUser.usuariosCreados || []);
    filteredSubUsers = filterStatus(EstUser.usuariosCreados || []);

    const canToggle = EstUser.rol === 'Super' || EstUser.rol === 'Admin';
    const loggedInUser = user.login;


    const toggleUserVisibility = () => {
      setShowAllUsers((prev) => !prev); // Alterna entre mostrar todos los usuarios y solo los activos
    };

    return (
      <div key={EstUser._id} style={{ marginBottom: '5px', padding: '10px' }}>
                {depth === 0 && (
          <CheckboxContainer>
            <StyledCheckbox
              type="checkbox"
              checked={showAllUsers}
              onChange={toggleUserVisibility}
            />
            <span>
              {'Usuarios desactivados'}
            </span>
          </CheckboxContainer>
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RoleIndicator depth={depth} />
          
          <h4
            style={{ marginRight: '10px', cursor: 'pointer' }}
            onClick={() => {
              // if (EstUser.login !== loggedInUser) {
                setCurrentPage(1);
                setSelectedUser(EstUser);
                setCurrentUser(EstUser.login);
              // }
            }}
          >
            {EstUser.login} ({EstUser.rol})
          </h4>
  
          {canToggle && (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => toggleRow(EstUser._id)}
            >
              {openRows[EstUser._id] ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          )}
        </div>
  
        {canToggle && openRows[EstUser._id] && (
          <div style={{ paddingLeft: '20px' }}>
            {/* Verifica si el nodo ya tiene subusuarios cargados */}
            {filteredSubUsers.length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {filteredSubUsers.map((subUser) => renderUserHierarchy(subUser, depth + 1))}
              </ul>
            ) : (
              <p>No hay usuarios creados.</p>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Función para alternar la apertura/cierre de filas
  const toggleRow = (userId) => {
    setOpenRows((prevOpenRows) => ({
      ...prevOpenRows,
      [userId]: !prevOpenRows[userId],
    }));
  };

  const [isOpenEstructura, setIsOpenEstructura] = useState(false);



  const toggleEstructuraModal = () => {
    setIsOpenEstructura((prev) => !prev);
  };

  const handleUserClick = (EstUser) => {
      setCurrentPage(1);  
      setSelectedUser(EstUser);
      setCurrentUser(EstUser.login)
      setIsOpenEstructura(false);
  };

  const renderUserHierarchyMobile = (EstUser, depth = 0) => {
    if (!EstUser) return null;

    const filterStatus = (users) => {
      return showAllUsers ? users : users.filter(user => user.activo === 1);
    };

    let filteredSubUsers = filterAdmins(EstUser.usuariosCreados || []);
    filteredSubUsers = filterStatus(EstUser.usuariosCreados || []);

    const canToggle = EstUser.rol === 'Super' || EstUser.rol === 'Admin';

    const toggleUserVisibility = () => {
      setShowAllUsers((prev) => !prev); // Alterna entre mostrar todos los usuarios y solo los activos
    };

    return (
      <div
        key={EstUser._id}
        style={{
          marginBottom: '5px',
          padding: '10px',
          position: 'relative',
          backgroundColor: 'transparent', 
          width: '90%', 
          borderRadius: '8px',
        }}
      >
                        {depth === 0 && (
          <CheckboxContainer>
            <StyledCheckboxR
              type="checkbox"
              checked={showAllUsers}
              onChange={toggleUserVisibility}
            />
            <span>
              {'Usuarios desactivados'}
            </span>
          </CheckboxContainer>
        )}

        <div style={{ display: 'flex', alignItems: 'center'}}>
          <RoleIndicator depth={depth} />
          <h4
            style={{ marginRight: '10px', cursor: 'pointer', color: bgText}} 
            onClick={() => handleUserClick(EstUser)}
          >
            {EstUser.login} ({EstUser.rol})
          </h4>
          {canToggle && (
            <span
              style={{ cursor: 'pointer', color: bgText }} 
              onClick={() => {
                console.log("Se ejecuto el boton para estructura"),
                toggleRow(EstUser._id)}}
            >
              {openRows[EstUser._id] ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          )}
        </div>

        {canToggle && openRows[EstUser._id] && (
          <div style={{ paddingLeft: '20px' }}>
            {filteredSubUsers.length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {filteredSubUsers.map((subUser) => renderUserHierarchyMobile(subUser, depth + 1))}
              </ul>
            ) : (
              <p style={{ color: '#fff' }}>No hay usuarios creados.</p> 
            )}
          </div>
        )}
      </div>
    );
  };





const handleSearch = async (selectedUserLogin) => {
  const userId = user._id;
  setLoading(true);

  try {
    setError('');
    setErrorByRol('');

    const startDateStr = startDate ? moment(startDate).format('YYYY-MM-DD') : null;
    const endDateStr = endDate ? moment(endDate).format('YYYY-MM-DD') : null;

    const filters = {
      userId,
      // usuariosCreados: user.usuariosCreados,
    };

    if (startDateStr && endDateStr) {
      filters.startDate = startDateStr;
      filters.endDate = endDateStr;
    }

    if (users) {
      filters.login = users;
    }

    if (filterRol) {
      filters.rol = filterRol;
    } else if (!currentUser) {
      filters.rol = "Todos";
    } else {
      filters.rol = "";
    }

    if (filterDirectos) {
      filters.directos = filterDirectos;
    } else if (filterDirectos === ""){
      filters.directos = ""
    }

    if (currentUser || selectedUserLogin) {
      console.log("se muestra la estructura seteada", currentUser || selectedUserLogin)
      filters.estructura = currentUser || selectedUserLogin;
    }

    console.log("muestro filtros enviados", filters)
    const response = await axiosD.post('/movimientos', filters);
    const { movimientos, totalMovimientos, montoTotal } = response.data.data;
    console.log("Se muestra movmientos:", movimientos)

    if (movimientos && movimientos.length > 0) {
      const sortedMovimientos = movimientos.sort((a, b) => moment(b.date) - moment(a.date));

      const filteredMovimientos = sortedMovimientos.filter(mov =>
        mov.usuarioResponsable === userId || 
        mov.usuarioReceptor === userId || 
        user.usuariosCreados.includes(mov.usuarioResponsable) ||
        user.usuariosCreados.includes(mov.usuarioReceptor)
      );

      updateMovimientos(movimientos, totalMovimientos);
      setTotalAmount(montoTotal);


    } else {
      setMovimientos([]);
      setMovsUser([]);
      setTotalAmount(0);
    }
  } catch (error) {
    console.error('Error buscando movimientos:', error);
    setError('Error al buscar movimientos');
    setMovimientos([]);
  } finally {
    setLoading(false); // Desactivar el loader al finalizar la solicitud
  }
};


const updateMovimientos = (filteredMovimientos, totalMovimientos) => {
  setMovimientos(filteredMovimientos);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(totalMovimientos / resultsPerPage);
  setTotalPages(totalPages);

  // Obtener movimientos de la página actual
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedMovimientosUser = filteredMovimientos.slice(startIndex, startIndex + resultsPerPage);
  setMovsUser(paginatedMovimientosUser);
};

const handlePageChange = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);

    const startIndex = (pageNumber - 1) * resultsPerPage;
    const paginatedMovimientosUser = movimientos.slice(startIndex, startIndex + resultsPerPage);
    setMovsUser(paginatedMovimientosUser);
  }
};

let pagesToShow;

if (isResponsive || isResponsiveTable) {
  pagesToShow = 5;
} else if (isResponsiveButtons) {
  pagesToShow = 7;
} else {
  pagesToShow = 10; 
} 

const getVisiblePages = (currentPage, totalPages) => {
  const startBlock = Math.floor((currentPage - 1) / pagesToShow) * pagesToShow;
  const endBlock = Math.min(startBlock + pagesToShow, totalPages); 

  return Array.from({ length: endBlock - startBlock }, (_, i) => startBlock + i + 1); 
};

// const updateMovimientos = (filteredMovimientos, totalAmount, totalPages) => {
//   setMovimientos(filteredMovimientos);

//   setTotalPages(totalPages);

//   const paginatedMovimientosUser = filteredMovimientos.slice(0, resultsPerPage);
//   setMovsUser(paginatedMovimientosUser);
  
// };

// const handlePageChange = async (pageNumber) => {
//   if (pageNumber >= 1 && pageNumber <= totalPages) {
//     setCurrentPage(pageNumber);
//   }
// };  


const handleClear = () => {
  setCurrentUser("")
  setTotalAmount(0);
  setEndDate(null);
  setStartDate(null);
  setMovimientos([]);
  setMovsUser([]);
  setCurrentPage(1); 
  setTotalPages(0); 
  setError('');
  setErrorByRol('');
  setUsers('');
  setSelectedDate(null);
  setExpandedIndex(null);
  setTotalBalance(0);
};

  const handleExpandClick = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const handleDateChange = (newStartDate, newEndDate) => {
    setMovimientos([]);
    setTotalAmount(0);
    setError('');
    setErrorByRol('');

    
    if (newStartDate !== null) {
      setStartDate(newStartDate);
    }
  
    if (newEndDate !== null) {
      setEndDate(newEndDate);

    }
  
    setExpandedIndex(null);
    setTotalBalance(0);
    setMovsUser("");
    setUserMov(null);
  };


  function Movssaldoxdia ( {movsUser, expandedIndex, handleExpandClick }) {


    return (
      <>
        {movsUser.length > 0 ? (
        movsUser.map((movimiento, index) => (
          <div key={index}>
            <TableRow>
              <TableCell><div className="div-date">{moment(movimiento.date).format('DD/MM/YYYY HH:mm:ss')}</div></TableCell>
              <TableCell><div className="div-type">{movimiento.details.nameResponsable}</div></TableCell>
              <TableCell><div className="div-type">{movimiento.details.nameReceptor}</div></TableCell>
              {isResponsive ? null :
              <TableCell>
              <ExpandButton onClick={() => handleExpandClick(index)} expanded={expandedIndex === index}>
                <MdExpandMore size={24} />
              </ExpandButton>
            </TableCell> }
            <TableCell>
  <div className="div-monto">
    {movimiento.type === 'Retiro' 
      ? `-${new Intl.NumberFormat('es-AR').format(movimiento.monto)}` 
      : `${new Intl.NumberFormat('es-AR').format(movimiento.monto)}` || '- - -'}
  </div>
</TableCell>
            {/* <TableCell><div className="div-monto">{movimiento.type === 'Retiro' ? `-$${movimiento.monto}` : `$${movimiento.monto}` || '- - -'}</div></TableCell> */}
            </TableRow>

            <DetailsContainer bgImage={bgsidebar} expanded={expandedIndex === index}>
              {movimiento.type === 'Cambio' && (
                <>
                  <Detail><strong>Campo:</strong> {movimiento.details.field}</Detail>
                  <Detail><strong>Valor Anterior:</strong> {movimiento.details.oldValue}</Detail>
                  <Detail><strong>Valor Nuevo:</strong> {movimiento.details.newValue}</Detail>
                </>
              )}
              {(movimiento.type === 'Deposito' || movimiento.type === 'Retiro') && (
                <>
                  <DetailA><strong>Tipo de transacción: </strong>
                  <em><hr/><h4>{movimiento.type}</h4></em><hr/></DetailA>
                  <br></br>
                  <DetailA><strong>Fecha: </strong>{moment(movimiento.date).format('DD/MM/YYYY HH:mm:ss')}</DetailA>
                  <DetailA><strong>Monto de transacción: </strong>${new Intl.NumberFormat('es-AR').format(movimiento.monto)}</DetailA>
                  <br></br>
                  <DetailB><strong>Responsable: </strong> {movimiento.details.nameResponsable}</DetailB>
                  <DetailB><strong>Saldo Responsable Antes: </strong>${new Intl.NumberFormat('es-AR').format(movimiento.balanceAntesResponsable)}</DetailB>
                  <DetailB><strong>Saldo Responsable Después: </strong>${new Intl.NumberFormat('es-AR').format(movimiento.balanceDespuesResponsable)}</DetailB>
                  <br></br>
                  <DetailR><strong>Receptor: </strong>{movimiento.details.nameReceptor}</DetailR>
                  <DetailR><strong>Saldo Receptor Antes: </strong>${new Intl.NumberFormat('es-AR').format(movimiento.balanceAntesReceptor)}</DetailR>
                  <DetailR><strong>Saldo Receptor Después: </strong>${new Intl.NumberFormat('es-AR').format(movimiento.balanceDespuesReceptor)}</DetailR>
                </>
              )}
              {movimiento.type === 'Cambio de contraseña' && (
                <>
                  <Detail><strong>Contraseña Anterior:</strong> {movimiento.details.oldPassword}</Detail>
                  <Detail><strong>Contraseña Nueva:</strong> {movimiento.details.newPassword}</Detail>
                </>
              )}
              {(movimiento.type === 'Inicio de sesión' || movimiento.type === 'Cierre de sesión') && (
                <>
                  <Detail><strong>Hora de Inicio:</strong> {moment(movimiento.details.loginTime).format('DD/MM/YYYY HH:mm:ss')}</Detail>
                  <Detail><strong>Hora de Cierre:</strong> {moment(movimiento.details.logoutTime).format('DD/MM/YYYY HH:mm:ss')}</Detail>
                  <Detail><strong>Duración:</strong> {movimiento.details.duration} ms</Detail>
                </>
              )}
            </DetailsContainer>

              

          </div>
        ))
      ) : (
        <NoResults>No se encontraron movimientos para este usuario.</NoResults>
      )}
      </>
    )
  }

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1);

  return (
<Container bgImage={bgsidebar}>
{isResponsive ? <NavBarAgentAdminResposive /> : <NavBarAgentAdmin />}

{!isResponsive ? 
<>
<SearchContainer>
  <p><strong><em>Desde:</em></strong></p>
  <StyledDatePicker
    selected={startDate}
    onChange={(date) => handleDateChange(date, endDate)} 
    dateFormat="yyyy-MM-dd"
    maxDate={maxDate}
    placeholderText="Seleccionar fecha"
    startDate={startDate}
  />
  <p><strong><em>Hasta:</em></strong></p>
  <StyledDatePicker
    selected={endDate}
    onChange={(date) => handleDateChange(startDate, date)} 
    dateFormat="yyyy-MM-dd"
    maxDate={maxDate}
    placeholderText="Seleccionar fecha"
    endDate={endDate}
  />
</SearchContainer>

<SearchContainer>
<select
        value={filterRol}
        onChange={(e) => setFilterRol(e.target.value)}
        style={{ padding: '7px' }}
      >
        {user.rol === "Super" ? (
  <>
    <option value="">Seleccionar</option>
    <option value="Admin">Admin</option>
    <option value="Agente">Agente</option>
    <option value="Jugador">Jugadores</option>
  </>
) : (
  <>
    <option value="">Seleccionar</option>
    <option value="Admin">Admin</option>
    <option value="Agente">Agente</option>
    <option value="Jugador">Jugadores</option>
  </>
)}
</select>

    <SearchInput
      type="text"
      value={users}
      onChange={handleSearchChange}
      placeholder="Buscar usuario..."
    />

    <SearchButton onClick={() => { handleSearch(); }}>
  Buscar
</SearchButton>
<ClearButton onClick={handleClear}>Limpiar</ClearButton>
  {user.rol === "Super" ? (    
    <select
        value={filterDirectos}
        onChange={(e) => setFilterDirectos(e.target.value)}
        style={{ padding: '7px' }}
      >
    <option value="">Seleccionar</option>
    <option value="Directos">Directos</option>
    <option value="Estructura">Estructura</option>
</select>) : null}

</SearchContainer>

{errorByRol && <ErrorMessage>{errorByRol}</ErrorMessage>}
    

<UserInfo>
    {userMov ? (
      <InfoDiv bgImage={bgsidebar}>
        <p><strong>Usuario:</strong> {userMov.login}</p>
        <p><strong>Saldo Actual: $</strong>{userMov.balance}</p>
        <p><strong>Email:</strong> {userMov.email}</p>
      </InfoDiv>
    ) : ( <></>)}

  
  </UserInfo>

<DivWrap>

  <TableContainer isResponsiveTable={isResponsiveTable} isVisible={true}>
 { loading ? (
  <div className="loader-container">
  <div className="loader-overlay">
    <HashLoader
 
      color="#997300" 
      loading={loading} 
      size={70}
      cssOverride={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15%',
        marginBottom: '15%',
        marginLeft: '45%' // Centra el loader horizontalmente
      }} 
    />
  </div>
</div>
) : (
  <>
    <HeaderRow>
      {isResponsive ? (
        <>
          <HeaderCell>Fecha</HeaderCell>
          <HeaderCell>Origen</HeaderCell>
          <HeaderCell>Destino</HeaderCell>
          <HeaderCell>Monto</HeaderCell>
        </>
      ) : (
        <>
          <HeaderCell>Fecha</HeaderCell>
          <HeaderCell>Origen</HeaderCell>
          <HeaderCell>Destino</HeaderCell>
          <HeaderCell>Detalles</HeaderCell>
          <HeaderCell>Monto</HeaderCell>
        </>
      )}
    </HeaderRow>

    <Body>
      {!userMov ? (
        <Movssaldoxdia
          movsUser={movsUser}
          expandedIndex={expandedIndex}
          handleExpandClick={handleExpandClick}
        />
      ) : (<></>
      )}
    </Body>

    <TableRowTotal>
      <TableCellTotal colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>
        <div className="montoTotal">
          Total: ${totalAmount !== null && totalAmount !== undefined ? `${new Intl.NumberFormat('es-AR').format(totalAmount)} ARS` : '0.00'}
        </div>
      </TableCellTotal>
    </TableRowTotal>

    <PaginationContainer>
      <ResultsPerPageSelect onChange={handleResultsPerPageChange} value={resultsPerPage}>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={30}>30</option>
        <option value={40}>40</option>
        <option value={50}>50</option>
      </ResultsPerPageSelect>

      <DivPagination>
        {/* Botón para retroceder 5 páginas */}
        <PageButton
          onClick={() => handlePageChange(currentPage - 5)}
          disabled={currentPage <= 5}
        >
          {"<<"}
        </PageButton>

        {/* Botón para retroceder 1 página */}
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </PageButton>

        {/* Renderizar las páginas visibles */}
        {getVisiblePages(currentPage, totalPages).map((page) => (
          <PageNumberButton
            key={page}
            onClick={() => handlePageChange(page)}
            active={currentPage === page}
          >
            {page}
          </PageNumberButton>
        ))}

        {/* Botón para avanzar 1 página */}
        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {">"}
        </PageButton>

        {/* Botón para avanzar 5 páginas */}
        <PageButton
          onClick={() => handlePageChange(currentPage + 5)}
          disabled={currentPage > totalPages - 5}
        >
          {">>"}
        </PageButton>
      </DivPagination>
    </PaginationContainer>
  </>
)}


  </TableContainer>

  <TableContainerAA isResponsiveTable={isResponsiveTable}>
    <div>
      {admins.length > 0 ? (
        admins.map((admin) => renderUserHierarchy(admin))
      ) : (
        <PulseLoader color="#997300" margin={12}/>

        
      )}
    </div>
  </TableContainerAA>
</DivWrap> 

</>

:
<SearchContainerResponsive>
<SearchButton onClick={toggleEstructuraModal}>Estructura</SearchButton>
      {isOpenEstructura && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,

        }}>
          <div style={{
            background: bgDiv,
            padding: '20px',
            borderRadius: '8px',
            width: '90%', 
            maxWidth: '800px', 
            height: '60%', 
            overflowY: 'auto', 
            
          }}>
            <button onClick={() => setIsOpenEstructura(false)} style={{marginLeft: '85%', marginBottom: '10px', color: bgText, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Cerrar
            </button>
            {admins.length > 0 ? (
              admins.map((admin) => renderUserHierarchyMobile(admin))
            ) : (
              <PulseLoader color="#997300" margin={12}/>
            )}
          </div>
        </div>
      )}

<SearchContainerR>
  <p><strong><em>Desde:</em></strong></p>
  <StyledDatePickerR
    selected={startDate}
    maxDate={maxDate}
    onChange={(date) => handleDateChange(date, endDate)} 
    dateFormat="yyyy-MM-dd"
    placeholderText="Seleccionar fecha"
    startDate={startDate}
  />
  <p><strong><em>Hasta:</em></strong></p>
  <StyledDatePickerR
    selected={endDate}
    maxDate={maxDate}
    onChange={(date) => handleDateChange(startDate, date)} 
    dateFormat="yyyy-MM-dd"
    placeholderText="Seleccionar fecha"
    endDate={endDate}
  />
</SearchContainerR>
<SearchContainerR>
<p><strong><em>Rol:</em></strong></p>

<select
        value={filterRol}
        onChange={(e) => setFilterRol(e.target.value)}
        style={{ padding: '7px', width: '100%' }}
      >
        <option value="">Seleccionar</option>
        <option value="Admin">Admin</option>
        <option value="Agente">Agente</option>
        <option value="Jugador">Jugadores</option>
</select>

{user.rol === "Super" ? (
  <>
    <p><strong><em>Filtrar por:</em></strong></p>
  
    <select
        value={filterDirectos}
        onChange={(e) => setFilterDirectos(e.target.value)}
        style={{ padding: '7px' }}
      >
    <option value="">Seleccionar</option>
    <option value="Directos">Directos</option>
    <option value="Estructura">Estructura</option>
</select>
</> 
) : null}

</SearchContainerR>


<SearchContainerR>
<p><strong><em>Usuario:</em></strong></p>

<SearchInputR
      type="text"
      value={users}
      onChange={handleSearchChange}
      placeholder="Buscar usuario..."
    />


    
    <SearchButtonR onClick={() => { handleSearch(); }}>Buscar</SearchButtonR>
    <ClearButtonR onClick={handleClear}>Limpiar</ClearButtonR>

  </SearchContainerR>



  {error && <ErrorMessage>{error}</ErrorMessage>}
  {errorByRol && <ErrorMessage>{errorByRol}</ErrorMessage>}




</SearchContainerResponsive>}
<UserInfo>
    {userMov ? (
      <InfoDiv bgImage={bgsidebar}>
        <p><strong>Usuario:</strong> {userMov.login}</p>
        <p><strong>Saldo Actual: $</strong>{userMov.balance}</p>
        <p><strong>Email:</strong> {userMov.email}</p>
      </InfoDiv>
    ) : ( <></>)}

  
  </UserInfo>
{isResponsive ?
  <DivWrap>
  <TableContainerR isResponsiveTable={isResponsiveTable} isVisible={true}>
  {loading ? ( // Verifica si loading es true
    <div className="loader-container">
      <div className="loader-overlay">
        <HashLoader
 
          color="#997300" 
          loading={loading} 
          size={100} // Aumenta el tamaño a 150
          cssOverride={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '30%',
            marginBottom: '30%',
            marginLeft: '35%'
          }} 
        />
      </div>
    </div>
  ) : (
    <>
      <HeaderRow>
        {isResponsive ? 
          (<>
            <HeaderCell>Fecha</HeaderCell>
            <HeaderCell>Origen</HeaderCell>
            <HeaderCell>Destino</HeaderCell>
            <HeaderCell>Monto</HeaderCell>
          </>) : 
          (<>
            <HeaderCell>Fecha</HeaderCell>
            <HeaderCell>Origen</HeaderCell>
            <HeaderCell>Destino</HeaderCell>
            <HeaderCell>Detalles</HeaderCell>
            <HeaderCell>Monto</HeaderCell>
          </>)}
      </HeaderRow>

      <Body>
        { !userMov ? (
          <Movssaldoxdia
            movsUser={movsUser}
            expandedIndex={expandedIndex}
            handleExpandClick={handleExpandClick}
          />
        ) : (
          <MovsxUser
            movsUser={movsUser}
            expandedIndex={expandedIndex}
            handleExpandClick={handleExpandClick}
          />
        )}
      </Body>

      <TableRowTotal>
        <TableCellTotal colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>
          <div className="montoTotal">
            Total: ${totalAmount !== null && totalAmount !== undefined ? 
              `${new Intl.NumberFormat('es-AR').format(totalAmount)} ARS` : '0.00'}
          </div>
        </TableCellTotal>
      </TableRowTotal>

      <PaginationContainer>
        <ResultsPerPageSelect onChange={handleResultsPerPageChange} value={resultsPerPage}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </ResultsPerPageSelect>

        <DivPagination>
          {/* Renderizar las páginas visibles */}
          {getVisiblePages(currentPage, totalPages).map((page) => (
            <PageNumberButton
              key={page}
              onClick={() => handlePageChange(page)}
              active={currentPage === page}
            >
              {page}
            </PageNumberButton>
          ))}
        </DivPagination>
      </PaginationContainer>

      <DivPaginationButtons>
        {/* Botón para retroceder 5 páginas */}
        <PageButton
          onClick={() => handlePageChange(currentPage - 5)}
          disabled={currentPage <= 5}
        >
          {"<<"}
        </PageButton>

        {/* Botón para retroceder 1 página */}
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </PageButton>

        {/* Botón para avanzar 1 página */}
        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {">"}
        </PageButton>

        {/* Botón para avanzar 5 páginas */}
        <PageButton
          onClick={() => handlePageChange(currentPage + 5)}
          disabled={currentPage > totalPages - 5}
        >
          {">>"}
        </PageButton>
      </DivPaginationButtons>
    </>
  )}
</TableContainerR>

</DivWrap>  :
null
}





</Container>
  );
}

//region ANIMATION
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

const sliderRight = keyframes`
  0% {
    transform: translateX(-50%);
    opacity: 0;
  }
  70% {
    transform: translateX(0);
    opacity: 1;
  }
`;
//endregion
const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px; // Espacio entre el checkbox y el resto
`;

const StyledCheckbox = styled.input`
  width: 20px;
  height: 20px;
  appearance: none; 
  background-color: white; 
  border: 2px solid #ccc; 
  border-radius: 4px; 
  margin-right: 10px; 

  &:checked {
    background-color: red; 
    border-color: red; 
  }

  &:checked::after {
    content: '';
    display: block;
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: red; 
    border-radius: 2px;
    top: 5px; 
    left: 5px; 
  }
`;

const StyledCheckboxR = styled.input`
  width: 20px;
  height: 20px;
  appearance: none; 
  background-color: white; 
  border: 2px solid #ccc;
  border-radius: 4px; 
  margin-right: 10px; 

  &:checked {
    background-color: red; 
    border-color: red; 
  }

  &:checked::after {
    content: '';
    display: block;
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: red; 
    border-radius: 2px;
    }
`;

const Container = styled.div`
  background: url(${(props) => props.bgImage}) no-repeat center center;
  background-size: cover; 
  background-attachment: fixed;
  min-height: 1080px;
  overflow: hidden;
  padding: 15px;

  @media (max-width: 926px) {
  padding: 0px;
  max-width: 926px;
}

@media (max-width: 768px) {
  padding: 0px;
  max-width: 768px;
}
  
@media (max-width: 480px) {
  padding: 0px;
  max-width: 480px;
}

`;

const TableContainerR = styled.div`
  background-color:${props => props.theme.bgtablecontainer};
  padding: 15px;
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 8px 24px 32px rgba(0, 0, 0, 0.6);
  animation: ${sliderLeft} 1.5s ease-out;
  width: 98%;
  margin-bottom: 2%;
  min-height: 300px;


  transition: opacity 1s ease-out;

  opacity: ${props => (props.isVisible ? 1 : 0)};
  transform: ${props => (props.isVisible ? 'translateX(0)' : 'translateX(0px)')};

@media (max-width: 768px) {
  margin-bottom: 40%;
  
}
  
`;

const DivWrap = styled.div`
display: flex;
width: 100%;
gap: 1%;  
`;

const TableContainer = styled.div`
  background-color:${props => props.theme.bgtablecontainer};
  padding: 15px;
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 8px 24px 32px rgba(0, 0, 0, 0.6);
  animation: ${sliderLeft} 1.5s ease-out;
  width: 69%;
  margin-bottom: 2%;
  min-height: 300px;


  transition: opacity 1s ease-out;

  opacity: ${props => (props.isVisible ? 1 : 0)};
  transform: ${props => (props.isVisible ? 'translateX(0)' : 'translateX(0px)')};

`;

const TableContainerAA = styled.div`
  background-color:${props => props.theme.bgtablecontainer};
  padding: 15px;
  overflow-x: auto;
  overflow-y: auto; 
  border-radius: 10px;
  box-shadow: 8px 24px 32px rgba(0, 0, 0, 0.6);
  animation: ${sliderLeft} 1.5s ease-out;
  width: 30%;
  height: 300px;

  transition: opacity 1s ease-out;

`;


const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 10px;  


  @media (max-width: 768px) {
  max-width: 768px;
  padding: 10px 30% 10px 5px;
  p{
  display:flex;
  }

}

`;

const SearchInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid red; 
  background-color: transparent; 
  color: ${props => props.theme.text};
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 1px solid  ${props => props.theme.gray300};
  animation: ${sliderRight} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
  max-width: 768px;
}
  @media (max-width: 480px) {
  max-width: 480px;
}
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 10px;
  border: 1px solid red; 
  border-radius: 5px;
  background-color: transparent; 
  color: ${props => props.theme.text};
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 1px solid  ${props => props.theme.gray300};
  animation: ${sliderRight} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
  width: 230px;
`;

const SearchButton = styled.button`
  padding: 8px 12px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.theme.bgtabbutton};
  color: white;
  cursor: pointer;
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;


  /* Sombra secundaria para suavidad */
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
    transform: scale(0.9);
    box-shadow: none;
  } 
      @media (max-width: 480px) {
  margin-left: 0px;
}
`;

const SearchButtonR = styled.button`
  padding: 8px 12px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.theme.bgtabbutton};
  color: white;
  cursor: pointer;
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;


  /* Sombra secundaria para suavidad */
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
    box-shadow: none;
  } 
      @media (max-width: 480px) {
  margin-left: 0px;
}
`;

const InfoDiv = styled.div`
  background: url(${(props) => props.bgImage}) no-repeat center;
  background-size: cover; 
  width: auto;
  max-width: 450px;
  padding: 8px 12px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  color: ${(props) => props.theme.text};
  cursor: pointer;
  transition: color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

`;

const ClearButton = styled.button`
  padding: 8px 12px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.theme.gray500};
  color: white;
  cursor: pointer;
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;


  /* Sombra secundaria para suavidad */
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: ${props => props.theme.gray300};
    transform: scale(0.9);
    box-shadow: none;
  }

        @media (max-width: 480px) {
  margin-left: 0px;
}
`;


const ClearButtonR = styled.button`
  padding: 8px 12px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.theme.gray500};
  color: white;
  cursor: pointer;
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;


  /* Sombra secundaria para suavidad */
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: ${props => props.theme.gray300};
    box-shadow: none;
  }

        @media (max-width: 480px) {
  margin-left: 0px;
}
`;



const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
`;

const UserInfo = styled.div`
  margin-bottom: 20px;
`;







const HeaderRow = styled.div`
  display: flex;
  font-weight: bold;
  color: #fff;
  background-color:${props => props.theme.bgheadertable};
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 4px 8px 16px rgba(0, 0, 0, 0.6);


  @media (max-width: 768px) {
    border-radius: 12px; 
    justify-content: flex-start;
  }
`;



const HeaderCell = styled.div`
  flex: 1;
  padding: 5px;
  text-align: start;
  margin-left: 50px;
  font-size: 0.8rem;

  @media (max-width: 1020px) {
    margin-left: 0px;
    padding: 8px; 
    font-size: 0.775rem; 
  }
  @media (max-width: 768px) {
    margin-left: 0px;
    padding: 8px; 
    font-size: 0.775rem; 
  }
`;

const TableRow = styled.div`
  display: flex;
  border-bottom: 1px solid #666;
  padding: 10px;
  margin: 5px;
  justify-content: flex-start;

  @media (max-width: 926px) {
    padding: 0px 0px;
  }
  @media (max-width: 768px) {
    padding: 0px 0px;
  }
`;



const TableRowTotal = styled.div`
  display: flex;
  border-bottom: 1px solid #666;
  padding: 10px;
  margin: 5px;
  justify-content: flex-start;


  @media (max-width: 926px) {
    padding: 0px 0px;
  }
  @media (max-width: 768px) {
    padding: 0px 0px;
  }

`;




const TableCell = styled.div`
  flex: 1;
  padding: 10px;
  color: ${props => props.theme.blackandwhite2}
  text-align: left;
  font-size: 0.8rem;
  width: 100px;
  
      .div-date{
    margin-left:10px
    }
    .div-monto{
    margin-left: 50px

    }
    .div-type{
    margin-left: 30px

    }
    .montoTotal{
    margin-right: 70px
    }

     @media (max-width: 926px) {
    .div-date{
    margin-left: 0px
    }
    .div-monto{
    margin-left: 0px

    }
    .div-type{
    margin-left: 0px

    }

  }

   @media (max-width: 480px) {

    .div-date{
    margin-left: 0px
    }

    .div-monto{
    margin-left: 10px
    }

    .div-type{
    margin-left: -10px
    }

  }


  @media (max-width: 768px) {
    max-width: 100px;
    overflow: hidden;
    font-size: 0.705rem;
    text-align: left;
  }


.iconuser{
  margin-bottom: 12px;
  margin-right: 5px;
  color: ${props => props.theme.bgtabicon};
  font-size: 25px;
      filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  animation: ${slideDown} 1.5s ease-out;

  @media (max-width: 768px) {
    font-size: 32px; 
  }
}

.divuser{
display: flex;
text-align: center;
align-items: center;
transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
animation: ${slideDown} 1.5s ease-out;
}

.divbalance{
margin-top: 12px;
display: flex;
text-align: center;
align-items: center;
transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
animation: ${slideDown} 1.5s ease-out;
}


.action-button{
  border: none;
  background-color: transparent; 
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  margin: 0;
  &:hover { color: #ddd; }

  @media (max-width: 768px) { font-size: 20px; }
};

.icon{
  border: none;
  cursor: pointer;
  margin-top: 12px;
  color: ${props => props.theme.bgtabicon};
  padding: 0;
  font-size: 25px;
  filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));
        transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
      animation: ${slideDown} 1.5s ease-out;
          &:hover {
    transform: scale(0.9);
  filter: none
  }
`;

const TableCellTotal = styled.div`
  flex: 1;
  padding: 10px;
  color: ${props => props.theme.blackandwhite2};
  text-align: left;
  font-size: 0.8rem;
  
  .montoTotal{
    margin-right: 13%
    }
   @media (max-width: 480px) {
    
     .montoTotal{
    margin-right: 5%
    }

  }
`;

const Body = styled.div`
  background-color:${props => props.theme.bgtablecontainer};
  display: flex;
  flex-direction: column;
  border-radius: 7px;
`;

//region EXPAND BUTTON
const ExpandButton = styled.button`
  background: none;
  color: red;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-left: 60px;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform: ${({ expanded }) => (expanded ? 'rotate(180deg)' : 'rotate(0deg)')};

  @media (max-width: 926px) {
    margin-left: 10px;
  }
  @media (max-width: 768px) {
    margin-left: 10px;
  }
`;

const DetailsContainer = styled.div`
display: ${({ expanded }) => (expanded ? 'block' : 'none')};
background: ${(props) => props.theme.blackandwhite};
  padding: 10px;
  border-radius: 5px;
  border: 1px solid red; 
  color: ${props => props.theme.text};
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 1px solid  ${props => props.theme.gray300};
  animation: ${fadeInFromLeft} 0.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

`;

const Detail = styled.div`
  margin-bottom: 5px;
`;

const DetailA = styled.div`
  margin-bottom: 5px;
    strong{
  color: ${(props) => props.theme.detailA};
    }
`;

const DetailR = styled.div`
  margin-bottom: 5px;
  strong{
  color: ${(props) => props.theme.detailReceptor};
    }
`;

const DetailB = styled.div`
  margin-bottom: 5px;
  strong{
  color: ${(props) => props.theme.detailResponsable};
    }
`;


const NoResults = styled.div`
  margin-top: 20px;
  font-style: italic;
  color: #888;
`;


//region PAGINATION

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;

    @media (min-width: 1900px) {
    gap: 30%;
    }

    @media (min-width: 1100px) {
    gap: 10%;
    }

`;

const DivPaginationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
`;

const DivPagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; 
  animation: ${fadeInFromLeft} 0.6s ease-out forwards;

  /* Se elimina el width fijo para que el contenedor se adapte */
  width: 100%; /* O puedes usar auto si prefieres */

  @media (min-width: 1900px) {
    max-width: 60%; 
}

  @media (min-width: 769px) {
    margin-right: 7%;
    max-width: 70%; 
  }

  @media (min-width: 480px) {
    margin-right: 7%;
    max-width: 90%; 
  }

  @media (min-width: 430px) {
    max-width: 100%; 
  }

    @media (min-width: 360px) {
    max-width: 100%; 
  }
`;


const PageButton = styled.button`
  background-color: transparent; /* Sin fondo */
  color: #fff;
  border: none;
  padding: 1px 12px;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
  animation: ${sliderRight} 1s ease-out;
      filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));


  &:hover {
    color:  #997300;
    transform: scale(1.1);
  }

  &:disabled {
    color: transparent;
    cursor: not-allowed;
  }
`;

const ResultsPerPageSelect = styled.select`
  background-color: ${props => props.theme.bgtabbutton};
  color: ${props => props.theme.tabbuttoncolor};
  border: none;
  border-radius: 4px;
  padding: 2px;
  max-height: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  animation: ${sliderLeft} 1s ease-out;
      filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));


  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
  }

  option {
    background-color: ${props => props.theme.bgtabbutton};
    color: ${props => props.theme.tabbuttoncolor};
  }
`;

const PageNumberButton = styled(PageButton)`
  background-color: transparent; 
  color: ${props => props.active ? props.theme.bgtabbutton : props.theme.text }; 
`;

//region RESPONSIVO
const SearchContainerResponsive = styled.div`
  display: flex;
  flex-direction: column; 
  gap: 10px;
  padding: 12px 10px;

  @media (min-width: 769px) {
    flex-direction: row; 
  }

  @media (max-width: 768px) {
    padding: 10px 5%; 
  }
`;

const SearchContainerR = styled.div`
  display: flex;
  flex-direction: column; 
  gap: 10px;

  @media (min-width: 769px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchInputR = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid red; 
  background-color: transparent; 
  color: ${props => props.theme.text};
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 1px solid ${props => props.theme.gray300};
  animation: ${sliderRight} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
  width: 100%; 

  @media (min-width: 769px) {
    max-width: 230px;
  }
`;

const StyledDatePickerR = styled(DatePicker)`
  padding: 10px;
  border: 1px solid red; 
  border-radius: 5px;
  background-color: transparent; 
  color: ${props => props.theme.text};
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 1px solid ${props => props.theme.gray300};
  animation: ${sliderRight} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
  width: 100%;

  @media (min-width: 769px) {
    max-width: 230px; 
  }
`;


