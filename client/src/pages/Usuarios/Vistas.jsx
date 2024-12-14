import styled, { useTheme, keyframes } from "styled-components";
import React, { useState, useEffect, useMemo, useContext} from 'react';
import axiosD from "../../axiosDefault";
import toast, { Toaster } from 'react-hot-toast';
import { AiOutlineUser, AiOutlineSearch, AiOutlineUpCircle, AiOutlineDownCircle, AiOutlineMore, AiOutlineConsoleSql } from "react-icons/ai";
import { DepositModal, WithdrawModal } from '../../components/Modals';
import { ActionsModal } from '../../components/ModalActions';
import { useAuth } from '../../Context';
import { NavBarAgentAdmin } from "../../components/HomeComponents/NavbarAgentAdmin";
import { NavBarAgentAdminResposive } from "../../components/HomeComponents/NavbarAgentAdminResponsive";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../App";
import bar from "../../assets/1.jpg"
import wab from "../../assets/2.png"
import { useSocket } from '../../ContextSocketio';
import { useBalance } from '../../ContextBalance';

function GlobalFilter({ globalFilter, setGlobalFilter }) {
  const navigate = useNavigate();

  return (
    <SearchContainer>
      <div>
        <SearchInput
          value={globalFilter || ''}
          onChange={e => setGlobalFilter(e.target.value || "")}
          placeholder={`Buscar...`}
        />
        <IconLupa className="iconlupa" />
      </div>
      <CreateUserButton onClick={() => navigate('/usuarios/crear')}>
        Crear Usuario
      </CreateUserButton>
    </SearchContainer>
  );
}

