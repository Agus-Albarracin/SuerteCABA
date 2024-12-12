import React, { useState, useContext, useEffect} from 'react';
import axiosD from '../axiosDefault';
import { toast } from 'react-toastify';
import bar from "../assets/1.png"
import wab from "../assets/2.png"
import { ThemeContext } from "../App";
import {styled, keyframes} from 'styled-components';
import { NavBarAgentAdmin } from "../components/HomeComponents/NavbarAgentAdmin";
import { NavBarAgentAdminResposive } from '../components/HomeComponents/NavbarAgentAdminResponsive';


export function Reportes (){
  const [userTitle, setUserTitle] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [giftTitle, setGiftTitle] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [isResponsive, setIsResponsive] = useState(false);


  const { setTheme, theme } = useContext(ThemeContext);

  const bgsidebar = theme === "light" ? wab : bar;

  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 768); 
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUserNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosD.post('/notifications', { title: userTitle, message: userMessage, type: 'user' });
      toast.success('Se envío la notificación con éxito');
      setUserTitle('');
      setUserMessage('');
    } catch (error) {
      console.error('Error al enviar notificación a usuarios:', error);
      toast.error('Error al enviar notificación a usuarios');
    }
  };

  const handleGiftNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosD.post('/notifications', { title: giftTitle, message: giftMessage, type: 'gift' });
      toast.success('Se envío la notificación de regalo con éxito');
      setGiftTitle('');
      setGiftMessage('');
    } catch (error) {
      console.error('Error al enviar notificación de regalos:', error);
      toast.error('Error al enviar notificación de regalos');
    }
  };

  return (
    <ReportsContainer bgImage={bgsidebar}>
{isResponsive ? <NavBarAgentAdminResposive /> : <NavBarAgentAdmin />}
      <Section>
        <SectionTitle>Enviar Notificación a Usuarios</SectionTitle>
        <FormContainer>
          <form onSubmit={handleUserNotificationSubmit}>
            <FormGroup>
              <Label>Título</Label>
              <Input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Mensaje</Label>
              <Textarea
                rows="4"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                required
              />
            </FormGroup>
            <Button type="submit">Enviar Notificación a Usuarios</Button>
          </form>
        </FormContainer>
      </Section>
      <Section>
        <SectionTitle>Enviar Notificación de Regalos</SectionTitle>
        <FormContainer>
          <form onSubmit={handleGiftNotificationSubmit}>
            <FormGroup>
              <Label>Título</Label>
              <Input
                type="text"
                value={giftTitle}
                onChange={(e) => setGiftTitle(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Mensaje</Label>
              <Textarea
                rows="4"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                required
              />
            </FormGroup>
            <Button type="submit">Enviar Notificación de Regalos</Button>
          </form>
        </FormContainer>
      </Section>
    </ReportsContainer>
  );
};



const ReportsContainer = styled.div`
  background: url(${(props) => props.bgImage}) no-repeat center center;
  border-radius: 8px;
  min-height: 1080px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 18px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }

  @media (max-width: 360px) {
    padding: 14px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5em;
  margin-bottom: 10px;
  border-bottom: 2px solid red;
  padding-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 1.4em;
  }

  @media (max-width: 480px) {
    font-size: 1.3em;
  }

  @media (max-width: 360px) {
    font-size: 1.2em;
  }
`;

const FormContainer = styled.div`
  padding: 20px;
  background: #333;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;

  @media (max-width: 768px) {
    padding: 18px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    width: 95%;
  }

  @media (max-width: 428px) {
    padding: 14px;
    width: 95%;
  }
  
  @media (max-width: 412px) {
    padding: 14px;
    width: 92%;
  }

  @media (max-width: 390px) {
    padding: 12px;
    width: 90%;
  }

  @media (max-width: 380px) {
    padding: 10px;
    width: 93%;
  }

  @media (max-width: 375px) {
    padding: 10px;
    width: 85%;
  }

  @media (max-width: 360px) {
    padding: 8px;
    width: 80%;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }

  @media (max-width: 360px) {
    margin-bottom: 10px;
  }
`;

const Label = styled.label`
  display: block;
  color: white;
  margin-bottom: 5px;
  font-weight: bold;

  @media (max-width: 480px) {
    margin-bottom: 4px;
  }

  @media (max-width: 360px) {
    margin-bottom: 3px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;

  @media (max-width: 768px) {
    padding: 7px;
  }

  @media (max-width: 480px) {
    padding: 6px;
  }

  @media (max-width: 360px) {
    padding: 5px;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;

  @media (max-width: 768px) {
    padding: 7px;
  }

  @media (max-width: 480px) {
    padding: 6px;
  }

  @media (max-width: 360px) {
    padding: 5px;
  }
`;
const Button = styled.button`
  background-color: ${props => props.theme.bgtabbutton};
  color: #fff;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
  }

`;