import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns'; 

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy HH:mm:ss'); 
};

export function ModalsNotificacionR({ notifications, onClose }) {
  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <NotificationList>
          {notifications.map((notif, index) => (
            <NotificationItem key={index}>
              <hr />
              <p>{formatDate(notif.date)}</p> 
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
            </NotificationItem>
          ))}
        </NotificationList>
      </ModalContainer>
    </ModalOverlay>
  );
}

export function ModalsGiftsR({ notificationsGift, onClose }) {
  return (
    <ModalOverlayg>
      <ModalContainerg>
        <CloseButtong onClick={onClose}>×</CloseButtong>
        <NotificationListg>
          {notificationsGift.map((notif, index) => (
            <NotificationItemg key={index}>
              <hr />
              <p>{formatDate(notif.date)}</p> 
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
            </NotificationItemg>
          ))}
        </NotificationListg>
      </ModalContainerg>
    </ModalOverlayg>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContainer = styled.div`
  background: #333;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px; 
  color: white; 
  position: relative;
  z-index: 9999;
  max-height: 100vh; /* Limita la altura máxima al 80% de la ventana */
  overflow-y: auto;

    @media (max-width: 768px) {
    width: 95%;
    max-width: 90%; 
    max-height: 90vh; /* Ajusta la altura máxima para pantallas pequeñas */
  }

  @media (max-width: 480px) {
    width: 95%;
    max-width: 90%; 
    max-height: 90vh; /* Ajusta la altura para pantallas más pequeñas */
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 40px;
  cursor: pointer;
  color: red;
`;

const NotificationList = styled.div`
  margin-top: 50px;
`;

const NotificationItem = styled.div`
  margin-bottom: 20px;
  font-size: 14px;

  p {
    margin: 0;
  }

  h3 {
    margin: 5px 0;
  }
`;

//region GIFT

const ModalOverlayg = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContainerg = styled.div`
  background: #333;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px; 
  color: white; 
  position: relative;
  z-index: 9999;

  @media (max-width: 768px) {
    width: 95%;
    max-width: 90%; 
  }
`;

const CloseButtong = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 40px;
  cursor: pointer;
  color: red;
`;

const NotificationListg = styled.div`
  margin-top: 50px;
`;

const NotificationItemg = styled.div`
  margin-bottom: 20px;
  font-size: 14px;

  p {
    margin: 0;
  }

  h3 {
    margin: 5px 0;
  }
`;