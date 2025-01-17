import styled, { keyframes } from 'styled-components';
import React, { useState, useEffect, useContext, useCallback, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosD from '../axiosDefault';
import { useAuth } from '../Context';
import { NavBar } from '../components/HomeComponents/Navbar';
import { SubNavbar } from '../components/HomeComponents/SubNavbar'
import { SubNavbarButton } from '../components/HomeComponents/SubNavbarButton'

import { FullScreenCarousel } from "../components/HomeComponents/Carousel";
import { NavBarResponsive } from '../components/HomeComponents/NavbarResponsive';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PacmanLoader from "react-spinners/PacmanLoader";
import home1 from "../assets/home1.png"
import home2 from "../assets/home2.png"
import bgsuerte from '../assets/bgsuerte.png';
import iconomayores from '../assets/icon18.png';


import { ThemeContext } from "../App";

//icon import categories:
import { AiFillHeart,  AiOutlineHeart, AiFillCloseCircle } from 'react-icons/ai';

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
  const [showTitle, setShowTitle] = useState("");
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
  const { user, setUser, logoutUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isResponsive, setIsResponsive] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

//region Separador de categorias
const categorySections = {
  TRAGAMONEDAS: ['slots', 'otros'],
  ARCADE: ['arcade', 'fast_games'],
  CASINOS: ['live_dealers', 'lottery', 'roulette'],
  DEPORTIVAS: ['sport'],
  CARTAS: ['card', 'video_poker']
};


useEffect(() => {
  // Comprobamos si la página ya fue recargada usando localStorage
  const hasReloaded = localStorage.getItem('hasReloaded');

  if (!hasReloaded && location.pathname === '/home') {
    // Si no se ha recargado, recargamos la página
    window.location.reload();
    localStorage.setItem('hasReloaded', 'true'); // Marcamos que la recarga ha ocurrido
  }
}, [location.pathname]); // Dependemos de la ruta


  useEffect(() => {
    if (user && (user.rol === 'Admin' || user.rol === 'Agente' || user.rol === "Super")) {
      toast.error("Los permisos son incorrectos.")
      logoutUsers();
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
          console.log("se muestra la lista",  getAllgames)
          const shuffledTitles = shuffleArray(response.data.gamesList.content.gameTitles);

// IDs que se deben filtrar
const excludedIds = [11675, 12559];

// Filtrar juegos con nombres duplicados, excluir ciertos IDs y mostrar juegos con "novomatic" en el título
const filteredGames = getAllgames.reduce((acc, game) => {
  if (
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

  
  //region Primera renderización de los juegos

  useEffect(() => {
    if (allGames.length > 0) {
      // Separar los juegos de "pragmatic"
      const pragmaticGames = allGames.filter((game) =>
        game.label.toLowerCase() === "pragmatic"
      );
  
      // Mezclar el resto de los juegos (sin los de pragmatic)
      const remainingGames = allGames.filter((game) => game.label.toLowerCase() !== "pragmatic");
  
      // Función para mezclar el arreglo de juegos restantes
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]; // Intercambia los elementos
        }
      };
  
      shuffleArray(remainingGames); // Mezclar los juegos restantes
  
      // Combinar los juegos de "pragmatic" al inicio de la lista
      const filteredGames = [...pragmaticGames, ...remainingGames];
  
      // Actualizar setGameList con los juegos filtrados (siempre con los de pragmatic al principio)
      setGameList(filteredGames);
  
      // Para los juegos específicos de escritorio (24 juegos)
      let escritorioGames = [...filteredGames];
      if (escritorioGames.length < 24) {
        const additionalGames = allGames.filter(
          (game) => !escritorioGames.some((filteredGame) => filteredGame.id === game.id)
        );
  
        shuffleArray(additionalGames); // Mezclar los juegos adicionales
        escritorioGames = escritorioGames.concat(
          additionalGames.slice(0, 24 - escritorioGames.length)
        );
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
  
    // Filtrar juegos por nombre y por la propiedad 'label' igual a "pragmatic"
    const filteredGames = allGames
      .filter((game) => game.name.toLowerCase().includes(value)) // Filtrado por nombre
      // .filter((game) => game.label === "pragmatic"); // Filtrar juegos con label: "pragmatic"

    setShowTitle("Todos")
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
     console.log("se muestra juego", gameId)
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
    setShowTitle(transformedTitle)
  
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
   
  
  useEffect(() => {
    setGamesToShow(200);
    setShowMoreButton(true)
  }, [selectedTitle]);
  // Log de actualización de gameList
  


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
    console.log("Cambio el title", category)
     

    if(category === selectedTitle){setSelectedTitle("")}
    else{if(category !== selectedTitle){setSelectedTitle(category)}}

  };

  const filterGamesByCategory = (section) => {

    // Obtener las categorías dentro de la sección seleccionada
    const categories = categorySections[section] || [];

    console.log("se muestras la categorias", categories)
    
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
    if(title === "todos"){
      setSelectedTitle("")
      setShowTitle("TODOS")
      handleTitlesClick("pragmatic")
      return
    }
    setSelectedTitle(title);
    handleMenuOptions(title);
  };

  
  const renderCategoryButtons = () => {
    const sectionTitles = {
      TRAGAMONEDAS: "TRAGAMONEDAS",
      ARCADE: "ARCADE",
      CASINOS: "CASINOS",
      DEPORTIVAS: "DEPORTIVAS",
      CARTAS: "CARTAS",
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
              console.log("Categoría seleccionada:", sectionTitles[section]);
              setShowTitle(sectionTitles[section])
              handleMenuOptions(section);
              filterGamesByCategory(section);
              smooth();
              setIsCategorySelected(true);
            }}
          >
            <img
              src={sectionIcons[section]}
              alt={sectionTitles[section]}
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

  
  // Función para alternar pantalla completa en otros navegadores
  //region renderGames
  const [visibleGames, setVisibleGames] = useState(15); // Inicia mostrando 15 juegos

  const renderGames = () => {
    if (gameList.length === 0) {
      return (
        <div className="load-list">
          <p>No hay juegos que mostrar</p>
        </div>
      );
    }
  
    const gamesToShow = gameList.slice(0, visibleGames); // Controlar cuántos juegos se muestran
   
  
    return (
      <>
        <GameListResponsivo>
          {gamesToShow.map((game, index) => {
            const isFavorite = favorites.some((fav) => fav.id === game.id);
  
            return (
              <GameItem
                key={game.id}
                onClick={() => handleGameClick(game.id, game)}
              >
                {game.img ? (
                  <img src={game.img} alt={game.name} />
                ) : (
                  <p>Imagen no disponible</p>
                )}
                <button
                  className={`favorite-button ${isFavorite ? "favorited" : ""}`}
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
              </GameItem>
            );
          })}
        </GameListResponsivo>
  
        {/* Botones para cargar y quitar juegos */}
        <ButtonContainer>
          {visibleGames < gameList.length && (
            <LoadMoreButton onClick={() => setVisibleGames(visibleGames + 15)}>
              Ver más
            </LoadMoreButton>
          )}
          {visibleGames > 15 && (
            <LoadLessButton onClick={() => setVisibleGames(visibleGames - 15)}>
              Ver menos
            </LoadLessButton>
          )}
        </ButtonContainer>
      </>
    );
  };
  

  
  

  const [visibleGamesE, setVisibleGamesE] = useState(18); // Inicia mostrando 15 juegos
  const renderGamesEscritorio = () => {
    if (gameList.length === 0) {
      return (
        <div className="load-list">
          <p>No hay juegos que mostrar</p>
        </div>
      );
    }
  
    // Tomar los juegos visibles basados en el estado
    const gamesToShow = gameList.slice(0, visibleGamesE);
  
    return (
      <>
        <GameListEscritorio>
          {gamesToShow.map((game, index) => {
            const isFavorite = favorites.some((fav) => fav.id === game.id);
  
            return (
              <GameItemEscritorio
                key={game.id}
                onClick={() => handleGameClick(game.id, game)}
              >
                {game.img ? (
                  <img src={game.img} alt={game.name} />
                ) : (
                  <p>Imagen no disponible</p>
                )}
                <button
                  className={`favorite-button ${isFavorite ? "favorited" : ""}`}
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
              </GameItemEscritorio>
            );
          })}
        </GameListEscritorio>
  
        {/* Botones para cargar y quitar juegos */}
        <ButtonContainer>
          {visibleGamesE < gameList.length && (
            <LoadMoreButton onClick={() => setVisibleGamesE(visibleGamesE + 18)}>
              Ver más
            </LoadMoreButton>
          )}
          {visibleGamesE > 18 && (
            <LoadLessButton onClick={() => setVisibleGamesE(visibleGamesE - 18)}>
              Ver menos
            </LoadLessButton>
          )}
        </ButtonContainer>
      </>
    );
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
  TRAGAMONEDAS: iconTragamonedas,
  ARCADE: iconArcade,
  CASINOS: iconCasino,
  DEPORTIVAS: iconDeportivas,
  CARTAS: iconCarta,
};

const sectionTitles = {
  ARCADE: 'ARCADE',
  TRAGAMONEDAS: 'TRAGAMONEDAS',
  CASINOS: 'CASINOS',
  DEPORTIVAS: 'DEPORTIVAS',
};


const handleSectionChange = (event) => {
  const section = event.target.value;
  console.log("cambio de section", section)
  
  // Ignorar secciones "ARCADE" y "CARTAS" basado en el título
  if (sectionTitles[section] === "ARCADE" || sectionTitles[section] === "CARTAS") {
    return;
  }

  if (section === "section0") {
    setSelectedCategory(section);
    filterGamesByCategory(section);
    return;
  } else {
    setSelectedCategory(section);
    setShowTitle(section)
    handleMenuOptions(section);
    filterGamesByCategory(section);

    // // Renderiza imágenes según la sección
    // if (sectionImages[section]) {
    //   renderImage(sectionImages[section]);
    // }
  }
};

const handleSectionChangeTitle = (event) => {
  const section = event.target.value;
  console.log("cambio de section", section)

  // Ignorar secciones "ARCADE" y "CARTAS" basado en el título
  if (sectionTitles[section] === "CARTAS") {
    return;
  }

  if (section === "section0") {
    setSelectedCategory(section);
    setShowTitle(section)
    filterGamesByCategory(section);
    return;
  } else {
    setSelectedCategory(section);
    setShowTitle(section)
    handleMenuOptions(section);
    filterGamesByCategory(section);
  }
};


const sectionImages = {
  TRAGAMONEDAS: imgTragamonedas,
  CARTAS: imgCarta,
  CASINOS: imgCasinoEnVivo,
  DEPORTIVAS: imgDeportivas,
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


//region function button
const [showSubNavbar, setShowSubNavbar] = useState(false);

const toggleSubNavbar = () => {
  setShowSubNavbar(!showSubNavbar);
};


return (

    !isResponsive ? (
      <Container bgImage={bgHome}>
      <NavBar />
      <FullScreenCarousel />
      <div>

    {isGameOpen && (
        <IframeContainer>
          <StyledIframe src={gameUrl} ref={iframeRef} allow="fullscreen"/>
          <CloseButton onClick={() =>{
          handleCloseGame()
          toggleFullScreen(false)}}>
            <AiFillCloseCircle />
          </CloseButton>

      { isFullScreenIOS && (
     <SafariHelperContainer className={`safarihelper-bg ${isFullScreenIOS ? 'active' : ''}`}>
     <div id="safarihelper" />
     </SafariHelperContainer>
      )}
        </IframeContainer>
    )}

    </div>


    {showCategoriesMenu && renderCategoryButtons()}     

    <TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>Selecciona proveedores de Juegos</TitleText>
      <GradientLine className="gradient-right" />
      </TitleContainer>

      <SubNavbar categories={titles} onCategoryClick={handleTitlesClick} />
{showSubNavbar && (
    <SubNavbarButton categories={titles} onCategoryClick={handleTitlesClick} toggleSubNavbar={toggleSubNavbar} />
  )}

<DivToggleButton> 
    <ToggleButton onClick={toggleSubNavbar}>
        {showSubNavbar ? "Ocultar" : "Ver todos"}
      </ToggleButton>
    </DivToggleButton>

      <DivButtonTop>
        <InputSearch
          type="text"
          placeholder="Buscar juego por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

    
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

      <TitleText>{showTitle || "Pragmatic"}</TitleText>
      
      <GradientLine className="gradient-right" />
      </TitleContainer>


    {gameList && gameList.length > 0 ? renderGamesEscritorio() : <div className="load-list"><p>No hay juegos que mostrar</p></div>}


      <DivButton>
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
    .filter(([, title]) => title !== "ARCADE" && title !== "CARTAS") // Excluir ARCADE y CARTAS basado en el título
    .map(([section, title]) => (
      <CarouselItemH
        key={section}
        onClick={() => {
          handleSectionChange({ target: { value: section } }); // Manejar el cambio de sección
          window.scrollTo({
            top: 900, // Desplazar al inicio de la página
            left: 0,
            behavior: "smooth", // Desplazamiento suave
          });
        }}
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
    onClick={() => {
      handleSectionChangeTitle({ target: { value: section } }); // Manejar el cambio de sección
      window.scrollTo({
        top: 900, // Desplazar 10 píxeles desde el inicio
        left: 0, // Sin desplazamiento horizontal
        behavior: "smooth", // Desplazamiento animado
      });
    }}
    isSelected={selectedCategory === section}
  >
      {sectionTitles[section]}
    </CarouselItemH>
  ))}
</CarouselContainerH>

      <MyDiv>
        <LogoMayores><img src={iconomayores}  alt="logo"/></LogoMayores>
        <span><strong>Sitio exclusivo</strong> para personas mayores de 18 años
        <br />
        Juga responsablemente</span>
      </MyDiv>

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
      


      <TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>Selecciona proveedores de Juegos</TitleText>
      <GradientLine className="gradient-right" />
      </TitleContainer>

    <SubNavbar categories={titles} onCategoryClick={handleTitlesClick} />

    {showSubNavbar && (
        <SubNavbarButton categories={titles} onCategoryClick={handleTitlesClick} toggleSubNavbar={toggleSubNavbar}/>
      )}
    
    <DivToggleButton> 
    <ToggleButton onClick={toggleSubNavbar}>
        {showSubNavbar ? "Ocultar" : "Ver todos"}
      </ToggleButton>
    </DivToggleButton>





<TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>{showTitle || "Pragmatic"}</TitleText>
      <GradientLine className="gradient-right" />
</TitleContainer>
<DivButtonTopR>
      <InputSearchR
          type="text"
          placeholder="Buscar juego por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </DivButtonTopR>

{gameList && gameList.length > 0 ? renderGames() : <div className="load-list"><p>No hay juegos que mostrar</p></div>}


{loading ? (
  <LoaderWrapperR>
    <PacmanLoader color={color} loading={loading} size={25} />
  </LoaderWrapperR>
) : showMoreButton ? (
  //agregar un botón u otro componente cuando sea necesario
  null
) : null}

{/* Carrusel para Categorías */}

<TitleContainer>
      <GradientLine className="gradient-left" />
      <TitleText>Secciones</TitleText>
      <GradientLine className="gradient-right" />
</TitleContainer>

<CarouselContainer0>
  {Object.entries(sectionTitles)
    .filter(([, title]) => title !== "ARCADE" && title !== "CARTAS") // Excluir ARCADE y CARTAS basado en el título
    .map(([section, title]) => (
      <CarouselItem0
        key={section}
        onClick={() => {
          handleSectionChange({ target: { value: section } }); // Manejar el cambio de sección
          console.log("se muestra el target", section)
          window.scrollTo({
            top: 10, // Desplazar al inicio de la página
            left: 0,
            behavior: "smooth", // Desplazamiento suave
          });
        }}
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
    {Object.keys(sectionTitles).slice(0, 2)
    .map((section) => (
      <CarouselItem1
        key={section}
        onClick={() => {
          handleSectionChangeTitle({ target: { value: section } }); 
          window.scrollTo({
            top: 10, 
            left: 0,
            behavior: "smooth", 
          });
        }}
        isSelected={selectedCategory === section}
      >
        {sectionTitles[section]}
      </CarouselItem1>
    ))}
  </div>
  <div className="column">
    {Object.keys(sectionTitles).slice(2).map((section) => (
      <CarouselItem1
      key={section}
      onClick={() => {
        handleSectionChangeTitle({ target: { value: section } }); // Manejar el cambio de sección
        window.scrollTo({
          top: 10, // Desplazar 10 píxeles desde el inicio
          left: 0, // Sin desplazamiento horizontal
          behavior: "smooth", // Desplazamiento animado
        });
      }}
      isSelected={selectedCategory === section}
    >
        {sectionTitles[section]}
      </CarouselItem1>
    ))}
  </div>
</CarouselContainer1>

<MyDiv>
        <LogoMayores><img src={iconomayores}  alt="logo"/></LogoMayores>
        <span><strong>Sitio exclusivo</strong> para personas mayores de 18 años
        <br />
        Juga responsablemente</span>
</MyDiv>

</ContainerR>
  )
)
}



//region ..:: :: E :: ::...
export const Container = styled.div`
    height: auto;
  max-width: 100%;
  background: url(${(props) => props.bgImage}) no-repeat;
  background-size: cover; 
  background-attachment: fixed;
  overflow-x: hidden;
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
  z-index: 1000 !important; 
`;
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
  z-index: 9999 !important;
  transition: color 0.3s;

  &:hover {
    color: red; /* Color al pasar el ratón sobre el ícono */
  }
`;
const SafariHelperContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: var(--window-inner-height, 100vh); /* Altura dinámica */
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9997;
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


const DivButtonTop = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  margin-left: 35px;
  margin-bottom: 10px;
  gap: 17px;
  align-items: center;
`;

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

export const DivButtonCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 20px 0;
`;

export const DivButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;

  .pacmanDiv {
    margin-top: 20px;
  }
`;

export const ButtonShowMore = styled.button`
  background-image: url(${bgsuerte});
  background-size: cover;
  background-position: center;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  color: black;
  cursor: pointer;
  font-size: 18px;
`;


//region RenderCategories
export const CategoriesMenu = styled.div`
    display: flex;
  justify-content: space-between; /* Distribuye los botones uniformemente */
  align-items: center;
  width: 100%; /* Asegura que ocupe el ancho completo */
  padding: 2%; /* Espaciado alrededor */
  gap: 1vw; /* Espaciado entre los botones */
  overflow-x: auto; /* Permite scroll horizontal si es necesario */

  /* Evita que los botones se envuelvan */
  flex-wrap: nowrap; 

  /* Opcional: estilos para el scrollbar */
  &::-webkit-scrollbar {
    display: none; /* Oculta scrollbar en navegadores webkit */
  }
`;

const CategoriesButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2%;
  gap: 1%;
  cursor: pointer;
  background-color: #000;
  width: 30vw; /* Relativo al ancho de la pantalla */
  height: 15vw; /* Relativo al ancho de la pantalla */
  border-radius: 1vw; /* Relativo al ancho de la pantalla */
  color: ${(props) => props.theme.iconcolorHome};
  transition: all 0.3s ease;

  svg, img {
    width: 60%;
    height: auto; /* Mantiene proporción */
    margin-bottom: 5%;
    transition: transform 0.3s ease;
    filter: drop-shadow(2px 12px 2px rgba(0, 0, 0, 0.5));
  }

  .category-title {
    font-size: 0.8em; /* Relativo al tamaño de fuente base */
    font-weight: 600;
    color: #fff;
    transition: transform 0.3s ease;
    text-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
  }

  &:hover {
    svg, img {
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
`;

//region Vista Juegos
export const GameListEscritorio = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6 columnas */
  grid-template-rows: repeat(4, auto); /* 4 filas automáticas */
  gap: 20px; /* Espaciado entre los elementos */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .load-list {
    grid-column: span 6; /* Ocupa todo el ancho disponible si no hay juegos */
    text-align: center;
    color: #777;
    font-size: 1.2rem;
  }

  > div {
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden; /* Asegura que el contenido no se salga del contenedor */
  }
`;





export const GameGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 10px;
`;

export const GameTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

export const ViewAllButton = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

export const GameRows = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;

  & > div {
    flex: 1 1 calc(33.33% - 10px); /* 3 columnas */
    max-width: calc(33.33% - 10px);
    box-sizing: border-box;
  }
`;



export const GameItemEscritorio = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  padding: 5px;

  /* Estilos para la imagen del juego */
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    transition: transform 0.2s ease-in-out;
  }

  /* Efecto hover en la imagen */
  &:hover img {
    transform: scale(1.1);
  }

  /* Estilos para el botón de favorito */
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

  /* Estilo para el texto debajo de la imagen */
  p {
    font-size: 0.9rem;
    color: #666;
    text-align: center;
    margin-top: 10px;
  }
`;

//region Flyers
const CarouselContainerH = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: center;
  padding: 20px;
  gap: 5px; /* Espaciado entre los elementos */
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
const MyDiv = styled.div`
  display: flex;
  flex-direction: column;  
  justify-content: center;  
  align-items: center;  
  text-align: center;  
  margin-left: auto;
  margin-right: auto;
  width: 70%;
  margin-bottom: 10%;

  @media (max-width: 480px) {
  margin-bottom: 62%;
}

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

//region ..:: :: R :: ::..

// Carousel Card Cont

export const ContainerR = styled.div`
   flex-direction: column;
  background-image: url(${(props) => props.bgHome});
  background-size: cover;
  background-attachment: fixed;
  height: auto;
  max-width: 100%;
  overflow-x: hidden;
`;




export const DivButtonTopR = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;
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

//region Vista juegos responsivo
const GameListResponsivo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Tres columnas iguales */
  gap: 15px; /* Espaciado entre juegos */
  padding: 20px;
  width: 100%;
  box-sizing: border-box; /* Incluye padding en el cálculo del ancho */
  justify-items: center; /* Centra los elementos en las columnas */
`;

const GameItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%; /* El ancho es gestionado por la cuadrícula */
  max-width: 200px; /* Tamaño máximo para pantallas grandes */
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 5px;
  }

  p {
    margin: 10px 0 0;
    color: #fff;
    font-size: 0.9em;
    text-align: center;
  }

  &:hover {
    transform: scale(1.05); 
  }

  .favorite-button {
      position: absolute;
      top: 1px;
      right: 2px;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      z-index: 2; 
      background: none;

     svg {
      color: red; 
      font-size: 24px;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px auto;
`;

const LoadMoreButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #000;
  border: solid 1px #997300;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const LoadLessButton = styled(LoadMoreButton)`
  background-color: #000;
  border: solid 1px #997300;
  &:hover {
    background-color: #a71d2a;
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

export const DivButtonCenterR = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
`;

export const GameList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;


export const InputSearchR = styled.input`
  width: 90%;
  max-width: 500px;
  padding: 0.75rem;
  font-size: 1rem;
  margin-left: 5px;
margin-bottom: 7%;
background: transparent;
color: ${(props) => props.theme.text};
border-radius: 15px;
font-size: 16px;
border: 2px solid  ${(props) => props.theme.text};
`;

export const NoGamesR = styled.div`
  font-size: 1.2rem;
  color: #999;
  text-align: center;
`;

export const LoaderWrapperR = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
`;

export const LoadMoreButtonR = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #007BFF;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const CarouselContainer0 = styled.div`
  display: flex;
  justify-content: space-around; /* Distribuye los elementos uniformemente */
  align-items: center; 
  padding: 2px;
  background-color: transparent;
  width: 100%; /* Asegura que ocupe todo el ancho */
  height: auto;
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
  cursor: pointer;
  /* Agregar estilos para la imagen */

  .carousel-img {
    max-width: 120px;
    height: auto;  
    border-radius: 10px;
  }
`;

//region button subnavbarbutton
const DivToggleButton = styled.div`
  display: flex;
  justify-content: center ; 
  align-items: center;
  margin: 2%;
`;

const ToggleButton = styled.button`
  background-image: url(${bgsuerte});
  background-size: cover;
  background-position: center;
  padding: 10px 20px;
  color: #000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
  font-size: 16px;

  &:hover {
    background-color: #555;
  }
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



//region Contenedor de ICONS
const IconGamesDivContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  flex-direction: row;
  margin-bottom: 70px;
  margin-right: 20px;
  justify-content: center;
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

    p {
    text-align: center; 
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95); 
  }
    @media (max-width: 480px) {
    width: 80px;
    margin: 10px;
    transform: scale(0.85); 

    &:hover {
      transform: scale(0.9); 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); 
    }

    &:active {
      transform: scale(0.8);
    }

    p {
      font-size: 0.9rem; 
    }
  }
`;

const RecentGameItemR = styled.div`
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px; 
  

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95); 
  }

`;


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
