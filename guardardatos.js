// Importación compatible con node-fetch v3+
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Configuración
const SUPABASE_URL = 'https://ddiupbfcemqcwkeptcxb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaXVwYmZjZW1xY3drZXB0Y3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDAyMDEsImV4cCI6MjA1ODUxNjIwMX0.IfeKrbYgGHqRd8cEiWKLlC-DUxtWzk-mAp1STGuTYBY';

// Función para verificar si el usuario ya existe por email
async function verificarUsuarioExistente(email) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?email=eq.${email}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const usuarios = await response.json();

    if (usuarios.length > 0) {
      console.log('⚠️ El usuario con este email ya existe:', email);
      return true; // El usuario ya existe
    }
    return false; // El usuario no existe
  } catch (error) {
    console.error('❌ Error al verificar el usuario:', error);
    throw error;
  }
}

// Función para insertar usuarios
async function insertarUsuarios(usuarios) {
  try {
    console.log('\nInsertando nuevos usuarios...');

    // Verificar si el usuario ya existe en la base de datos antes de insertarlo
    for (let usuario of usuarios) {
      const existe = await verificarUsuarioExistente(usuario.email);
      if (existe) {
        console.log('🔴 El usuario con el email', usuario.email, 'ya existe en la base de datos.');
        return; // Si el usuario ya existe, no se inserta
      }
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(usuarios)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const usuariosInsertados = await response.json();

    // Mostrar resultados
    console.log('\n✅ Usuarios insertados correctamente:');
    console.log('='.repeat(60));
    usuariosInsertados.forEach((usuario, index) => {
      console.log(`👤 Usuario ${index + 1} insertado:`);
      console.log('─'.repeat(40));
      console.log(`  ID: ${usuario.id_usuario}`);
      console.log(`  Nombre: ${usuario.nombre_usuario}`);
      console.log(`  Email: ${usuario.email}`);
      console.log(`  Tipo: ${usuario.usuario_superadministrador ? 'Super Admin' : 
                      usuario.usuario_administrador ? 'Administrador' : 'Usuario Normal'}`);
      console.log('─'.repeat(40) + '\n');
    });
    console.log(`📌 Total de usuarios insertados: ${usuariosInsertados.length}`);
    console.log('='.repeat(60));

    return usuariosInsertados;
  } catch (error) {
    console.error('\n❌ Error al insertar usuarios:');
    console.error('='.repeat(60));
    console.error(error.message);
    console.error('='.repeat(60));
    throw error;
  }
}

// Función para obtener todos los usuarios
async function obtenerUsuarios() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
}

// Ejemplo de uso
(async () => {
  try {
    // Obtener usuarios existentes
    const usuarios = await obtenerUsuarios();
    console.log('Usuarios existentes:', usuarios.length);

    // Insertar nuevos usuarios si es necesario
    const nuevosUsuarios = [
      {
        identificacion: 7308272,
        nombre_usuario: "MaicolStiven",
        clave_encriptada: "112233", // Esta es la contraseña sin encriptar
        usuario_normal: 1,
        usuario_administrador: 1,
        usuario_superadministrador: 1,
        email: "ocampomaicol28@gmail.com"
      }
    ];

    // Insertar usuarios
    await insertarUsuarios(nuevosUsuarios);
  } catch (error) {
    process.exit(1);
  }
})();
