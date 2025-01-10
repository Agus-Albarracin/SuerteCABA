const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getIo } = require('../Socket');
const mongoose = require('mongoose');

//create user antes de hashear para los Agentes.
// const createUser = async (req, res) => {
//   const { login, balance, nombre, apellido, password, email, rol, supervisor} = req.body;

//   try {
//     const existingUser = await User.findOne({ login });
//     if (existingUser) {
//       return res.status(400).json({ status: 'fail', error: 'El usuario ya existe' });
//     }

//     if (!login || !password || !rol) {
//       return res.status(400).json({ status: 'fail', error: 'Complete los campos, por favor...' });
//     }

//     if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       return res.status(400).json({ status: 'fail', error: 'Ingrese un E-mail válido.' });
//     }

//     if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/.test(password)) {
//       return res.status(400).json({ status: 'fail', error: 'Ingrese una contraseña válida' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     let supervisorId = null;

//     // Si se proporciona un supervisor, buscarlo en la base de datos
//     if (supervisor) {
//       const getSupervisor = await User.findOne({ login: supervisor });

//       if (!getSupervisor) {
//         return res.status(400).json({ status: 'fail', error: 'Supervisor no encontrado' });
//       }

//       supervisorId = getSupervisor._id; 
//     }

//     const newUser = new User({
//       login,
//       balance: balance || "",
//       currency: 'ARS', 
//       nombre: nombre || "",
//       apellido: apellido || "",
//       password: hashedPassword,
//       email: email || "",
//       rol,
//       supervisor: supervisorId, 
//     });

//     await newUser.save();


//     res.status(201).json({ status: 'success', message: 'User created successfully', user: newUser });
//   } catch (error) {
//     console.error('Error in createUser:', error);
//     res.status(500).json({ status: 'fail', error: 'internal_error' });
//   }
// };

