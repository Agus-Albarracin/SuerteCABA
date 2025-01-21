import React, { useState, useContext, useEffect, useRef } from 'react';
import axiosD from '../axiosDefault';
import bar from "../assets/1.jpg";
import wab from "../assets/2.png";
import { ThemeContext } from "../App";
import { styled } from 'styled-components';
import { NavBarAgentAdmin } from "../components/HomeComponents/NavbarAgentAdmin";
import { NavBarAgentAdminResposive } from '../components/HomeComponents/NavbarAgentAdminResponsive';
import { CrearUsuarioModal} from './Usuarios/ModalCrearUsuario';
import { DepositModal, WithdrawModal } from '../components/Modals';
import toast, { Toaster } from 'react-hot-toast';
import { AiOutlinePlusCircle, AiOutlineMinusCircle} from "react-icons/ai";


import * as echarts from 'echarts';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { useAuth } from '../Context';

const groupByDate = (data, interval) => {
  const grouped = {};

  data.forEach(item => {
    const date = new Date(item.fecha);
    let period;

    switch (interval) {
      case 'day':
        period = format(startOfDay(date), 'yyyy-MM-dd');
        break;
      case 'week':
        period = format(startOfWeek(date), 'yyyy-MM-dd') + ' to ' + format(endOfWeek(date), 'yyyy-MM-dd');
        break;
      case 'month':
        period = format(date, 'yyyy-MM');
        break;
      case 'year':
        period = format(date, 'yyyy');
        break;
      default:
        period = format(date, 'yyyy-MM-dd');
    }

    if (!grouped[period]) {
      grouped[period] = 0;
    }
    grouped[period] += item.monto;
  });

  return Object.keys(grouped).map(key => ({ period: key, total: grouped[key] }));
};

const calculateIncomeData = (depositsData, withdrawalsData, interval) => {
  const depositGrouped = groupByDate(depositsData, interval);
  const withdrawalGrouped = groupByDate(withdrawalsData, interval);

  const depositMap = {};
  const withdrawalMap = {};
  const incomeMap = {};

  depositGrouped.forEach(item => {
    depositMap[item.period] = (depositMap[item.period] || 0) + item.total;
  });

  withdrawalGrouped.forEach(item => {
    withdrawalMap[item.period] = (withdrawalMap[item.period] || 0) + item.total;
  });

  Object.keys(depositMap).forEach(period => {
    incomeMap[period] = (incomeMap[period] || 0) + depositMap[period];
  });

  Object.keys(withdrawalMap).forEach(period => {
    incomeMap[period] = (incomeMap[period] || 0) - withdrawalMap[period];
  });

  const periods = new Set([...Object.keys(depositMap), ...Object.keys(withdrawalMap)]);
  const result = Array.from(periods).map(period => ({
    period,
    deposit: depositMap[period] || 0,
    withdrawal: withdrawalMap[period] || 0,
    income: incomeMap[period] || 0
  }));

  return result;
};

