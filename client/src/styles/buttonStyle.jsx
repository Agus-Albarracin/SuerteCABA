import { createGlobalStyle } from 'styled-components';

export const buttonStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => (theme.mode === 'dark' ? '#121212' : '#FFFFFF')};
    color: ${({ theme }) => (theme.mode === 'dark' ? '#FFFFFF' : '#121212')};
    transition: all 0.1s linear;
  }
`;

// src/styles/Variables.js
export const v = {
  darkcheckbox: '#333333',
  lightcheckbox: '#cccccc',
};