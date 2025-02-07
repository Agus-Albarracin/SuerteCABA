import React from "react";
import styled from "styled-components";
import logo from "../assets/logo-suerte-whitedorado.png";

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Ocupa toda la pantalla */
  width: 100vw;
  background-color: black; /* Fondo negro */
`;

const Logo = styled.img`
  max-width: 80%;
  max-height: 80%; /* Limita el tamaño máximo para que la imagen no sea demasiado grande */
  height: auto;
  animation: fadeIn 1.5s ease-in-out infinite alternate;

  @keyframes fadeIn {
    from {
      opacity: 0.5;
    }
    to {
      opacity: 1;
    }
  }

  /* Responsivo */
  @media (max-width: 768px) {
    max-width: 80%; /* En pantallas más pequeñas, ajustamos un poco más el tamaño */
  }
`;

const LoadingScreen = () => {
  return (
    <LoadingContainer>
      <Logo src={logo} alt="Suerte Logo" />
    </LoadingContainer>
  );
};

export default LoadingScreen;
