import React, { useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../App'; 
import { v } from '../styles/Variables';

const ToggleTheme = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleChangeTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ToggleContainer theme={theme}>
      <label className="switch">
        <input
          type="checkbox"
          className="theme-switcher"
          checked={theme === 'light'}
          onChange={handleChangeTheme}
        />
        <span className="slider round"></span>
      </label>
    </ToggleContainer>
  );
};

export default ToggleTheme;

const ToggleContainer = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    margin-top: 16px;

    .theme-switcher {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .slider::before {
        content: '☀️';
        font-size: 20px;
        transform: translateX(25px);
      }
    }

    .slider {
      position: absolute;
      cursor: pointer;
      height: 18px;
      width: 35px;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${({ theme }) => (theme === 'dark' ? v.darkcheckbox : v.lightcheckbox)};
      transition: 0.1s;

      &::before {
        position: absolute;
        content: '🌑';
        font-size: 20px;
        left: -7px;
        top: 9px;
        line-height: 0px;
        transition: 0.4s;
      }

      &.round {
        border-radius: 34px;

        &::before {
          border-radius: 50%;
        }
      }
    }
  }
`;