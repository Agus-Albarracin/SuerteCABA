const User = require('../models/User');
const Movement = require('../models/Movement');
const moment = require('moment');
const redis = require('redis');
const mongoose = require('mongoose');

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
      console.log("Conectado a redis")
      await redisClient.flushAll();
  } catch (error) {
      console.error('Error al conectar a Redis:', error);
  }
})();


  const obtenerUsuariosEnEstructura = async (login) => {
    const startTime = performance.now();

    const usuario = await User.findOne({ login }).lean()
    if (!usuario) return [];

    const matchTime = performance.now(); 

    const usuarios = await User.aggregate([
      { $match: { _id: usuario._id } },
      {
        $graphLookup: {
          from: 'User',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'supervisor',
          as: 'estructuraUsuarios'
        }
      },
      { $project: { 'estructuraUsuarios.login': 1, 'estructuraUsuarios.balance': 1, 'estructuraUsuarios._id': 1,} }
    ]);

            // Captura el tiempo de finalización
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            console.log("tiempo de ejecucion usuario en Estructura", executionTime)

    return usuarios.length > 0 ? usuarios[0].estructuraUsuarios : [];
  };

  const obtenerTodosLosHijos = async (id) => {
    const startTime = performance.now();
  
    // Convertir el ID a ObjectId si es un string
    const objectId = mongoose.Types.ObjectId(id);
  
    try {
      const resultado = await User.aggregate([
        { $match: { _id: objectId } }, // Empieza desde el usuario cuyo _id fue proporcionado
        {
          $graphLookup: {
            from: 'User', // Colección donde se realizará la búsqueda
            startWith: '$_id', // Empieza con el campo _id del usuario inicial
            connectFromField: '_id', // Conecta desde el campo _id de cada usuario
            connectToField: 'supervisor', // Conecta hacia el campo 'supervisor'
            as: 'todosLosHijos', // Almacena el resultado en un array llamado 'todosLosHijos'
            maxDepth: 99, // Cambia esto para obtener más niveles si es necesario
            depthField: 'nivel', // Almacena la profundidad de cada nivel
          }
        },
        {
          $project: {
            'todosLosHijos._id': 1, // Solo devuelve el _id de cada usuario encontrado
          }
        }
      ]);
  
      // Log para verificar los resultados
            // Captura el tiempo de finalización
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            console.log("tiempo de ejecucion OBTENER HIJOS", executionTime)
      // Mapea para obtener solo los _id de todos los descendientes
      return resultado.length > 0 ? resultado[0].todosLosHijos.map(user => user._id.toString()) : [];
    } catch (error) {
      console.error("Error en obtenerTodosLosHijos:", error);
      return [];
    }
  };
  


  const getTheMovements = async (req, res) => {
    const { userId, login, startDate, endDate, rol, estructura, directos} = req.body;
    console.log(req.body)
    // console.log(startDate, endDate)

    const finalEndDate = moment(endDate)
    .tz('America/Argentina/Buenos_Aires')
    .endOf('day')
    .format('YYYY-MM-DD')

     const currentDay = moment()
    .tz('America/Argentina/Buenos_Aires')
    .add(1, 'day')
    .format('YYYY-MM-DD');

    // Generar una clave única para caché basada en los parámetros
      const cacheKey = `movimientos:${userId || 'defaultUser'}:${login || 'defaultLogin'}:${startDate}:${finalEndDate}:${rol || 'defaultRol'}:${estructura || 'defaultEstructura'}:${directos || 'defaultDirectos'}`;
      // console.log("Keys desde GETTHEMOVEMENTS", cacheKey)

      // Captura el tiempo de inicio
      const startTime = performance.now();

      try {
        const cachedUserData = await redisClient.get(cacheKey);
      if ( cachedUserData 
             && (!finalEndDate.includes(currentDay) 
             && !startDate.includes(currentDay)) ) {

             console.log("hay cachedUser data")
             const userCache = JSON.parse(cachedUserData);
        if (userCache.data.movimientos && userCache.data.movimientos.length > 0) {
                console.log(`Datos obtenidos del caché para el usuario ${userId}`);
                return res.status(200).json(userCache);
        } else { console.log(`No se encontraron movimientos en caché para el usuario ${userId}`); }
        
      }

            // Continuar con la lógica original si no hay datos en caché
          if (!userId) {
              return res.status(400).json({ status: 'fail', error: 'user_id_missing' });
          }

          let userIds = new Set();
          const usuariosCreados = await User.findById(userId, '_id, login, rol').select('usuariosCreados');

          if (usuariosCreados && usuariosCreados.length > 0) {
              usuariosCreados.forEach(user => userIds.add(user._id.toString()));
          }

          if (estructura) {
              const usuariosEnEstructura = await obtenerUsuariosEnEstructura(estructura);
              usuariosEnEstructura.forEach(usuario => userIds.add(usuario._id.toString()));
          } else {
              userIds.add(userId);
              const todosLosHijos = await obtenerTodosLosHijos(userId);
              todosLosHijos.forEach(id => userIds.add(id));
          }

          const userIdsArray = Array.from(userIds);

            let query = {
              date: { $gte: startDate, $lte: finalEndDate }, // Filtro de fecha
              $or: [
                { usuarioResponsable: { $in: userIdsArray } },
                { usuarioReceptor: { $in: userIdsArray } }
              ]
            };

                  if (login) {  
                      query.nameReceptor = login;
                  }
                  
          const movimientos = await Movement.find(query).sort({ date: -1 }).lean();
      
          const usuarioActual = await User.findById(userId, '_id login rol').lean();
      
          const directoResponsable = await User.findOne({ login: estructura }, '_id login rol').lean();

          let filteredMovimientos;
            if(directos === 'Estructura'){

            filteredMovimientos = movimientos.filter(mov => {
                const responsableId = mov.usuarioResponsable?.toString();
                const receptorId = mov.usuarioReceptor?.toString();
                
                if (rol === "Super"){
                  return mov.rolResponsable === 'Super';
                }

                if (rol === 'Admin') {
                    return (
                        (usuarioActual.rol !== 'Super' && 
                        (receptorId === userId.toString() || 
                        (mov.rolReceptor === 'Agente' && responsableId !== userId.toString()))) ||
                        (usuarioActual.rol === 'Super' && 
                        (mov.rolReceptor === 'Agente' && 
                        (responsableId === userId.toString() || responsableId !== userId.toString())))
                    );
                }
                if (rol === 'Agente') {
                    return mov.rolReceptor === 'Agente';
                }
                return mov.rolReceptor === rol;
            });

          } else if (directos === "Directos"){
            
            filteredMovimientos = movimientos.filter(mov => {
              const responsableId = directoResponsable._id.toString();
              const receptorId = mov.usuarioReceptor?.toString();

                  // Asegúrate de que el usuario responsable coincida
                  if (mov.usuarioResponsable?.toString() !== responsableId) {
                    return false; // No incluir si el usuario responsable no coincide
                }
              
              if (rol === 'Admin') {
                  return (
                      (usuarioActual.rol !== 'Super' && 
                      (receptorId === userId.toString() || 
                      (mov.rolReceptor === 'Agente' && responsableId !== userId.toString()))) ||
                      (usuarioActual.rol === 'Super' && 
                      (mov.rolReceptor === 'Agente' && 
                      (responsableId === userId.toString() || responsableId !== userId.toString())))
                  );
              }
              if (rol === 'Agente') {
                  return mov.rolReceptor === 'Agente';
              }
              return mov.rolReceptor === rol;
            });

          }else if (directos === ""){
            filteredMovimientos = movimientos.filter(mov => {

              const responsableId = mov.usuarioResponsable?.toString();
              const receptorId = mov.usuarioReceptor?.toString();
              

              if (rol === "Super"){
                return mov.rolResponsable === 'Super';
              }
        
              if (rol === 'Admin') {
                  return (
                      (usuarioActual.rol !== 'Super' && 
                      (receptorId === userId.toString() || 
                      (mov.rolReceptor === 'Agente' && responsableId !== userId.toString()))) ||
                      (usuarioActual.rol === 'Super' && 
                      (mov.rolReceptor === 'Agente' && 
                      (responsableId === userId.toString() || responsableId !== userId.toString())))
                  );
              }
              if (rol === 'Agente') {
                  return mov.rolReceptor === 'Agente';
              }
              return mov.rolReceptor === rol;
          });
          }   


          const totalMovimientos = filteredMovimientos.length; 

          const formattedMovimientos = filteredMovimientos.map(mov => ({
              type: mov.type === 'deposito' ? 'Deposito' : 'Retiro',
              details: {
                  nameResponsable: mov.nameResponsable,
                  nameReceptor: mov.nameReceptor,
                  monto: mov.monto
              },
              date: mov.date,
              monto: mov.monto,
              nameResponsable: mov.nameResponsable,
              balanceAntesResponsable: mov.balanceAntesResponsable,
              balanceDespuesResponsable: mov.balanceDespuesResponsable,
              nameReceptor: mov.nameReceptor,
              balanceAntesReceptor: mov.balanceAntesReceptor,
              balanceDespuesReceptor: mov.balanceDespuesReceptor,
          }));

          const formattedMovimientosMonto = filteredMovimientos.map(mov => ({
            ...mov,
            type: mov.type === 'deposito' ? 'Deposito' : 'Retiro',
            details: {
              monto: mov.monto
            },
            date: mov.date
          }));
  
          
          const montoTotal = formattedMovimientosMonto.reduce((acc, mov) => {
            return acc + (mov.type === 'Deposito' ? mov.monto : -mov.monto);
          }, 0);

          // Captura el tiempo de finalización
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          console.log("tiempo de ejecucion GETTHEMOVEMENTS", executionTime)

          await redisClient.setEx(cacheKey, 72000, JSON.stringify({
            status: 'success',
            userId: userId,
            data: {
                movimientos: formattedMovimientos,
                totalMovimientos,
                montoTotal,
            }
        }));
        console.log("Clave almacenada en Redis:", cacheKey);   

        console.log("se muestra datos encontrados",totalMovimientos)
        console.log("se muestra el total de datos encontrados",montoTotal)


          return res.status(200).json({
              status: 'success',
              data: {
                  movimientos: formattedMovimientos,
                  totalMovimientos,
                  montoTotal,
              }
          });

  } catch (error) {
      console.error('Error al obtener movimientos:', error);
      res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};


module.exports = {
  getTheMovements,
};