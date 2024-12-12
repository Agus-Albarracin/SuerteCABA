const bcrypt = require('bcrypt');
const User = require('../models/User');

// Editar usuario
const editUser = async (req, res) => {
  try {
    const { id, nombre, apellido, login, email } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'user_not_found' });
    }

    if (nombre && nombre !== user.nombre) {
      user.changes.push({ field: 'nombre', oldValue: user.nombre, newValue: nombre });
      user.nombre = nombre;
    }
    if (apellido && apellido !== user.apellido) {
      user.changes.push({ field: 'apellido', oldValue: user.apellido, newValue: apellido });
      user.apellido = apellido;
    }
    if (login && login !== user.login) {
      user.changes.push({ field: 'login', oldValue: user.login, newValue: login });
      user.login = login;
    }
    if (email && email !== user.email) {
      user.changes.push({ field: 'email', oldValue: user.email, newValue: email });
      user.email = email;
    }

    await user.save();
    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error('Error in editUser:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { id, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'fail', error: 'passwords_do_not_match' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'user_not_found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const oldPassword = user.password;
    user.password = hashedPassword;

    user.passwordChanges.push({ oldPassword, newPassword: hashedPassword });

    await user.save();
    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
}

const changePermission = async (req, res) => {
  try {
    const { id, rol } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'user_not_found' });
    }


    if (rol && rol !== user.rol) {
      
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          $set: { rol: rol }, 
          $push: { changes: { field: 'rol', oldValue: user.rol, newValue: rol } } 
        },
        { new: true, runValidators: true } 
      );

      res.status(200).json({ status: 'success', user: updatedUser });
    } else {
      res.status(200).json({ status: 'success', message: 'No se realizó ningún cambio.' });
    }
  } catch (error) {
    console.error('Error en changePermission:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'user_not_found' });
    }
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

const statusUser = async (req, res) => {
  const { userId, status } = req.body; // Esperamos que el ID del usuario y el estado se envíen en el cuerpo de la solicitud

  if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
    return res.status(400).json({ message: "El estado debe ser 0 (desactivado) o 1 (activado)." });
  }

  try {
    // Actualizar el usuario para establecer 'activo' en el valor proporcionado
    const result = await User.updateOne(
      { _id: userId }, // Filtrar por ID de usuario
      { $set: { activo: status } } // Establecer 'activo' en el estado proporcionado
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "Usuario no encontrado o ya está en el estado deseado." });
    }

    res.status(200).json({ message: `Usuario ${status === 1 ? 'activado' : 'desactivado'} correctamente.` });

  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del usuario.' });
  }
}

module.exports = {
  editUser,
  changePassword,
  changePermission,
  deleteUser,
  statusUser
};