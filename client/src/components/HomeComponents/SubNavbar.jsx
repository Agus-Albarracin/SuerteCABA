import { useContext } from "react";
import styled, { keyframes} from 'styled-components';
import { Carousel } from 'primereact/carousel';
import 'primereact/resources/themes/saga-blue/theme.css';  
import 'primereact/resources/primereact.min.css';           
import 'primeicons/primeicons.css';                         
import 'primeflex/primeflex.css';                          
import blanco from '../../assets/skarybet-blanco.png';
import negro from '../../assets/skarybet-negro.png';
import { ThemeContext } from "../../App";

// Imagenes
import pragmaticImage from '../../assets/pragmatic.png';
import elkstudios from '../../assets/elkstudios.png';
import amaticImage from '../../assets/amatic.png';
import scientificGamesImage from '../../assets/scientific_games.png';
import fastGamesImage from '../../assets/fast_games.png';
import liveDealersImage from '../../assets/live_dealers1.png';
import fishImage from '../../assets/fish.png';
import novomaticImage from '../../assets/novomatic.png';
import aristocratImage from '../../assets/aristocrat.png';
import apolloImage from '../../assets/apollo.png';
import vegasImage from '../../assets/vegas.png';
import tomhornImage from '../../assets/tomhorn.png';
import microgamingImage from '../../assets/microgaming.png';
import ainsworthImage from '../../assets/ainsworth.png';
import quickspinImage from '../../assets/quickspin.png';
import yggdrasilImage from '../../assets/yggdrasil.png';
import netentImage from '../../assets/netent.png';
import habaneroImage from '../../assets/habanero.png';
import igtImage from '../../assets/igt.png';
import igrosoftImage from '../../assets/igrosoft.png';
import apexImage from '../../assets/apex.png';
import merkurImage from '../../assets/merkur.png';
import wazdanImage from '../../assets/wazdan.png';
import egtImage from '../../assets/egt.png';
import rouletteImage from '../../assets/roulette.png';
import bingoImage from '../../assets/bingo.png';
import kenoImage from '../../assets/keno.png';
import tableGamesImage from '../../assets/table_games.png';
import kajot from '../../assets/kajot.png';
import zitro  from '../../assets/zitro1.png';
import rubyplay from '../../assets/rubyplay.png';
import playngo from '../../assets/playngo.png';
import firekirin from '../../assets/firekirin.png';
import platipus from '../../assets/platipus.png';
import evolution from '../../assets/evolution.png';
import pgsoft from '../../assets/pgsoft.png';
import playson from '../../assets/playson.png';
import altente from '../../assets/altente.png';
import booming from '../../assets/booming.png';
import galaxsys from '../../assets/galaxsys.jpg';
import spribe from '../../assets/spribe.png';
import pragmaticlive from '../../assets/pragmaticlive.png';




// Mapa de imágenes
const imageMap = {
  "pragmatic": pragmaticImage,
  "amatic": amaticImage,
  "scientific_games": scientificGamesImage,
  "fast_games": fastGamesImage,
  "live_dealers": liveDealersImage,
  "fish": fishImage,
  "novomatic": novomaticImage,
  "aristocrat": aristocratImage,
  "apollo": apolloImage,
  "vegas": vegasImage,
  "tomhorn": tomhornImage,
  "microgaming": microgamingImage,
  "ainsworth": ainsworthImage,
  "quickspin": quickspinImage,
  "yggdrasil": yggdrasilImage,
  "netent": netentImage,
  "habanero": habaneroImage,
  "igt": igtImage,
  "igrosoft": igrosoftImage,
  "apex": apexImage,
  "merkur": merkurImage,
  "wazdan": wazdanImage,
  "egt": egtImage,
  "roulette": rouletteImage,
  "bingo": bingoImage,
  "keno": kenoImage,
  "table_games": tableGamesImage,
  "kajot": kajot, 
  "zitro": zitro,
  "rubyplay": rubyplay,
  "playngo": playngo,
  "elkstudios": elkstudios,
  "firekirin": firekirin,
  "platipus": platipus,
  "evolution": evolution,
  "pgsoft": pgsoft,
  "playson": playson,
  "altente": altente,
  "booming": booming,
  "galaxsys": galaxsys,
  "spribe": spribe,
  "pragmatic_play_live": pragmaticlive
};

