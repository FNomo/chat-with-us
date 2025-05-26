const loader = require('./../models/messagesLoader');
const moment = require('moment')

messagesManager = {
    handleNewMessage : async function(users,messages,message,socket,io){       
        // Gestion d'un nouveau message recu
        var date = moment().format('YYYY-MM-DD HH:mm:ss') ;
        var messageCopy = JSON.parse(JSON.stringify(message)) ;

        var mentionsSet = getAllMentionnedUser(messageCopy.content) ;
        var mentionsArray = getMentionnedUserIdArray(users,mentionsSet) ;
        messageCopy.mentions = mentionsArray ;

        messageCopy.emitDate = date ;
        var res = await loader.uploadMessage(messageCopy) ;
        var name = (socket.name)?socket.name : '???' ;

        if (res.resState == true){
            var userEmiter = users.all[message.userID] ;
            messageCopy.ID = res.lineID ;
            messageCopy.reactions = {like : [] , basketball:[] , dislike:[]} ;
            messages[res.lineID] = messageCopy ;
            
            if (userEmiter.ID == 1 || messageCopy.mentions.indexOf(1) >= 0){
                io.emit('new-message:receive' , {result : true , messageItem: messageCopy}) ;
            }else{
                var userToSendList = new Set() ;

                userToSendList.add(userEmiter.ID) ;// on l'envoie a l'utilisateur qui a ecrit le message

                for (item in messageCopy.mentions){ // on l'envoie au utilisateur mentionner
                    userToSendList.add(messageCopy.mentions[item]) ;
                }

                for (item in userEmiter.subscribers){// on l'envoie au utilisateur qui suit l'utilisateur emeteur
                    userToSendList.add( userEmiter.subscribers[item] );
                }

                userToSendList.forEach( function(key , val , set){

                    var connections = users.all[val].connections ;

                    for (itemJ in connections){
                        connections[itemJ].emit('new-message:receive' , {result : true , messageItem: messageCopy}) ;
                    }
                });
                

                
            }

            console.log('[SERVER] MESSAGES '.blue  +   `new message : ${name}`.green ) ;

        }else{
            socket.emit('new-message:receive' , {result : false });
            console.log('[SERVER] MESSAGES '.blue  +   `new message : ${name}`.red ) ;
        }

    },

    sendAllMessages : function(users,messages, id,socket ){ /**Envoie la liste de message a un utilisateur specifique */
        var messagesToSend = [];
        var endItem = false;

        for(item in messages){
            var mess = JSON.parse( JSON.stringify(messages[item]) ) ; // On fait une copie
            mess.selected = false ;
            mess.addReaction = false ;
            mess.reactions['like'] = (mess.reactions['like'])?mess.reactions['like'] : [] ;
            mess.reactions['dislike'] = (mess.reactions['dislike'])?mess.reactions['dislike'] : [] ;
            mess.reactions['basketball'] = (mess.reactions['basketball'])?mess.reactions['basketball'] : [] ;

            var messUserID = mess.userID ;
            var usrEmitter = users.all[messUserID] ;
            

            mess.usrPic = usrEmitter.pictureSrc ;
            mess.usrPseudo = usrEmitter.pseudo ;


            if (messUserID == 1 || mess.mentions.indexOf(1) >= 0){ // Si un anonym a envoyer le message
                messagesToSend.push(mess) ;
            }
            else if (messUserID == id){
                messagesToSend.push(mess) ; // Si la personne est l'emeteur
            }else{
                
                for (itemJ in mess.mentions){ // Si elle apparait dans les mentions
                    var mention = mess.mentions[itemJ] ;
                    
                    if (mention == id){
                        messagesToSend.push(mess) ;
                        endItem = true ;
                    }
                }

                if(! endItem){ // Si un l'utilisateur suit l'emeteur du message
                    var user = users.all[id] ;
                    for (itemJ in user.subscriptions){
                        if (messUserID == user.subscriptions[itemJ]){
                            messagesToSend.push(mess) ;
                            endItem = true ;
                        }
                    }
                }
            }
            endItem = false ;

        }

        socket.emit('messages:all',messagesToSend) ;
        var name = (socket.name)?socket.name : '???' ;
        console.log('[SERVER] MESSAGES '.blue  +   `send all : ${name}` ) ;
    } ,

    /** Partie Reaction */
    handleNewReaction : function(users,messages, messageId , reactionType ,socket,io){
        var message = messages[messageId] ;
        var userEmiter = users.all[message.userID] ;
        var name = (socket.name)?socket.name : '???' ;

        // Traitement & enregistrement
        if(message.reactions[reactionType]){
            var index = message.reactions[reactionType].indexOf(socket.userID) ;
            if ( index>= 0){
                message.reactions[reactionType].splice(index , 1) ;
                loader.deleteReaction(messageId , socket.userID , reactionType) ;
                console.log('[SERVER] REACTIONS '.blue  +   `${name} : remove ${reactionType} --> Message${message.ID}` ) ;
            }
            else {
                message.reactions[reactionType].push(socket.userID) ;
                loader.uploadReaction(messageId , socket.userID , reactionType) ;
                console.log('[SERVER] REACTIONS '.blue  +   `${name} : add ${reactionType} --> Message${message.ID}` ) ;
            }
        }else{    
            message.reactions[reactionType] = [socket.userID] ;
            loader.uploadReaction(messageId , socket.userID , reactionType) ;
            console.log('[SERVER] REACTIONS '.blue  +   `${name} : add ${reactionType} --> Message${message.ID}` ) ;
        }
        

        // Enregistrement


        // Envoie
        if (userEmiter.ID == 1 || message.mentions.indexOf(1) >= 0){
            io.emit('new-reaction:receive' ,message.ID , reactionType , message.reactions[reactionType] ) ;
        }else{
            var userToSendList = new Set() ;

            userToSendList.add(userEmiter.ID) ;// on l'envoie a l'utilisateur qui a ecrit le message

            for (item in message.mentions){ // on l'envoie au utilisateur mentionner
                userToSendList.add(message.mentions[item]) ;
            }

            for (item in userEmiter.subscribers){// on l'envoie au utilisateur qui suit l'utilisateur emeteur
                userToSendList.add( userEmiter.subscribers[item] );
            }

            userToSendList.forEach( function(key , val , set){

                var connections = users.all[val].connections ;

                for (itemJ in connections){
                    connections[itemJ].emit('new-reaction:receive' ,message.ID , reactionType , message.reactions[reactionType]) ;
                }
            });           
        }
    }
}

/**
 * Fonctions annexes
 */
// On construit un set contenant les user mentionner par un message
var getAllMentionnedUser = function(mess){
    const regex = /@\w*/g;
    var mySet = new Set() ;

    var usrPseudo ;

    while((usrPseudo = regex.exec(mess)) !== null){
        mySet.add(usrPseudo[0].replace(/@/,"")) ;
    }
    return mySet ;
}

var getMentionnedUserIdArray = function(users,mySet){
    var mentions = [] ;

    mySet.forEach( function(key , val , set){ 
        if (val == 'everyone') val = 'ANONYM' ;

        for (item in users.all){
            var usr = users.all[item] ;
            if (usr.pseudo == val){
                mentions.push(usr.ID) ;
                break ;
            }
        }
    });

    return mentions ;
}

module.exports = messagesManager ;