const express = require("express");
const bcrypt = require("bcrypt");
const Usuario = require("../models/usuario");
const app = express();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post("/login", function (req, res) {
  let body = req.body;
  Usuario.findOne({ email: body.email })
    .then((usuarioDB) => {
      if (!usuarioDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "(Usuario) o contraseña incorrectos",
          },
        });
      }

      if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario o (contraseña) incorrectos",
          },
        });
      }

      //El metodo jwt.sign recibe como parametros la data, en esta caso
      //el usuario, una palabra 'secret' que debe de cambiarse en producción
      //el tiempo de expiración que indica:
      //60 segundos * 60 minutos * 24 horas * 30 días
      let token = jwt.sign(
        {
          usuario: usuarioDB,
        },
        process.env.SEED,
        { expiresIn: process.env.CADUCIDAD_TOKEN }
      );

      res.json({
        ok: true,
        usuario: usuarioDB,
        token,
      });
    })
    .catch((err) => {
      res.status(500).json({
        ok: false,
        err,
      });
    });
});

//Configuraciones de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;

  try {
    let googleUser = await verify(token);

    let usuarioDB = await Usuario.findOne({ email: googleUser.email });
    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario ya creado, debe de iniciar sesión",
          }
        });
      } else {
        let token = jwt.sign(
          {
            usuario: usuarioDB,
          },
          process.env.SEED,
          { expiresIn: process.env.CADUCIDAD_TOKEN }
        );

        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      }
    } else {
      //Si el usuario no existe en nuestra BD, se creara
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = "=)";

      usuarioDB = await usuario.save();

      let token = jwt.sign(
        {
          usuario: usuarioDB,
        },
        process.env.SEED,
        { expiresIn: process.env.CADUCIDAD_TOKEN }
      );

      return res.json({
        ok: true,
        usuario: usuarioDB,
        token,
      });
    }
  } catch (e) {
    return res.status(403).json({
      ok: false,
      err: e,
    });
  }
});

module.exports = app;
