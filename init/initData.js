
const usersLoader = require('./../models/usersLoader') ;
const messagesLoader = require('./../models/messagesLoader') ;

initData = {
    init : async function(users,messages){
        // partie utilisateurs
        var loadUserResponses = await usersLoader.loadAll() ;
        for(userItem in loadUserResponses.allUsers){ // On ajoute les utiliateurs au tableau de tous les utilisateurs
            let user= loadUserResponses.allUsers[userItem] ;
            user.subscribers = [] ;
            user.subscriptions = [] ;
            user.connections = [] ;
            users.all[user.ID] = user ;
        }
    
        for (subscribeItem in loadUserResponses.allSubcribtions){ // On remplie le tableau subscribers de chaque utilisateur
            users.all[ loadUserResponses.allSubcribtions[subscribeItem].subscribtionID ].subscribers.push(loadUserResponses.allSubcribtions[subscribeItem].subscriberID) ;
            users.all[ loadUserResponses.allSubcribtions[subscribeItem].subscriberID ].subscriptions.push(loadUserResponses.allSubcribtions[subscribeItem].subscribtionID) ;
        }
    
        // partie messages 
        var loadMessResponses = await messagesLoader.loadAll() ;
        for (messageItem in  loadMessResponses.messagesList){ // On ajoute un mesage a la liste de touts les messages
            var message = {
                ID : loadMessResponses.messagesList[messageItem].ID ,
                userID : loadMessResponses.messagesList[messageItem].userID ,
                content : loadMessResponses.messagesList[messageItem].content,
                date : loadMessResponses.messagesList[messageItem].emitDate,
                mentions : [],
                reactions : {}
            };
            messages[loadMessResponses.messagesList[messageItem].ID] = message ;
        }
    
        
        for (messageMentionItem in loadMessResponses.mentionsList){ // On remplie la liste mentions de tous les messages
            var message = messages[ loadMessResponses.mentionsList[messageMentionItem].messageID ] ;
            var userMentionnedID = loadMessResponses.mentionsList[messageMentionItem].userMentionnedID ;
            message.mentions.push(userMentionnedID) ;
            messages[message.ID] = message ;
        }
    
        for (messageReactionItem in loadMessResponses.reactionsList){ // On remplie la hashmap reactions de tous les messages
            var message = messages[ loadMessResponses.reactionsList[messageReactionItem].messageID ] ;
            var reaction = loadMessResponses.reactionsList[messageReactionItem].reaction ;
            var userID = loadMessResponses.reactionsList[messageReactionItem].userID ;
            if (message.reactions[reaction]){
                message.reactions[reaction].push(userID) ;
            }else{
                message.reactions[reaction] = [ userID ] ;
            }
        }

    }
}

module.exports = initData ;