export function Finanzas() {
  const [isResponsive, setIsResponsive] = useState(false);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [timeInterval, setTimeInterval] = useState('month');
  const [dailyProfitsChartData, setDailyProfitsChartData] = useState([]);
  const [bestFinancesData, setBestFinancesData] = useState([]);




  const { setTheme, theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null); 



  const [activeModal, setActiveModal] = useState(null);
  const [username, setUsername] = useState(''); 
  const [userModal, setUserModal] = useState(null); 
  const [adminData, setAdminData] = useState(user); 

  const bgsidebar = theme === "light" ? wab : bar;

  const handleOpenModal = async (modalType) => {
    if (!username) {
      toast.error("Por favor ingresa un nombre de usuario.");
      return;
    }

    
    try {
      const response = await axiosD.post('/getLogin', { login: username });
      if (!response.data) {
        toast.error("No se pudo encontrar el usuario.");
        return;
      }
      setUserModal(response.data);
      setActiveModal(modalType); 
    } catch (error) {
      console.error('Error al buscar el usuario', error);
      toast.error("No se pudo encontrar el usuario.");
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setUsername(''); 
    setUserModal(null); 
  };

  const handleOpenModalCrear = (modalType) => {
    setActiveModal(modalType);
  };




  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { 

    const fetchNetwin = async () => {
      try {
        const responseNetwin = await axiosD.post('/getFinancesAllUser', { supervisor: user._id });
    
       
        const transformedData = [];
    
        for (const [date, values] of Object.entries(responseNetwin.data)) {
          transformedData.push({
            fecha: [date], 
            resultados: {
              Admin: values.Admin.total || 0,
              Agente: values.Agente.total || 0,
              Jugador: values.Jugador.total || 0,
            }
          });
        }
    
        setDailyProfitsChartData(transformedData);
      } catch (error) {
        console.error("Error fetching netwin data:", error);
      }
    };

    const fetchBestFinances = async () => {
      try {
        const responseBestFinances = await axiosD.post('/getBestFinancesUser', { supervisor: user._id });
  
       
        setBestFinancesData(responseBestFinances.data);
        
      } catch (error) {
        console.error("Error al obtener las mejores finanzas:", error);
      }
    };
  

    const fetchDatosFinancieros = async () => {
      try {
        const response = await axiosD.post('/getFin', { _id: user._id });
        const { data } = response; 
    
    
        
        if (Array.isArray(data.finanzasUsuario)) {
          const finanzasUsuario = data.finanzasUsuario;
    
          
          const totalDepositos = finanzasUsuario
            .filter(item => item.tipo === 'deposito') 
            .reduce((acc, item) => acc + item.monto, 0); 
    
         
          const totalRetiros = finanzasUsuario
            .filter(item => item.tipo === 'retiro') 
            .reduce((acc, item) => acc + item.monto, 0); 
    
         
          const balance = totalDepositos - totalRetiros;
    
          setTotalDeposits(totalDepositos)
          setTotalWithdrawals(totalRetiros)
    
    
        } else {
          console.error("finanzasUsuario no es un array:", data.finanzasUsuario);
        }
      } catch (error) {
        console.error("Error al obtener datos financieros:", error);
      }
    };

    fetchDatosFinancieros();
    fetchNetwin();
    fetchBestFinances(); 
  }, [user, timeInterval]);

  const [previousMonthWin, setPreviousMonthWin] = useState(0);
const [currentMonthWin, setCurrentMonthWin] = useState(0);
const [percentageChange, setPercentageChange] = useState(0);
const [isImprovement, setIsImprovement] = useState(null);

useEffect(() => {
    const initializeChart1 = () => {
      if (!chartRef1.current || !dailyProfitsChartData || dailyProfitsChartData.length === 0) {

        return;
      }
  
      const chartInstance = echarts.init(chartRef1.current);
      const isMobile = window.innerWidth < 926;
  
      const fechas = dailyProfitsChartData.map(data => data.fecha[0]);
      const jugadorData = dailyProfitsChartData.map(data => data.resultados?.Jugador || 0);
  
      const options = {
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '15%',
          right: isMobile ? '20%' : '14%',
          bottom: '20%',
        },
        legend: {
          data: ['NetWin'],
          top: '5%',
        },
        xAxis: {
          type: 'category',
          data: fechas,
          axisLabel: {
            rotate: isMobile ? 45 : 0,
            fontSize: isMobile ? 10 : 12,
            interval: isMobile ? 1 : 'auto',
          },
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'NetWin',
            type: 'line',
            data: jugadorData,
            lineStyle: { width: 2 },
          },
        ],
      };
  
      chartInstance.setOption(options);
      chartInstance.resize();
    };
  
    initializeChart1();
  
    window.addEventListener('resize', initializeChart1);
    
    return () => {
      window.removeEventListener('resize', initializeChart1);
    };
  }, [dailyProfitsChartData]);

  useEffect(() => {
    const initializeChart2 = () => {
      if (!chartRef2.current || !dailyProfitsChartData || dailyProfitsChartData.length === 0) {

        return;
      }
  
      const chartInstance = echarts.init(chartRef2.current);
      const isMobile = window.innerWidth < 926;
  
  
      const monthlyData = {};
  
      dailyProfitsChartData.forEach(data => {
        const fecha = new Date(data.fecha[0]);
        const monthYear = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`; 
  
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { Jugador: 0 };
        }
  
        monthlyData[monthYear].Jugador += data.resultados?.Jugador || 0;
      });
  
   
      const fechas = Object.keys(monthlyData);
      const jugadorData = Object.values(monthlyData).map(data => data.Jugador);
  
     
      const currentMonth = fechas[fechas.length - 1]; 
      const previousMonth = fechas[fechas.length - 2]; 
      setCurrentMonthWin(monthlyData[currentMonth]?.Jugador || 0);
      setPreviousMonthWin(monthlyData[previousMonth]?.Jugador || 0);
  
     
      if (previousMonthWin) {
        const change = ((currentMonthWin - previousMonthWin) / previousMonthWin) * 100;
        setPercentageChange(change);
        setIsImprovement(change > 0);
      } else {
        setPercentageChange(0);
        setIsImprovement(null); 
      }
  
      const options = {
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '15%',
          right: isMobile ? '20%' : '14%',
          bottom: '20%',
        },
        legend: {
          data: ['NetWin'],
          top: '5%',
        },
        xAxis: {
          type: 'category',
          data: fechas,
          axisLabel: {
            rotate: isMobile ? 45 : 0,
            fontSize: isMobile ? 10 : 12,
            interval: isMobile ? 1 : 'auto',
          },
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'NetWin',
            type: 'line',
            data: jugadorData,
            lineStyle: { width: 2 },
          },
        ],
      };
  
      chartInstance.setOption(options);
      chartInstance.resize();
    };
  
    initializeChart2();
  
    window.addEventListener('resize', initializeChart2);
  
    return () => {
      window.removeEventListener('resize', initializeChart2);
    };
  }, [dailyProfitsChartData, previousMonthWin, currentMonthWin]);

  




  
  
  return (

    !isResponsive ? (
      
      <Container bgImage={bgsidebar}>
      <div><Toaster/></div>

      <NavBarAgentAdmin bg={bgsidebar} />
      <Div>

      <ChartWrapper>
      <p>Carga rápida</p>

          <ButtonModalCrear onClick={() => handleOpenModalCrear('crearUsuario')}>Crear usuario</ButtonModalCrear>
          <InlineWrapper>

            <InputModal
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div>
             <StyledUpCircle onClick={() => handleOpenModal('deposit')} />
             <StyledDownCircle onClick={() => handleOpenModal('withdraw')} />
           </div>
          </InlineWrapper>

          {activeModal === 'crearUsuario' && (
            <CrearUsuarioModal isOpen={true} onClose={handleCloseModal} />
          )}
          {activeModal === 'deposit' && userModal && (
            <DepositModal 
              isOpen={true} 
              onClose={handleCloseModal} 
              user={userModal} 
              adminData={adminData} 
              onSuccess={() => {  }}
            />
          )}
          {activeModal === 'withdraw' && userModal && (
            <WithdrawModal 
              isOpen={true} 
              onClose={handleCloseModal} 
              user={userModal} 
              adminData={adminData} 
              onSuccess={() => { }}
            />
          )}
        </ChartWrapper>
      {/* <ChartWrapper>
      <p>Ganancias Neta</p>

  <DivMesDiff > 
    <h3 style={{ color: 'black' }}>NetWin del Mes Pasado: ${previousMonthWin ? previousMonthWin.toFixed(2) : '00.00'}</h3>
    <h3 style={{ color: 'black' }}>NetWin del Mes Actual: ${currentMonthWin.toFixed(2)}</h3>
    <ChangeRectangle isImprovement={isImprovement}>
      <h3 style={{ margin: 0 }}> 
        {isImprovement !== null ? (
          <>
            {isImprovement ? Math.abs(percentageChange.toFixed(2)) : '00.00'}%
          </>
        ) : '00.00%'}
      </h3>
    </ChangeRectangle>
  </DivMesDiff>
</ChartWrapper> */}



        {/* <ChartWrapper>
          <p>Netwin Diario</p>
          <div  className="chart" ref={chartRef1} style={{ height: '400px', width: '100%', marginTop: "10%" }}></div>
        </ChartWrapper> */}

        {/* <ChartWrapper>
          <p>NetWin Mensual</p>
          <div className="chart" ref={chartRef2} style={{ height: '400px', width: '100%', marginTop: "10%"  }}></div>
        </ChartWrapper> */}


      </Div>
    </Container>
   
   )  : (
    <ContainerR bgImage={bgsidebar}>
      <div><Toaster/></div>

    <NavBarAgentAdminResposive bg={bgsidebar} />
    <DivR>
    <ChartWrapperR4>
      <p>Carga rápida</p>

          <ButtonModalCrear onClick={() => handleOpenModalCrear('crearUsuario')}>Crear usuario</ButtonModalCrear>
          <InlineWrapper>

            <InputModal
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div>
             <StyledUpCircle onClick={() => handleOpenModal('deposit')} />
             <StyledDownCircle onClick={() => handleOpenModal('withdraw')} />
           </div>
          </InlineWrapper>

          {activeModal === 'crearUsuario' && (
            <CrearUsuarioModal isOpen={true} onClose={handleCloseModal} />
          )}
          {activeModal === 'deposit' && userModal && (
            <DepositModal 
              isOpen={true} 
              onClose={handleCloseModal} 
              user={userModal} 
              adminData={adminData} 
              onSuccess={() => {  }}
            />
          )}
          {activeModal === 'withdraw' && userModal && (
            <WithdrawModal 
              isOpen={true} 
              onClose={handleCloseModal} 
              user={userModal} 
              adminData={adminData} 
              onSuccess={() => { }}
            />
          )}
        </ChartWrapperR4>


    {/* <ChartWrapperR2>
    <p>Ganancias Neta</p>

  <DivMesDiffR style={{ marginTop: "15%"}}>
    <h3 style={{ color: 'black', fontSize: '14px' }}>NetWin del Mes Pasado: ${previousMonthWin ? previousMonthWin.toFixed(2) : '00.00'}</h3>
    <h3 style={{ color: 'black', fontSize: '14px' }}>NetWin del Mes Actual: ${currentMonthWin.toFixed(2)}</h3>
    <ChangeRectangle isImprovement={isImprovement}>
      <h3 style={{ margin: 0 }}> 
        {isImprovement !== null ? (
          <>
            {isImprovement ? Math.abs(percentageChange.toFixed(2)) : '00.00'}%
          </>
        ) : '00.00%'}
      </h3>
    </ChangeRectangle>
  </DivMesDiffR>
</ChartWrapperR2>
      
       <ChartWrapperR>
    <p>Netwin Diario</p>
         <div className="chart" ref={chartRef1} style={{ height: '400px', width: '100%', marginTop: "15%"  }}></div>
       </ChartWrapperR>
 
       <ChartWrapperR>
       <p>NetWin Mensual</p>
         <div className="chart" ref={chartRef2} style={{ height: '400px', width: '100%', marginTop: "15%"  }}></div>
       </ChartWrapperR> */}

    </DivR>
  </ContainerR>
   ) 
  );
}

const Container = styled.div`
  background-image: url(${props => props.bgImage});
  margin-bottom: 10%;
  height: 100%;
  margin-left: 1%;
  margin-right: 1%;
   display: flex;
  flex-wrap: wrap; 
  justify-content: flex-end;
  
`;

const DivMesDiff = styled.div`
  border: 1px solid #ccc; 
  padding: 20px;
  border-radius: 8px; 
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
  margin-left: 12%;
`;



const ChangeRectangle = styled.div`
  background-color: ${({ isImprovement }) => (isImprovement ? 'green' : 'red')}; 
  color: white; 
  padding: 10px 20px; 
  border-radius: 8px;
  text-align: center; 
  margin-top: 10px; 
`;

const Div = styled.div`
background-color: white;
border-radius: 10px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
width: 100%;
padding: 20px;
margin: 0 auto;
gap: 20px;
  display: flex;
  flex-wrap: wrap; 
  gap: 20px;
  justify-content: center
`;

const ChartWrapper = styled.div`
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: flex-start; 
  width: 100%; 
  margin-top: 20px;
  margin-bottom: 20px; 
  width: 500px; 
  height: 400px; 
  background-color: #f0f0f0; /
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3); 
  position: relative;

  .chart{
  margin-top: 25%;
  }


  p {
    background-color:  #997300;;
    color: white;
    padding: 10px;
    position: absolute;
    top: 7%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(-50%); 
    text-align: center;
    width: 350px; 
  }
`;

const ContainerR = styled.div`
  background-image: url(${props => props.bgImage});
  margin-bottom: 10%;
  height: 100vh; 
  margin-left: 1%;
  overflow-y: auto;
  overflow-x: hidden; /* Evitar el scroll horizontal */
  -webkit-overflow-scrolling: touch;
`;


const DivR = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  display: flex;
  flex-wrap: wrap; 
  justify-content: space-between; 
  margin-bottom: 10%;
`;

const ChartWrapperR = styled.div`
  margin-bottom: 20px;
  width: 90%;
  margin-right: 5%;
  margin-left: 5%;
  min-height: 500px; 
  background-color: #f1f1f1; 
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  -webkit-overflow-scrolling: touch;
  
  .chart{
  margin-top: 25%;
  }


    p {
    background-color:  #997300;;
    color: white;
    padding: 10px;
    position: absolute;
    top: 7%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(-50%); 
    text-align: center;
    width: 250px;
  }
s

        @media (max-width: 415px) {
    width: 97%; 
  }

           @media (max-width: 413px) {
    width: 90%; 
  }

            @media (max-width: 391px) {
    width: 90%; 
  }

              @media (max-width: 385px) {
    width: 80%; 
  }


  
    @media (max-width: 376px) {
    width: 90%; 
  }
    
    @media (max-width: 361px) {
    width: 74%; 
  }

      @media (max-width: 320px) {
    width: 65%; 
  }

`;

const ChartWrapperR2 = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  width: 90%;
  margin-right: 5%;
  margin-left: 5%;
  min-height: 300px; 
  background-color: #f0f0f0; 
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3); 
  position: relative;
  -webkit-overflow-scrolling: touch;
  

    p {
    background-color:  #997300;;
    color: white;
    padding: 10px;
    position: absolute;
    top: 7%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(-50%);
    text-align: center;
    width: 250px; 
  }


  @media (max-width: 415px) {
    width: 97%;

  }

             @media (max-width: 413px) {
    width: 90%; 
  }


            @media (max-width: 391px) {
    width: 90%; 
  }
              @media (max-width: 385px) {
    width: 80%; 
  }


       @media (max-width: 376px) {
    width: 90%; 
  }

      @media (max-width: 361px) {
    width: 74%; 
  }

        @media (max-width: 320px) {
    width: 65%; 
  }

`;

const ChartWrapperR4 = styled.div`
  margin-bottom: 20px;
  width: 90%;
  margin-right: 5%;
  margin-left: 5%;
  margin-top: 15%;
  min-height: 300px; 
  background-color: #f1f1f1; 
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  -webkit-overflow-scrolling: touch;
  
  .chart{
  margin-top: 25%;
  }


    p {
    background-color:  #997300;;
    color: white;
    padding: 10px;
    position: absolute;
    top: 7%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(-50%); 
    text-align: center;
    width: 250px;
  }



          @media (max-width: 415px) {
    width: 97%; 
  }
   
             @media (max-width: 413px) {
    width: 90%; 
  }


          @media (max-width: 391px) {
    width: 90%; 
  }

              @media (max-width: 385px) {
    width: 80%; 
  }


 
       @media (max-width: 376px) {
    width: 90%; 
  }

      @media (max-width: 361px) {
    width: 74%; 
  }
      @media (max-width: 320px) {
    width: 65%; 
  }

`;


const DivMesDiffR = styled.div`
  border: 1px solid #ccc; 
  padding: 25px;
  margin: 15%;
  border-radius: 8px; 
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
`;



const InlineWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px; 
  margin-top: 10%;

  @media (max-width: 768px) {
    width: 90%; 
  }

  @media (max-width: 480px) {
    width: 89%; 
  }
`;

const InputModal = styled.input`
  width: calc(70% - 40px); 
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const ButtonModalCrear = styled.button`
  width: 150px; 
  display: flex;
  justify-content: center; 
  align-items: center; 
  background-color: ${(props) => props.theme.primary};
  color: #fff;
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin: 0 auto; 

  &:hover {
    background-color: ${(props) => props.theme.primaryDark};
    transform: scale(0.9);
  }
  
  @media (max-width: 768px) {
    margin-top: 20%; 
  }

  @media (max-width: 480px) {
    margin-top: 20%;
  }

`;

const StyledUpCircle = styled(AiOutlinePlusCircle)`
  font-size: 3rem; 
  color:  #997300; 
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

const StyledDownCircle = styled(AiOutlineMinusCircle)`
  font-size: 3rem; 
  color: #997300; 
  cursor: pointer;

  &:hover {
    transform: scale(1.1); 
  }
`;