export default function Vistas() {
  const { user } = useAuth();
  const [userData, setUserData] = useState([]);
  const [allUserData, setAllUserData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [allAgentData, setAllAgentData] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [allAdminData, setAllAdminData] = useState([]);
  const [loginData, setLoginData] = useState([]);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [key, setKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);
  const [isResponsive, setIsResponsive] = useState(false);
  const [isResponsiveTable, setIsResponsiveTable] = useState(false);
  const [isResponsiveButtons, setIsResponsiveButtons] = useState(false);


  const { socket } = useSocket();
  const { balance, setBalance } = useBalance();
  const { setTheme, theme } = useContext(ThemeContext);
  const bgsidebar = theme === "light" ? wab : bar;
  
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, activeTab]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user && !balance) {
      setBalance(user.balance);
    }
  
    if (socket) {
      // Escucha el evento de actualización de balance
      socket.on('balanceUpdated', (data) => {
  
        // Verificar si la actualización es para el usuario actual
        if (data.login === user?.login) {
          setBalance(data.balance);
        }
  
        // Actualizar el balance del jugador correspondiente en la lista
        updatePlayerBalance(data);
      });
  
      return () => {
        socket.off('balanceUpdated');
      };
    }
  }, [socket, user, setBalance, balance, activeTab]);

  const updatePlayerBalance = (data) => {
    const { login, balance } = data;
  
    // Actualizar el estado correspondiente dependiendo de la pestaña activa
    if (activeTab === 'users') {
      setAllUserData((prevData) => {
        return prevData.map(item => 
          item.login === login ? { ...item, balance: balance } : item
        );
      });
    } else if (activeTab === 'agents') {  
      setAllAgentData((prevData) => {
        return prevData.map(item => 
          item.login === login ? { ...item, balance: balance } : item
        );
      });
    } else if (activeTab === 'admins') {
      setAllAdminData((prevData) => {
        return prevData.map(item => 
          item.login === login ? { ...item, balance: balance } : item
        );
      });
    }
  };


  useEffect(() => {
    // Función que verifica el tamaño de la pantalla
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 768);
      setIsResponsiveTable(window.innerWidth <= 926);
      setIsResponsiveButtons(window.innerWidth <= 1000);
    };
    // Añade un listener para detectar el cambio de tamaño
    window.addEventListener("resize", handleResize);

    // Llama la función al cargar para establecer el estado inicial
    handleResize();

    // Limpia el listener al desmontar el componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    try {
      let response;
      const userId = user._id; 
  
      switch (activeTab) {
        case 'users':
          response = await axiosD.get('/getUsers', { 
            params: { 
              page: currentPage, 
              limit: pageSize,
              userId: userId 
            } 
          });
          setTotalPages(response.data.totalPages || 1);
          setAllUserData(response.data.allData || []);
          setUserData(response.data.data || []);

          break;
        case 'agents':
          response = await axiosD.get('/getAgents', { 
            params: { 
              page: currentPage, 
              limit: pageSize,
              userId: userId 
            } 
          });
          

          setAllAgentData(response.data.allData || []);
          setTotalPages(response.data.totalPages || 1);
          setAgentData(response.data.data || []);

          break;
        case 'admins':
          response = await axiosD.get('/getAdmins', { 
            params: { 
              page: currentPage, 
              limit: pageSize,
              userId: userId 
            } 
          });

          setAllAdminData(response.data.allData || []);
          setTotalPages(response.data.totalPages || 1);
          setAdminData(response.data.data || []);

          break;
        default:
          break;
      }
  
      const loginResponse = await axiosD.post('/getLogin', {login :user.login});
      setLoginData(loginResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al obtener los datos');
    }
  };
  



   const filteredData = useMemo(() => {
    const filter = globalFilter.toLowerCase();
    let data = [];

    switch (activeTab) {
      case 'users':
        data = allUserData;
        break;
      case 'agents':
        data = allAgentData;
        break;
      case 'admins':
        data = allAdminData;
        break;
      default:
        break;
    }

    return data.filter(item => 
      item.login.toLowerCase().includes(filter)
    ).slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [globalFilter, activeTab, allUserData, allAgentData, allAdminData, currentPage, pageSize]);
  useEffect(() => {
    // Establece el número de elementos visibles a la longitud de filteredData inmediatamente
    setVisibleItems(filteredData.length);
  
  }, [filteredData]);
;

  // const renderPageNumbers = () => {
  //   const pageNumbers = [];
  //   for (let i = 1; i <= totalPages; i++) {
  //     pageNumbers.push(
  //       <PageNumberButton
  //         key={i}
  //         active={i === currentPage}
  //         onClick={() => handlePageChange(i)}
  //       >
  //         {i}
  //       </PageNumberButton>
  //     );
  //   }
  //   return pageNumbers;
  // };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let maxPageNumbers; // Máximo de números de página a mostrar

if (isResponsive || isResponsiveTable) {
  maxPageNumbers = 5;
} else if (isResponsiveButtons) {
  maxPageNumbers = 7;
} else {
  maxPageNumbers = 10; 
} 
    const halfMax = Math.floor(maxPageNumbers / 2); // Mitad del máximo

    let startPage, endPage;

    // Lógica para determinar el rango de páginas a mostrar
    if (totalPages <= maxPageNumbers) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= halfMax) {
        startPage = 1;
        endPage = maxPageNumbers;
      } else if (currentPage + halfMax >= totalPages) {
        startPage = totalPages - maxPageNumbers + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfMax;
        endPage = currentPage + halfMax;
      }
    }

    // Asegurarse de que los límites de las páginas son válidos
    startPage = Math.max(startPage, 1);
    endPage = Math.min(endPage, totalPages);

    // Crear los botones de página
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PageNumberButton
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PageNumberButton>
      );
    }

    return pageNumbers;
  };


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const handleDepositSuccess = () => {
    fetchData(); // Actualiza los datos de la tabla después de un depósito
  };

  const handleWithdrawSuccess = () => {
    fetchData(); // Actualiza los datos de la tabla después de un retiro
  };

  const handleActionSuccess = () => {
    fetchData();
  };

  const handleOperation = (type, row) => {
    setSelectedUser(row.original);

    if (type === 'up') {
      setWithdrawModalOpen(false);
      setDepositModalOpen(true);
    } else if (type === 'down') {
      setWithdrawModalOpen(true);
      setDepositModalOpen(false);
    }
  };

  const handleAction = (row) => {
    setSelectedUser(row.original);
    setActionsModalOpen(true); 
  };

  const handleTabChange = (tab) => {
    setIsTableVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      fetchData();
      setCurrentPage(1); 
      setIsTableVisible(true); 
    }, 100);
  };

