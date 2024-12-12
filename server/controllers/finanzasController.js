const Finanzas = require('../models/Finanzas');
const User = require('../models/User')
const Movement = require('../models/Movement')

const getFinanzas = async (req, res) => {
  const { _id } = req.body; 

  try {
   
    const finanzasUsuario = await Finanzas.find({
      supervisor: _id
    });

    res.status(200).json({
      finanzasUsuario 
    });
  } catch (error) {
    console.error('Error al obtener las finanzas:', error);
    res.status(500).json({ message: 'Error al obtener las finanzas' });
  }
};

const getFinanzasByUser = async (req, res) => {
  const { supervisor, userId, rol } = req.body;

  try {
   
    let filter = {};

    if (rol === "Super") {
   
      filter.supervisor = supervisor;
    } else {

      filter = {
        $or: [
          { usuarioResponsable: supervisor }, 
          { usuarioReceptor: userId }, 
        ]
      };
    }

    const finances = await Movement.find(filter).populate('usuarioResponsable usuarioReceptor supervisor');

    if (!finances || finances.length === 0) {
      return res.status(404).json({ message: 'No se encontraron finanzas para el usuario.' });
    }

    res.status(200).json(finances);
  } catch (error) {
    console.error("Error al obtener las finanzas del usuario:", error);
    res.status(500).json({ message: 'Error al obtener las finanzas del usuario.' });
  }
};

const addFinanza = async (req, res) => {
  const { fecha, monto, tipo, supervisor, rol } = req.body;

  if (!monto || !tipo) {
    return res.status(400).json({ message: 'Monto y tipo son obligatorios' });
  }

  if (tipo !== 'retiro' && tipo !== 'deposito') {
    return res.status(400).json({ message: 'El tipo debe ser "retiro" o "deposito"' });
  }

  try {
    // Recuperar usuarios creados directamente desde la base de datos
    const adminData = await User.findById(supervisor).select('usuariosCreados');
    if (!adminData || !Array.isArray(adminData.usuariosCreados) || adminData.usuariosCreados.length === 0) {
      return res.status(400).json({ message: 'Usuarios creados debe ser un array no vacío' });
    }

    const cleanedUsuariosCreados = adminData.usuariosCreados.filter(user => 
      user.usuarioId && user.rol && user._id && !user._bsontype
    );

    if (cleanedUsuariosCreados.length !== adminData.usuariosCreados.length) {
      return res.status(400).json({ message: 'Algunos usuarios creados tienen campos inválidos' });
    }

    const nuevaFinanza = new Finanzas({
      fecha: fecha ? new Date(fecha) : Date.now(), // Si no se proporciona la fecha, se usa la fecha actual
      monto,
      tipo,
      rol,
      supervisor,
      usuariosCreados: cleanedUsuariosCreados
    });

    await nuevaFinanza.save();

    res.status(201).json(nuevaFinanza);
  } catch (error) {
    console.error('Error al agregar la finanza:', error);
    res.status(500).json({ message: 'Error al agregar la finanza' });
  }
};


// FINANZAS PARA GAFRICOS:

const getFinanzasAllUser = async (req, res) => {
  const { supervisor } = req.body; 

  try {
    const usuariosSupervisados = await User.find({ supervisor: supervisor }, '_id');

    if (!usuariosSupervisados || usuariosSupervisados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios supervisados.' });
    }

    const idsUsuarios = usuariosSupervisados.map(user => user._id);

    const finances = await Movement.find({
      $or: [
        { usuarioResponsable: { $in: idsUsuarios } },
        { usuarioReceptor: { $in: idsUsuarios } }
      ]
    }, 'rolReceptor date monto type').populate('usuarioResponsable usuarioReceptor supervisor');

    const groupedByDate = {};

    finances.forEach(movement => {
      const rolReceptor = movement.rolReceptor;

      if (rolReceptor === 'Super') {
        return; 
      }

      const dateKey = new Date(movement.date).toISOString().split('T')[0]; 

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          Admin: { total: 0 },
          Agente: { total: 0 },
          Jugador: { total: 0 }
        };
      }

      if (groupedByDate[dateKey][rolReceptor]) {
        const amount = movement.monto; 
        if (movement.type === 'deposito') {
          groupedByDate[dateKey][rolReceptor].total += amount;
        } else if (movement.type === 'retiro') {
          groupedByDate[dateKey][rolReceptor].total -= amount;
        }
      }
    });

    if (Object.keys(groupedByDate).length === 0) {
      return res.status(404).json({ message: 'No se encontraron finanzas para los usuarios supervisados.' });
    }

    res.status(200).json(groupedByDate); 
  } catch (error) {
    console.error("Error al obtener las finanzas de los usuarios supervisados:", error);
    res.status(500).json({ message: 'Error al obtener las finanzas de los usuarios supervisados.' });
  }
};

const getBestFinanzasUser = async (req, res) => {
  const { supervisor } = req.body; 

  try {

    const usuariosSupervisados = await User.find({ supervisor: supervisor });

    if (!usuariosSupervisados || usuariosSupervisados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios supervisados.' });
    }

    const idsUsuarios = usuariosSupervisados.map(user => user._id);

    
    const finances = await Movement.find({
      usuarioResponsable: { $in: idsUsuarios },
      type: 'deposito' // Solo contar depósitos
    }).populate('usuarioResponsable usuarioReceptor supervisor');


   
    const agentTotals = {};

    finances.forEach(movement => {
      const rolReceptor = movement.rolReceptor;

     
      if (rolReceptor === 'Agente' || rolReceptor === "Admin") {
        const agentId = movement.usuarioResponsable._id;

        
        if (!agentTotals[agentId]) {
          agentTotals[agentId] = {
            login: movement.usuarioResponsable.login, 
            total: 0
          };
        }

        
        const amount = movement.monto; 
        agentTotals[agentId].total += amount;
      }
    });

    
    const sortedAgents = Object.values(agentTotals).sort((a, b) => b.total - a.total);

   
    const topAgents = sortedAgents.slice(0, 4);

    
    if (topAgents.length === 0) {
      return res.status(404).json({ message: 'No se encontraron agentes con movimientos.' });
    }

    res.status(200).json(topAgents); 
  } catch (error) {
    console.error("Error al obtener las finanzas de los usuarios supervisados:", error);
    res.status(500).json({ message: 'Error al obtener las finanzas de los usuarios supervisados.' });
  }
};

module.exports = { getFinanzas, getFinanzasByUser,getBestFinanzasUser, getFinanzasAllUser, addFinanza};