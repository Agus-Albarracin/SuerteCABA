import React, { useState, useEffect, useContext } from 'react';
import {styled, keyframes} from 'styled-components';
import axiosD from "../axiosDefault";
import axios from "axios"
import { NavBarAgentAdminResposive } from '../components/HomeComponents/NavbarAgentAdminResponsive';
import { NavBarAgentAdmin } from '../components/HomeComponents/NavbarAgentAdmin';
import { FaTrashAlt } from 'react-icons/fa'; 
import { toast } from 'react-toastify'; 
import bar from "../assets/1.jpg"
import wab from "../assets/2.png"
import { ThemeContext } from "../App";
import { useAuth } from '../Context';


export function Settings() {
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isResponsive, setIsResponsive] = useState(false);
  
    const { setTheme, theme } = useContext(ThemeContext);
    const { user, loginOffice, logout } = useAuth();

    const bgsidebar = theme === "light" ? wab : bar;
  
    useEffect(() => {
      axiosD.get('/images')
        .then(response => setImages(response.data))
        .catch(error => console.error('Error fetching images:', error));
    }, []);
  
    useEffect(() => {
      const handleResize = () => setIsResponsive(window.innerWidth <= 768);
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSelectedFile(file);
  
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    };
  
    const handleUpload = () => {
      if (!selectedFile) {
        toast.error('No se ha seleccionado ningún archivo.');
        return;
      }
  
      const formData = new FormData();
      formData.append('images', selectedFile);
  
      axiosD.post('/upload', formData)
        .then(response => {
          if (response.data && Array.isArray(response.data.files)) {
            setImages(prevImages => [
              ...prevImages,
              ...response.data.files.map(file => `https://suerte24.bet/uploads/${file.filename}`)
            ]);
            toast.success('Imagen subida exitosamente!');
            setSelectedFile(null);  
            setPreviewUrl(null);   
          } else {
            console.error('Unexpected response format:', response.data);
          }
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          toast.error('Error al subir la imagen.');
        });
    };
  
    const handleDelete = (filename) => {
      const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta imagen?');
      if (!confirmed) return;
  
      const fileName = filename.split('/').pop();
  
      axiosD.delete(`/delete/${fileName}`)
        .then(response => {
          setImages(prevImages => prevImages.filter(img => !img.endsWith(fileName)));
          toast('🔴 🗑️ Imagen eliminada exitosamente!');
        })
        .catch(error => {
          console.error('Error deleting image:', error);
          toast.error('Error al eliminar la imagen.');
        });
    };
  
    const triggerFileInput = () => {
      document.getElementById('fileInput').click();
    };

    useEffect(() => {
      // Recuperar la configuración inicial
      axiosD.get('/getsettings')
          .then(response => {
              const data = response.data.content;
              
              // Configuración del hall
              const hallConfig = data.hall.reduce((acc, item) => {
                  acc[item.key] = item.value;
                  return acc;
              }, {});
              
              setRatio(hallConfig.ratio || '3x4');
              setLanguage(hallConfig.language || 'AUTO');
              setRtp(hallConfig.rtp || '150');
              setBetMin(hallConfig.bet_min || '0.01');
              setBetMax(hallConfig.bet_max || '5000.00');
              setEgtJp(hallConfig.egt_jp === '1');
              setDemoCredit(hallConfig.demoCredit || '100.00');
              
              // Configuración IG
              const igConfig = data.ig.reduce((acc, item) => {
                  acc[item.key] = item.value;
                  return acc;
              }, {});
              
              setIgroDenom(igConfig.igroDenom || '1.0');
              setDenom(igConfig.denom || 'true');
              setMinLine(igConfig.minLine === '1');
              setIgBetLimit(igConfig.betLimit || '5000');
              setIgRiskLimit(igConfig.riskLimit || '1000');
              
              // Configuración SLGames
              const slgamesConfig = data.slgames.reduce((acc, item) => {
                  acc[item.key] = item.value;
                  return acc;
              }, {});
              
              setSlBetLimit(slgamesConfig.betLimit || '1000');
              setSlRiskLimit(slgamesConfig.riskLimit || '300');
              
          })
          .catch(error => {
              console.error('Error al recuperar la configuración del hall:', error);
              toast.error('Error al recuperar la configuración del hall.');
          });
  }, []);

    const [ratio, setRatio] = useState('3x4');
    const [language, setLanguage] = useState('AUTO');
    const [rtp, setRtp] = useState('150');
    const [betMin, setBetMin] = useState('0.01');
    const [betMax, setBetMax] = useState('5000.00');
    const [egtJp, setEgtJp] = useState(true);
    const [igroDenom, setIgroDenom] = useState('1.0');
    const [denom, setDenom] = useState('true');
    const [minLine, setMinLine] = useState(false);
    const [igBetLimit, setIgBetLimit] = useState('5000');
    const [igRiskLimit, setIgRiskLimit] = useState('1000');
    const [slBetLimit, setSlBetLimit] = useState('1000');
    const [slRiskLimit, setSlRiskLimit] = useState('300');
    const [demoCredit, setDemoCredit] = useState('100.00');

    const handleSubmit = (e) => {
        e.preventDefault();

        const requestData = {
            ratio,
            language,
            rtp,
            egt_jp: egtJp,
            bet_min: betMin,
            bet_max: betMax,
            igroDenom,
            denom,
            minLine,
            igBetLimit,
            igRiskLimit,
            slBetLimit,
            slRiskLimit,
            demoCredit,
        };

        axiosD.post('/settings', requestData)
            .then(response => {
                toast.success('Configuración del hall cambiada exitosamente!');
            })
            .catch(error => {
                console.error('Error al cambiar la configuración del hall:', error);
                toast.error('Error al cambiar la configuración del hall.');
            });
    };
  
    return (
      <Container bgImage={bgsidebar}>
        <Section>
          {isResponsive ? <NavBarAgentAdminResposive /> : <NavBarAgentAdmin />}
          <h1>Gestionar imágenes</h1>
          <div className="divFiles">
          {previewUrl && (
            <PreviewContainer>
              <h3>Previsualización de la imagen:</h3>
              <img src={previewUrl} alt="Previsualización" />
            </PreviewContainer>
          )}
            <HiddenInput id="fileInput" type="file" onChange={handleFileChange} />
            <ButtonSelectFile onClick={triggerFileInput}>Seleccionar Imagen</ButtonSelectFile>
            <ButtonUp onClick={handleUpload}>Subir Imagen</ButtonUp>
          </div>

          <ImageGrid>
            {images.map((image, index) => (
              <ImageItem key={index}>
                <img src={image} alt={`Imagen ${index + 1}`} />
                <Actions>
                  <ActionButton onClick={() => handleDelete(image)}>
                    <FaTrashAlt color="red" />
                  </ActionButton>
                </Actions>
              </ImageItem>
            ))}
          </ImageGrid>
        </Section>
  {user && user.rol === "Super" ? (
    <>
  <h2>Cambiar Configuración del Hall</h2>
      <Section2>
        <Form onSubmit={handleSubmit}>
        <br />
        <br />
          <FormGroup>
            <Label htmlFor="language">Lenguaje:</Label>
            <Input type="text" id="language" value={language} transparent />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="rtp">RTP:</Label>
            <Input
              type="text"
              id="rtp"
              value={rtp}
              onChange={(e) => setRtp(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="betMin">Apuesta Min:</Label>
            <Input
              type="number"
              step="0.01"
              id="betMin"
              value={betMin}
              onChange={(e) => setBetMin(e.target.value)}
              transparent
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="betMax">Apuesta Max:</Label>
            <Input
              type="number"
              step="0.01"
              id="betMax"
              value={betMax}
              onChange={(e) => setBetMax(e.target.value)}
              transparent
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="egtJp">EGT JackPoint:</Label>
            <Checkbox
              type="checkbox"
              id="egtJp"
              checked={egtJp}
              onChange={(e) => setEgtJp(e.target.checked)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="demoCredit">Credito demo:</Label>
            <Input
              type="text"
              id="demoCredit"
              value={demoCredit}
              onChange={(e) => setDemoCredit(e.target.value)}
              transparent
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="ratio">Pantalla:</Label>
            <Select id="ratio" value={ratio} onChange={(e) => setRatio(e.target.value)}>
              <option value="16x9">16x9</option>
              <option value="3x4">3x4</option>
              <option value="9x16">9x16</option>
            </Select>
          </FormGroup>

          <br />
          <br />

          <h2>IG Configuración</h2>
          <br />
          <br />

          <FormGroup>
            <Label htmlFor="igroDenom">Denominación: Igrosoft, American Poker II:</Label>
            <Select id="igroDenom" value={igroDenom} onChange={(e) => setIgroDenom(e.target.value)}>
              <option value="0.01">0.01</option>
              <option value="0.10">0.10</option>
              <option value="1.0">1.0</option>
              <option value="10">10</option>
              <option value="100">100</option>
              <option value="1000">1000</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="denom">Denominación: Aristocrat, Novomatic, Merkur</Label>
            <Select id="denom" value={denom} onChange={(e) => setDenom(e.target.value)}>
              <option value="0.01">0.01</option>
              <option value="true">true</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="minLine">Lineas Mínimas:</Label>
            <Checkbox
              type="checkbox"
              id="minLine"
              checked={minLine}
              onChange={(e) => setMinLine(e.target.checked)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="igBetLimit">Máxima multiplicación de juego:</Label>
            <Input
              type="number"
              id="igBetLimit"
              value={igBetLimit}
              onChange={(e) => setIgBetLimit(e.target.value)}
              transparent
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="igRiskLimit">Máxima multiplicación de riesgo:</Label>
            <Input
              type="number"
              id="igRiskLimit"
              value={igRiskLimit}
              onChange={(e) => setIgRiskLimit(e.target.value)}
              transparent
            />
          </FormGroup>
          <br />
          <br />
          <h2>SL Games Configuración</h2>
          <TituloH4>Otro sistema de configuración</TituloH4>

          <br />
          <br />
          <FormGroup>
            <Label htmlFor="slBetLimit">SL Apuesta Límite:</Label>
            <Input
              type="number"
              id="slBetLimit"
              value={slBetLimit}
              onChange={(e) => setSlBetLimit(e.target.value)}
              transparent
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="slRiskLimit">SL Riesgo Límite:</Label>
            <Input
              type="number"
              id="slRiskLimit"
              value={slRiskLimit}
              onChange={(e) => setSlRiskLimit(e.target.value)}
              transparent
            />
          </FormGroup>
          <br />
          <br />
          <Button type="submit">Cambiar Configuración</Button>
        </Form>
      </Section2>
      </>
       ) : ( null )}
      </Container>
    );
  }
  
  const slideDown = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;
const Container = styled.div`
  background: url(${(props) => props.bgImage}) no-repeat;
  background-size: cover; 
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  min-height: 1080px;
  overflow: hidden;
  padding: 15px;

  @media (max-width: 768px) {
    padding: 0px;
    max-width: 768px;
  }
  @media (max-width: 480px) {
    padding: 0px;
    max-width: 480px;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  margin-bottom: 5%;


  .divFiles{
  flex-direction: row;
  margin-rightg: 15px;
  padding: 10px;

  }

.file-input {
  display: none; /* Oculta el input real */
}

.file-label {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.file-label:hover {
  background-color: #0056b3;
}

`;

const PreviewContainer = styled.div`
  margin-top: 20px;
  h3 {
    margin-bottom: 10px;
  }
  img {
    max-width: 500px;
    width: 100%;
    max-height: 150px;
    height: auto;
    border: 1px solid #ddd;
    padding: 5px;
    border-radius: 5px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ButtonSelectFile = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 8px 12px;
  margin-right: 10px;
  border-radius: 4px;

  border: none;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;
const ImageGrid = styled.div`
  display: grid;
  padding: 10px;
  grid-template-columns: repeat(3, 1fr); /* Tres columnas de igual tamaño */
  gap: 5%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr); /* Dos columnas en pantallas medianas */
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Una columna en pantallas pequeñas */
  }
`;

const ImageItem = styled.div`
   display: flex;
  flex-direction: column;
  position: relative;

  img {
    margin-top: 5px;
    max-width: 500px;
    max-height: 150px;
    width: 100%;
    width: 100%;
    height: auto;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }
`;

const Actions = styled.div`
  max-width: 500px;
  background-color: #333;
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: relative;
  padding: 0 10px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #333;

  &:hover {
    color: #007bff;
  }
`;

const ButtonUp = styled.button`
  padding: 8px 12px;
  margin-left: 1px;
  max-width: 150px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.theme.bgtabbutton};
  color: white;
  cursor: pointer;
  transition: background-color 0.6s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.8s ease;
  border: 0px solid rgb(50, 50, 50);
  animation: ${slideDown} 1.5s ease-out;
  box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.6);
  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
    transform: scale(0.9);
    box-shadow: none;
  } 

  @media (max-width: 768px) {
  margin-top: 7px;
}

`;

const Section2 = styled.section`
  padding-left: 5%;
  padding-right: 45%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  margin-top: 20px;
  
@media (max-width: 480px) {
  padding-right: 5%;
  margin-bottom: 30%;

}

`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; 
  gap: 10px; 
`;

const Label = styled.label`
  font-weight: bold;
  flex-basis: 50%; 
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 200px;
  width: 100%;
  background-color: ${(props) => props.transparent ? 'transparent' : 'white'};
  color: ${(props) => props.transparent ? 'white' : '#000'};
  border-color: ${(props) => props.transparent ? '#ccc' : '#ccc'};
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 200px;
  width: 100%;
`;

const TituloH4 = styled.h4`
  text-decoration: underline;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin: 0 10px 0 0;
  width: 15px; 
  height: 15px; 
  transform: scale(1.5);
  cursor: pointer;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #red;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20%;
  background-color: ${props => props.theme.bgtabbutton};

  &:hover {
    background-color: ${props => props.theme.tabbuttoncolorhover};
`;

export default Settings;