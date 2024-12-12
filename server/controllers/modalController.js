const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Movement = require('../models/Movement');
const MovementError = require('../models/MovementsError');

const User = require('../models/User');
const { getIo } = require('../Socket');
const moment = require('moment-timezone');
const redis = require('redis');

const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Conectar al cliente de Redis
(async () => {
  try {
      await redisClient.connect();  
  } catch (error) {
      console.error('Error al conectar a Redis:', error);
  }
})();

// const registerMovementCache = async (movimiento) => {
//   try {
//     // console.log("Se muestra movimiento fecha:", movimiento.date);
//     // console.log("Se muestra movimientos", movimiento);

//     const userKey = `userId${movimiento.usuarioResponsable}`; 
//     // console.log("Se muestra el id responsable", userKey);

//     const newMovement = movimiento;
//     console.log(newMovement);

//     const movementDate = movimiento.date.split(' ')[0];
//     // console.log("Se muestra la fecha del movimiento:", movementDate);

//     const cachedMovements = await redisClient.get(userKey); 
    
//     if (cachedMovements) {
//       const movementsData = JSON.parse(cachedMovements);
//       // console.log("se muestra movementsData parseado", movementsData);

//       movementsData.data.movimientos.push(newMovement);
//       movementsData.data.totalMovimientos = movementsData.data.movimientos.length;

//       await redisClient.set(userKey, JSON.stringify(movementsData), 'EX', 5000);
//     } else {
//       const initialMovementsData = {
//         data: {
//           movimientos: [newMovement],  
//           totalMovimientos: 1
//         }
//       };
//       await redisClient.set(userKey, JSON.stringify(initialMovementsData), 'EX', 72000);
//     }

//     const updatedCachedData = await redisClient.get(userKey);
//     // console.log(`Contenido del caché para la clave ${userKey}:`, JSON.parse(updatedCachedData));

//   } catch (error) {
//     console.error('Error al registrar el movimiento:', error);
//     throw new Error('Error al registrar el movimiento');
//   }
// };

const registerMovement = async (movimiento) => {
  try {
    const newMovement = new Movement(movimiento);
    await newMovement.save();

  } catch (error) {
    console.error('Error al registrar el movimiento:', error);
    throw new Error('Error al registrar el movimiento');
  }
  
};

const registerMovementError = async (movimiento) => {
  try {
    const newMovement = new MovementError(movimiento);
    await newMovement.save();

  } catch (error) {
    console.error('Error al registrar el movimiento erroneo:', error);
    throw new Error('Error al registrar el movimiento erroneo');
  }
  
};

// Función para registrar un movimiento en el usuario
const registerMovementInUser = async (userId, movimiento) => {
  const user = await User.findById(userId, 'movimientos');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Agregar el nuevo movimiento al usuario
  user.movimientos.push(movimiento);
  await user.save();

};


// Función común para crear y registrar movimientos
const createMovement = async (type, adminId, userId, amount, bonus, adminBalance, userBalance, adminLogin, userLogin, adminRole, userRole) => {
  const transactionId = uuidv4();
  const movementDate = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')  
  
  console.log("date", movementDate);


  // await registerMovementCache({
  //   type: type === "deposito" ? "Deposito" : "Retiro",
  //   balanceAntesReceptor:userBalance.toFixed(2),
  //   balanceAntesResponsable:adminBalance.toFixed(2),
  //   balanceDespuesReceptor:(userBalance + amount).toFixed(2),
  //   balanceDespuesResponsable:(adminBalance - amount).toFixed(2),
  //   date: movementDate, 
  //   details:{
  //     nameReceptor: userLogin,
  //     nameResponsable: adminLogin,
  //     monto: amount,
  //   },
  //   monto: amount,
  //   nameReceptor: userLogin,
  //   nameResponsable: adminLogin,
  //   usuarioReceptor: userId,
  //   usuarioResponsable: adminId,
  //   bonificacion: bonus > 0 ? bonus.toFixed(2) : undefined,
  //   transactionId,
  //   rolResponsable: adminRole,
  //   rolReceptor: userRole,
  // });

  // Registrar un solo movimiento que cubra tanto al admin como al usuario
  await registerMovement({
    type,
    date: movementDate, 
    monto: amount,
    usuarioResponsable: adminId,
    usuarioReceptor: userId,
    nameResponsable: adminLogin,
    balanceAntesResponsable:adminBalance.toFixed(2),
    balanceDespuesResponsable:(adminBalance - amount).toFixed(2),
    nameReceptor: userLogin,
    balanceAntesReceptor:userBalance.toFixed(2),
    balanceDespuesReceptor:(userBalance + amount).toFixed(2),
    bonificacion: bonus > 0 ? bonus.toFixed(2) : undefined,
    transactionId,
    rolResponsable: adminRole,
    rolReceptor: userRole,
  });




  return transactionId;
};

