import { useContext, useState } from "react";
import Select from 'react-select';
import styled, { keyframes} from 'styled-components';
import { Carousel } from 'primereact/carousel';
import 'primereact/resources/themes/saga-blue/theme.css';  
import 'primereact/resources/primereact.min.css';           
import 'primeicons/primeicons.css';                         
import 'primeflex/primeflex.css';                           
import { ThemeContext } from "../../App";

// Imágenes 
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



export function SubNavbarSelect({ categories, onCategoryClick }) {
    const { theme } = useContext(ThemeContext);
    const [selectedCategory, setSelectedCategory] = useState("");

    const customOptions = categories.map(category => ({
        value: category,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={imageMap[category.toLowerCase().replace(/\s+/g, '_')]} 
              alt={category} 
              style={{ width: '100px', textAlign: 'center' }} 
            />
          </div>
        ),
    }));
    
    const handleCategoryChange = (selectedOption) => {
      setSelectedCategory(selectedOption.value);
      onCategoryClick(selectedOption.value);
    };

    const customStyles = {
        menuPortal: (base) => ({
            ...base,
            zIndex: 5555, 
            padding: '10px',
            
        }),
        control: (base) => ({
            ...base,
            backgroundColor: theme === "light" ? '#f1f1f1' : '#333',
            color:  'white',
            border: theme === "light" ?'2px solid black' :'2px solid white' ,
            borderRadius: '15px',
            padding: '6px',
            margin: '3px',
            width: '100%',
            '@media only screen and (max-width: 926px)': {
            width: '50%', 
        },
        '@media only screen and (max-width: 491px)': {
          width: '98%', 
      },
        }),
        option: (base) => ({
            ...base,
            backgroundColor: theme === "light" ? '#f1f1f1' : '#333',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', 
            padding: '10px', 
            width: '90px', 
            margin: '0 auto', 
            cursor: 'pointer',
            borderRadius: '10px',
            

        }),
        singleValue: (base) => ({
            ...base,
            color: 'white', 
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#333',
            color: 'white', 
        }),
        placeholder: (base) => ({
            ...base,
            color: theme === "light" ? 'black;' : 'white',

        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: theme === "light" ? 'black;' : 'white',

        }),
    };

    return (
        <Select 
          options={customOptions} 
          onChange={handleCategoryChange}
          placeholder="🧩 Proveedores"
          styles={customStyles}  
          menuPortalTarget={document.body}  
        />
    );
}
  