const createUser = async (req, res) => {
  let { login, balance, nombre, apellido, password, confirmPassword, email, rol, supervisor } = req.body;

  try {

    login = login?.toLowerCase();
    password = password?.toLowerCase();
    confirmPassword = confirmPassword?.toLowerCase();
    
    let supervisorId = null;
    let hashedPassword = password; // Usamos la contraseña proporcionada, si el supervisor no es "Agente"
    let userRole = rol || ''; // Usamos el rol proporcionado, si el supervisor no es "Agente"
    let supervisorRole = '';

    // Si se proporciona un supervisor, buscarlo en la base de datos solo con los campos 'id' y 'rol'
    if (supervisor) {
      const getSupervisor = await User.findOne(
        { login: supervisor },
        { _id: 1, rol: 1 } // Proyección para obtener solo los campos '_id' y 'rol'
      );

      if (!getSupervisor) {
        return res.status(400).json({ status: 'fail', error: 'Supervisor no encontrado' });
      }

      // Guardamos el rol del supervisor y el id
      supervisorRole = getSupervisor.rol;
      supervisorId = getSupervisor._id;

      // Si el supervisor es de rol "Agente", se establece la contraseña y rol por defecto
      if (supervisorRole === 'Agente') {
        hashedPassword = await bcrypt.hash("suerte123", 10); // Establecer la contraseña "suerte123"
        userRole = 'Jugador'; // Establecer el rol "Jugador"
      }
    }

    // Validaciones solo si el supervisor NO es "Agente"
    if (supervisorRole !== 'Agente') {
      // Si el supervisor no es Agente, validamos los campos `login`, `password`, y `rol`
      if (!login || !password || !rol) {
        return res.status(400).json({ status: 'fail', error: 'Complete los campos, por favor...' });
      }

      // Validar formato del email si se proporciona
      if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ status: 'fail', error: 'Ingrese un E-mail válido.' });
      }

      // Validar la contraseña si el supervisor no es Agente
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/.test(password)) {
        return res.status(400).json({ status: 'fail', error: 'Ingrese una contraseña válida' });
      }

      // Verificar que las contraseñas coincidan
      if (password !== confirmPassword) {
        return res.status(400).json({ status: 'fail', error: 'Las contraseñas no coinciden.' });
      }
    }

    // Crear el nuevo usuario
    const newUser = new User({
      login,
      balance: balance || "",
      currency: 'ARS',
      nombre: nombre || "",
      apellido: apellido || "",
      password: hashedPassword, // Usamos la contraseña procesada según el rol del supervisor
      email: email || "",
      rol: userRole, // Usamos el rol determinado después de verificar el supervisor
      supervisor: supervisorId,
    });

    await newUser.save();

    res.status(201).json({ status: 'success', message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    console.error('Error en createUser:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};




const getUsers = async (req, res) => {
  try {
    const { page, limit, userId } = req.query;
    console.log(req.query)

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'User not found' });
    }

    let query = { rol: { $nin: ["Agente", "Admin", "Super"] } };
    
    if (user.rol !== "Super") {
      const usuarioIds = user.usuariosCreados.map(u => u.usuarioId);
      query = { ...query, _id: { $in: usuarioIds } }; 
    }

    const totalUsers = await User.countDocuments(query);

    const allUsers = await User.find(query)
    .select('login balance rol supervisor usuariosCreados activo')
    .lean()
    .sort({ login: 1 })


    const users = await User.find(query)
      .select('login balance rol supervisor usuariosCreados activo') 
      .lean()
      .sort({ login: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))


    res.status(200).json({
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      allData: allUsers, 
      data: users
    });

  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};


const getAgents = async (req, res) => {
  try {
    const { page, limit, userId } = req.query;
    console.log(req.query)

    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'User not found' });
    }
   
    let query = { rol: { $nin: ["Jugador", "Admin", "Super"] } };
    if (user.rol !== "Super") {
      const usuarioIds = user.usuariosCreados.map(u => u.usuarioId);
      query = { ...query, _id: { $in: usuarioIds } }; 
    }


    const totalUsers = await User.countDocuments(query);

    const allAgents = await User.find(query)
    .select('login balance rol supervisor usuariosCreados activo') 
    .lean()
    .sort({ login: 1 })


    const agents = await User.find(query)
    .select('login balance rol supervisor usuariosCreados activo') 
    .lean() 
    .sort({ login: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))


  res.status(200).json({
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
    allData: allAgents, // Devuelve todos los usuarios con solo login y balance
    data: agents
  });
  } catch (error) {
    console.error('Error in getAgents:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

const getAdmins = async (req, res) => {
  try {

    const { page, limit, userId } = req.query;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'User not found' });
    }

    
    let query = { rol: { $nin: ["Agente", "Jugador", "Super"] } };
    if (user.rol !== "Super") {
      const usuarioIds = user.usuariosCreados.map(u => u.usuarioId);
      query = { ...query, _id: { $in: usuarioIds } }; 
    }

    const totalUsers = await User.countDocuments(query);

    const allAdmins = await User.find(query)
    .select('login balance rol supervisor usuariosCreados activo') 
    .lean()
    .sort({ login: 1 })


    const admins = await User.find(query)
    .select('login balance rol supervisor usuariosCreados activo') 
    .lean()
    .sort({ login: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))


  res.status(200).json({
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
    allData: allAdmins, 
    data: admins,
  });

 ;
  } catch (error) {
    console.error('Error in getAdmins:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

// const getEstructuraAdmins = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     console.log(req.query)

//     // Buscar el usuario que hizo la petición
//     const user = await User.findById(userId).populate('usuariosCreados.usuarioId');

//     if (!user) {
//       return res.status(404).json({ status: 'fail', error: 'User not found' });
//     }

//     // Función recursiva para obtener la estructura de usuarios
//     const buildUserHierarchy = async (user) => {
//       const subUsers = await User.find({ supervisor: user._id }).populate('usuariosCreados.usuarioId');
//       const userStructure = {
//         _id: user._id,
//         login: user.login,
//         rol: user.rol,
//         usuariosCreados: []
//       };

//       for (const subUser of subUsers) {
//         const subUserHierarchy = await buildUserHierarchy(subUser);
//         userStructure.usuariosCreados.push(subUserHierarchy);
//       }

//       return userStructure;
//     };

//     // Construir la estructura comenzando desde el usuario actual
//     const estructura = await buildUserHierarchy(user);

//     // Responder con la estructura encontrada
//     console.log(estructura.length)
//     res.status(200).json({ status: 'success', data: estructura });
//   } catch (error) {
//     console.error('Error in getEstructuraAdmins:', error);
//     res.status(500).json({ status: 'fail', error: 'internal_error' });
//   }
// };

//region actualizacion 1
// const getEstructuraAdmins = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     console.log(req.query);

//     // Buscar el usuario que hizo la petición
//     const user = await User.findById(userId).populate('usuariosCreados.usuarioId');

//     if (!user) {
//       return res.status(404).json({ status: 'fail', error: 'User not found' });
//     }

//     // Función recursiva para obtener la estructura de usuarios
//     const buildUserHierarchy = async (user) => {
//       const subUsers = await User.find({ supervisor: user._id }).populate('usuariosCreados.usuarioId').lean();

//       const userStructure = {
//         _id: user._id,
//         login: user.login,
//         rol: user.rol,
//         usuariosCreados: []
//       };

//       // Usar Promise.all para manejar múltiples subusuarios
//       const promises = subUsers.map(async (subUser) => {
//         const subUserHierarchy = await buildUserHierarchy(subUser);
//         userStructure.usuariosCreados.unshift(subUserHierarchy); // Agregar al principio
//       });

//       await Promise.all(promises); // Esperar a que todas las promesas se resuelvan
//       return userStructure;
//     };

//     // Construir la estructura comenzando desde el usuario actual
//     const estructura = await buildUserHierarchy(user);

//     // Enviar la respuesta
//     res.status(200).json({ status: 'success', data: [estructura] }); // Envolver en un array
//   } catch (error) {
//     console.error('Error in getEstructuraAdmins:', error);
//     res.status(500).json({ status: 'fail', error: 'internal_error' });
//   }
// };


//region actualización 2
// const getEstructuraAdmins = async (req, res) => {
//   try {
//     const { userId } = req.query;

//     // Verificar si el usuario existe
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ status: 'fail', error: 'User not found' });
//     }

