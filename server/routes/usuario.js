const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken, verificaRol } = require('../middlewares/autenticacion');


  app.get('/usuario', verificaToken , (req, res) => {
    
    // return res.json({
    //   usuario: req.usuario,
    //   nombre: req.usuario.nombre,
    //   email: req.usuario.email
    // });

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 20;
    limite = Number(limite);

    // Si se desea introducir parametros de "filtro" en el servicio
    // dentro de los {} de .find, se debe de introducir por ejemplo:
    // google: true
    // esto devolver aquellos registros que cumplan con true en el campo google
    // tambien esto mismo en los {} de: Usuario.countDocuments({})
    Usuario.find({ estado: true }, 'nombre email estado' ).skip(desde).limit(limite)
    
    .then(usuarioDB => {
      Usuario.countDocuments({ estado: true })
      
      .then( conteo => {
        res.json({
          ok: true,
          usuario: usuarioDB,     
          cuantos: conteo
        });
      })
      
      .catch(err => {
        res.status(400).json({
          ok: false,
          err  
        })
      })
    
    })
    .catch(err => {
      res.status(400).json({
        ok: false,
        err
      });
    });

  })
  
  app.post('/usuario', [verificaToken, verificaRol] , (req, res) => {
    let body = req.body;
  
    let usuario = new Usuario({
      nombre: body.nombre,
      email: body.email,
      password: bcrypt.hashSync(body.password, 10),
      role: body.role
    });

    usuario.save()
      .then(usuarioDB => {
        res.json({
          ok: true,
          usuario: usuarioDB
        })
      })
      
  });
  
  app.put('/usuario/:id', [verificaToken, verificaRol], function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true})
    .then(usuarioDB => {
      res.json({
        ok: true,
        usuario: usuarioDB
      });
    })
    .catch(err => {
      res.status(400).json({
        ok: false,
        err
      });
    });

  });
  
  app.delete('/usuario/:id', verificaToken, function (req, res) {
  
    let id = req.params.id;
    let cambiaEstado = {
      estado: false
    };
    
    //Usuario.findByIdAndRemove(id)
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true })
    .then(usuarioBorrado => {
      
      if (!usuarioBorrado) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Usuario no encontrado'
          }
        })
      }
      
      res.json({
        ok: true,
        usuario: usuarioBorrado
      })

    })
    .catch(err => {
      res.status(400).json({
        ok: false,
        err
      })
    })

  });
  
  module.exports = app;