//region HTML

  return (
    <Container className="container"  bgImage={bgsidebar} shouldAnimate={shouldAnimate}>
    <div className="navcont" >
      <h1 key={key} >
      {!isResponsive ? 
            (activeTab === 'users' ? 'Jugadores' : activeTab === 'agents' ? 'Agentes' : 'Administradores')
            : null}
      </h1>
      {isResponsive ? <NavBarAgentAdminResposive /> : <NavBarAgentAdmin />}
      </div>
      <Toaster />
      <GlobalFilter
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      <TabContainer>
        <TabButton
          active={activeTab === 'users'}
          onClick={() => handleTabChange('users')}
        >
          Usuarios
        </TabButton>
        {user.rol !== 'Agente' && (
        <TabButton
          active={activeTab === 'agents'}
          onClick={() => handleTabChange('agents')}
        >
          Agentes
        </TabButton>
         )}
        {user.rol !== 'Agente' && (
          <TabButton
            active={activeTab === 'admins'}
            onClick={() => handleTabChange('admins')}
          >
            Administradores
          </TabButton>
        )}
      </TabContainer>

      <TableContainer isVisible={isTableVisible}>
        <HeaderRow>
          <HeaderCell>Usuario</HeaderCell>
          <HeaderCell>Saldo</HeaderCell>
          <HeaderCell>Operaciones</HeaderCell>
          <HeaderCell>Acciones</HeaderCell>
        </HeaderRow>
        {filteredData.slice(0, visibleItems).map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className='divuser'>
                {item.login}
              </div>
            </TableCell>
            <TableCell>
              {/* <div className='divbalance'>
                {item.balance && item.balance ? parseFloat(item.balance).toFixed(2) : '0.00'}
              </div> */}
              <div className='divbalance'>
    ${item.balance ? new Intl.NumberFormat('es-AR').format(parseFloat(item.balance).toFixed(2)) : '0.00'}
</div>
            </TableCell>
            <TableCell>
              <div className='cont-div-icon'>
              <AiOutlineUpCircle className="icon" onClick={() => handleOperation('up', { original: item })} />
              <AiOutlineDownCircle className="icon" onClick={() => handleOperation('down', { original: item })} />
              </div>
            </TableCell>
            <TableCellAction>
              <button className="action-button" onClick={() => handleAction({ original: item })}>
                <AiOutlineMore className="icon" />
              </button>
            </TableCellAction>
          </TableRow>
        ))}
{!isResponsive ? (

    <DivPagination>
    <PageSizeSelector value={pageSize} onChange={handlePageSizeChange}>
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={30}>30</option>
      <option value={40}>40</option>
      <option value={50}>50</option>
    </PageSizeSelector>

      <PaginationContainer>   
      <PageButton onClick={() => handlePageChange(currentPage - 5)}>{"<<"}</PageButton>
      <PageButton onClick={() => handlePageChange(currentPage - 1)}>{"<"}</PageButton>
      {renderPageNumbers()}
      <PageButton onClick={() => handlePageChange(currentPage + 1)}>{">"}</PageButton>
      <PageButton onClick={() => handlePageChange(currentPage + 5)}>{">>"}</PageButton>
    </PaginationContainer>
    </DivPagination>

) : (
  <PaginationWrapper>
      <PaginationContainerR>

      <PageSizeSelector value={pageSize} onChange={handlePageSizeChange}>
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={30}>30</option>
      <option value={40}>40</option>
      <option value={50}>50</option>
    </PageSizeSelector>

        {renderPageNumbers()} {/* Renderiza los números de página aquí */}
      </PaginationContainerR>

      <DivPaginationButtonR>
        <PageButton onClick={() => handlePageChange(currentPage - 5)}>{"<<"}</PageButton>
        <PageButton onClick={() => handlePageChange(currentPage - 1)}>{"<"}</PageButton>
        <PageButton onClick={() => handlePageChange(currentPage + 1)}>{">"}</PageButton>
        <PageButton onClick={() => handlePageChange(currentPage + 5)}>{">>"}</PageButton>
      </DivPaginationButtonR>
    </PaginationWrapper>
)}


        
      </TableContainer>


      {selectedUser && (
        <>
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            user={selectedUser}
            adminData={loginData}
            onSuccess={handleDepositSuccess}

          />
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            user={selectedUser}
            adminData={loginData}
            onSuccess={handleWithdrawSuccess}
          />
         <ActionsModal
            isOpen={actionsModalOpen}
            onClose={() => setActionsModalOpen(false)}
            user={selectedUser}
            onSuccess={handleActionSuccess}
          />
        </>
      )}
    </Container>
  );
}

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

//region ESTILOS.









//region container