//     // Obtener los usuarios creados directamente por el usuario dado
//     const estructura = await User.aggregate([
//       { $match: { _id: mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: 'User',
//           localField: '_id',
//           foreignField: 'supervisor',
//           as: 'usuariosCreados',
//         },
//       },
//       {
//         $unwind: {
//           path: '$usuariosCreados',
//           preserveNullAndEmptyArrays: true, // Mantiene usuarios sin subusuarios
//         },
//       },
//       {
//         $lookup: {
//           from: 'User',
//           localField: 'usuariosCreados._id',
//           foreignField: 'supervisor',
//           as: 'usuariosCreados.usuariosCreados',
//         },
//       },
//       {
//         $group: {
//           _id: '$_id',
//           login: { $first: '$login' },
//           rol: { $first: '$rol' },
//           usuariosCreados: { $push: '$usuariosCreados' },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           login: 1,
//           rol: 1,
//           usuariosCreados: 1,
//         },
//       },
//     ]);

//     console.log('Estructura de Admin:', estructura);
//     res.status(200).json({ status: 'success', data: estructura });

//   } catch (error) {
//     console.error('Error in getEstructuraAdmins:', error);
//     res.status(500).json({ status: 'fail', error: 'internal_error' });
//   }
// };

const createProjectStage = (depth) => {
  const projection = {
    _id: 1,
    login: 1,
    rol: 1,
    activo: 1,
  };

  let currentLevel = projection;
  for (let i = 0; i < depth; i++) {
    currentLevel['usuariosCreados'] = {
      _id: 1,
      login: 1,
      rol: 1,
      activo: 1,
      usuariosCreados: {},
    };
    currentLevel = currentLevel['usuariosCreados'];
  }

  delete currentLevel['usuariosCreados']; // Eliminar el último nivel de usuariosCreados

  return projection;
};

