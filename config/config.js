/*
	Import des differents modules et middlewares
*/
let port ;
const fs = require('fs');
const express = require('express'); const app = express();
const session = require('express-session') ;
const bodyParser = require('body-parser') ;
const colors = require('colors') ;

/**
 * variable de configuration
 */
var sessionConfig = {
	secret: 'The Beard MVP 2021',
	resave:true ,
	saveUninitialized : false 
}
 
var databaseConfig = {
	host : 'localhost' , 
	user : null , // [[A Remplacer]] par votre nom d'utilisateur
	password : null , // [[A Remplacer]] par votre mot de passe d'utilisateur
	database : null
}

/**
 * Ajout des donnees de configuration
 */
try {
    const data = fs.readFileSync('./config/configData.json' ,'utf8' ) ;
    const configData = JSON.parse(data);
    port = configData.port ;
    databaseConfig.user = configData.DBuser ;
    databaseConfig.password = configData.DBpassword ;
    databaseConfig.database = configData.DBDataBase ;
    console.log("[SERVER] ".blue + "CONFIG ".blue + "perso");
} catch (error) {
    console.log("[SERVER] ".blue + "CONFIG ERROR ".red + "reading config file.");
    console.log("[SERVER] ".blue + "CONFIG ".blue + "default");
    port = 8080 ;
    databaseConfig.user = "franc" ;
    databaseConfig.password = "" ;
    databaseConfig.database = 'chat_with_us' ;
}

/**
 * Configuration du moteur de templates
 */
app.set('view engine','ejs');

/*
	Lien avec les middlewares
*/
app.use('/assets' , express.static('public/assets'));
app.use('/datas' , express.static('public/datas'));
app.use(session(sessionConfig));
app.use(bodyParser.urlencoded({extended : false }));
app.use(bodyParser.json());

/**
 * Exportation des valeur que l'on a configurer
 */
module.exports = {
    getApp : function(){
        return app ;
    } ,

    getPort : function(){
        return port ;
    } ,

    getDataBaseConfig : function(){
        return databaseConfig ;
    }
} ;