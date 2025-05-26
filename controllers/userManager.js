/**
 * Les import de modules
 */
const userLoader = require('./../models/usersLoader') ;
const messagesManager = require('./messagesManager');

/**
 * Module user manager
 */
userManager = {

    handleUser : function(users,messages,userID,socket,io){
        socket.userID = userID ;
        var user = users.all[userID] ;
        user.connections.push(socket);

        var connectionLength = user.connections.length ;
        var previousName = socket.name ;
        socket.name = `${user.pseudo}[${connectionLength}]` ;

        if (connectionLength == 1){
            users.onlines++ ;   // il s'agit dune nouvelle connection
        }

        emitNewAnonymOnline(users,io) ;
        emitNewOnline(users,io) ;

        console.log('[SERVER] CONNECTION '.blue + `open : ${socket.name}`) ;
        messagesManager.sendAllMessages(users,messages,userID,socket);
    },// Utilisateur arrive sur le serveur

    handleAnonym : function(users,messages,socket,io){
        socket.userID = 1 ;
        socket.anonymID = ++users.anonymsCounter ;
        var previousName = socket.name ;
        socket.name = `anonym[${socket.anonymID}]` ;
        var user = users.all[1] ;
        user.connections.push(socket);

        users.anonyms++;

        emitNewOnline(users,io) ;
        emitNewAnonymOnline(users,io) ;

        console.log('[SERVER] CONNECTION '.blue + `open : ${socket.name}`  ) ;
        messagesManager.sendAllMessages(users,messages,1,socket);
    },// Anonym arrive sur le serveur

    handleLogIn : async function(users,messages,logger, socket,io){
        var errMess = 'Invalid pseudo.';
        var previousName = socket.name ;

        for (item in users.all){
            var user = users.all[item] ;
            if (logger.pseudo == 'ANONYM'){ // On ne peut pas se connecter a l'utilisateur anonym
                break ;
            }

            if (user.pseudo == logger.pseudo){ // si tout macth on change la socket de place dans la map users.onlines
                if ( user.password == logger.password ){
                    users.all[1].connections.splice(socket,1);
                    user.connections.push(socket) ;
                    
                    var connectionLength = user.connections.length ;
                    socket.userID = user.ID ;
                    
                    
                    if( connectionLength == 1 ){
                        users.onlines ++;
                        emitNewOnline(users,io) ;
                    }
                    
                    var userToSend = { // Creer l'utilisateur a envoyer
                        ID : user.ID ,
                        firstname : user.firstname,
                        lastname : user.lastname,
                        pseudo : user.pseudo ,
                        userDescription : user.userDescription,
                        email: user.email,
                        pictureSrc : user.pictureSrc ,
                        creationDate : user.creationDate ,
                        subscribers: [...user.subscribers],
                        subscriptions: [...user.subscriptions],                        
                    }

                    socket.name = `${userToSend.pseudo}[${connectionLength}]`; // sert a la verbose
                    users.anonyms -- ;
                    emitNewAnonymOnline(users,io) ;
                    socket.emit('log-in:accept' , userToSend ) ;
                    console.log('[SERVER] LOG IN '.blue  +   `${previousName} --> ${socket.name} : ` + 'accepted'.green ) ;
                    messagesManager.sendAllMessages(users,messages,userToSend.ID,socket);
                    
                    return;
                }
                errMess = 'Invalid password.';
                break;
            }
        }
        socket.emit('log-in:reject' , errMess ) ;
        console.log('[SERVER] LOG IN '.blue +  `${previousName} --> ${logger.pseudo} : ` + 'refused'.red ) ;    

    }, // Utilisateur essaie de s'authentifie sur le serveur

    handleSignIn : async function(users,messages,signer, socket,io){
        var errMess = 'Use another pseudo. not ANONYM.';
        var previousName = (socket.name)?socket.name:'???' ;

        for (item in users.all){ // Verifie s'il y a deja un utilisateur existant
            var user = users.all[item] ;
            if (signer.pseudo == 'ANONYM'){
                console.log('Use another pseudo.');
                console.log('[SERVER] SIGN IN '.blue +  `${previousName} --> ${signer.pseudo}[1] : ` + 'refused'.red ) ;
                socket.emit('sign-in:reject' , errMess ) ;
                return ;
            }

            if (user.pseudo == signer.pseudo){ // si il existe deja un utilisateur avec ce pseudo
                errMess = 'User already exist.' ;
                console.log('User already exist.');
                console.log('[SERVER] SIGN IN '.blue +  `${previousName} --> ${signer.pseudo}[1] : ` + 'refused'.red ) ;
                socket.emit('sign-in:reject' , errMess ) ;
                return ;
            }
        }

        var userCreated = { // Creer un utilisateur, pour le stocker dans le tableau users.all
            pseudo : signer.pseudo ,
            password : signer.password ,
            userDescription : "" ,
            pictureSrc : '/datas/user-profil/anonym.png' ,
            subscribers: [],
            subscriptions: [],
            connections:[]              
        };

        var data = await userLoader.uploadUser(userCreated) ;
        
        if (data.resultOK){ // Il a reussi a s'inscrire
            userCreated.ID = data.ID ;
            userCreated.creationDate = data.creationDate ;
            users.all[data.ID] = userCreated ;
            socket.userID = userCreated.ID;
            socket.name = `${signer.pseudo}[1]`;
            userCreated.connections.push(socket);

            console.log(users.all[2])
            var userToSend = { // Creer un utilisateur pour l'envoyer par la suite
                ID : data.ID,
                pseudo : signer.pseudo ,
                pictureSrc : '/datas/user-profil/anonym.png' ,
                subscribers: [],
                subscriptions: [],
            } ;

            console.log('create :');
            console.log(userCreated);
            console.log('send :');
            console.log(userToSend);

            users.anonyms --;
            users.onlines ++;
            emitNewAnonymOnline(users,io) ;
            emitNewOnline(users,io) ;

            socket.emit('sign-in:accept' , userToSend) ;
            console.log('[SERVER] SIGN IN '.blue +  `${previousName} --> ${signer.pseudo}[1] : ` + 'accepted'.green ) ;
            messagesManager.sendAllMessages(users,messages,userToSend.ID,socket);
            return ;
        }else{
            errMess = data.errMess ;
            console.log('[SERVER] SIGN IN '.blue +  `${previousName} --> ${signer.pseudo}[1] : ` + 'refused'.red ) ;
        }

        socket.emit('sign-in:reject' , errMess ) ;
    }, // Utilisateur essaie de s'inscrire sur le serveur

    handleLogOut : function(users,messages,socket,io){
        
        previousID = socket.userID ;
        previousName = socket.name ;
        users.all[previousID].connections.splice(socket,1) ;
        users.all[1].connections.push(socket) ;

        var connectionLength = users.all[1].connections.length ;
        socket.userID = 1 ;
        socket.anonymID = ++users.anonymsCounter ;
        socket.name = `anonym[${socket.anonymID}]` ;

        if (users.all[previousID].connections.length == 0){
            users.onlines --;
            emitNewOnline(users,io) ;
        }       
        
        users.anonyms++;
        emitNewAnonymOnline(users,io) ;
        console.log('[SERVER] LOG OUT '.blue  +   `${previousName} --> ${socket.name}` ) ;
        messagesManager.sendAllMessages(users,messages,1,socket);
    }, // Utilisateur essaie de de se desauthentifie sur le serveur

    handleAddFollow : function(users,messages ,followID,socket){ // On ajoute un nouveau follow
        
        var userID = socket.userID ;
        var follows = users.all[userID].subscriptions ;
        var followers = users.all[followID].subscribers ;
        var name = (socket.name)?socket.name : '???' ;

        if (follows.indexOf(followID) < 0){
            
            userLoader.uploadFollow(userID,followID);
            follows.push(followID) ;
            followers.push(userID) ;

            users.all[userID].connections.forEach(function(connect) {
                connect.emit('new-subscriptions:receive', 'follows' , follows , users.all[followID].pseudo) ;
                messagesManager.sendAllMessages(users,messages,userID,socket);
            });

            users.all[followID].connections.forEach(function(connect) {
                connect.emit('new-subscriptions:receive', 'followers' , followers , users.all[userID].pseudo) ;
            });

            console.log('[SERVER] FOLLOWS '.blue + `${name} --> ${users.all[followID].pseudo} : ` + 'follow'.green ) ;           
        }
    } ,

    handleRemoveFollow : function(users,messages,followID,socket){ // On retire un follow
        var userID = socket.userID ;
        var follows = users.all[userID].subscriptions ;
        var followIndex = follows.indexOf(followID);
        var followers = users.all[followID].subscribers ;
        var followerIndex = followers.indexOf(userID);
        var name = (socket.name)?socket.name : '???' ;

        if (followIndex >= 0){
            
            userLoader.deleteFollow(userID,followID);
            follows.splice(followIndex,1) ;
            followers.splice(followerIndex,1) ;

            users.all[userID].connections.forEach(function(connect) {
                connect.emit('remove-subscriptions:receive', 'follows' , follows , users.all[followID].pseudo) ;
                messagesManager.sendAllMessages(users,messages,userID,socket);
            });

            users.all[followID].connections.forEach(function(connect) {
                connect.emit('remove-subscriptions:receive', 'followers' , followers) ;
            });

            console.log('[SERVER] FOLLOWS '.blue + `${name} --> ${users.all[followID].pseudo} : ` + 'unfollow'.red ) ;           
        }

    },

    handleSearchAsk : function(users,request,socket){
        var array = [] ;
        var name = (socket.name)?socket.name : '???' ;

        for (item in users.all){
            var user = users.all[item] ;
            var state = user.pseudo.search(request) >= 0 || (user.firstname && user.firstname.search(request) >= 0 ) || (user.lastname && user.lastname.search(request) >= 0 ) ;
            
            if ( state ){
                var elem = {
                    ID : user.ID ,
                    pseudo : user.pseudo,
                    userDescription : user.userDescription,
                    online : user.connections.length > 0 ,
                    creationDate : user.creationDate,
                    firstname:user.firstname,
                    lastname:user.lastname
                } ;
                 if (user.ID != 1) array.push(elem);
            }
        }

        socket.emit('search:receive' , array) ;
        console.log('[SERVER] SEARCH '.blue + `${name} ask for : ${request}`  ) ;
    },

    handleDisconnection : function(users,socket,io){ // On finis la connection avec une socket
        
        if (socket.userID){
            users.all[socket.userID].connections.splice(socket,1) ;
        
            if (socket.userID == 1){ // Il s'agit de la socekt d'un anonym
                users.anonyms -- ;
                emitNewAnonymOnline(users,io) ;
            }
    
            else if (users.all[socket.userID].connections.length == 0 ){ // Il s'agit de la socekt d'un utilisateur ayant plusieurs connections
                users.onlines -- ;
                emitNewOnline(users,io) ;
            } 
        }        
                
        var name = (socket.userID)?socket.name:'???' ;
        console.log('[SERVER] CONNECTION '.blue + 'close : ' +  name ) ;


    }// Utilisateur quitte le serveur ( completement ou il se reconnect)
};

var emitNewOnline = function(users,io){ // emissions de la modification du nombre d' utilisateur en ligne a toutes personnes connectes
    io.emit('userOnlineModified' , users.onlines) ;
};

var emitNewAnonymOnline = function(users,io){ // emissions de la modification du nombre d' anonymes en ligne a toutes personnes connectes
    io.emit('anonymOnlineModified' , users.anonyms) ;
};

module.exports = userManager ;