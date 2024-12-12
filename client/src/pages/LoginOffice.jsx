import styled, { keyframes} from 'styled-components';
import React, { useState, useEffect, useContext} from 'react';
import axiosD from '../axiosDefault';
import { useAuth } from '../Context';
import { NavBarOffice } from '../components/HomeComponents/NavbarOffice';
import { SubNavbar } from '../components/HomeComponents/SubNavbar'
import { FullScreenCarousel } from "../components/HomeComponents/Carousel";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PacmanLoader from "react-spinners/PacmanLoader";
import PropagateLoader from "react-spinners/PropagateLoader";
import home1 from "../assets/home1.png"
import home2 from "../assets/home2.png"
import { ThemeContext } from "../App";

export const ThemeContext2 = React.createContext(null);

export function LoginOffice() {
  const [allGames, setAllGames] = useState([]);
  const [gameList, setGameList] = useState([]);
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [showAllTitles, setShowAllTitles] = useState(false);
  const [gamesToShow, setGamesToShow] = useState(72); 
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#ffffff");
const { setTheme, theme } = useContext(ThemeContext);
const [searchTerm, setSearchTerm] = useState("");

const bgHome = theme === "light" ? home2 : home1;


  return (
    <Container bgImage={bgHome}>
      <NavBarOffice />
    </Container>
  );
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
//region Container
const Container = styled.div`
  height: auto;
  background: url(${(props) => props.bgImage}) no-repeat;
  background-size: cover; 
  background-attachment: fixed;

 

  @media (max-width: 480px) {
  padding: 0px;
   
`;
//region INPUT
export const InputSearch = styled.input`
background: transparent;
color: ${(props) => props.theme.text};
position: absolute;
right: 12%;
border-radius: 15px;
background-size: 100% 100%;
margin-bottom: 50px;;
padding: 10px;
border: 1px solid  ${(props) => props.theme.text};
width: 40%;
  &:focus {
    outline: none;
  }
`;