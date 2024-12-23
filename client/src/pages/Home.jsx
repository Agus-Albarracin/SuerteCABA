import styled, { keyframes } from 'styled-components';
import React, { useState, useEffect, useContext, useCallback, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosD from '../axiosDefault';
import { useAuth } from '../Context';
import { NavBar } from '../components/HomeComponents/Navbar';
import { SubNavbar } from '../components/HomeComponents/SubNavbar'
import { SubNavbarSelect } from '../components/HomeComponents/SubNavbarSelect'

import { FullScreenCarousel } from "../components/HomeComponents/Carousel";
import { NavBarResponsive } from '../components/HomeComponents/NavbarResponsive';



import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PacmanLoader from "react-spinners/PacmanLoader";
import home1 from "../assets/home1.png"
import home2 from "../assets/home2.png"
import { ThemeContext } from "../App";

//icon import categories:
import { AiFillHeart,  AiOutlineHeart, AiFillCloseCircle } from 'react-icons/ai';
import { FaBasketballBall } from "react-icons/fa";
import { FaGamepad, FaDice, FaRobot } from "react-icons/fa";
import { GiConsoleController, GiPokerHand,  } from "react-icons/gi";
import { FaFire, FaRegGem, FaClock, FaHeart } from 'react-icons/fa';

//region ICON imports
import iconArcade from "../assets/ICON-ARCADE.png"
import iconCarta from "../assets/ICON-CARTA.png"
import iconCasino from "../assets/ICON-CASINOENVIVO.png"
import iconDeportivas from "../assets/ICON-DEPORTIVAS.png"
import iconFavoritos from "../assets/ICON-FAVORITOS.png"
import iconPopulares from "../assets/ICON-POPULARES.png"
import iconRecientes from "../assets/ICON-RECIENTES.png"
import iconTodos from "../assets/ICON-TODOS.png"
import iconTragamonedas from "../assets/ICON-TRAGAMONEDAS.png"

import iconFavoritosBlack from "../assets/ICON-FAVORITOS-BLACK.png"
import iconPopularesBlack from "../assets/ICON-POPULARES-BLACK.png"
import iconRecientesBlack from "../assets/ICON-RECIENTES-BLACK.png"
import iconTodosBlack from "../assets/ICON-TODOS-BLACK.png"

//region IMG imports

import imgCarta from "../assets/IMG-CARTAS.png"
import imgCasinoEnVivo  from "../assets/IMG-CASINOENVIVO.png"
import imgDeportivas from "../assets/IMG-DEPORTIVAS.png"
import imgTragamonedas from "../assets/IMG-TRAGAMONEDAS.png"

//region RESPONSIVE

export const ThemeContext2 = React.createContext(null);

export function Home() {
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(true);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [popularGames, setPopularGames] = useState([]);
  const [gamesToShow, setGamesToShow] = useState(18);
  const [recentGames, setRecentGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#FFFF00");
  const [allGames, setAllGames] = useState([]);
  const [gameList, setGameList] = useState([]);
  const [gameListEscritorio, setGameListEscritorio] = useState([]);
  const [isCategorySelected, setIsCategorySelected] = useState(false);

  const [popular, setPopular] = useState([]);
  const [titles, setTitles] = useState([]);

  const iframeRef = useRef(null);
  const [isFullScreenIOS, setFullScreenIOS] = useState(false); 

const [showMoreButton , setShowMoreButton ] = useState(true);


  const { setTheme, theme } = useContext(ThemeContext);
  const bgHome = theme === "light" ? home2 : home1;
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isResponsive, setIsResponsive] = useState(false);



  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 926);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

const categorySections = {
  section1: ['slots', 'otros'],
  section2: ['arcade', 'fast_games'],
  section3: ['live_dealers', 'lottery', 'roulette'],
  section4: ['sport'],
  section5: ['card', 'video_poker']
};




  useEffect(() => {
    if (user && (user.rol === 'Admin' || user.rol === 'Agente' || user.rol === "Super")) {
      toast.error("Los permisos son incorrectos.")
      logout();
      navigate('/');
    }

    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const fetchData = async () => {
      try {
        setLoading(true); // Iniciar carga
        const response = await axiosD.post('/getGamesList', {});
        if (response.data && response.data.gamesList && response.data.gamesList.content && response.data.gamesList.content.gameList) {
          const getAllgames = response.data.gamesList.content.gameList;
          const shuffledTitles = shuffleArray(response.data.gamesList.content.gameTitles);

// IDs que se deben filtrar
const excludedIds = [11675, 12559];

// Filtrar juegos con nombres duplicados, excluir ciertos IDs y mostrar juegos con "novomatic" en el título
const filteredGames = getAllgames.reduce((acc, game) => {
  if (
    !acc.some(g => g.name === game.name) && // Filtrar nombres duplicados
    !excludedIds.includes(parseInt(game.id)) // Excluir juegos con IDs específicos
  ) {
    acc.push(game);
  }
  return acc;
}, []);


setAllGames(filteredGames);
          setTitles(shuffledTitles);
          setGameList(shuffleArray); // Inicialmente mostrar los primeros juegosToShow
          setGameListEscritorio(shuffleArray)
        } else {
          console.error('Error fetching games list: Invalid data format');
        }
        
        // Obtener los juegos más populares
        const popularResponse = await axiosD.get('/popular-games');
        if(popularResponse.data){
          const { data } = popularResponse;
          setPopularGames(data.popularGames);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Finalizar carga
      }
    };

    fetchData();
  }, [ user, navigate]);

  
  //region Carga de Juego

  //solo carga algunas categorias para despues LoadMore cargar mas categorias
  
  // useEffect(() => {
  //   if (allGames.length > 0) {
  //     // Barajar (mezclar) los juegos
  //     const shuffledGames = shuffleArray(allGames);
      
  //     // Actualizar el estado con los juegos desordenados
  //     setGameList(shuffledGames);
  
  //     // Establecer categorías únicas para los títulos
  //     setUniqueCategories(getUniqueCategories(allGames));
  //   }
  // }, [allGames]);
  useEffect(() => {
    if (allGames.length > 0) {
      // Definición de títulos de los proveedores para section1
      const titleSections = {
        section1: [
          'pragmatic', 'amatic', 'booming', 'aristocrat', 'firekirin', 'elkstudios', 
          'novomatic', 'rubyplay', 'evolution', 'pgsoft'
        ]
      };
  
      // Función para mezclar el arreglo de títulos
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]; // Intercambia los elementos
        }
      };
  
      // Mezclar los títulos de la section1
      const titlesToLoad = [...titleSections['section1']]; // Copiar para evitar modificar el original
      shuffleArray(titlesToLoad);
  
      // Seleccionar los primeros 3 títulos después de mezclarlos
      const selectedTitles = titlesToLoad.slice(0, 3);
  
      // Filtrar juegos que coinciden con los títulos seleccionados
      const filteredGames = allGames.filter(game => 
        selectedTitles.some(title => game.title.toLowerCase().includes(title.toLowerCase()))
      );
  
      // Mostrar los títulos seleccionados en consola
      console.log("Títulos seleccionados:", selectedTitles);
  
      // Actualizar setGameList con los juegos filtrados
      setGameList(filteredGames);
  
      // Preparar lista específica de 24 juegos para setGameListEscritorio
      let escritorioGames = [...filteredGames];
      if (escritorioGames.length < 24) {
        const additionalGames = allGames.filter(game => 
          !escritorioGames.some(filteredGame => filteredGame.id === game.id)
        );
  
        shuffleArray(additionalGames);
        escritorioGames = escritorioGames.concat(additionalGames.slice(0, 24 - escritorioGames.length));
      } else {
        escritorioGames = escritorioGames.slice(0, 24);
      }
  
      setGameListEscritorio(escritorioGames);
  
      // Establecer categorías únicas si es necesario
      setUniqueCategories(getUniqueCategories(filteredGames));
    }
  }, [allGames]);
  
  
  
  


  useEffect(() => {
    const storedGames = JSON.parse(localStorage.getItem('recentGames')) || [];
    const now = Date.now();
  
    // Filtrar juegos que tienen más de 24 horas
    const validStoredGames = storedGames.filter(g => now - g.timestamp < 24 * 60 * 60 * 1000);
    setRecentGames(validStoredGames);
  }, []);


  const shuffleArray = (array) => {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filteredGames = allGames.filter((game) =>
      game.name.toLowerCase().includes(value)
    );

    setGameList(filteredGames); // Mostrar juegos filtrados
    setGameListEscritorio(filteredGames); // Mostrar juegos filtrados

  };


  const [gameUrl, setGameUrl] = useState('');
  const [isGameOpen, setIsGameOpen] = useState(false); // Estado para controlar la visibilidad del iframe

  const handleGameClick = async (gameId, game) => {
    if (!user) {
      toast.error("Debe iniciar sesión"); // Notificación de error
      return;
    }
    if (user.balance <= 25){
      toast.error("El saldo no es suficiente")
      return;
    }
  
    try {
      await axiosD.post('/increment-clicks', { name: game.name });
  
      const response = await axiosD.post('/openGame', {
        login: user.login,
        gameId: gameId,
      });
  
  
      if (response.data) {
        const newGameUrl = response.data.content.game.url;
        // window.open(newGameUrl, '_blank'); // Abre la URL en una nueva pestaña
        setGameUrl(newGameUrl); // Actualiza el estado con la nueva URL del juego
        setIsGameOpen(true); // Muestra el iframe
  
        const now = Date.now();
        const newGame = { ...game, timestamp: now };
  
        setRecentGames(prevRecentGames => {
          const updatedGames = [newGame, ...prevRecentGames.filter(g => now - g.timestamp < 24 * 60 * 60 * 1000 && g.id !== gameId)].slice(0, 10);
  
          localStorage.setItem('recentGames', JSON.stringify(updatedGames));
          return updatedGames;
        });
      } else {
        console.error('Error opening game:', response.data.error);
      }
    } catch (error) {
      console.error('Error opening game:', error);
    }
  };

  // Función para cerrar el iframe
  const handleCloseGame = () => {
    setIsGameOpen(false); // Oculta el iframe
    setGameUrl(''); // Limpia la URL del juego
  };

  const handleTitlesClick = (title) => {
    if (!user) {
      toast.error("Debe iniciar sesión"); // Notificación de error
      return;
    }
  
    // Mostrar en console.log todos los labels antes de ejecutar la función
    const allLabels = allGames.map(game => game.label).filter(Boolean);
    
    // Transformar "Pragmatic Play Live" a "pragmatic_live"
    let transformedTitle = title;
    if (title === "Pragmatic Play Live") {
      transformedTitle = "pragmatic_live";
    }
  
    setSelectedTitle(transformedTitle);
  
    // Filtrar los juegos según la categoría seleccionada
    const filteredGames = transformedTitle
      ? allGames.filter((game) => {
          // Si el título es "novomatic", buscar labels que contengan "novomatic"
          if (transformedTitle.toLowerCase() === "novomatic") {
            return game.label && game.label.toLowerCase().includes("novomatic");
          }
          // Para el resto, hacer una búsqueda exacta
          return game.label && game.label === transformedTitle;
        })
      : allGames;
  
  
    setGameList(filteredGames.slice(0, gamesToShow)); // Mostrar juegos filtrados con el número actual
    setGameListEscritorio(filteredGames.slice(0, gamesToShow)); // Mostrar juegos filtrados con el número actual

  };
  

  // const loadMoreGames = useCallback(() => {
  //   if (loading) return; // Evita cargar si ya está cargando
  //   setLoading(true); // Iniciar la carga
  
  //   // Incrementar el contador de juegos mostrados
  //   setGamesToShow(prevGamesToShow => prevGamesToShow + 9);
  
  //   // Definición de categorías de las secciones
  //   const categorySections = {
  //     section1: ['slots', 'otros'],
  //     section2: ['arcade', 'fast_games'],
  //     section3: ['live_dealers', 'lottery', 'roulette'],
  //     section4: ['sport'],
  //     section5: ['card', 'video_poker']
  //   };
  
  //   // Etiquetas de proveedores
  //   const providerLabels = [
  //     "pragmatic", "amatic", "scientific_games", "fast_games", "live_dealers",
  //     "fish", "novomatic", "aristocrat", "apollo", "vegas", "tomhorn",
  //     "microgaming", "ainsworth", "quickspin", "yggdrasil", "netent",
  //     "habanero", "igt", "igrosoft", "apex", "merkur", "wazdan", "egt",
  //     "roulette", "bingo", "keno", "table_games", "kajot", "zitro", "rubyplay",
  //     "playngo", "elkstudios", "firekirin", "platipus", "evolution", "pgsoft",
  //     "playson", "altente", "booming", "galaxsys", "spribe", "pragmatic_play_live"
  //   ];
  
  //   // Determinar si se filtra por un proveedor o por categorías
  //   let filteredGames = [];
  
  //   if (providerLabels.includes(selectedTitle)) {
  //     // Filtrar por el título del proveedor
  //     filteredGames = allGames.filter(game => game.title === selectedTitle);
  //   } else {
  //     // Filtrar por categorías correspondientes al `selectedTitle`
  //     const labelsToFilter = categorySections[selectedTitle] || [];
  //     filteredGames = labelsToFilter.length > 0
  //       ? allGames.filter(game => labelsToFilter.includes(game.categories))
  //       : allGames;
  //   }
  
  
  //   // Actualizar la lista de juegos
  //   setGameList(prevGameList => {
  //     const moreGames = shuffleArray(filteredGames.slice(prevGameList.length, prevGameList.length + 72));
  
  
  //     const updatedGameList = [...prevGameList, ...moreGames];
  
  //     // Verificar si se alcanzó el límite de juegos
  //     if (updatedGameList.length >= filteredGames.length) {
  //       setShowMoreButton(false); // Ocultar botón si no hay más juegos
  //     }
  
  //     return updatedGameList;
  //   });
  
  //   setLoading(false); // Finalizar la carga
  // }, [loading, allGames, selectedTitle, gameList]);
  const loadMoreGames = useCallback(() => {
    if (loading) return; // Evita cargar si ya está cargando
    setLoading(true); // Iniciar la carga
  
    // Definición de todos los títulos
    const allTitles = [
      'pragmatic', 'amatic', 'booming', 'sagaming', 'holi_bet', 'scientific_games', 'galaxsys', 'aviatrix', 'spribe', 
      'aristocrat', 'firekirin', 'elkstudios', 'Pragmatic Play Live', 'zitro', 'playngo', 'microgaming', 'netent', 
      'altente', 'playson', 'apollo', 'platipus', 'kajot', 'vegas', 'tomhorn', 'ainsworth', 'evolution', 'pgsoft', 
      'quickspin', 'habanero', 'yggdrasil', 'novomatic', 'rubyplay', 'fish', 'live_dealers', 'fast_games', 'wazdan', 
      'egt', 'roulette', 'bingo', 'keno', 'table_games', 'igt', 'igrosoft', 'apex', 'merkur'
    ];
  
    // Obtener las secciones ya cargadas
    const loadedTitles = new Set(gameList.map(game => game.title.toLowerCase()));
  
    // Filtrar los títulos que aún no se han cargado
    const remainingTitles = allTitles.filter(title => !loadedTitles.has(title.toLowerCase()));
  
    if (remainingTitles.length === 0) {
      setShowMoreButton(false); // Si ya se han cargado todos los títulos, ocultar el botón
      setLoading(false);
      return;
    }
  
    // Mezclar los títulos restantes aleatoriamente
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambia los elementos
      }
    };
  
    shuffleArray(remainingTitles);
  
    // Seleccionar los primeros 3 títulos restantes
    const titlesToLoad = remainingTitles.slice(0, 3);
  
    // Filtrar los juegos de los títulos seleccionados
    let filteredGames = allGames.filter(game =>
      titlesToLoad.some(title => game.title.toLowerCase().includes(title.toLowerCase()))
    );
  
    // Actualizar la lista de juegos
    setGameList(prevGameList => {
      const updatedGameList = [...prevGameList, ...filteredGames];
  
      // Verificar si se alcanzó el límite de juegos
      if (updatedGameList.length >= allGames.length) {
        setShowMoreButton(false); // Ocultar botón si no hay más juegos
      }
  
      return updatedGameList;
    });

    setGameListEscritorio(prevGameList => {
      const updatedGameList = [...prevGameList, ...filteredGames];
  
      // Verificar si se alcanzó el límite de juegos
      if (updatedGameList.length >= allGames.length) {
        setShowMoreButton(false); // Ocultar botón si no hay más juegos
      }
  
      return updatedGameList;
    });
  
    setLoading(false); // Finalizar la carga
  }, [loading, allGames, gameList]);
  

  
  useEffect(() => {
    setGamesToShow(200);
    setShowMoreButton(true)
  }, [selectedTitle]);
  // Log de actualización de gameList
  
  useEffect(() => {
    if (gameList.length > 0) {
      window.scrollBy({
        top: 400,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [gameList]);

  const handleFavoriteClick = (game, index) => {
    if (!user) {
      return;
    }
    // Función para mostrar la notificación de agregar a favoritos
    const addFav = `idAddFave${index}`;
    const notifyAdded = () => toast("❤️ Se agregó a favoritos.", {
      toastId: addFav
    });
    
    // Función para mostrar la notificación de quitar de favoritos
    const removeFav = `idRemoveFave${index}`;
    const notifyRemoved = () => toast.warning("💔 Se quitó de favoritos.", {
      toastId: removeFav
    });
  
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(fav => fav.id === game.id);
  
      // Actualizar la lista de favoritos
      const updatedFavorites = isFavorite
        ? prevFavorites.filter(fav => fav.id !== game.id)
        : [...prevFavorites, game];
  
      // Guardar la lista actualizada en localStorage
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      // Mostrar notificación según la acción realizada
      if (isFavorite) {
        notifyRemoved();
      } else {
        notifyAdded();
      }
  
      return updatedFavorites;
    });
  };

  const getUniqueCategories = (allGames) => {
    const categoriesSet = new Set();

    allGames.forEach(game => {
      // Asegúrate de que 'categories' es un string y no esté vacío
      const categories = game.categories ? game.categories.trim() : '';
        if (categories) {
        // Si hay múltiples categorías separadas por comas, divídelas
        categories.split(',').forEach(category => {
          const cleanedCategory = category.trim() || "otros";
          categoriesSet.add(cleanedCategory);
        });
      } else {
        // Añade "Sin categoría" si no hay categorías
        categoriesSet.add("otros");
      }
    });
    return Array.from(categoriesSet);
  };

  const handleMenuOptions = (category) => {
    if (!user) {
      return;
    }

    if(category === selectedTitle){setSelectedTitle("")}
    else{if(category !== selectedTitle){setSelectedTitle(category)}}

  };

  const filterGamesByCategory = (section) => {

    // Obtener las categorías dentro de la sección seleccionada
    const categories = categorySections[section] || [];
    
    // Filtrar los juegos que pertenecen a cualquiera de las categorías en la sección seleccionada
    const filteredGames = allGames.filter(game => {
      // Asegurarse de que game.categories sea un array
      const gameCategories = Array.isArray(game.categories) ? game.categories : (typeof game.categories === 'string' ? game.categories.split(',').map(cat => cat.trim()) : []);
  
      return gameCategories.some(cat => categories.includes(cat));
    });
  
    setGameList(filteredGames.slice(0, gamesToShow)); // Mostrar juegos filtrados
    setGameListEscritorio(filteredGames.slice(0, gamesToShow)); // Mostrar juegos filtrados


  } 
  
  const handleTitleChange = (event) => {

    const title = event.target.value;
    if(title === "populares"){
      filterPopularGames()
    }
    setSelectedTitle(title);
    handleMenuOptions(title);
  };
  // Renderizar los botones de categorías
  // const renderCategoryButtons = () => {

  //   const sectionTitles = {
  //     section1: 'TRAGAMONEDAS',
  //     section2: 'ARCADE',
  //     section3: 'CASINO EN VIVO',
  //     section4: 'DEPORTIVAS',
  //     section5: 'CARTAS'
  //   };

  //   const smooth = () => {
  //        // Desplazar la ventana de visualización hacia abajo
  //  window.scrollBy({
  //   top: 600, // Cantidad de píxeles a desplazar hacia abajo
  //   left: 0,
  //   behavior: 'smooth' // Desplazamiento suave
  // });
  //   }
    
  //   return (
  //     <CategoriesMenu className="categories-menu">
  //       {Object.keys(categorySections).map((section) => (
  //       <CategoriesButton
  //         key={section}
  //         onClick={() => {
  //           handleMenuOptions(section);
  //           filterGamesByCategory(section);
  //           smooth();
  //         }}
  //       >
  //            {sectionIcons[section]}
  //           <div className="category-title">{sectionTitles[section]}</div>
  //         </CategoriesButton>
  //       ))}
  //     </CategoriesMenu>
  //   );
  // };
  // Renderizar los botones de categorías
  const renderCategoryButtons = () => {
    const sectionTitles = {
      section1: "TRAGAMONEDAS",
      section2: "ARCADE",
      section3: "CASINO EN VIVO",
      section4: "DEPORTIVAS",
      section5: "CARTAS",
    };
  
    const smooth = () => {
      // Desplazar la ventana de visualización hacia abajo
      window.scrollBy({
        top: 600, // Cantidad de píxeles a desplazar hacia abajo
        left: 0,
        behavior: "smooth", // Desplazamiento suave
      });
    };
  
    return (
      <CategoriesMenu className="categories-menu">
        {Object.keys(sectionTitles).map((section) => (
          <CategoriesButton
            key={section}
            onClick={() => {
              handleMenuOptions(section);
              filterGamesByCategory(section);
              smooth();
              setIsCategorySelected(true); // Establecer que una categoría fue seleccionada
            }}
          >
            <img
              src={sectionIcons[section]}
              alt={sectionTitles[section]}
              style={{
                width: "50px", // Ajusta el tamaño del icono
                height: "50px",
                objectFit: "contain",
              }}
            />
            <div className="category-title">{sectionTitles[section]}</div>
          </CategoriesButton>
        ))}
      </CategoriesMenu>
    );
  };
  

  const renderRecentGames = () =>{
    if (!user) {
      return;
    }
  return(
    <IconGamesDivContainer>
      {recentGames.length > 0 ? (
        recentGames.map((game, index) => (
          <RecentGameItem key={index}>
            <GameImage src={game.img} alt={game.name} onClick={() => handleGameClick(game.id, game)} />

            <GameName>{game.name}</GameName>
          </RecentGameItem>
        ))
      ) : (
        <p>No hay juegos recientes.</p>
      )}
    </IconGamesDivContainer>
  )}

  const FavoriteIcon = ({ onClick, isFavorite }) => (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      {isFavorite ? <AiFillHeart size={24} color="red" /> : <AiOutlineHeart size={24} color="gray" />}
    </div>
  );

  const renderFavoriteGames = () =>{
    if (!user) {
      return;
    }
   return(
    <IconGamesDivContainer>
      {favorites.length > 0 ? (
        favorites.map((game, index) => (
          <RecentGameItem key={index}>
            <GameImage src={game.img} alt={game.name} onClick={() => handleGameClick(game.id, game)} />
            <GameName>{game.name}</GameName>
            <FavoriteIcon
              onClick={() => handleFavoriteClick(game, index)}
              isFavorite={favorites.some(fav => fav.id === game.id)}
            />
          </RecentGameItem>
        ))
      ) : (
        <p>No tienes juegos favoritos.</p>
      )}
    </IconGamesDivContainer>
  )};

  const filterPopularGames = () => {
    const popularGameNames = popularGames.map(game => game.name);
    const filteredPopularGames = allGames.filter(game =>
      popularGameNames.includes(game.name)
    );


    setPopular(filteredPopularGames.slice(0, gamesToShow)); // Mostrar juegos populares filtrados
  };

  const renderPopularesGames = () =>{
    if (!user) {
      return;
    }
    
 return (
    
    <IconGamesDivContainer>
      {popular.length > 0 ? (
        popular.map((game, index) => (
          <RecentGameItem key={index}>
            <GameImage src={game.img} alt={game.name} onClick={() => handleGameClick(game.id, game)} />
            <GameName>{game.name}</GameName>
            <FavoriteIcon
              onClick={() =>handleFavoriteClick(game, index)}
              isFavorite={favorites.some(fav => fav.id === game.id)}
            />
          </RecentGameItem>
        ))
      ) : (
        <p>No hay juegos populares disponibles.</p>
      )}
    </IconGamesDivContainer>
  ) };
  
  const renderGamesEscritorio = () => {
    console.log(gameListEscritorio)
    if (gameListEscritorio.length === 0) {
      return (
        <div className="load-list-escritorio">
          <p>No hay juegos que mostrar</p>
        </div>
      );
    }

    const pattern = [
      "large", "large", "large",
    ];

    const repeatedPattern = [];
    let patternIndex = 0;

    for (let i = 0; i < gameListEscritorio.length; i++) {
      repeatedPattern.push(pattern[patternIndex]);
      patternIndex = (patternIndex + 1) % pattern.length;
    }

    return gameListEscritorio.map((game, index) => {
      const isFavorite = favorites.some(fav => fav.id === game.id);

      return (
        <div
          key={game.id}
          className={`game-item-escritorio ${repeatedPattern[index]}`}
          onClick={() => handleGameClick(game.id, game)}
        >
          {game.img ? (
            <img src={game.img} alt={game.name} />
          ) : (
            <p>Imagen no disponible</p>
          )}
          <button
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // Evita que el clic en el botón de corazón active el onClick del juego
              handleFavoriteClick(game, index);
            }}
          >
            {isFavorite ? <AiFillHeart size={24} color="red" /> : <AiOutlineHeart size={24} />}
          </button>
        </div>
      );
    });
  };

   // Función para alternar pantalla completa en otros navegadores
  //region renderGames
   const [expandedGroups, setExpandedGroups] = useState({}); // Estado para rastrear grupos expandidos
   const renderGames = () => {
    console.log(gameList);
  
    if (gameList.length === 0) {
      return (
        <div className="load-list">
          <p>No hay juegos que mostrar</p>
        </div>
      );
    }
  
    // Agrupar los juegos por `title`
    const groupedGames = gameList.reduce((acc, game) => {
      if (!acc[game.title]) {
        acc[game.title] = [];
      }
      acc[game.title].push(game);
      return acc;
    }, {});
  
    // Manejar la expansión de los grupos
    const handleToggleGroup = (title) => {
      setExpandedGroups((prev) => ({
        ...prev,
        [title]: !prev[title], // Alterna entre expandir/contraer
      }));
    };
  
    // Función para formatear el título
    const formatTitle = (title) => {
      return title
        .replace(/_/g, " ") // Reemplaza guiones bajos por espacios
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitaliza cada palabra
    };
  
    // Renderizar los grupos y los juegos
    return Object.entries(groupedGames).map(([title, games]) => {
      console.log("se muestra games", games);
      const isExpanded = expandedGroups[title] || false; // Verificar si el grupo está expandido
  
      return (
        <div key={title} className="game-group">
          <div className="group-header">
            <h2 className="game-title">{formatTitle(title)}</h2> {/* Formatear el título */}
            <button
              className="view-all-button"
              onClick={() => handleToggleGroup(title)}
            >
              {isExpanded ? "Ver menos" : "Ver todo"}
            </button>
          </div>
          <div className="games-row">
            {(isExpanded ? games : games.slice(0, 3)).map((game, index) => {
              const isFavorite = favorites.some((fav) => fav.id === game.id);
  
              return (
                <div
                  key={game.id}
                  className="game-item"
                  onClick={() => handleGameClick(game.id, game)}
                >
                  {game.img ? (
                    <img src={game.img} alt={game.name} />
                  ) : (
                    <p>Imagen no disponible</p>
                  )}
                  <button
                    className={`favorite-button ${
                      isFavorite ? "favorited" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que el clic en el botón de corazón active el onClick del juego
                      handleFavoriteClick(game, index);
                    }}
                  >
                    {isFavorite ? (
                      <AiFillHeart size={24} color="red" />
                    ) : (
                      <AiOutlineHeart size={24} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };
  

  const [expandedGroups2, setExpandedGroups2] = useState({}); // Estado para rastrear grupos expandidos
  const renderGames2 = () => {
   console.log(gameList);
 
   if (gameList.length === 0) {
     return (
       <div className="load-list">
         <p>No hay juegos que mostrar</p>
       </div>
     );
   }
 
   // Agrupar los juegos por `title`
   const groupedGames = gameList.reduce((acc, game) => {
     if (!acc[game.title]) {
       acc[game.title] = [];
     }
     acc[game.title].push(game);
     return acc;
   }, {});
 
   // Manejar la expansión de los grupos
   const handleToggleGroup = (title) => {
     setExpandedGroups2((prev) => ({
       ...prev,
       [title]: !prev[title], // Alterna entre expandir/contraer
     }));
   };
 
   // Función para formatear el título
   const formatTitle = (title) => {
     return title
       .replace(/_/g, " ") // Reemplaza guiones bajos por espacios
       .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitaliza cada palabra
   };
 
   // Renderizar los grupos y los juegos
   return Object.entries(groupedGames).map(([title, games]) => {
     console.log("se muestra games", games);
     const isExpanded = expandedGroups2[title] || false; // Verificar si el grupo está expandido
 
     return (
       <div key={title} className="game-group">
         <div className="group-header">
           <h2 className="game-title">{formatTitle(title)}</h2> {/* Formatear el título */}
           <button
             className="view-all-button"
             onClick={() => handleToggleGroup(title)}
           >
             {isExpanded ? "Ver menos" : "Ver todo"}
           </button>
         </div>
         <div className="games-row">
           {(isExpanded ? games : games.slice(0, 6)).map((game, index) => {
             const isFavorite = favorites.some((fav) => fav.id === game.id);
 
             return (
               <div
                 key={game.id}
                 className="game-item-escritorio2"
                 onClick={() => handleGameClick(game.id, game)}
               >
                 {game.img ? (
                   <img src={game.img} alt={game.name} />
                 ) : (
                   <p>Imagen no disponible</p>
                 )}
                 <button
                   className={`favorite-button ${
                     isFavorite ? "favorited" : ""
                   }`}
                   onClick={(e) => {
                     e.stopPropagation(); // Evita que el clic en el botón de corazón active el onClick del juego
                     handleFavoriteClick(game, index);
                   }}
                 >
                   {isFavorite ? (
                     <AiFillHeart size={24} color="red" />
                   ) : (
                     <AiOutlineHeart size={24} />
                   )}
                 </button>
               </div>
             );
           })}
         </div>
       </div>
     );
   });
 };
  
  
  
   const toggleFullScreen = (isFull) => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    if (
      (document.fullscreenElement && document.fullscreenElement !== null) ||
      (!document.mozFullScreen && !document.webkitIsFullScreen)
    ) {
      if (isFull === false) {
        return;
      }
      // Solicitar pantalla completa
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
      } else if (iframe.webkitRequestFullScreen) {
        iframe.webkitRequestFullScreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    } else {
      if (isFull === true) {
        return;
      }
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Sincronizar la altura de la ventana para iOS
  const syncWindowHeight = () => {
    if (window.pageYOffset !== 0) {
      localStorage.pageScroll = Math.round(window.pageYOffset);
    }

    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
      document.body.classList.add('disable-scroll');
      document.documentElement.classList.add('disable-scroll');
      setFullScreenIOS(false);  // No mostrar el overlay en modo vertical
    } else {
      document.body.classList.remove('disable-scroll');
      document.documentElement.classList.remove('disable-scroll');
      setFullScreenIOS(true);   // Mostrar el overlay en modo horizontal
    }

    setTimeout(() => {
      document.documentElement.style.setProperty(
        "--window-inner-height",
        `${window.innerHeight}px`
      );
    }, 100);
  };

  // Efecto para gestionar la pantalla completa en iOS y otros navegadores
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const webkit = !!ua.match(/WebKit/i);
    const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

    if (iOSSafari && isGameOpen) {
      syncWindowHeight();
      window.addEventListener('resize', syncWindowHeight);
      window.addEventListener('orientationchange', syncWindowHeight); // Para detectar cambios de orientación
    } else if (isGameOpen) {
      toggleFullScreen(true); // Activa pantalla completa en otros navegadores
    }

    return () => {
      window.removeEventListener('resize', syncWindowHeight);
      window.removeEventListener('orientationchange', syncWindowHeight);

      // Restablecer scroll al desmontar
      if (localStorage.pageScroll) {
        window.scrollTo(0, localStorage.pageScroll);
      }

      document.body.classList.remove('disable-scroll');
      document.documentElement.classList.remove('disable-scroll');
    };
  }, [isGameOpen]);

  //region RESPONSIVE 
const [selectedCategory, setSelectedCategory] = useState("");

const sectionIcons = {
  section1: iconTragamonedas,
  section2: iconArcade,
  section3: iconCasino,
  section4: iconDeportivas,
  section5: iconCarta,
};

const sectionTitles = {
  section2: 'ARCADE',
  section1: 'TRAGAMONEDAS',
  section5: 'CARTAS',
  section3: 'CASINO EN VIVO',
  section4: 'DEPORTIVAS',
};

const handleCategoryChange = (event) => {
  const section = event.target.value;
  if(section === 'section0'){
    setSelectedCategory(section)
    filterGamesByCategory(section);
    return
  }else{
    setSelectedCategory(section)
    handleMenuOptions(section);
    filterGamesByCategory(section);
  }

};

//region SectionChange
const handleSectionChange = (event) => {
  const section = event.target.value;

  // Ignorar sección "ARCADE" si está presente
  if (sectionTitles[section] === "ARCADE") {
    console.log("Sección ARCADE no se renderiza.");
    return;
  }

  if (section === "section0") {
    setSelectedCategory(section);
    filterGamesByCategory(section);
    return;
  } else {
    setSelectedCategory(section);
    handleMenuOptions(section);
    filterGamesByCategory(section);

    // Renderiza imágenes según la sección
    if (sectionImages[section]) {
      renderImage(sectionImages[section]);
    } else {
      console.error("Sección no reconocida o no válida:", section);
    }
  }
};

const sectionImages = {
  section1: imgTragamonedas,
  section5: imgCarta,
  section3: imgCasinoEnVivo,
  section4: imgDeportivas,
};

// Define los íconos para cada tema
const iconsLight = {
  populares: iconPopulares,
  recientes: iconRecientes,
  favoritos: iconFavoritos,
  todos: iconTodos,
};

const iconsDark = {
  populares: iconPopularesBlack,
  recientes: iconRecientesBlack,
  favoritos: iconFavoritosBlack,
  todos: iconTodosBlack,
};

// Selecciona los íconos según el tema
const icons = theme === "dark" ? iconsLight : iconsDark;


  return (

    !isResponsive ? (
      <Container bgImage={bgHome}>
      
      <NavBar />
      <FullScreenCarousel />
      <div>

      {/* {isGameOpen && (
        <IframeContainer>
          <StyledIframe src={gameUrl} ref={iframeRef}/>
          <CloseButton onClick={handleCloseGame}><AiFillCloseCircle /></CloseButton>
        </IframeContainer>
      )} */}

{isGameOpen && (
        <IframeContainer>
          <StyledIframe src={gameUrl} ref={iframeRef} allow="fullscreen"/>
          <CloseButton onClick={() =>{
          handleCloseGame()
          toggleFullScreen(false)}}>
            <AiFillCloseCircle />
          </CloseButton>

          {isFullScreenIOS && (
  <SafariHelperContainer className={`safarihelper-bg ${isFullScreenIOS ? 'active' : ''}`}>
    <div id="safarihelper" />
  </SafariHelperContainer>
)}
        </IframeContainer>
      )}
    </div>


      {showCategoriesMenu && renderCategoryButtons()}
      
      <SubNavbar categories={titles} onCategoryClick={handleTitlesClick} />


      <DivButtonTop>
        <InputSearch
          type="text"
          placeholder="Buscar juego por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {/* <IconBar value={selectedTitle} onChange={handleTitleChange}>
          <IconItem value="todos">🪟 Filtros</IconItem>
          <IconItem value="populares">🔥 Populares</IconItem>
          <IconItem value="Recientes">⌛ Recientes</IconItem>
          <IconItem value="favoritos">❤️ Favoritos</IconItem>
          <IconItem value="todos">🎰 Todos</IconItem>
        </IconBar> */}

          {/* Carrusel para Títulos */}
  <CarouselContainerEscritorio>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "populares" } })}
      isSelected={selectedTitle === "populares"}
    >
                  <img 
    src={icons.populares} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />

    </CarouselItem>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "Recientes" } })}
      isSelected={selectedTitle === "Recientes"}
    >
            <img 
    src={icons.recientes} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />
      
    </CarouselItem>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "favoritos" } })}
      isSelected={selectedTitle === "favoritos"}
    >
      <img 
    src={icons.favoritos} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />
    </CarouselItem>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "todos" } })}
      isSelected={selectedTitle === "todos"}
    >
      <img 
    src={icons.todos} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />
    </CarouselItem>
  </CarouselContainerEscritorio>

      </DivButtonTop>
      
      <DivButtonCenter>
      {selectedTitle === "Recientes" && renderRecentGames()}
      {selectedTitle === "populares" && popular && renderPopularesGames()}
      {selectedTitle === "favoritos" && favorites && renderFavoriteGames()}
      </DivButtonCenter>

      <TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>Mejores juegos</TitleText>
      <GradientLine className="gradient-right" />
</TitleContainer>

<div className={isCategorySelected ? "game-list-escritorio2" : "game-list-escritorio"}>
  {gameList && gameList.length > 0 ? (
    isCategorySelected ? (
      renderGames2()
    ) : (
      renderGamesEscritorio()
    )
  ) : (
    <div className="load-list">
      <p>No hay juegos que mostrar</p>
    </div>
  )}
</div>

      {/* <div className="game-list-escritorio">
        
        {gameList && gameList.length > 0 ? renderGamesEscritorio() :
          <div className="load-list">
            <p>No hay juegos que mostrar</p>
          </div>
        }
      </div> */}

      <DivButton>
      {showMoreButton && !loading && (
          <ButtonShowMore bgImage={bgHome} onClick={loadMoreGames}>Otros Juegos</ButtonShowMore>
        )}
        <div className="pacmanDiv">
          <PacmanLoader
            color={color}
            loading={loading}
            size={30}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </DivButton>

      <TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>Secciones</TitleText>
      <GradientLine className="gradient-right" />
</TitleContainer>

<CarouselContainerH>
  {Object.entries(sectionTitles)
    .filter(([, title]) => title !== "ARCADE") // Excluir ARCADE basado en el título
    .map(([section, title]) => (
      <CarouselItemH
        key={section}
        onClick={() => handleSectionChange({ target: { value: section } })}
        isSelected={selectedCategory === section}
      >
        <img 
          src={sectionImages[section]} 
          alt={title} 
          className="carousel-img" 
        />
      </CarouselItemH>
    ))}
</CarouselContainerH>

<CarouselContainerH>
  {Object.keys(sectionTitles).map((section) => (
    <CarouselItemH
      key={section}
      onClick={() => handleSectionChange({ target: { value: section } })}
      isSelected={selectedCategory === section}
    >
      {sectionTitles[section]}
    </CarouselItemH>
  ))}
</CarouselContainerH>

    </Container>
  ) : (
    <ContainerR bgHome={bgHome}>
      
    <NavBarResponsive />
    <FullScreenCarousel />

    {/* <SubNavbarSelect categories={titles} onCategoryClick={handleTitlesClick} /> */}
    
    <div>


{isGameOpen && (
        <IframeContainer>
          <StyledIframe src={gameUrl} ref={iframeRef} allow="fullscreen" />
          <CloseButton onClick={() =>{
          handleCloseGame()
          toggleFullScreen(false)}}>
            <AiFillCloseCircle />
          </CloseButton>

          {isFullScreenIOS && (
  <SafariHelperContainer className={`safarihelper-bg ${isFullScreenIOS ? 'active' : ''}`}>
    <div id="safarihelper" />
  </SafariHelperContainer>
)}
        </IframeContainer>
      )}
  </div>


  <DivButtonTopR>


  {/* Carrusel para Títulos */}
  <CarouselContainer>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "populares" } })}
      isSelected={selectedTitle === "populares"}
    >
                  <img 
    src={icons.populares} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />

    </CarouselItem>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "Recientes" } })}
      isSelected={selectedTitle === "Recientes"}
    >
            <img 
    src={icons.recientes} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />
      
    </CarouselItem>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "favoritos" } })}
      isSelected={selectedTitle === "favoritos"}
    >
      <img 
    src={icons.favoritos} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />
    </CarouselItem>
    <CarouselItem
      onClick={() => handleTitleChange({ target: { value: "todos" } })}
      isSelected={selectedTitle === "todos"}
    >
      <img 
    src={icons.todos} 
    alt="Icono de Cartas" 
    style={{
      width: "50px", // Ajusta el tamaño de la imagen
      height: "50px", 
      objectFit: "contain"
    }}
  />
    </CarouselItem>
  </CarouselContainer>
</DivButtonTopR>



  <DivButtonCenterR>
        {selectedTitle === "Recientes" && renderRecentGames()}
        {selectedTitle === "populares" && popular && renderPopularesGames()}
        {selectedTitle === "favoritos" && favorites && renderFavoriteGames()}
  </DivButtonCenterR>

      <InputSearchR
          type="text"
          placeholder="Buscar juego por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
    <SubNavbar categories={titles} onCategoryClick={handleTitlesClick} />

<TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>Mejores juegos</TitleText>
      <GradientLine className="gradient-right" />
</TitleContainer>

    {gameList.length > 0 ? (
           <div className="game-list">
           {gameList && gameList.length > 0 ? renderGames() :
             <div className="load-list">
               <p>No hay juegos que mostrar</p>
             </div>
           }
         </div>
    ) : (
      <NoGamesR>No se encontraron juegos</NoGamesR>
    )}

{loading ? (
<LoaderWrapperR>
  <PacmanLoader color={color} loading={loading} size={25} />
</LoaderWrapperR>
) : showMoreButton && (
<LoadMoreButtonR onClick={loadMoreGames}>
  Otros Juegos
</LoadMoreButtonR>
)}

{/* Carrusel para Categorías */}

<TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>Secciones</TitleText>
      <GradientLine className="gradient-right" />
</TitleContainer>

<CarouselContainer0>
  {Object.entries(sectionTitles)
    .filter(([, title]) => title !== "ARCADE") // Excluir ARCADE basado en el título
    .map(([section, title]) => (
      <CarouselItem0
        key={section}
        onClick={() => handleSectionChange({ target: { value: section } })}
        isSelected={selectedCategory === section}
      >
        <img 
          src={sectionImages[section]} 
          alt={title} 
          className="carousel-img" 
        />
      </CarouselItem0>
    ))}
</CarouselContainer0>


<CarouselContainer1>
  <div className="column">
    {Object.keys(sectionTitles).slice(0, 3).map((section) => (
      <CarouselItem1
        key={section}
        onClick={() => handleSectionChange({ target: { value: section } })}
        isSelected={selectedCategory === section}
      >
        {sectionTitles[section]}
      </CarouselItem1>
    ))}
  </div>
  <div className="column">
    {Object.keys(sectionTitles).slice(3).map((section) => (
      <CarouselItem1
        key={section}
        onClick={() => handleSectionChange({ target: { value: section } })}
        isSelected={selectedCategory === section}
      >
        {sectionTitles[section]}
      </CarouselItem1>
    ))}
  </div>
</CarouselContainer1>

</ContainerR>
  )
)
}
//region Animaciones
export const backgroundAnimation = keyframes`
0% {
  background-position: 0% 0%;
}
50% {
  background-position: 100% 0%;
}
100% {
  background-position: 0% 100%;
}
`;
//CATEGORIES
const CategoriesMenu = styled.div`
  display: flex;
  margin-top: 40px;
  justify-content: space-between;
  align-items: center;
  margin-left: 35px;
  margin-right: 40px;
`;

const IconBar = styled.select`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.iconBgcolorHome};
  border: 2px solid ${(props) => props.theme.iconcolorHome};
  border-radius: 15px;
  padding: 15px;
  cursor: pointer;
  font-size: 16px;
  filter: drop-shadow(2px 8px 2px rgba(0, 0, 0, 0.5));


  color: ${(props) => props.theme.iconcolorHome};
  svg {
    margin-right: 10px;
  }
  
`;

const IconItem = styled.option`
display: flex;
  justify-content: start;
  text-items: start;
  font-size: 20px;
  background-color: ${(props) => props.theme.iconBgcolorHome};
  color: ${(props) => props.theme.iconcolorHome};
  padding: 15px;
  border-radius: 10px;

`;

const CategoriesButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; 
  padding: 10px;
  border: 1px solid #997300;
  cursor: pointer;
  background-color:transparent;
  min-width: 350px;
  min-height: 150px;
  border-radius: 15px; 
  color: ${(props) => props.theme.iconcolorHome};

   svg, img, img {
    width: 45px;
    height: 45px;
    margin-bottom: 4px;
    transition: transform 0.3s ease;
    filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));

    }

  .category-title {
    margin-top: 2px; 
    font-size: 25px;
    font-weight: 600;
    color: ${props => props.theme.text};
    transition: transform 0.3s ease;
        text-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);


  }

  &:hover {
  svg, img{
    transform: scale(1.2); 
    color: ${(props) => props.theme.iconcolorHomeHover};
  }

  .category-title {
    transform: scale(1.05); 
    color: ${(props) => props.theme.iconcolorHomeHover};
    }
  }

  &:focus {
    outline: none; 
    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.5); 
  }

  &:active {
    transform: scale(0.95);
  }

    @media (max-width: 1800px) {
    flex-wrap: wrap;
    min-width: 270px; /* Reduce el tamaño mínimo */
    min-height: 100px; /* Reduce el tamaño mínimo */
    font-size: 15px;

    svg, img {
      width: 35px; /* Ajusta el tamaño del ícono */
      height: 35px;
    }

    .category-title {
      font-size: 20px; /* Ajusta el tamaño de la fuente */
    }
  }

      @media (max-width: 1600px) {
    flex-wrap: wrap;
    min-width: 200px; /* Reduce el tamaño mínimo */
    min-height: 100px; /* Reduce el tamaño mínimo */
    font-size: 15px;

    svg, img {
      width: 35px; /* Ajusta el tamaño del ícono */
      height: 35px;
    }

    .category-title {
      font-size: 20px; /* Ajusta el tamaño de la fuente */
    }
  }

  
  @media (max-width: 1200px) {
    flex-wrap: wrap;
    min-width: 150px; /* Reduce el tamaño mínimo */
    min-height: 100px; /* Reduce el tamaño mínimo */
    font-size: 15px;

    svg, img {
      width: 25px; /* Ajusta el tamaño del ícono */
      height: 25px;
    }

    .category-title {
      font-size: 12px; /* Ajusta el tamaño de la fuente */
    }
  }

    @media (max-width: 800px) {
    flex-wrap: wrap;
    min-width: 120px; /* Reduce el tamaño mínimo */
    min-height: 100px; /* Reduce el tamaño mínimo */
    font-size: 15px;

    svg, img {
      width: 20px; /* Ajusta el tamaño del ícono */
      height: 20px;
    }

    .category-title {
      font-size: 10px; /* Ajusta el tamaño de la fuente */
    }
  }
        @media (max-width: 700px) {
    flex-wrap: wrap;
    min-width: 80px; /* Reduce el tamaño mínimo */
    min-height: 40px; /* Reduce el tamaño mínimo */
    font-size: 15px;

    svg, img {
      width: 15px; /* Ajusta el tamaño del ícono */
      height: 15px;
    }

    .category-title {
      font-size: 4px; /* Ajusta el tamaño de la fuente */
    }
  }
`;

//region Contenedor de ICONS
const IconGamesDivContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  flex-direction: row;
  margin-top: 70px;
  margin-bottom: 70px;
  margin-left: 20px;
  margin-right: 20px;

  justify-content: start;
  align-items: center;

`;

const RecentGameItem = styled.div`
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 170px; 

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95); 
  }
`;

// Estilos para la imagen del juego
const GameImage = styled.img`
  width: 100px;
  height: auto;
  border-radius: 8px; 
`;

const GameName = styled.p`
  margin-top: 5px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text}
  text-align: center;
`;

//region Container

const Container = styled.div`
  height: auto;
  max-width: 100%;
  background: url(${(props) => props.bgImage}) no-repeat;
  background-size: cover; 
  background-attachment: fixed;
  overflow-x: hidden;

  .game-list-escritorio2{
  display: flex;
  flex-direction: column;
    gap: 15px;
    padding: 32px;

    .load-list {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .game-item-escritorio2 {
  flex: 0 1 calc(15.333% - 15px);
    background-color:transparent;
    text-align: center;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: scale(0.9);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease-in-out;
    }

    &:hover img {
      transform: scale(1.2);
    }

     &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5); 
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1; 
    }

    &:hover::before {
      opacity: 1;
    }

    button {
      background: transparent;
    }

    .favorite-button {
      position: absolute;
      top: 10px;
      right: 10px;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      z-index: 2; 

      svg {
        color: red; 
        font-size: 24px;
      }
    }
  }

  .game-list-escritorio {
    display: flex;
    flex-wrap: wrap; /* Permite que los juegos se ajusten en múltiples filas */
    gap: 15px; /* Espacio entre los juegos */
    padding: 32px;
    justify-content: center; /* Centra los juegos horizontalmente */

    .load-list-escritorio {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
  }

  .game-item-escritorio {
    flex: 0 1 calc(15.333% - 15px); /* Tres juegos por fila */
    background-color: transparent;
    text-align: center;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: scale(0.9);
    }

    img {
      width: 100%;
      height: auto;
      object-fit: cover;
      transition: transform 0.2s ease-in-out;
    }

    &:hover img {
      transform: scale(1.1);
    }

    .favorite-button {
      position: absolute;
      top: 10px;
      right: 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      z-index: 2;

      svg {
        font-size: 24px;
        transition: color 0.3s ease;
        color: red;
      }
    }
  }

.game-group {
  margin-bottom: 32px;
}

.game-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.games-row {
  display: flex;
  flex-wrap: wrap; 
  gap: 10px;
  justify-content: space-between; 
  overflow-x: auto; 
  padding-bottom: 10px; 
  scroll-behavior: smooth; 

    &:after {
    content: ""; 
    flex: 1 1 auto; 
  }

  &:only-child,
  &:only-child:after {
    justify-content: center;
  }

    &::-webkit-scrollbar {
    height: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.iconcolorHome};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.view-all-button {
  background-color: #997300;;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.view-all-button:hover {
  background-color: #e6ac00;;
}


  .game-list {
  display: flex;
  flex-direction: column;
    gap: 15px;
    padding: 32px;

    .load-list {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .game-item {
  flex: 0 1 calc(33.333% - 15px);
    background-color:transparent;
    text-align: center;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: scale(0.9);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease-in-out;
    }

    &:hover img {
      transform: scale(1.2);
    }

     &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5); 
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1; 
    }

    &:hover::before {
      opacity: 1;
    }

    button {
      background: transparent;
    }

    .favorite-button {
      position: absolute;
      top: 10px;
      right: 10px;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      z-index: 2; 

      svg {
        color: red; 
        font-size: 24px;
      }
    }
  }



  @media (max-width: 480px) {
    padding: 0px;
    max-width: 1080px;
    .game-list {
      grid-template-columns: repeat(3, 1fr);
    }

    .game-item {
      width: 250px;
      text-align: center;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease-in-out;

      &:hover {
        transform: scale(0.9);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease-in-out;
      }

      &:hover img {
        transform: scale(1.2);
      }

      .favorite-button {
        top: 5px;
        right: 5px;
      }
    }

    .small, .large {
      grid-column: span 1;
      grid-row: span 1;
    }
  }
`;

//region DivButton TOP

const DivButtonTop = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  margin-left: 35px;
  margin-bottom: 10px;
  gap: 17px;
  align-items: center;
`;

//region div button Center

const DivButtonCenter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

`;

//region INPUT
export const InputSearch = styled.input`
background: transparent;
color: ${(props) => props.theme.text};
border-radius: 15px;
background-size: 100% 100%;
padding: 15px;
border: 2px solid  ${(props) => props.theme.text};
filter: drop-shadow(2px 8px 2px rgba(0, 0, 0, 0.5));

width: 40%;
  &:focus {
    outline: none;
  }
`;

//region BOTONES
const DivButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .pacmanDiv{
  margin-top: 40px;
  margin-bottom: 70px;
  }

  .showMoreDiv{
  align-self: flex-end;
  display:flex;
  justify-content: end;
  align-items: end;
  margin-bottom: 10px;
  margin-right: 30px;

  }

`;

const ButtonShowMore = styled.button`
  position: absolute;
  background: #997300; 
  border: 2px solid ${(props) => props.theme.blackandwhite2};
  color: ${(props) => props.theme.blackandwhite}; 
  font-size: 12px;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  overflow: hidden; 
  transition: color 0.3s ease, box-shadow 0.2s;

  &:hover {
  color: ${(props) => props.theme.blackandwhite2}; 
    box-shadow: 0 0 20px ${(props) => props.theme.navcolorhoverHome};
  }
`;
// Estilo para el contenedor del iframe
const IframeContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
`;

// Estilo para el iframe
const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 60px; /* Tamaño del ícono */
  color: white;
  z-index: 10000 !important;
  transition: color 0.3s;

  &:hover {
    color: red; /* Color al pasar el ratón sobre el ícono */
  }
`;


//region RESPONSIVE

const SafariHelperContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: var(--window-inner-height, 100vh); /* Altura dinámica */
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s linear, visibility 0.5s linear;

  &.active {
    opacity: 1;
    visibility: visible;
  }

  #safarihelper {
    position: fixed;
    top: 10px;
    right: 40px;
    height: 304px;
    width: 90px;
    background-repeat: no-repeat;
    background-position: 0 -310px;
    z-index: 7777;
  }

  &.disable-scroll {
    overflow: hidden;
  }
`;

const ContainerR = styled.div`
  flex-direction: column;
  background-image: url(${(props) => props.bgHome});
  background-size: cover;
  background-attachment: fixed;
  height: auto;
  max-width: 100%;
  overflow-x: hidden;

  .game-group {
  margin-bottom: 32px;
}

.game-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.games-row {
  display: flex; /* Juegos en línea horizontal */
  gap: 15px; /* Espacio entre los juegos */
  overflow-x: auto; /* Barra de desplazamiento horizontal */
  padding-bottom: 10px; /* Espacio para evitar que la barra de scroll toque los juegos */
  scroll-behavior: smooth; /* Desplazamiento suave */
    &::-webkit-scrollbar {
    height: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.iconcolorHome};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.view-all-button {
  background-color: #997300;;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.view-all-button:hover {
  background-color: #e6ac00;;
}


  .game-list {
  display: flex;
  flex-direction: column;
    gap: 15px;
    padding: 32px;

    .load-list {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .game-item {
    flex: 0 0 auto; /* Evita que los juegos se reduzcan o expandan */
    background-color:transparent;
    text-align: center;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: scale(0.9);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease-in-out;
    }

    &:hover img {
      transform: scale(1.2);
    }

     &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5); 
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1; 
    }

    &:hover::before {
      opacity: 1;
    }

    button {
      background: transparent;
    }

    .favorite-button {
      position: absolute;
      top: 10px;
      right: 10px;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      z-index: 2; 

      svg {
        color: red; 
        font-size: 24px;
      }
    }
  }

  .small {
    grid-column: span 1;
    grid-row: span 1;
  }

`;



const NoGamesR = styled.div`
  color: white;
  font-size: 20px;
  margin-top: 20px;
`;

const LoaderWrapperR = styled.div`
  display: flex;
  justify-content: center
  align-items: center;
  margin-top: 20px;
  margin-bottom: 40%;
  margin-left: 25%;
`;

const LoadMoreButtonR = styled.button`
  background: transparent;
  border: 2px solid ${(props) => props.theme.blackandwhite2};
  color: ${(props) => props.theme.blackandwhite2}; 
  font-size: 12px;
  width: 120px;
  margin: 20px 25% 5%;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.3s ease, box-shadow 0.2s;

  &:hover {
    background-color: #997300; 
    color: ${(props) => props.theme.navcolorhoverHome}; 
    box-shadow: 0 0 20px ${(props) => props.theme.navcolorhoverHome};
  }

@media (max-width: 926px) {
  margin: 20px 43% 5%;
}

  @media (max-width: 431px) {
  margin: 20px 34% 5%;
  
}

  @media (max-width: 428px) {
  margin: 20px 34% 5%;
  
}

`;


//region DIV TOP

const DivButtonTopR = styled.div`
  display: flex;
  flex-direction: column;
  Width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 5px;
  gap: 10px;


`;
//region INPUT
export const InputSearchR = styled.input`
margin-left: 5px;
margin-bottom: 7%;
background: transparent;
width: 100%;
color: ${(props) => props.theme.text};
border-radius: 15px;
font-size: 16px;
padding: 15px;
border: 2px solid  ${(props) => props.theme.text};
  &:focus {
    outline: none;
  }
@media (max-width: 926px) {
  width: 50%;
}
  @media (max-width: 431px) {
  width: 98%;
}
@media (max-width: 420px) {
  width: 98%;
}
 @media (max-width: 391px) {
  width: 98%;
}

 @media (max-width: 375px) {
  width: 98%;
}

@media (max-width: 361px) {
  width: 98%;
}
`;


//region DIV  CENTER

const DivButtonCenterR = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  @media (max-width: 391px) {
    width: 99%;
}

@media (max-width: 361px) {
    width: 99%;
}

`;


export const backgroundAnimationR = keyframes`
0% {
  background-position: 0% 0%;
}
50% {
  background-position: 100% 0%;
}
100% {
  background-position: 0% 100%;
}
`;


const CarouselContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  padding: 10px;
  justify-content: center;
  width: 100%;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.iconcolorHome};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const CarouselContainerEscritorio = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  padding: 10px;
  justify-content: flex-end;
  margin-right: 2%;
  width: 100%;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.iconcolorHome};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;


const CarouselItem = styled.div`
  flex-shrink: 0;
  background-color: transparent;
  border-radius: 15px;
  color: #997300;
  font-size: 30px;
  padding: 10px 10px;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;

  ${(props) =>
    props.isSelected &&
    `
    border-color: #ff9900;
    font-weight: bold;
  `}
`;



const CarouselContainer0 = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center; 
  padding: 15px;
  background-color: transparent;
  width: 100%;
  height: auto; 
  overflow-x: auto; 
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 5px; /* Barra de desplazamiento horizontal */
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.iconcolorHome || "#ff9900"};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .carousel-img {
    width: 120px;
    height: 220px;
    border-radius: 10px;
    margin-right: 15px; /* Espaciado entre las imágenes */
    transition: transform 0.3s ease;
  }
