const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

// ====================================
// Obtener todos los productos
// ====================================
app.get('/producto', verificaToken, (req, res) => {
    // Trae todos los productos
    // Populate: usuario categoria
    // Paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);

    //Muestra solo los productos que esten disponibles
    Producto.find({disponible: true})
        .skip(desde).limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .then( productoDB => {
            res.json({
                ok: true,
                productoDB
            })
        })
        .catch( err => {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'No hay productos creados'
                } 
            });
        });

});

// ====================================
// Obtener un productos por ID
// ====================================
app.get('/producto/:id', verificaToken, (req, res) => {
    // Populate: usuario categoria
    // Paginado

    let id = req.params.id;

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);

        Producto.findById(id)
        .skip(desde).limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .then( productoDB => {
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: `No se encuentra el producto con el ID ${id}`
                    }
                })
            }
            res.json({
                ok: true,
                productoDB
            })
        })
        .catch( (err) => {
            res.status(400).json({
                ok: false,
                err: { 
                    message: 'No se encontro el producto'
                }
            });
        });

});

// ====================================
// Buscar productos
// ====================================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {


    // Obtiene productos por un indicio de una palabra
    // Se apoya con una expresión regular para que la busqueda
    // sea más flexible

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex})
    .populate('categoria', 'nombre')
    .then( productoDB => {
        res.json({
            ok: true,
            productoDB
        })
    })
    .catch((error) =>{
        res.status(500).json({
            ok: false,
            error: { 
                message: 'No se encontraron productos'
            }
        })
    })

});



// ====================================
// Crear un nuevo producto
// ====================================
app.post('/producto', verificaToken, (req, res) => {
    // Grabar el usuario
    // Grabar una categoria del listado

    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body. nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save()
    .then(productoDB => {
        res.status(201).json({
            ok: true,
            productoDB
        })
    })
    .catch( err => {
        res.status(400).json({
            ok: false,
            err: {
                message: 'No se pudo crear el producto'
            }
        })
    })

});


// ====================================
// Actualizar un nuevo producto
// ====================================
app.put('/producto/:id', (req, res) => {
    // Grabar el usuario
    // Grabar una categoria del listado

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id)
    .then( (productoDB) => {
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                  message: "Producto no encontrado",
                },
              });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save()

        res.status(201).json({
            ok: true,
            productoDB
        })
    })
    
    .catch( (err) => {
        res.status(400).json({
            ok: false,
            err: {
                message: 'Error al actualizar producto',
            }
        })
    })

});


// ====================================
// Borrar un producto
// ====================================
app.delete('/producto/:id', (req, res) => {
    // Actualiza la disponibilidad del producto

    let id = req.params.id;

    Producto.findById(id)
    .then( productoDB => {
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no encontrado'
                }
            })
        }

        productoDB.disponible = false;

        productoDB.save()

        res.status(201).json({
            ok: true,
            productoDB,
            message: 'Producto borrado exitosamente'
        })

    })
    .catch((error) => {
        res.status(500).json({
            ok: false,
            error: {
                message: 'Error al borrar un producto'
            }
        })
    })


});


module.exports = app;