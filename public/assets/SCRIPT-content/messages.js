/**
 * Ce fichiers definit la gestion des messages
 */

/**  Gestion des envoies au serveur*/
$(document).ready(function () {
    // Envoie du message au serveur
    $(document).on('click' , '#my-input-message-button' , function(e){
        var text = app.myMessage.content ;
        
        if (!text || text == ''){
            displayMessageNotificationSend('error' , 'Your message cannot be sent.') ;
        }else if (app.user.ID == 1 && text.search(/@/) >= 0){
            displayMessageNotificationSend('error' , 'Your message cannot be sent. An anonym cannot mention an user.') ;
        }
        else{
            app.myMessage.userID = app.user.ID ;
            app.myMessage.usrPic = app.user.pictureSrc ;
            app.myMessage.usrPseudo = app.user.pseudo;

            socket.emit('new-message:send' , app.myMessage);
            animateTheSendButton() ;
            displayMessageNotificationSend('positive' , 'Your message have been sent.') ;
            app.myMessage.content = '' ;
            $('#my-input-message').val('') ;
        }

    }) ;

/** Gestion des click des messages */

    // Click sur le bouton mention d'un message
    $(document).on('click' , '.my-mention-button' , function(e){
        var userMentionPseudo = $(this).closest('.my-message-header').find('.my-message-pseudo').text().replace(/ /g , "")
        userMentionPseudo = (userMentionPseudo == 'ANONYM')?'everyone' : userMentionPseudo ;
        
        var messInput = $('#my-input-message').val() ;
        messInput += ` @${userMentionPseudo} `;
        $('#my-input-message').val(messInput)  ;    
        app.myMessage.content = messInput ;
    }) ;
});

/** Traitement de la reponse du serveur */
var handleAllMessagesReceive = function(messages){
    app.loading = true ;
    app.messages = messages ;
}

var handleNewMessageReceive = function(response){
    
    if(response.result){
        var mess = response.messageItem ;
        app.addNewMessage(mess) ;
    }
}

var handleNewReaction = function(messId , reactionType , array){
    for (item in app.messages){
        var mess = app.messages[item] ;
        
        if (mess.ID == messId){
            mess.reactions[reactionType] = array ;
            return;
        }
    }
}

socket.on('messages:all' , handleAllMessagesReceive);
socket.on('new-message:receive' , handleNewMessageReceive);
socket.on('new-reaction:receive', handleNewReaction)

/** Fonction annexes */
var displayMessageNotificationSend = function(messType , messContent){
    var id = `notification${++notificationID}`
    var createSendMess = `<div class="ui ${messType} message" id="${id}">`+
        '<i class="close icon"></i>' +
        '<div class="header">'+
        'Request to send a message'+
        '</div>'+
        `<p>${messContent}.</p>`+
        '</div>' ;

    $('#page-main-pane').prepend(createSendMess) ;
  
    setTimeout(function(){ 
    $(`#${id}`).queue( function() { 
      $(`#${id}`).slideUp(400).dequeue() 
    }).queue( function() { 
      $(`#${id}`).remove().dequeue() 
    });
    }, 2000);
}

var displayMessageWithMention = function(mess){
    return mess.replace(/@\w*/g , '<span class="my-mention-pseudo">$&</span>') ;
}

/** Animations */

var animateTheSendButton = function(){
    $( "#my-input-message" ).slideUp().slideDown();
};