const getEstructuraAdmins = async (req, res) => {
  try {
    const { userId } = req.query;
    const { depth = 99 } = req.query; // Valor por defecto de 3 niveles si no se especifica

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'User not found' });
    }

    // Obtener los usuarios creados con estructura jerárquica y proyección dinámica
    const estructura = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'User',
          localField: '_id',
          foreignField: 'supervisor',
          as: 'usuariosCreados',
        },
      },
      {
        $unwind: {
          path: '$usuariosCreados',
          preserveNullAndEmptyArrays: true, // Mantiene usuarios sin subusuarios
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'usuariosCreados._id',
          foreignField: 'supervisor',
          as: 'usuariosCreados.usuariosCreados',
        },
      },
      {
        $group: {
          _id: '$_id',
          login: { $first: '$login' },
          rol: { $first: '$rol' },
          activo: { $first: '$activo'},
          usuariosCreados: { $push: '$usuariosCreados' },
        },
      },
      {
        $project: createProjectStage(depth), 
      },
    ]);

    estructura.forEach(admin => {
      admin.usuariosCreados.sort((a, b) => {
        // Primero comparar por rol
        const rolePriority = getRolePriority(a.rol) - getRolePriority(b.rol);
        if (rolePriority !== 0) return rolePriority;

        return a.login.localeCompare(b.login);
      });
    });

    res.status(200).json({ status: 'success', data: estructura });

  } catch (error) {
    console.error('Error in getEstructuraAdmins:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

const getRolePriority = (role) => {
  switch (role) {
    case 'Admin':
      return 1; 
    case 'Agente':
      return 2;
    default:
      return 3; 
  }
};



const getLogin = async (req, res) => {
  const { login } = req.body;
  try {
    const user = await User.findOne({ login })
      .select('_id login rol balance usuariosCreados'); // Especificar los campos necesarios

    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'user_not_found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getLogin:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};


const login = async (req, res, io) => {
  try {
    let { login, password } = req.body;

    login = login?.toLowerCase();
    password = password?.toLowerCase();

    if (!login || !password) {
      return res.status(400).json({ status: 'fail', error: 'Login and password are required' });
    }

    const user = await User.findOne({ login }).exec();

    if (!user) {
      return res.status(400).json({ status: 'fail', error: 'El usuario no existe.' });
    }

    if (user && user.rol === "Admin") {
      return res.status(400).json({ status: 'fail', error: 'Este acceso no esta permitido. Inicie sesión desde Office' });
    }

    if (user && user.rol === "Agente") {
      return res.status(400).json({ status: 'fail', error: 'Este acceso no esta permitido. Inicie sesión desde Office' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ status: 'fail', error: 'La contraseña es invalida.' });
    }

    const token = generateToken(user);
    const balance = parseFloat(user.balance.toString()).toFixed(2);

    // Evento de actualización de saldo
    io.emit('balanceUpdated', { login: user.login, balance });
 

    res.status(200).json({ status: 'success', token, login: user.login, rol: user.rol, balance: balance, _id: user._id, activo: user.activo });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

const loginOffice = async (req, res, io) => {
  try {
    let { login, password } = req.body;

    login = login?.toLowerCase();
    password = password?.toLowerCase();
    

    if (!login || !password) {
      return res.status(400).json({ status: 'fail', error: 'Login and password are required' });
    }

    const user = await User.findOne({ login }).exec();

    if (!user) {
      return res.status(400).json({ status: 'fail', error: 'El usuario no existe.' });
    }

    if (user && user.rol === "Jugador") {
      return res.status(400).json({ status: 'fail', error: 'Este acceso no esta permitido. Inicie sesión desde Suerte24.bet' });
    }

    if (user && user.activo === 0) {
      return res.status(400).json({ status: 'fail', error: 'El usuario se encuentra suspendido.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ status: 'fail', error: 'La contraseña es invalida.' });
    }

    const token = generateToken(user);
    const balance = parseFloat(user.balance.toString()).toFixed(2);

    // Evento de actualización de saldo
    io.emit('balanceUpdated', { login: user.login, balance });

     
    res.status(200).json({ status: 'success', token, login: user.login, rol: user.rol, balance: balance, _id: user._id, usuariosCreados: user.usuariosCreados, activo: user.activo });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

// Función para generar un token JWT
const generateToken = (user) => {
  const payload = {
    id: user._id,
    login: user.login,
    rol: user.rol,
    balance: user.balance,
  };

  const options = {
    expiresIn: '1h'
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', options);

  return token;
};

const validateToken = async (req, res) => {
  const { token, status} = req.body;

  if (!token) {
    return res.status(400).json({ status: 'fail', error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ status: 'fail', error: 'Invalid token' });
    }

    const balance = parseFloat(user.balance.toString()).toFixed(2);
    res.status(200).json({ status: 'success', login: user.login, rol: user.rol, balance, _id:user._id, usuariosCreados: user.usuariosCreados });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ status: 'fail', error: 'Invalid token' });
  }
};  

const sendNotification = async (req, res) => {
  const { title, message, type } = req.body;

  try {
    if (type !== 'user' && type !== 'gift') {
      return res.status(400).json({ message: 'Tipo de notificación no válido' });
    }

    if (type === 'user') {
      await User.updateMany(
        { rol: 'Jugador' },
        {
          $push: {
            notifications: {
              title,
              message,
              type,
              date: new Date(),
            }
          }
        }
      );
    } else if (type === 'gift') {
      await User.updateMany(
        { rol: 'Jugador' }, 
        {
          $push: {
            giftNotifications: { 
              title,
              message,
              type,
              date: new Date(),
            }
          }
        }
      );
    }

    const io = getIo(); // Obtén la instancia de socket.io
    if (io) {
      if (type === 'user') {
        io.emit('getNotification', {
          notifications: [{
            title,
            message,
            type,
            date: new Date(),
          }]
        });
      } else if (type === 'gift') {
        io.emit('getNotificationGift', {
          notifications: [{
            title,
            message,
            type,
            date: new Date(),
          }]
        });
      }
    }

    res.status(200).json({ message: 'Notificación enviada a todos los clientes' });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({ message: 'Error al enviar notificación' });
  }
};

const getNotification = async (req, res, io) => {
  const userLogin = req.headers['user-login'];

  if (!userLogin) {
      return res.status(400).json({ message: 'Login de usuario no proporcionado' });
  }

  try {
      const user = await User.findOne({ login: userLogin });

      if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const userNotifications = user.notifications
          .filter(notification => notification.type === 'user')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map(notification => ({
              date: notification.date,
              seen: notification.seen,
              title: notification.title,
              message: notification.message,
              type: notification.type,
          }));

      const giftNotifications = user.notifications
          .filter(notification => notification.type === 'gift')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map(notification => ({
              date: notification.date,
              seen: notification.seen,
              title: notification.title,
              message: notification.message,
              type: notification.type,
          }));

      if (user.socketId) {
          io.to(user.socketId).emit('getNotification', { notifications: userNotifications });
          io.to(user.socketId).emit('getNotificationGift', { notifications: giftNotifications });
      }
      

      console.log(userNotifications)
      res.status(200).json({ userNotifications, giftNotifications });

  } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
}

const markNotificationsAsRead = async (req, res) => {
  const userLogin = req.headers['user-login'];

  if (!userLogin) {
    return res.status(400).json({ message: 'Login de usuario no proporcionado' });
  }

  try {
    const user = await User.findOne({ login: userLogin });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.notifications.forEach(notification => {
      notification.seen = true;
    });

    await user.save();

    if (user.socketId) {
      io.to(user.socketId).emit('markNotification', { message: 'Notifiaciones vistas' });
  }

    res.status(200).json({ message: 'Notificaciones marcadas como vistas' });
  } catch (error) {
    console.error('Error al marcar notificaciones como vistas:', error);
    res.status(500).json({ message: 'Error al marcar notificaciones como vistas' });
  }
};

const sendIndividualNotification = async (req, res, io) => {
  const { login, title, message, type } = req.body;

  try {
    const user = await User.findOne({ login });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.notifications.push({
      title,
      message,
      type,
      date: new Date(),
    });

    await user.save();

    if (user.socketId) {
      io.to(user.socketId).emit('receiveNotification', { title, message, type, date, seen });
    }

    res.status(200).json({ message: `Notificación enviada a ${login}` });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({ message: 'Error al enviar notificación' });
  }
};


module.exports = { 
   createUser, getEstructuraAdmins,
    getUsers, getAgents, getAdmins, getLogin,
     login, loginOffice, validateToken,
     sendNotification, getNotification, sendIndividualNotification,
     markNotificationsAsRead};