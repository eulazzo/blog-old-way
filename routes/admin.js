//criar rotas separados
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Postagem');
const Categoria = mongoose.model('categorias');
const Postagem = mongoose.model('postagens');
const {eAdmin}  = require('../helpers/eAdmin')

router.get('/',eAdmin, (req,res)=>{
    res.render('admin/index');
})

router.get('/categorias/edit/:id',eAdmin,(req,res)=>{
    
    Categoria.findOne({_id:req.params.id}).then(categoria=>{
        
        res.render('admin/editCategorias',{categoria});

    }).catch(err=>{
        req.flash('error_msg','Essa categoria não existe');
        res.redirect('/admin/categorias')
    })
})

router.get('/posts',eAdmin,(req,res) => {
    res.send('pagina de posts')
})

router.get('/categorias',eAdmin,(req,res) => {
    Categoria.find().sort({date:'DESC'}).then(categorias=>{
        res.render('admin/categorias',{categorias});
    }).catch(err=>{
        req.flash('error_msg','Erro ao listar categorias',err);
        res.redirect('/admin')
    })
})

router.post('/categorias/nova',eAdmin,(req,res)=>{
    
    const error = [];
    if(!req.body.nome){
        error.push({texto:'Nome inválido'});
    }else 
        if(req.body.nome.length < 4){
        error.push({texto:'Nome válido: mínimo 4 caracteres'});
    }

    if(!req.body.slug){
        error.push({texto:'slug inválido'});
    }
     
    if(error.length>0){

        res.render('admin/addcategorias',{error});

    }else{
       
        const category = async()=>{
            const novaCategoria = {
                nome:req.body.nome,
                slug:req.body.slug,
                
            }
            await  new Categoria(novaCategoria).save();
        }
    
        category()
            .then(()=>{
                req.flash('success_msg',"categoria criada com sucesso")
                res.redirect('/admin/categorias')
            }).catch((err)=>{
               req.flash('error_msg','Houve um erro ao criar categoria, tente novamente!',err)
                res.redirect('/admin')
            })
    }

})

router.post('/categorias/edit',eAdmin,(req,res)=>{
   
    Categoria.findOne({_id:req.body.id}).then(editCategoria => {

        editCategoria.nome = req.body.nome; 
        editCategoria.slug = req.body.slug;

        editCategoria.save().then(()=>{

            req.flash('success_msg','Categoria editada com sucesso');
            res.redirect('/admin/categorias'); 

        }).catch(err =>{

            req.flash('error_msg','Erro interno ao editar categoria');
            res.redirect('/admin/categorias') ;

        })

    }).catch(() => {
        req.flash('error_msg','Houve um erro  ao editar');
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar',eAdmin,(req,res)=>{
    Categoria.deleteOne({_id:req.body.id}).then(()=>{
        req.flash('error_msg','Categoria deletada com sucesso!');
        res.redirect('/admin/categorias/')
    }).catch(err=>{
        req.flash('sucesss_msg','Erro ao deletar categoria!!');
        res.redirect('/admin/categorias/')
    })

})

router.get('/categorias/add',eAdmin,(req,res)=>{
    res.render('admin/addcategorias');
})

//postagens

router.post('/postagens/add',eAdmin,(req,res)=>{
   
    const error = [];

    if(req.body.categoria =='0'){
        error.push({texto:'Nenhuma categoria registrada,registre-a!'});
    }
    if(error.length > 0){
        res.render('../views/admin/addPostagem',{error})
    }else{
        addPost = async()=>{
            const newPost = {
    
                titulo:req.body.titulo,
                slug:req.body.slug,
                descricao:req.body.descricao,
                conteudo:req.body.conteudo,
                categoria:req.body.categoria,
    
            }
            await new Postagem(newPost).save()
        }
        addPost().then(()=>{
            
            req.flash('success_msg','Postagem criada com sucesso!');
            res.redirect('/admin/postagens',);
    
        }).catch(err=>{
            req.flash('error_msg','Erro ao criar postagem!',err);
            res.redirect('/admin');
        })
    }
})

 
//rota listar postagens
// router.get('/postagens',(req,res)=>{
//     Postagem.find().sort({date:'DESC'}).then(postagens=>{
//         res.render('../views/admin/postagem',{postagens});
//     }).catch(err=>{
//         req.flash('error_msg','Erro ao listar postagens',err);
//         res.redirect('/admin/postagens');
//     })
// })

router.get('/postagens',eAdmin,(req,res)=>{

    Postagem.find().populate('categoria').sort({data:'DESC'}).then(postagens=>{
        res.render('../views/admin/postagem',{postagens});
    }).catch(err=>{
        req.flash('error_msg','Erro ao listar postagens',err);
        res.redirect('/admin');
    })
})



router.get('/postagens/add',eAdmin,(req,res)=>{
    Categoria.find().sort({date:'DESC'}).then(categorias=>{
        res.render('admin/addPostagem',{categorias});
    }).catch(err=>{
        req.flash('error_msg','Erro ao carregar o formulario!');
        res.redirect('/admin')
    })
}) 

 //aqui
router.get('/postagens/edit/:id',eAdmin,(req,res)=>{

    Postagem.findOne({_id:req.params.id}).then(postagem=>{
        
        Categoria.find().then(categorias=>{

            res.render('admin/editPostagem',{postagem,categorias})

        }).catch(err=>{
            req.flash('error_msg','Erro ao listar categorias')
            res.redirect('/admin/postagens');
        })

    }).catch(err=>{
        req.flash('error_msg','Erro ao carregar formulário de edição');
        res.redirect('/admin/postagens')
    })

})


router.post('/postagem/edit',eAdmin,(req,res)=>{

    Postagem.findOne({_id:req.body.id}).then(postagem=>{

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.conteudo = req.body.conteudo;
        postagem.descricao = req.body.descricao;
        postagem.categoria = req.body.categoria;

        postagem.save().then(()=>{
            req.flash('success_msg','Sucesso ao editar postagem');
            res.redirect('/admin/postagens')
        }).catch(()=>{
            req.flash('error_msg','Erro interno');
            res.redirect('/admin/postagens')
        })


    }).catch(err=>{

        
        req.flash('error_msg','Erro ao editar postagem');
        res.redirect('admin/postagens')
    })

})
 

router.get('/postagens',eAdmin,(req,res)=>{
     
    res.render('admin/postagem');
})

router.post('/postagens/deletar',eAdmin,(req,res)=>{

    Postagem.deleteOne({_id:req.body.id}).then(()=>{
        req.flash('success_msg','Postagem deletada com sucesso!');
        res.redirect('/admin/postagens/');
    }).catch(err=>{
        req.flash('error_msg','Erro ao deletar postagem!');
        res.redirect('/admin/postagens/');
    })  

})


module.exports = router;