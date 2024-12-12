import styled from "styled-components";
import logo from "../assets/logo-navbar.png";
import logodark from "../assets/logo-navbardark.png";
import { v } from "../styles/Variables";
import {
  AiOutlineRight,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineUserAdd,
  AiOutlineTeam ,
} from "react-icons/ai";
import { MdOutlineAnalytics,MdMenu, MdLogout,
         MdOutlineRequestQuote, MdReportGmailerrorred ,MdOutlineCurrencyExchange   } from "react-icons/md";
import { AiOutlineClose  } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context';

export function SidebarResponsive({ sidebarOpen, setSidebarOpen}) {

  const [responsiveMode, setResponsiveMode] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

 useEffect(() => {
 setSidebarOpen(false);
 },[])


  const handleResize = () => {
    setResponsiveMode(window.innerWidth <= 768);
  };

  window.addEventListener('resize', handleResize);

  const { setTheme, theme } = useContext(ThemeContext);
  

  const logoToUse = theme === "light" ? logo : logodark;

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label, to) => {
    if (openMenus[label]) {
      setOpenMenus({ ...openMenus, [label]: false });
    } else {
      setOpenMenus({ ...openMenus, [label]: true });
      if (label === 'Usuarios') {
        navigate('/vistas');
      }
    }
  };

  const handleLogout = () => {
    navigate('/Admin');
    setTimeout(() =>{logout(); }, 1000)
    
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }
  const handleSidebarOpen = () => {
    setSidebarOpen(true)
  }

  //#region Data links
const linksArray = user?.rol === 'Agente' ? [

  {
    label: "Usuarios",
    icon: <AiOutlineUser />,
    to: "/vistas",
    subLinks: [
      {
        label: "Crear Usuarios",
        icon: <AiOutlineUserAdd />,
        to: "/usuarios/crear",
      },
      {
        label: "Ver usuarios",
        icon: <AiOutlineTeam />,
        to: "/vistas",
      },
    ],
  },
  {
    label: "Movimientos",
    icon: <MdOutlineCurrencyExchange />,
    to: "/movs",
  },
  {
    label: "Finanzas",
    icon: <MdOutlineAnalytics />,
    to: "/Finanzas",
  }
] : [

  {
    label: "Usuarios",
    icon: <AiOutlineUser />,
    to: "/vistas",
    subLinks: [
      {
        label: "Crear Usuarios",
        icon: <AiOutlineUserAdd />,
        to: "/usuarios/crear",
      },
      {
        label: "Ver usuarios",
        icon: <AiOutlineTeam />,
        to: "/vistas",
      },
    ],
  },
  {
    label: "Movimientos",
    icon: <MdOutlineCurrencyExchange />,
    to: "/movs",
  },
  // {
  //   label: "Estadisticas",
  //   icon: <MdOutlineAnalytics />,
  //   to: "/estadisticas",
  // },
  {
    label: "Finanzas",
    icon: <MdOutlineRequestQuote />,
    to: "/finanzas",
  },
  {
    label: "Reportes",
    icon: <MdReportGmailerrorred />,
    to: "/reportes",
  },
];
const secondarylinksArray = [
  ...(user?.rol === 'Super'? [{
    label: "Configuración",
    icon: <AiOutlineSetting />,
    to: "/set",
  }] : []),
  {
    label: "Salir",
    icon: <MdLogout />,
    to: "/admin",
  },
];

