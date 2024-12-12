const mongoose = require('mongoose');
const User = require('../models/User'); 
const MyMovements = require('../models/MyMovements');
const moment = require('moment-timezone');

const loadSuper = async (req, res, io) => {
  try {
    const { amount, login } = req.body; 

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'El monto ingresado no es válido.' });
    }

    try {
      const user = await User.findOne({ login });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      if (user.rol !== 'Super') {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
      }

      const currentBalance = parseFloat(user.balance || '0');
      const amountDecimal = parsedAmount;



      const newBalance = (currentBalance + amountDecimal).toFixed(2);


      user.balance = newBalance.toString();

      await user.save();

      const movement = new MyMovements({
        date: moment().tz("America/Argentina/Buenos_Aires").format('YYYY-MM-DD HH:mm:ss'),
        monto: amountDecimal
      });

      await movement.save();
  
      io.emit('balanceUpdatedAdmin', {
        login: user.login, 
        balance: user.balance 
      });

      return res.status(200).json({ message: 'Carga realizada exitosamente.', balance: user.balance });
    } catch (err) {
      console.error('Error al realizar la transacción:', err);
      return res.status(500).json({ error: 'Error al realizar la carga.' });
    }
  } catch (error) {
    console.error('Error en loadSuper:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { loadSuper };