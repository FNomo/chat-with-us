/**
 * Script qui gere la connection l'insciption et la deconnection d'un utilisateur
 */

/**
 * Partie Envoie des informations au serveur
 */
$(document).ready(function () {
    /**
     * Partie connection
     */
     $(document).on('click' , '#log-in-submit' , function (e) { 
        // verifier si les champs sont remplies
        var emptyField = [] ;
        var pseudoInf = $('#log-in-pseudo').val() ;
        var passwordInf = $('#log-in-password').val() ;
        if (pseudoInf == '') emptyField.push('pseudo') ;
        if (passwordInf == '') emptyField.push('password') ;
        var logger = {pseudo :pseudoInf , password : passwordInf}
        // envoie
        if(emptyField.length == 0) {
            $('#logInErrorMessage').remove();
            socket.emit('log-in:asked' , logger) ;
        }else{
            
            var errMess = '<div class="al ui error message" id="log-in-error-message">' + 
            '<i class="close icon"></i>' + 
            '<div class="header">' + 
              'There were some errors with your submission' + 
            '</div>' + 
            '<ul class="list">' ;

            for(fieldIndex in emptyField){
                errMess += '<li>You need to enter a ' + emptyField[fieldIndex] + '.</li>'
            }
            errMess += '</ul></div>'  ;

            if ($('#log-in-error-message').length != 0){
                $('#log-in-error-message').remove();
            }

            $('#log-in-submit').before(errMess);
            $('.message').show() ;
            
        }
    });

    /**
     * Partie inscription
     */
     $(document).on('click' , '#sign-in-submit' , function (e) { 
        // verifier si les champs sont remplies
        var emptyField = [] ;
        var pseudoInf = $('#sign-in-pseudo').val() ;
        var passwordInf = $('#sign-in-password').val() ;
        var passwordConfirmInf = $('#sign-in-password-confirm').val() ;
        if (pseudoInf == '') emptyField.push('pseudo') ;
        if (passwordInf == '') emptyField.push('password') ;
        if (passwordConfirmInf == '') emptyField.push('password confirmation') ;
        var logger = {pseudo :pseudoInf , password : passwordInf}
        
        // envoie
        if(emptyField.length == 0) {
            $('#sign-in-error-message').remove();
            var errList ='';

            if (! correctPseudo(pseudoInf)){
                errList += '<li> Your pseudo is incorrect. </li>' ;
            }else var pseudoOK = true ;

            if (passwordInf == passwordConfirmInf){

                if (correctPassword(passwordInf,pseudoInf) ){          

                    if (pseudoOK){
                        socket.emit('sign-in:asked' , {pseudo: pseudoInf , password : passwordInf}) ;
                        return ;
                    }

                }else{
                    errList += '<li> Your password is incorrect. </li>' ;
                }
                
            }else{
                errList += '<li> Your passwords don\'t match. </li>' ;
            }

            var errMess = '<div class="al ui error message" id="sign-in-error-message">' + 
            '<i class="close icon"></i>' + 
            '<div class="header">' + 
            'There were some errors with your submission' + 
            '</div>' + 
            '<ul class="list">' +
            errList +
            '</ul></div>'  ;

            if ($('#sign-in-error-message').length != 0){
                $('#sign-in-error-message').remove();
            }

            $('#sign-in-submit').before(errMess);
            $('#sign-in-error-message').show() ;
            

            //socket.emit('log-in' , logger) ;
        }else{
            
            var errMess = '<div class="al ui error message" id="sign-in-error-message">' + 
            '<i class="close icon"></i>' + 
            '<div class="header">' + 
              'There were some errors with your submission' + 
            '</div>' + 
            '<ul class="list">' ;

            for(fieldIndex in emptyField){
                errMess += '<li>You need to enter a ' + emptyField[fieldIndex] + '.</li>'
            }
            errMess += '</ul></div>'  ;

            if ($('#sign-in-error-message').length != 0){
                $('#sign-in-error-message').remove();
            }

            $('#sign-in-submit').before(errMess);
            $('.message').show() ;
            
        }
    });

    /**
     * Partie deconnection
     */
    $(document).on( 'click' , '#log-out-button' , async function(e) {
        var user = await createAnonymUser() ;
        app.user = user;
        app.menu = 'home';
        socket.emit('log-out') ;
    }) ;// deconnextion d'un utilisateur
});

/**
 * Partie Reception de la reponses du serveur
 */

let handleAccept =  function(user){
    app.signInStatus = false ;
    app.logInStatus = false ;
    app.user = user ;
    sessionStorage.user = JSON.stringify(user) ;
    resetModification();
} ; // demande accepter

socket.on('log-in:accept' , handleAccept);
socket.on('sign-in:accept' , handleAccept);

let handleLogReject =  function(errorMess){
    var errMess = '<div class="al ui error message" id="log-in-error-message">' + 
            '<i class="close icon"></i>' + 
            '<div class="header">' + 
            'There were some errors with your submission' + 
            '</div>' + 
            '<ul class="list">' +
            '<li>' + errorMess + '</li>' + 
            '</ul></div>'  ;

    if ($('#log-in-error-message').length != 0){
        $('#log-in-error-message').remove();
    }

    $('#log-in-submit').before(errMess);
    $('#log-in-error-message').show() ;
} // refus du log in

let handleSignReject =  function(errorMess){
    var errMess = '<div class="al ui error message" id="sign-in-error-message">' + 
            '<i class="close icon"></i>' + 
            '<div class="header">' + 
            'There were some errors with your submission' + 
            '</div>' + 
            '<ul class="list">' +
            '<li>' + errorMess + '</li>' + 
            '</ul></div>'  ;

    if ($('#sign-in-error-message').length != 0){
        $('#sign-in-error-message').remove();
    }

    $('#sign-in-submit').before(errMess);
    $('#sign-in-error-message').show() ;
} // refus du sign in


socket.on('log-in:reject' , handleLogReject);
socket.on('sign-in:reject' , handleSignReject);