const Container = styled.div`
  background: url(${(props) => props.bgImage}) no-repeat center center;
  background-size: cover; 
background-attachment: fixed;
  font-family: Arial, sans-serif;
  padding: 15px 80px 80px 80px;
  overflow: hidden;
  min-height: 1080px;

  h1 {
    color: ${props => props.theme.text};
    font-size: 1.5rem;
    transition: opacity 0.2s ease-out, transform 0.3s ease-out; 
    animation: ${props => (props.shouldAnimate ? fadeInFromLeft : 'none')} 0.6s ease-out forwards;
    text-shadow: 12px 12px 12px rgba(0, 0, 0, 0.5);
  }
 
  .navcont{
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   align-items: center;
  }
   
    @media (max-width: 926px) {
    overflow: hidden;
    padding-top: 0px;
    padding-left: 5px;
    padding-right: 5px;

    h1 {
      font-size: 1.25rem; 
    }
  }

  @media (max-width: 768px) {
    overflow: hidden;
    padding-top: 0px;
    padding-left: 5px;
    padding-right: 5px;


    h1 {
      font-size: 1.25rem; 
    }
  }
`;

//region search container
const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
  width: auto;

  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const SearchInput = styled.input`
  width: 400px;
  padding: 8px;
  margin-right: 0;
  margin-bottom: 12px;
  border-radius: 5px;
  border: 1px solid red; 
  background-color: transparent; 
  color: ${props => props.theme.text};
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 1px solid  ${props => props.theme.gray300};
  animation: ${sliderRight} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
  
  @media (max-width: 768px) {
    width: 225px;
    padding: 8px; 
    border-radius: 4px;
    }

    @media (max-width: 480px) {
    width: 225px;
      padding: 8px; 
      border-radius: 4px;
    }
`;

const IconLupa = styled(AiOutlineSearch)`
    flex-direction: row;
    justify-content: center;
    margin-top: -40px;
    display: flex;
    margin-left: 370px;
 color: ${props => props.theme.bgtabicon};; 
 transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
 animation: ${sliderRight} 2s ease-out;
    @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    margin-top: -40px;
    display: flex;
    margin-left: 200px;
    margin-bottom: 12px;
    }

    @media (max-width: 480px) {
    flex-direction: row;
    justify-content: center;
    margin-top: -40px;
    display: flex;
    margin-left: 200px;
    margin-bottom: 12px;

    }

`;

//region create button

const CreateUserButton = styled.button`
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

  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
    transform: scale(0.9);
    box-shadow: none;
  }

    @media (max-width: 480px) {
  margin-right: 15px;
  padding: 8px 4px;

    }

`;

//region tab button

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 0;
  justify-content: flex-start;
  animation: ${slideDown} 0.5s ease-out;


  @media (max-width: 768px) {
   
  }
`;

const TabButton = styled.button`
  background: ${props => (props.active ? props.theme.bgtabbuttonactive : props.theme.bgtabbutton)};
  color: ${props => (props.active ? props.theme.tabbuttoncolor : props.theme.tabbuttoncolor )};
  border: none;
  border-radius: 10px 20px 0 0;
  padding: 7px 20px;
  margin-right: 0;
  margin-bottom: 0;
  cursor: pointer;
  position: relative;
  top: 1px;
  transition: background-color 0.4s ease, color 0.8s ease, transform 0.3s ease, box-shadow 0.6s ease;
 box-shadow: ${props => (props.active ? 'none' : '0px -4px 2px 2px rgba(0, 0, 0, 0.6)')};

  &:first-child {
    border-left: 0px solid #ddd;
  }

  &:not(:last-child) {
    border-right: none;
  }

  &:active{
    box-shadow: none;
  }

  &:hover {
    background: ${props => (props.active ? props.theme.tabbuttoncolorhover : props.theme.tabbuttoncolorhover)};
    transform: scale(1.03);
    box-shadow: none;
  }

  @media (max-width: 768px) {
    
  }
`;

//region tablas 
const TableContainer = styled.div`
  background-color:${props => props.theme.bgtablecontainer};
  padding: 15px;
  overflow-x: auto;
  border-bottom-right-radius: 15px;
  border-bottom-left-radius: 15px;
  border-top-right-radius: 15px; 
  box-shadow: 8px 24px 32px rgba(0, 0, 0, 0.6);
  animation: ${sliderLeft} 1.5s ease-out;
  

  transition: opacity 1s ease-out;

  opacity: ${props => (props.isVisible ? 1 : 0)};
  transform: ${props => (props.isVisible ? 'translateX(0)' : 'translateX(0px)')};

  @media (max-width: 768px) {
    padding: 10px; /* Reducido para pantallas más pequeñas */
  }
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
    padding: 8px;
  }
`;

const HeaderCell = styled.div`
  flex: 1;
  padding: 5px;
  text-align: start;
  margin-left: 50px;
  font-size: 0.8rem;


  @media (max-width: 768px) {
    margin-left:5px;
    padding: 2px; 
    font-size: 0.70rem; 
  }
