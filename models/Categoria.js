const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Categoria = new Schema({
    
    nome:{
        type:String,
        required:true,  
    },  
    slug:{
        type:String,
        required:true,
    },
    date:{
    type:Date,
    default:Date.now()    
    }
    
})

mongoose.model("categorias",Categoria);
//aqui 'categorias' é como se fosse o nome da tabela em mysql.
//aqui refere ao nome da collections