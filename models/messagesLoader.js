/**
 * Interroge la base de donne sur la presence d'un utilisateur;
 */
 const mysql = require('mysql');
 const config = require('../config/config') ;
 const util = require('util') ; // utiliser par la suite pour faire la query de maniere asynchrone
 
 /**
  * variable privees
  */
 const pool = mysql.createPool(config.getDataBaseConfig());
 const query = util.promisify(pool.query).bind(pool);
 
 /**
  * Fonctions serveant a charge les donnees
  */
 module.exports = {
 
     loadAll : async function(request ){ // rends la methode asynchone (lie avec le controlleur)
        var queryContent = 'SELECT * FROM messages';
        var res1 = await this.queryResult(queryContent) ;
        queryContent = 'SELECT * FROM mentions';
        var res2 = await this.queryResult(queryContent) ;
        queryContent = 'SELECT * FROM reactions';
        var res3 = await this.queryResult(queryContent) ;
        console.log('[SERVER] MESSAGES '.blue + 'load : all messages');
        return {messagesList : res1, mentionsList: res2, reactionsList: res3};
     } ,
 
     queryResult : async function(queryContent){ // recuperation du resultat de la requete
         var res = query(queryContent) ;      
         return res ;
     } ,

     uploadMessage : async function(message){
       
        try {
            var queryContent = `INSERT INTO messages(userID,content,emitDate) VALUES (${message.userID},"${message.content}","${message.emitDate}")`;
            var res = await this.queryResult(queryContent) ;
            
            var id = res.insertId ;
            if (message.mentions.length >= 0){ 
                
                message.mentions.forEach( function(item) {
                    queryContent = `INSERT INTO mentions VALUES (${id},${item})`;
                    query(queryContent) ;
                });
                
            }
            return {resState : true , lineID : id} ;
        } catch (error) {
            return {resState : false } ;
        }
     } ,

     uploadReaction: async function(messID , usrID , reaction){
       
        try {
            var queryContent = `INSERT INTO reactions VALUES (${messID},${usrID},"${reaction}")`;
            var res = await this.queryResult(queryContent) ;
            return true ;
        } catch (error) {
            return false ;
        }
     } ,

     deleteReaction: async function(messID , usrID , reaction){
       
        try {
            var queryContent = `DELETE FROM reactions WHERE messageID = ${messID}  AND userID = ${usrID}  AND reaction = "${reaction}" `;
            var res = await this.queryResult(queryContent) ;
            return true ;
        } catch (error) {
            return false ;
        }
     }

     
 }