// Función común para crear y registrar movimientos
const createMovementError = async (type, adminId, userId, amount, bonus, adminBalance, userBalance, adminLogin, userLogin, adminRole, userRole) => {
  const transactionId = uuidv4();
  const movementDate = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');

  console.log("date", movementDate);

    // Cálculo de balances según el tipo de movimiento
    const balanceDespuesResponsable =
    type === 'deposito_erroneo'
      ? (adminBalance - amount).toFixed(2)
      : type === 'retiro_erroneo'
      ? (adminBalance + amount).toFixed(2) // Retiro erróneo: reembolsar monto al admin
      : adminBalance.toFixed(2);

  const balanceDespuesReceptor =
    type === 'deposito_erroneo'
      ? (userBalance + amount).toFixed(2)
      : type === 'retiro_erroneo'
      ? (userBalance - amount).toFixed(2) // Retiro erróneo: descontar monto al usuario
      : userBalance.toFixed(2);

  // Registrar un solo movimiento
    // Registrar un solo movimiento
    await registerMovementError({
      type,
      date: movementDate,
      monto: amount,
      usuarioResponsable: adminId,
      usuarioReceptor: userId,
      nameResponsable: adminLogin,
      balanceAntesResponsable: adminBalance.toFixed(2),
      balanceDespuesResponsable,
      nameReceptor: userLogin,
      balanceAntesReceptor: userBalance.toFixed(2),
      balanceDespuesReceptor,
      bonificacion: bonus > 0 ? bonus.toFixed(2) : undefined,
      transactionId,
      rolResponsable: adminRole,
      rolReceptor: userRole,
    });

  return transactionId;
};

