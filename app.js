 
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const bodyparser = require('body-parser');
const admin =  require('./routes/admin')
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuarios');
const PORT = process.env.PORT || 8081;
const passport = require('passport')
require('./config/auth')(passport)
//loading modules

//sessao
app.use(session({
    secret:'amazzo',
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize());
app.use(passport.session())

//middlwares tipo globais : acesso em qualquer lgar
app.use(flash())
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; //armazena dados do usuario logado!
    next();
})
 

//bodyparser
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//handlebars
app.engine('handlebars',handlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout:'main'
}))
app.set('view engine','handlebars');

app.use(express.static(path.join(__dirname,'public')))


//rotas

//mongoose config
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://Lazzaro:kjkszpj@cluster0-mve3h.mongodb.net/test?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology: true 
}).then(()=>{
    console.log('Conectou com mongodb')
}).catch(err=>{
    console.log('Erro ao conectar com o mongodb',err)
})

//rotas depois do /admin usando as rotas tanto do admin quanto do usuarios  
app.use('/admin',admin);
app.use('/usuarios',usuarios);

app.get('/',(req,res)=>{
    Postagem.find().populate('categoria').sort({data:'DESC'}).then(postagens=>{
        res.render('index',{postagens}) 
    }).catch(err=>{
        req.flash('error_msg','Erro interno');
        res.redirect('/404')
    })
})


app.get('/postagem/:slug',(req,res)=>{
    Postagem.findOne({slug:req.params.slug}).then((postagem)=>{
        if(postagem){
            res.render('postagem/index',{postagem})
        }else{
            req.flash('error_msg','Essa postagem nao existe');
            res.redirect('/');
        }
    }).catch(()=>{
        req.flash('error_msg','Erro interno');
        res.redirect('/');
    })
})

app.get('/404',(req,res)=>{
    res.render('erro404');
})
//rota para listar categorias 
app.get('/categorias',(req,res)=>{
    Categoria.find().then(categorias=>{
        res.render('Categorias/index',{categorias});
    }).catch(()=>{
        req.flash('error_msg','Houve um erro interno ao listar categorias');
        res.redirect('/');
    })
})
//rota mostrar postagem quando clicado em uma categoria 
app.get('/categorias/:slug',(req,res)=>{
    
    Categoria.findOne({slug:req.params.slug}).then(categoria=>{
       
        
        if(categoria){
            
            Postagem.find({categoria:categoria._id}).then(postagens=>{
                // console.log('categoria',categoria);
                // console.log('postagens',postagens);
                // console.log('CATEGORIA ID',{categoria:categoria._id});

                res.render('Categorias/postagens',{postagens,categoria});

            }).catch(()=>{

                req.flash('error_msg','Erro ao listar as postagens');
                res.redirect('/');

            })
        }else{

            req.flash('error_msg','Esta categoria nao existe');
            res.redirect('/');

        }

    }).catch(()=>{
        req.flash('error_msg','Erro interno ao carregar página dessa categoria ')
        res.redirect('/');
    })

})

app.listen(PORT,()=>{
    console.log(`listenning at port: ${PORT}`)
})