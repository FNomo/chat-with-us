/**
 * Interroge la base de donne sur la presence d'un utilisateur;
 */
 const mysql = require('mysql');
 const config = require('../config/config') ;
 const moment = require('moment') ;
 const fs = require('fs');
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
 
     loadAll : async function(request ){ // async rends la methode asynchone (lie avec un controlleur)
        /**
         * Charge tous les utilisateurs
         */
        const pool = mysql.createPool(config.getDataBaseConfig());
        var queryContent = 'SELECT * FROM users';
        var res1 = await this.queryResult(queryContent) ;
        queryContent = 'SELECT * FROM subcribtions';
        var res2 = await this.queryResult(queryContent) ;
        console.log('[SERVER] USERS '.blue + 'load : all users');
        return {allUsers : res1 , allSubcribtions : res2 };
     } ,

     uploadUser : async function(user){
        /**
         * Charge un utilisateur dans la BD
         */
        try {
            var queryContent = `INSERT INTO users(pseudo,password) VALUES ("${user.pseudo}","${user.password.replace(/"/g,'\\"')}" )`;
            var res = await this.queryResult(queryContent) ;
            queryContent = `SELECT ID , creationDate FROM users WHERE ID=${res.insertId}`;
            res = await this.queryResult(queryContent) ;
            return {resultOK : true , ID: res[0].ID , creationDate : res[0].creationDate} ;
        } catch (error) { // Il n'as pas pu le faire
            return {resultOK : false , errMess :'Cannot upload you to the database. Try later.' } ;
        }
  
     } ,

     updateUser : async function(id,field,value){
        /**
         * Change les donnee d'un utilisateur
         */
        try {
            var queryContent = `UPDATE users SET ${field} = ${value} WHERE ID=${id}`;
            var res = await this.queryResult(queryContent) ;
            return true ;
        } catch (error) { // Il n'as pas pu le faire
            return false ;
        }
  
     } ,

     uploadFile : async function(fileName , file){
        /**  Telecharge l'image envoye par l'utilisateur */
        try{
            var wstream = fs.createWriteStream(`public/${fileName}`);
            wstream.write(file) ;
            wstream.end();
            return true ;
        }catch(err){
            return false ;
        }
     } ,

     uploadFollow : async function(userID , followID){
        /**  Ajoute un nouveau follow dans la BD */
        try {
            var queryContent = `INSERT INTO subcribtions VALUES ( ${userID} , ${followID} )`;
            await this.queryResult(queryContent) ;
        } catch (error) { // Il n'as pas pu le faire
        }
     } ,

     deleteFollow : async function(userID , followID){
        /**  Retire un follow de la BD */
        try {
            var queryContent = `DELETE FROM subcribtions WHERE subscriberID = ${userID} AND subscribtionID = ${followID} `;
            await this.queryResult(queryContent) ;
        } catch (error) { // Il n'as pas pu le faire
        }
     } ,
 
     queryResult : async function(queryContent){ // recuperation du resultat de la requete
         var res = query(queryContent) ;      
         return res ;
     }
 }