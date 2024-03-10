const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');


const app = express();
app.use(cors());
app.use(express.json()); // Se Agrega un middleware para manejar el cuerpo de la solicitud en formato JSON

// Configuración de la conexión a la base de datos MySQL de XAMPP
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'datoshogarinfantil'
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});


// Ruta para el inicio de sesión


app.post('/login', (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const query = 'SELECT correo, `contraseña` FROM usuarios WHERE correo = ?';

    connection.query(query, [correo], (err, results) => {
      if (err) {
        console.error('Error al realizar la autenticación:', err);
        res.status(500).json({ error: 'Error al autenticar' });
        return;
      }

      if (results.length > 0) {
        // Usuario encontrado, verificar la contraseña
        const storedPassword = results[0].contraseña;
        const storedcorreo = results[0].correo;

    

        if (contrasena !== undefined && storedPassword !== undefined) {
          bcrypt.compare(contrasena.trim(), storedPassword.trim(), (err, result) => {
           
            if (err) {
              console.error('Error al comparar las contraseñas:', err);
              res.status(500).json({ error: 'Error al autenticar', bcryptError: err });
              return;
            }

            if (result) {
              // Contraseña correcta, usuario autenticado
              res.json({ message: 'Inicio de sesión exitoso', usuario: results[0] });
            } else {
              // Contraseña incorrecta
              res.status(401).json({ error: 'Credenciales incorrectas', result });
            }
          });
        } else {
          console.error("La contraseña o la hash almacenada no están definidas.");
          res.status(500).json({ error: 'Error al autenticar' });
        }
      } else {
        // Usuario no encontrado
        res.status(401).json({ error: 'Credenciales incorrectas' });
      }
    });
  } catch (error) {
    console.error('Error durante el proceso de inicio de sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Definir una ruta de ejemplo para obtener datos de la base de datos
app.get('/datos/:grupo', (req, res) => {
  const { grupo } = req.params; // Obtener el parámetro de ruta ":grupo"
  
  // Query para obtener datos filtrados por el campo "grupo"
  const query = 'SELECT * FROM hogarinfantil WHERE grupo = ?';

  connection.query(query, [grupo], (err, results) => {
    if (err) {
      console.error('Error al realizar la consulta:', err);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    console.log(`Datos obtenidos para el grupo ${grupo}:`, results);
    res.json(results);
  });
});

app.put('/datos/:grupo', (req, res) => {
  const { grupo } = req.params;
  const newData = req.body; // Nuevos datos a actualizar

  // Query para actualizar datos filtrados por el campo "grupo"
  const query = 'UPDATE hogarinfantil SET ? WHERE grupo = ?';

  connection.query(query, [newData, grupo], (err, results) => {
    if (err) {
      console.error('Error al actualizar datos:', err);
      res.status(500).json({ error: 'Error al actualizar datos' });
      return;
    }
    console.log(`Datos actualizados para el grupo ${grupo}:`, results);
    res.json({ message: 'Datos actualizados correctamente' });
  });
});


app.post('/insertarDatos', (req, res) => {
  const data = req.body; // Datos enviados desde el formulario
  console.log('Datos recibidos para insertar:', data);

  // Realizar la inserción en la base de datos
  connection.query('INSERT INTO hogarinfantil SET ?', data, (err, result) => {
    if (err) {
      console.error('Error al insertar datos:', err);
      res.status(500).json({ error: 'Error al insertar datos' });
      return;
    }
    console.log('Datos insertados correctamente');
    res.status(200).json({ message: 'Datos insertados correctamente' });
  });
});

app.delete('/datos/:grupo', (req, res) => {
  const { grupo } = req.params;

  // Query para eliminar datos filtrados por el campo "grupo"
  const query = 'DELETE FROM hogarinfantil WHERE grupo = ?';

  connection.query(query, [grupo], (err, results) => {
    if (err) {
      console.error('Error al eliminar datos:', err);
      res.status(500).json({ error: 'Error al eliminar datos' });
      return;
    }
    console.log(`Datos eliminados para el grupo ${grupo}:`, results);
    res.json({ message: 'Datos eliminados correctamente' });
  });
});

app.post('/registro', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Hashear la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(contrasena.trim(), 10);

    // Insertar en la base de datos
    const insertQuery = 'INSERT INTO usuarios (correo, contraseña) VALUES (?, ?)';
    connection.query(insertQuery, [correo, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error al registrar el usuario:', err);
        res.status(500).json({ error: 'Error al registrar el usuario' });
        return;
      }

      res.json({ message: 'Usuario registrado con éxito' });
    });
  } catch (error) {
    console.error('Error durante el proceso de registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
