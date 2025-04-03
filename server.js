// Importación de las dependencias necesarias
const express = require('express');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');

// Configuración de Supabase
const SUPABASE_URL = 'https://ddiupbfcemqcwkeptcxb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaXVwYmZjZW1xY3drZXB0Y3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDAyMDEsImV4cCI6MjA1ODUxNjIwMX0.IfeKrbYgGHqRd8cEiWKLlC-DUxtWzk-mAp1STGuTYBY';

// Crear servidor Express
const app = express();
app.use(express.json());

// Función para verificar si el usuario ya existe
async function verificarUsuarioExistente(email) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?email=eq.${email}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const usuarios = await response.json();

  if (usuarios.length > 0) {
    return true;
  }
  return false;
}

// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  const { identificacion, nombre_usuario, clave_encriptada, email, usuario_normal, usuario_administrador, usuario_superadministrador } = req.body;

  // Verificar si el usuario ya existe
  const existe = await verificarUsuarioExistente(email);
  if (existe) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(clave_encriptada, 10);

  // Crear el nuevo usuario
  const nuevoUsuario = {
    identificacion,
    nombre_usuario,
    clave_encriptada: hashedPassword,
    email,
    usuario_normal: usuario_normal ? 1 : 0,
    usuario_administrador: usuario_administrador ? 1 : 0,
    usuario_superadministrador: usuario_superadministrador ? 1 : 0
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([nuevoUsuario])
    });

    const result = await response.json();
    res.json({ success: true, message: 'Usuario registrado exitosamente', user: result[0] });

  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Ruta para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?email=eq.${email}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const usuarios = await response.json();
  
  if (usuarios.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const user = usuarios[0];
  
  // Verificar la contraseña usando bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.clave_encriptada);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  // Excluir la contraseña del objeto de respuesta
  const { clave_encriptada, ...userData } = user;
  res.json({ success: true, message: 'Login exitoso', user: userData });
});

// Iniciar servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
