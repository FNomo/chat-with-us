
/**
 * Importation des modules
 */
const appConfig  = require('./config/config') ;
const app = appConfig.getApp() ;
const server = require('http').Server(app) ;
const io = require('socket.io')(server) ;
const initData = require('./init/initData')
const userManager = require('./controllers/userManager') ;
const messagesManager = require('./controllers/messagesManager') ;
const profilManager = require('./controllers/profilManager') ;

/**
 * variables globales
 */
var users = {
    onlines : 0,
    anonyms : 0 ,
    anonymsCounter : 0,
    all : {},
};

var messages = {} ;

/**
 * Inialisations des donnees
 */
initData.init(users,messages); 

/**
 * Nos routes
 */

// Via la methodes get
app.get('/chat-with-us', function(req , res){
    res.render('HTML-content/home.ejs') ;
} );

/**
 * Gestion des connections & des evenements lies a celles-ci
 */
io.on('connection' , function(socket) {

    // partie utilisateur
    socket.on('user' , function(usersInfos){
        userManager.handleUser(users,messages,usersInfos, socket,io);
    }) ;

    socket.on('anonym' , function(){
        userManager.handleAnonym(users,messages,socket,io);
    }) ;

    socket.on('log-in:asked' , function(logger){
        userManager.handleLogIn(users,messages,logger, socket,io);
    }) ;

    socket.on('sign-in:asked' , function(signer){
        userManager.handleSignIn(users,messages,signer, socket,io);
    }) ;

    socket.on('log-out' , function(){
        userManager.handleLogOut(users,messages, socket,io);
    }) ;

    // partie profil
    socket.on('modif-profil-pseudo:asked' , function(newPseudo){
        profilManager.handleModifPseudo(users,newPseudo, socket);
    }) ;

    socket.on('modif-profil-names:asked' , function(infos){
        profilManager.handleModifNames(users,infos, socket);
    }) ;

    socket.on('user-password:asked' , function(password){
        var state = password == users.all[socket.userID].password
        socket.emit('user-password:response' ,state ) ;
        var name = (socket.userID)?socket.name:'???' ;
        if (state) console.log('[SERVER] PROFIL '.blue +  `${name} | password : ` + 'match'.green ) ;
        else console.log('[SERVER] PROFIL '.blue +  `${name} | password : ` + 'not match'.red ) ;
    }) ;

    socket.on('modif-profil-password:asked' , function(newPassword){
        profilManager.handleModifPassword(users,newPassword, socket);
    }) ;

    socket.on('modif-profil-description:asked' , function(newDescription){
        profilManager.handleModifDescription(users,newDescription, socket);
    }) ;

    socket.on('modif-profil-picture:asked' , function(image){
        profilManager.handleModifPicture(users, image.file , image.ext , socket);
    }) ;

    // partie messages
    socket.on('new-message:send' , function(message){
        messagesManager.handleNewMessage(users,messages,message,socket,io);
    }) ;

    socket.on('new-reaction:send' , function(messageId , reactionType ){
        messagesManager.handleNewReaction(users,messages, messageId , reactionType ,socket,io);
    }) ;

    // partie souscription
    socket.on('new-subscriptions:asked' , function(followID){
        userManager.handleAddFollow(users,messages,followID,socket);
    }) ;

    socket.on('remove-subscriptions:asked' , function(followID){
        userManager.handleRemoveFollow(users,messages,followID,socket);
    }) ;

    // partie recherche
    socket.on('search:send', function(pseudo){
        userManager.handleSearchAsk(users,pseudo,socket);
    }) ;
 
    // deconnection du serveur
    socket.on('disconnect' , function(){
        userManager.handleDisconnection(users,socket,io);
    }) ;

}) ;

/**
 * Demmarage du serveur
 */
server.listen(appConfig.getPort() , function() {
    console.log('[SERVER] START '.blue +  'port : ' + appConfig.getPort() ) ;
})