const deposit = async (req, res, io) => {
  const { adminId, userId, amount, bonus, supervisor, usuariosCreados } = req.body;

  try {
    const admin = await User.findById(adminId, 'login balance rol');
    const user = await User.findById(userId, 'login balance rol');
     
    if (!admin || !user) {
      return res.status(404).json({ message: 'Admin o usuario no encontrado' });
    }

    const depositAmount = parseFloat(amount);
    const bonusPercentage = parseFloat(bonus) || 0;

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    if (bonusPercentage < 0) {
      return res.status(400).json({ message: 'Porcentaje de bonificación inválido' });
    }

    // Calcular la bonificación
    const bonusAmount = (depositAmount * (bonusPercentage / 100));
    const totalDepositAmount = depositAmount + bonusAmount;

    const adminBalance = parseFloat(admin.balance.toString());
    const userBalance = parseFloat(user.balance.toString());

    if (adminBalance < totalDepositAmount) {
      return res.status(400).json({ message: 'Saldo insuficiente en la cuenta del administrador' });
    }

    admin.balance = (adminBalance - totalDepositAmount).toFixed(2);
    user.balance = (userBalance + totalDepositAmount).toFixed(2);


    await admin.save();
    await user.save();
    res.status(200).json({ message: 'Depósito exitoso', adminBalance: admin.balance, userBalance: user.balance});

    
    
    // Crear y registrar el movimiento
    const transactionId = await createMovement(
      'deposito',
      adminId,
      userId,
      totalDepositAmount,
      bonusAmount,
      adminBalance,
      userBalance,
      admin.login,
      user.login,
      admin.rol,
      user.rol,
      supervisor,
    );
    
          // Actualizar balances
          const newAdminBalance = (adminBalance - depositAmount).toFixed(2);
          const newUserBalance = (userBalance + depositAmount).toFixed(2);
    

          // Registrar movimiento en el administrador
          await registerMovementInUser(adminId, {
            type: 'deposito',
            date: moment().tz('America/Argentina/Buenos_Aires').toDate(), 
            monto: totalDepositAmount,
            usuarioResponsable: adminId,
            usuarioReceptor: userId,
            nameResponsable:admin.login,
            nameReceptor: user.login,
            balanceAntes: mongoose.Types.Decimal128.fromString(adminBalance.toFixed(2)),
            balanceDespues: mongoose.Types.Decimal128.fromString(newAdminBalance),
            transactionId: transactionId,
          });
      
          // Registrar movimiento en el usuario
          await registerMovementInUser(userId, {
            type: 'deposito',
            date: moment().tz('America/Argentina/Buenos_Aires').toDate(),
            monto: totalDepositAmount,
            usuarioResponsable: adminId,
            usuarioReceptor: userId,
            nameResponsable:admin.login,
            nameReceptor: user.login,
            balanceAntes: userBalance.toFixed(2),
            balanceDespues: newUserBalance,
            transactionId: transactionId,
          });




        const io = getIo();
        
        io.emit('balanceUpdatedAdmin', {
            login: admin.login, 
            balance: admin.balance
          });


          io.emit('balanceUpdated', {
            login: user.login, 
            balance: user.balance
          });

          console.log("Enviando notificación a:", user.login);
          io.to(user.login).emit('getNotification', {
          login: user.login, 
          balance: user.balance
         });
    
        //notificación de retiro
        io.to(user.login).emit('getNotification', {
          notifications: [{
            type: 'deposito',
            date: new Date(),
            message: `Se ha realizado un depósito de  $${totalDepositAmount} de tu cuenta con éxito.`,
            seen: false
          }]
        });


  } catch (error) {
    console.error('Error al realizar el depósito:', error);

        // Enviar el error al endpoint de depósitos erróneos
        try {
          await axiosD.post('/depositError', {
            adminId,
            userId,
            amount: parseFloat(amount) || 0,
            bonus: parseFloat(bonus) || 0,
            supervisor,
          });
        } catch (postError) {
          console.error('Error al registrar el depósito erróneo:', postError);
        }

    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const retiro = async (req, res, io) => {
  const { adminId, userId, amount, bonus , supervisor, usuariosCreados} = req.body;

  try {
    const admin = await User.findById(adminId, 'login balance rol');
    const user = await User.findById(userId, 'login balance rol');

    if (!admin || !user) {
      return res.status(404).json({ message: 'Admin o usuario no encontrado' });
    }

    const withdrawalAmount = parseFloat(amount);
    const bonusPercentage = parseFloat(bonus) || 0;

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    if (bonusPercentage < 0) {
      return res.status(400).json({ message: 'Porcentaje de bonificación inválido' });
    }

    // Calcular la bonificación
    const bonusAmount = (withdrawalAmount * (bonusPercentage / 100));
    const totalWithdrawalAmount = withdrawalAmount + bonusAmount;

    const adminBalance = parseFloat(admin.balance.toString());
    const userBalance = parseFloat(user.balance.toString());

    if (userBalance < totalWithdrawalAmount) {
      return res.status(400).json({ message: 'Saldo insuficiente en la cuenta del usuario' });
    }

    // Actualizar balances
    admin.balance = (adminBalance + totalWithdrawalAmount).toFixed(2);
    user.balance = (userBalance - totalWithdrawalAmount).toFixed(2);

    await admin.save();
    await user.save();
    res.status(200).json({ message: 'Retiro exitoso', adminBalance: admin.balance, userBalance: user.balance});


    // Crear y registrar el movimiento
    const transactionId = await createMovement(
      'retiro',
      adminId,
      userId,
      totalWithdrawalAmount,
      bonusAmount,
      adminBalance,
      userBalance,
      admin.login,
      user.login,
      admin.rol,
      user.rol,
      supervisor,
    );

      // Actualizar balances
      const newAdminBalance = (adminBalance + withdrawalAmount).toFixed(2);
      const newUserBalance = (userBalance - withdrawalAmount).toFixed(2);

    // Registrar movimiento en el administrador
    await registerMovementInUser(adminId, {
      type: 'retiro',
      fecha: moment().tz('America/Argentina/Buenos_Aires').toDate(),
      monto: withdrawalAmount,
      usuarioResponsable: adminId,
      usuarioReceptor: userId,
      nameResponsable:admin.login,
      nameReceptor: user.login,
      balanceAntes: adminBalance.toFixed(2),
      balanceDespues: newAdminBalance,
      transactionId: transactionId,
    });

    // Registrar movimiento en el usuario
    await registerMovementInUser(userId, {
      type: 'retiro',
      fecha: moment().tz('America/Argentina/Buenos_Aires').toDate(),
      monto: withdrawalAmount,
      usuarioResponsable: adminId,
      usuarioReceptor: userId,
      nameResponsable:admin.login,
      nameReceptor: user.login,
      balanceAntes:userBalance.toFixed(2),
      balanceDespues: newUserBalance,
      transactionId: transactionId,
    });

    const io = getIo();

    io.emit('balanceUpdatedAdmin', {
      login: admin.login, 
      balance: admin.balance
    });

    io.emit('balanceUpdated', {
      login: user.login, 
      balance: user.balance
    });

    io.to(user.login).emit('getNotification', {
      login: user.login, 
      balance: user.balance
    });


        //notificación de retiro
        io.to(user.login).emit('getNotification', {
          notifications: [{
            type: 'withdrawal',
            date: new Date(),
            message: `Se ha realizado un retiro de  $${totalWithdrawalAmount} de tu cuenta con éxito.`,
            seen: false
          }]
        });

  } catch (error) {
    console.error('Error al realizar el retiro:', error);

            // Enviar el error al endpoint de depósitos erróneos
            try {
              await axiosD.post('/retiroError', {
                adminId,
                userId,
                amount: parseFloat(amount) || 0,
                bonus: parseFloat(bonus) || 0,
                supervisor,
              });
            } catch (postError) {
              console.error('Error al registrar el retiro erróneo:', postError);
            }

    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


const depositError = async (req, res) => {
  const { adminId, userId, amount, bonus, supervisor } = req.body;

  try {
    const admin = await User.findById(adminId, 'login balance rol');
    const user = await User.findById(userId, 'login balance rol');

    if (!admin || !user) {
      return res.status(404).json({ message: 'Admin o usuario no encontrado' });
    }

    const parsedAmount = parseFloat(amount) || 0;
    const parsedBonus = parseFloat(bonus) || 0;

    // Calcular valores necesarios
    const totalDepositAmount = parsedAmount + parsedBonus;
    const adminBalance = parseFloat(admin.balance) || 0;
    const userBalance = parseFloat(user.balance) || 0;

    // Crear y registrar el movimiento
    const transactionId = await createMovementError(
      'deposito_erroneo',
      adminId,
      userId,
      totalDepositAmount,
      parsedBonus,
      adminBalance,
      userBalance,
      admin.login,
      user.login,
      admin.rol,
      user.rol,
      supervisor
    );

    console.log(`Depósito erróneo registrado: Admin (${admin.login}), Usuario (${user.login}), Monto: ${parsedAmount}`);

    res.status(200).json({ message: 'Depósito erróneo registrado correctamente', transactionId });
  } catch (error) {
    console.error('Error al registrar el depósito erróneo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const retiroError = async (req, res) => {
  const { adminId, userId, amount, supervisor } = req.body;

  try {
    const admin = await User.findById(adminId, 'login balance rol');
    const user = await User.findById(userId, 'login balance rol');

    if (!admin || !user) {
      return res.status(404).json({ message: 'Admin o usuario no encontrado' });
    }

    // Calcular valores necesarios
    const totalRetiroAmount = parsedAmount + parsedBonus;
    const adminBalance = parseFloat(admin.balance) || 0;
    const userBalance = parseFloat(user.balance) || 0;


    // Crear y registrar el movimiento del retiro erróneo
    // Crear y registrar el movimiento
    const transactionId = await createMovementError(
      'retiro_erroneo',
      adminId,
      userId,
      totalRetiroAmount,
      parsedBonus,
      adminBalance,
      userBalance,
      admin.login,
      user.login,
      admin.rol,
      user.rol,
      supervisor
    );

    console.log(`Retiro erróneo registrado: Admin (${admin.login}), Usuario (${user.login}), Monto: ${parsedAmount}`);

    res.status(200).json({ message: 'Retiro erróneo registrado correctamente', transactionId });
  } catch (error) {
    console.error('Error al registrar el retiro erróneo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  deposit, depositError,
  retiro, retiroError
};