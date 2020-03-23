const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro');
})

router.post('/registro', (req, res) => {
    let erros = [];

    if (!req.body.nome) {
        erros.push({
            texto: 'Nome inválido'
        });
    }
    if (!req.body.email) {
        erros.push({
            texto: 'Email inválido'
        })
    }
    if (!req.body.senha) {
        erros.push({
            texto: 'Senha inválida'
        })
    }
    if (req.body.senha.length < 4) {
        erros.push({
            texto: 'Senha válida: mínimo 5 dígitos'
        })
    }
    if (req.body.senha != req.body.senhaAgain) {
        erros.push({
            texto: 'Senhas diferentes,tente novamente!'
        })
    }

    if (erros.length) {
        res.render('usuarios/registro', {
            erros
        });
    } else {

        Usuario.findOne({

            email: req.body.email

        }).then(user => {
            if (user) {

                req.flash('error_msg', 'Já existe um conta associada a este email!');
                res.redirect('/usuarios/registro');

            } else {

                const novoUsuario = new Usuario({

                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                   
                   
                })
                //hash for password
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Houve um erro durate o salvamento')
                            res.redirect('/')
                        } else {
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(() => {
                                req.flash('success_msg', 'Usuario cadastrado com sucesso')
                                res.redirect('/');
                            }).catch(() => {
                                req.flash('error_msg', 'Erro ao cadastrar usuario, tente novamente!')
                            })
                        }
                    })
                })
            }

        }).catch(err => {
            req.flash(err => {
                req.flash('erro_msg', 'Houve um erro interno');
                res.redirect('/');
            })
        })

    }

})

router.get('/login',(req,res)=>{
    res.render('usuarios/login');
})


//rota de autenticaçao
router.post('/login',(req,res,next)=>{

    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/usuarios/login',
        failureFlash:true,
    })(req,res,next);

})

router.get('/logout',(req,res)=>{

    req.logout();
    req.flash('success_msg','Deslogado com sucesso!');
    res.redirect('/')

})

module.exports = router;