// Importación compatible con node-fetch v3+
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const SUPABASE_URL = 'https://ddiupbfcemqcwkeptcxb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaXVwYmZjZW1xY3drZXB0Y3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDAyMDEsImV4cCI6MjA1ODUxNjIwMX0.IfeKrbYgGHqRd8cEiWKLlC-DUxtWzk-mAp1STGuTYBY';

// Datos de los nuevos usuarios a insertar
const nuevosUsuarios = [
  {
    identificacion: 112233,
    nombre_usuario: "maikol pully",
    clave_encriptada: "maikolPully123",
    usuario_normal: 1,
    usuario_administrador: 0,
    usuario_superadministrador: 0,
    email: "maikol.Pully@ejemplo.com"
  },
  {
    identificacion: 445566,
    nombre_usuario: "Maicol ocampo",
    clave_encriptada: "maicolOcampo456",
    usuario_normal: 0,
    usuario_administrador: 1,
    usuario_superadministrador: 0,
    email: "maicol.ocampo@ejemplo.com"
  },
  {
    identificacion: 778899,
    nombre_usuario: "juan pablo",
    clave_encriptada: "juanPablo789",
    usuario_normal: 0,
    usuario_administrador: 0,
    usuario_superadministrador: 1,
    email: "juN.pablo@ejemplo.com"
  }
];

// Función para insertar usuarios
async function insertarUsuarios() {
  try {
    console.log('\nInsertando nuevos usuarios...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Para recibir los datos insertados
      },
      body: JSON.stringify(nuevosUsuarios)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const usuariosInsertados = await response.json();
    // Mostrar resultados
    console.log('\n✅ Usuarios insertados correctamente:');
    console.log('='.repeat(60));
    usuariosInsertados.forEach((usuarios, index) => {
      console.log(`👤 Usuario ${index + 1} insertado:`);
      console.log('─'.repeat(40));
      console.log(`  ID: ${usuarios.id_usuario}`);
      console.log(`  Nombre: ${usuarios.nombre_usuario}`);
      console.log(`  Email: ${usuarios.email}`);
      console.log(`  Tipo: ${usuarios.usuario_superadministrador ? 'Super Admin' : 
                          usuarios.usuario_administrador ? 'Administrador' : 'Usuario Normal'}`);
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
    process.exit(1);
  }
}

// Ejecutar la función
(async () => {
  await insertarUsuarios();
})();
