const express = require("express");
let { verificaToken, verificaRol } = require("../middlewares/autenticacion");
let app = express();
let Categoria = require("../models/categoria");

// ====================================
// Mostrar todas las categorias
// ====================================
app.get("/categoria", verificaToken, (req, res) => {
  Categoria.find({})
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .then((categoriaDB) => {
      res.json({
        ok: true,
        categoriaDB,
      });
    })

    .catch((err) => {
      res.json({
        ok: false,
        err: {
          message: "No se encuentran categorias",
        },
      });
    });
});

// ====================================
// Mostrar una categoria por ID
// ====================================
app.get("/categoria/:id", verificaToken, (req, res) => {
  
  let id = req.params.id;

  Categoria.findById(id)
    .populate('usuario', 'nombre email')
    .then((categoriaDB) => {
      res.json({
        ok: true,
        categoriaDB,
      });
    })

    .catch((err) => {
      res.status(400).json({
        ok: false,
        err: {
          message: "La categoria no existe",
        },
      });
    });
});

// ====================================
// Crear nueva categoria
// ====================================
app.post("/categoria", verificaToken, (req, res) => {
  let body = req.body;

  let nuevaCategoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id,
  });

  nuevaCategoria
    .save()
    .then((categoriaDB) => {
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Error al crear la categoria",
          },
        });
      }

      res.status(201).json({
        ok: true,
        categoriaDB,
      });
    })
    .catch((err) => {
      res.status(400).json({
        ok: false,
        err,
      });
    });
});

// ====================================
// Actualizar Categoria
// ====================================
app.put("/categoria/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  let desCategoria = {
    descripcion: body.descripcion,
  };

  Categoria.findOneAndUpdate({ _id: id }, desCategoria, {
    new: true,
    runValidators: true,
  })
    .then((categoriaDB) => {
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Error al actualizar la categoria",
          },
        });
      }

      res.status(200).json({
        ok: true,
        categoriaDB,
      });
    })

    .catch((err) => {
      res.status(400).json({
        ok: false,
        err,
      });
    });
});

// ====================================
// Eliminar la categoria
// ====================================
app.delete("/categoria/:id", [verificaToken, verificaRol], (req, res) => {
  let id = req.params.id;

  Categoria.findByIdAndDelete(id)
    .then((categoriaDB) => {
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "La categoria no existe",
          },
        });
      }

      res.status(200).json({
        ok: true,
        message: "Categoria borrada",
      });
    })
    .catch((err) => {
      res.status(400).json({
        ok: false,
        err,
      });
    });
});

module.exports = app;
