import { useState, useContext } from "react";
import styled from "styled-components";
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

export function SubNavbarButton({ categories, onCategoryClick, toggleSubNavbar }) {
  const { theme } = useContext(ThemeContext);
  const [visibleCategory, setVisibleCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setVisibleCategory(visibleCategory === category ? null : category);
    onCategoryClick(category);
    toggleSubNavbar();
  };

  const logoToUse = theme === "light" ? "negro.png" : "blanco.png"; // Ajusta el logo según el tema

  const excludedCategories = ["pragmatic_live", "netent", "bingo", "roulette", "keno", "table_games"];
  
  // Filtrar categorías
  const filteredCategories = categories
    .filter((category) => !excludedCategories.includes(category))
    .filter((category) => imageMap[category.toLowerCase().replace(/\s+/g, '_')]);

  return (
    <SubNavContainer theme={theme}>
      <ContentWrapper>
        <CategoriesGrid>
          {filteredCategories.map((category) => {
            const imagePath = imageMap[category.toLowerCase().replace(/\s+/g, '_')];
            return (
              <CategoryButton key={category} onClick={() => handleCategoryClick(category)}>
                <CategoryImage src={imagePath} alt={category} />
              </CategoryButton>
            );
          })}
        </CategoriesGrid>
      </ContentWrapper>
    </SubNavContainer>
  );
}

// Estilos

const SubNavContainer = styled.div`
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 35px;
  color: ${(props) => props.theme.text};
  margin-bottom: 2%;
  margin-top: 2%;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 100%;
  padding: 10px;
`;

const CategoryButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 10px;
  padding: 10px;
  background-color: ${(props) => props.theme.subnavbarCont || "transparent"};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #444;
  }
`;

const CategoryImage = styled.img`
  width: 100%;
  max-width: 100px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const CategoryDetails = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  color: white;
  width: 100%;
  max-width: 150px;

  h3 {
    margin-bottom: 5px;
    font-size: 16px;
  }

  p {
    font-size: 14px;
  }
`;