export function SubNavbar({ categories, onCategoryClick }) {
    const { setTheme, theme } = useContext(ThemeContext);
    const CambiarTheme = () => {
      setTheme((theme) => (theme === "dark" ? "light" : "dark"));
    };
    const logoToUse = theme === "light" ? negro : blanco;

    const excludedCategories = ["pragmatic_live", "netent", "bingo", "roulette", "keno", "table_games"];

    const filteredCategories = categories.filter(category => !excludedCategories.includes(category));
      
    const responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 4,
        numScroll: 1
      },
      {
        breakpoint: '926px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '768px',
        numVisible: 3,
        numScroll: 2
      },
      {
        breakpoint: '560px',
        numVisible: 3,
        numScroll: 1
      }
    ];
  
    return (
      <SubNavContainer themeUse={theme}>
        <ContentWrapper>
          <CategoriesCarousel>
            <Carousel
              value={filteredCategories}
              numVisible={4}
              numScroll={1}
              responsiveOptions={responsiveOptions}
              className="custom-carousel"
              circular
              showArrows={false} 
              autoplayInterval={2000}
              showIndicators={false}
              itemTemplate={(category) => {
                const imagePath = imageMap[category.toLowerCase().replace(/\s+/g, '_')];
                return (
                  <CategoryItem onClick={() => onCategoryClick(category)}>
                    {imagePath ? (
                      <CategoryImage src={imagePath} alt={category} />
                    ) : (
                      null
                    )}
                  </CategoryItem>
                );
              }}
            />
          </CategoriesCarousel>
        </ContentWrapper>
      </SubNavContainer>
    );
  }

  //region Animacion
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
  
  const SubNavContainer = styled.div`
    display: flex;
    flex-direction: column; 
    align-items: center;
    padding: 0px 35px;
    color: ${(props) => props.theme.text};

    @media (max-width: 926px) {
    padding: 0px 5px;
      width: 98vw;
    }

    @media (max-width: 480px) {
    padding: 0px 5px;
    }
  `;
  
  const ContentWrapper = styled.div`
    display: flex;
    flex-direction: row; 
    justify-content: center;
    align-items: center;
    width: 100%;
  
    @media (max-width: 480px) {
      flex-direction: column; 
    width: 45vh;
    }
  `;
  
  
  const CategoriesCarousel = styled.div`
    justify-content: center;
    width: 100%;
    max-heigth: 10px;  
    border-radius: 15px;
    background-size: 100% 100%;
    animation: ${backgroundAnimation} 6s linear infinite;

    .p-carousel-prev {
  display: none;
}

    .p-carousel-content{
    margin-top: 10px;
    max-height: 140px;
    overflow: hidden;
    border-radius: 15px;
    // background-color: ${(props) => props.theme.subnavbarCont};
    background-color: transparent;

    }

    .custom-carousel .p-carousel-item {
      display: flex;
      justify-content: center;
      margin-top: 15px;
    }
      .pi{
      color: ${(props) => props.theme.iconcolorHome};
      }
      .p-carousel .p-carousel-content .p-carousel-prev, .p-carousel .p-carousel-content .p-carousel-next {
      top: -5px;

      }


    @media (max-width: 1200px) {
      .custom-carousel .p-carousel-item {
      display: flex;
      justify-content: center;
    }
      .pi{
      color: ${(props) => props.theme.iconcolorHome};
      }
      .p-carousel .p-carousel-content .p-carousel-prev, .p-carousel .p-carousel-content .p-carousel-next {
      top: 0px;
      }

    }

    @media (max-width: 480px) {
    align-items: center;
    }
  `;
  
  const CategoryItem = styled.div`
    cursor: pointer;
    text-align: center;
    
  `;
  
  const CategoryImage = styled.img`
    width: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    border-radius: 9px;
  
    &:hover {
      transform: scale(0.9);
    }

    @media (max-width: 1200px) {
      width: 120px;
          &:hover {
      transform: scale(1.0);
    }

        @media (max-width: 480px) {
      width: 75px;
          &:hover {
      transform: scale(1.0);
    }

    }

  `;
