// src/ContextBalance.js
import React, { createContext, useContext, useState } from 'react';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [adminBalance, setAdminBalance] = useState(0);


  return (
    <BalanceContext.Provider value={{ balance, setBalance, adminBalance, setAdminBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