`;

const TableRow = styled.div`
  display: flex;
  border-bottom: 1px solid #666;
  padding: 10px;
  justify-content: flex-start;

  @media (max-width: 768px) {
    padding: 30px 0px;
  }
`;

const TableCell = styled.div`
  flex: 1;
  padding: 10px;
  color: #fff;
  text-align: left;
  font-size: 0.8rem;

  .cont-div-icon{
    @media (max-width: 1950px) {
  margin-left: -50px
  }

  @media (max-width: 1830px) {
  margin-left: -30px
  }

    @media (max-width: 1400px) {
  margin-left: 0px
  }
}

  @media (max-width: 768px) {
    overflow: hidden;
    padding: 8px;
    font-size: 0.705rem;
    text-align: left;
  }
    }  

.iconuser{
  margin-bottom: 12px;
  margin-right: 5px;
  color: ${props => props.theme.bgtabicon};
  font-size: 25px;
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  animation: ${slideDown} 1.5s ease-out;

  @media (max-width: 768px) {
  margin-top: 10px;
    font-size: 22px; 
  }
}

.divuser{
display: flex;
text-align: center;
align-items: center;
           transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
      animation: ${slideDown} 1.5s ease-out;
  @media (max-width: 768px) {
  margin-top: 17px;
  }

}

.divbalance{
margin-top: 12px;
display: flex;
text-align: center;
align-items: center;
           transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
      animation: ${slideDown} 1.5s ease-out;
      
  @media (max-width: 768px) {
  margin-top: 15px;
    font-size: 15px; 
  }

}



.icon{
  border: none;
  cursor: pointer;
  margin-top: 12px;
  color: ${props => props.theme.bgtabicon};
  padding: 0;
  font-size: 25px;
        transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
      animation: ${slideDown} 1.5s ease-out;
          &:hover {
    transform: scale(0.9);
  filter: none

  }

  @media (max-width: 768px) {
    font-size: 32px; 
  }
};

`;


const TableCellAction = styled.div`
  flex: 0.5;
  padding: 5px;
  color: #fff;
  margin-right: 20px;
  font-size: 20px;

  .action-button{
  border: none;
  background-color: transparent; 
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  margin: 0;
  margin-left: -100px;

  &:hover {
    color: #ddd;
  }

    @media (max-width: 1700px) {
  margin-left: -60px;
  }

  @media (max-width: 1500px) {
  margin-left: -50px;
  }


      @media (max-width: 1300px) {
  margin-left: -0px;
  }

  @media (max-width: 768px) {
  margin-left: -10px;
    font-size: 20px; 
  }
}

  @media (max-width: 768px) {
    max-width: 100px;
    overflow: hidden;
    padding: 8px;
    font-size: 0.705rem;
  }
`;

//region paginación

const DivPagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  animation: ${fadeInFromLeft} 0.6s ease-out forwards;

`;

const DivPaginationR = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  animation: ${fadeInFromLeft} 0.6s ease-out forwards;

`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  animation: ${slideDown} 0.5s ease-out;

`;

const PaginationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px; 
  animation: ${slideDown} 0.5s ease-out;
`;

const PaginationContainerR = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: space-between;
`;

const DivPaginationButtonR = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: space-between;
`;


const PageButton = styled.button`
  background-color: transparent; /* Sin fondo */
  color: ${props => props.theme.bgtabicon};
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1rem; /* Tamaño de fuente para números */
  transition: color 0.3s ease, transform 0.3s ease;
  animation: ${sliderRight} 1s ease-out;


  &:hover {
    color: darkred; /* Cambiar a un rojo más oscuro al pasar el ratón */
    transform: scale(1.1);
  }

  &:disabled {
    color: lightgray; /* Color para los botones deshabilitados */
    cursor: not-allowed;
  }
`;

const PageSizeSelector = styled.select`
  background-color: ${props => props.theme.bgtabbutton};
  color: ${props => props.theme.tabbuttoncolor};
  border: none;
  border-radius: 4px;
  padding: 2px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  animation: ${sliderLeft} 1s ease-out;


  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
  }

  option {
    background-color: ${props => props.theme.bgtabbutton};
    color: ${props => props.theme.tabbuttoncolor};
  }
`;

const PageNumberButton = styled(PageButton)`
  background-color: transparent; /* Sin fondo para números */
  color: ${props => props.active ? props.theme.bgtabbutton : props.theme.text }; /* Rojo si activo, negro si no */
`;


