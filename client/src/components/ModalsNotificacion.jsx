import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy HH:mm:ss');
};

export function ModalsNotificacion({ notifications, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <ModalOverlay>
      <ModalContainer ref={modalRef}>
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

export function ModalsGifts({ notificationsGift, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <ModalOverlayg>
      <ModalContainerg ref={modalRef}>
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
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContainer = styled.div`
  background: #333;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid red;
  width: 400px;
  position: absolute;
  z-index: 9999;
  right: 290px;
  top: 20px;
  color: Red;
  max-height: 80vh;
  overflow-y: auto; 
  `;

const CloseButton = styled.button`
  position: absolute;
  top: 0px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 50px;
  cursor: pointer;
  color:red;
`;

const NotificationList = styled.div`
  margin-top: 40px;
`;

const NotificationItem = styled.div`
margin-bottom: 25px;
  color: white;
`;


//region GIFT

const ModalOverlayg = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContainerg = styled.div`
  background: #333;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  position: absolute;
  z-index: 9999;
  right: 210px;
  top: 20px;
  color: Red;

  `;

const CloseButtong = styled.button`
  position: absolute;
  top: 0px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 50px;
  cursor: pointer;
  color:red;
`;

const NotificationListg = styled.div`
  margin-top: 40px;

`;

const NotificationItemg = styled.div`
margin-bottom: 25px;
  color: white;
`;