//#endregion


  return (
    <Container isOpen={sidebarOpen} themeUse={theme}>

      <div className="Logocontent">
        <div className="imgcontent">
          <img src={logoToUse} width="40px" />
        </div>
        <h2>SKARYBET</h2>
      </div>
      {linksArray.map(({ icon, label, to, subLinks }) => (
        <div key={label}>
          <div className={`LinkContainer ${(!sidebarOpen && 'responsive-menu')}`}
          >
            <NavLink
              to={to}
              className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
              title={label}
              onClick={(e) => {
                if(sidebarOpen === false && subLinks ){handleSidebarOpen();}
                if(sidebarOpen === false && !subLinks ){handleSidebarOpen();}
                if(sidebarOpen === true && !subLinks){() =>{handleSidebarClose()}}
                if (subLinks) {
                  e.preventDefault();
                  toggleMenu(label);
                }else{
                  if(sidebarOpen === true){
                    handleSidebarClose();}
                }
              }}
              >

              {sidebarOpen &&
              <div className="divspanarrow">
                  <div className="Linkicon">{icon}</div>
                <span>{label}</span>
                {subLinks && <AiOutlineRight className={`toggleIcon ${openMenus[label] ? "open" : ""}`} />}
              </div>
                }
              
            </NavLink>
          </div>
          
          <div
            className={`SubLinksContainer ${
              openMenus[label] ? "open" : "closed"
            }`}
          >
            {subLinks &&
              subLinks.map(({ icon, label, to }) => (
                <div className={`SubLinkContainer ${(!sidebarOpen && 'responsive-menu')}`} key={label}>

                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `Links${isActive ? ` active` : ``}`
                    }
                    title={label} // Añadir propiedad title
                    onClick={()=>{
                      handleSidebarOpen()
                      setOpenMenus({});
                      handleSidebarToggle()}}
                  >
                    <div className="Linkicon">{icon}</div>
                    {sidebarOpen && <span>{label}</span>}
                  </NavLink>
                </div>
              ))}
          </div>
        </div>
      ))}

      <Divider />
      {secondarylinksArray.map(({ icon, label, to }) => (
      <div className={`LinkContainer ${(!sidebarOpen && 'responsive-menu')}`} key={label}>
      
          
          <NavLink
            to={to}
            className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
            onClick={() => 
              label === "Salir" 
                ? handleLogout() 
                : (handleSidebarOpen(), setOpenMenus({}), handleSidebarToggle())
            }
          >
            {sidebarOpen && <div className="Linkicon">{icon}</div>}
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        </div>
      ))}

    </Container>
  );
}


//#region STYLED COMPONENTS
const Container = styled.div`
  color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.bg};
  display: flex;
  flex-direction: column;
  position: sticky;
  padding-top: 20px;
  height: auto;

  .Sidebarbutton {
    position: absolute;
    top: 90px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${(props) => props.theme.bgtgderecha};
    box-shadow: 0 0 4px ${(props) => props.theme.bg3},
      0 0 7px ${(props) => props.theme.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 1.0s;
    transform: ${({ isOpen }) => (isOpen ? `initial` : `rotate(180deg)`)};
    border: none;
    letter-spacing: inherit;
    color: inherit;
    font-size: inherit;
    text-align: inherit;
    padding: 0;
    font-family: inherit;
    outline: none;
  }
   
  .Logocontent {
    display: flex;
    justify-content: center;
    align-items: center;


    padding-bottom: 10px;
    .imgcontent {
      display: flex;
      img {
        max-width: 100%;
        height: auto;
      }
      cursor: pointer;
      transition: all 0.3s;
      transform: ${({ isOpen }) => (isOpen ? `scale(0.7)` : `scale(1.5)`)};
    }
    h2 {
      display: ${({ isOpen }) => (isOpen ? `block` : `none`)};
    }
  }


  .LinkContainer {
    margin: 0px 0;
    padding: 5px;
    &:hover {
      background: ${(props) => props.theme.bg3};
      border-radius: 10px;
    }
  }

  .Links {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: 0px;
      color: ${(props) => props.theme.text};
      height:50px;
      font-size: 12px;


      .Linkicon {
        padding: ${v.smSpacing} ${v.mdSpacing};
        display: flex;
        color: ${(props) => props.theme.bgicon};

                svg { font-size: 20px; }

      }

      &:hover .Linkicon svg {
        color: ${(props) => props.theme.text};
      }

      &.active {
        border-radius: 10px;
        
        .Linkicon {
          svg { color: ${(props) => props.theme.bgiconactive}; }
        }
          

      }


    .toggleIcon {
      width: 30px;
      transition: transform 0.3s ease;
      &.open {
        transform: rotate(90deg);
      }
    }
  }

  .divspanarrow{
  display: flex;
  align-items: center;
  font-size: 12px;
  justify-content: space-between;
  width: 100%;
  }
  .divspanarrow span {
    flex-grow: 1;
  }

  .SubLinksContainer {
    padding-left: 20px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 1.0s ease, opacity 0.5s ease;
    opacity: 0;
    &.open {
    max-height: 500px;
    opacity: 1;
    }

    .SubLinkContainer {
      margin: 8px 0;
      padding: 0 5%;

      .Links {
        display: flex;
        align-items: center;
        text-decoration: none;
        padding: 10px 0px;
        color: ${(props) => props.theme.text};
        height: 40px;

        .Linkicon {
          padding: 5px 8px;

          display: flex;
          color: ${(props) => props.theme.bgicon};

          svg {
            font-size: 20px;
          }
        }

        &.active {
          background: ${(props) => props.theme.bg5};
          border-radius: 10px;
          box-shadow: 0 0 4px ${(props) => props.theme.bg3},
            0 0 7px ${(props) => props.theme.bg};

          .Linkicon {
            svg {
              color: ${(props) => props.theme.bgiconactive};
            }
          }
        }
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
//#endregion