`;

const CarouselItem0 = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  background-color: transparent;
  border-radius: 15px;
  color: #997300;
  font-size: 20px;
  padding: 10px;
  cursor: pointer;
`;


//region Linea gradiante
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px 0;
`;

const GradientLine = styled.hr`
  flex: 1;
  height: 2px;
  border: none;
  background: ${(props) => props.theme.linedegrade};
  margin: 0 10px;

  &.gradient-right {
    background: ${(props) => props.theme.linedegraderight};
  }
`;

const TitleText = styled.span`
  color: ${(props) => props.theme.newtext};
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
`;


const CarouselContainer1 = styled.div`
  display: flex;
  justify-content: space-between;  /* Alinea los dos contenedores */
  padding: 15px;
  background-color: transparent;
  width: 100%;
  margin-top: 10%;
  margin-bottom: 20%;
`;

const CarouselItem1 = styled.div`
  background-color: transparent;
  border-radius: 15px;
  color: #997300;
  font-size: 20px;
  padding: 10px 20px;
  cursor: pointer;
  text-align: flex-start;
  white-space: nowrap;
  transition: background-color 0.3s ease;
  width: 100%;  /* Los ítems ocuparán el 100% del ancho del contenedor de columna */
  margin-bottom: 15px;

  /* Estilo para pantallas pequeñas */
  @media (max-width: 768px) {
    font-size: 18px;
    padding: 8px 15px;
  }
`;


const CarouselContainerH = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 20px;
  gap: 20px; /* Espaciado entre los elementos */
    overflow-x: auto; 
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 5px; /* Barra de desplazamiento horizontal */
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.iconcolorHome || "#ff9900"};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .carousel-img {
    width: 250px;
    height: 500px;
    border-radius: 10px;
    margin-right: 15px; /* Espaciado entre las imágenes */
    transition: transform 0.3s ease;
  }
  
  @media (min-width: 768px) {
    justify-content: center;
    padding: 40px;
  }
`;

const CarouselItemH = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding: 10px;
  border-radius: 8px;
  color: #997300;


  &:hover {
    transform: scale(1.05); /* Efecto de hover */
  }

`;
