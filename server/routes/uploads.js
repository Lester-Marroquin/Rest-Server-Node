const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();

const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

const fs = require("fs");
const path = require("path");

// default options
app.use(fileUpload());

app.put("/upload/:tipo/:id", (req, res) => {
  let tipo = req.params.tipo;
  let id = req.params.id;

  // Validar el tipo
  let tiposValidos = ["productos", "usuarios"];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "Los tipos permitidos son: " + tiposValidos.join(", "),
        tipo_recibido: tipo,
      },
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "No se ha seleccionado nigún archivo",
      },
    });
  }

  //Extensiones de archivos permitidos
  archivo = req.files.archivo;
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  let nombreExtension = archivo.name.split(".");
  let extension = nombreExtension[nombreExtension.length - 1];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          "Las extensiones permitidas son: " + extensionesValidas.join(", "),
        extension_recibida: extension,
      },
    });
  }

  //Cambiar nombre al archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, function (err) {
    if (err)
      return res.status(500).json({
        ok: false,
        err,
      });

    // Aqui, imagen cargada
    if (tipo === "usuarios") {
      imagenUsuario(id, res, nombreArchivo);
    } else {
      imagenProducto(id, res, nombreArchivo);
    }
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id)
    .then((usuarioDB) => {
      ////borrarArchivo(nombreArchivo, "usuarios");

      if (!usuarioDB) {
        ////borrarArchivo(nombreArchivo, "usuarios");
        res.status(400).json({
          ok: false,
          err: {
            message: "Usuario no encontrado",
          },
        });
      }

      //borrarArchivo(nombreArchivo, "usuarios");

      usuarioDB.img = nombreArchivo;
      usuarioDB.save();

      res.json({
        ok: true,
        usuarioDB,
        img: nombreArchivo,
      });
    })
    .catch((error) => {
      res.status(400).json({
        ok: false,
        error,
      });
    });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id)
    .then((productoDB) => {
      ////borrarArchivo(nombreArchivo, "productos");

      if (!productoDB) {
        ////borrarArchivo(nombreArchivo, "productos");
        res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado",
          },
        });
      }

      //borrarArchivo(nombreArchivo, "productos");

      productoDB.img = nombreArchivo;
      productoDB.save();

      res.json({
        ok: true,
        productoDB,
        img: nombreArchivo,
      });
    })
    .catch((error) => {
      res.status(400).json({
        ok: false,
        error,
      });
    });
}

function borrarArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(
    __dirname,
    `../../uploads/${tipo}/${nombreImagen}`
  );

  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}

module.exports = app;
