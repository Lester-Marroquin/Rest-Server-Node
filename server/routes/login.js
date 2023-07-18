const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const app = express();
const jwt = require('jsonwebtoken');


app.post('/login', function (req, res) {

    let body = req.body;
    Usuario.findOne({email: body.email})
    .then( usuarioDB => {

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: { 
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err: { 
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        //El metodo jwt.sign recibe como parametros la data, en esta caso
        //el usuario, una palabra 'secret' que debe de cambiarse en producción
        //el tiempo de expiración que indica:
        //60 segundos * 60 minutos * 24 horas * 30 días
        let token =  jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN })

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })

    })
    .catch(err => {
        res.status(500).json({
            ok: false,
            err
        })
    })

});







module.exports = app;