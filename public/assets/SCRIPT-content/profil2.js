/**
 * Script qui gere la connection la modification d'un utilisateur (2eme partie , informations personelles)
 */

/**
 * Partie Envoie des informations au serveur
 */
$(document).ready(function () {
    /**
     * Partie pseudo
     */
    $(document).on( 'click' , '#content-block-pseudo .my-edit-button' , function(e) {
        // creer un bouton save or cancel
        var cancelSaveButton = createSaveCancelButton() ;

        // ajoute le button au DOM
        $('#content-block-pseudo-input-block').after(cancelSaveButton);
        $('#my-edit-pseudo').prop('disabled',false) ;
        $('#my-edit-pseudo').focus() ;
    }) ;

    // annulation


    // sauvegarde du pseudo
    $(document).on( 'click' , '#content-block-pseudo #my-edit-save' , function(e) {
        var newPseudo = app.modifs.pseudo ;
        if ( newPseudo != app.user.pseudo && correctPseudo(newPseudo)){
          socket.emit('modif-profil-pseudo:asked' , newPseudo)
          displayModifSend() ;
          $('#my-edit-cancel').trigger('click');
        }
        else{
          $('.error').remove();
          var content = '<ul>' +
          '<li> You did not modify anything.</li>' +
          '<li> Pseudo must only contain letters or numbers.</li>' +
          '<li> Pseudo must contain at least 2 characters.</li>' +
          '<ul>' ;
          var errorMess = createModifError(content) ;
          $('#content-block-pseudo-input-block').before(errorMess); // Erreur dans les entrees
        }
      }) ;

      $(document).on( 'click' , '#content-block-pseudo #my-edit-cancel' , function(e) {
        // reset les  valeurs
        app.modifs.pseudo = app.user.pseudo ;

        // reset l'affichage
        $('#my-edit-pseudo').val(app.user.pseudo) ;     
      }) ;

    /**
     * Partie password
     */
    // verification du mot de passe courant
     $(document).on( 'click' , '#content-block-password .my-edit-button' , function(e) {
        // creer un div pour confirmer le mot de passe
        var cancelConfirmButton ='<div class="ui input my-edit-infos-added loading icon" id="my-edit-password-ask-pane"> ' +
            '<input maxlength="15" type="password" id="my-edit-password-ask" placeholder="Confirm your password...">' +
            constructModifPasswordButtons() +
            '</div>' ;

        // ajoute le button au DOM
        $('#content-block-password-pane').append(cancelConfirmButton);
        $('#my-edit-password-ask').focus() ;
    }) ;

    // Envoie de la confirmation du mot de passe
    $(document).on( 'click' , '#my-edit-password-ask-pane #my-edit-password-button' , function(e) {
        var password = $('#my-edit-password-ask').val() ;
        if (correctPassword(password ,app.user.pseudo)){
          socket.emit('user-password:asked' , password) ;

          //suppression des anciens boutons
          $('#my-edit-password-button').remove() ;
          $('#my-edit-cancel').remove() ;

          // ajout de l icone de chargement
          var loadingIcon= '<i class="search icon"></i>' ;
          $('#my-edit-password-ask-pane').append(loadingIcon) ;
        }
        else{
          $('.error').remove();
          var content = '<p>' +
          "It doesn't seem like a password." +
          '</p>' ;
          var errorMess = createModifError(content) ;
          $('#content-block-password-pane').before(errorMess); // Erreur dans les entrees
        }
      }) ;

    $(document).on( 'click' , '#password-form #my-edit-password-button' , function(e) {
        var password = $('#my-edit-password-edit').val() ;
        var passwordConf = $('#my-edit-password-confirm').val() ;
        if (password == passwordConf && correctPassword(password ,app.user.pseudo)){
            socket.emit('modif-profil-password:asked' , password) ;
            
            // Alerte de l'envoie des modification
            displayModifSend() ;
            $('#my-edit-cancel').trigger('click');
        }
        else{
            $('.error').remove();
            var content = '<ul>' +
            "<li>Passwords must be identical.</li>" +
            "<li>Password must only contain letters or numbers.</li>" +
            "<li>Password must contain at least 5 characters .</li>" +
            "<li>Password must contain at least 2 numbers .</li>" +
            '</ul>' ;
            var errorMess = createModifError(content) ;
            $('#content-block-password-pane').before(errorMess); // Erreur dans les entrees
        }
    }) ;


});


/**
 * Partie Reception des informations au serveur
 */

var handleResponsePasswordConfirm = function(response){
    if (response){
        // Suppression du contenu
        $('.error').remove();
        $('.search').remove();
        $('#my-edit-password-ask').prop('disabled',true);
        $('#my-edit-password-ask').addClass('my-correct');

        //ajout de contenu
        var newPasswordForm = '<div id="password-form" class="my-edit-infos-added">' +
            '<div class="ui input" id="my-edit-password-edit-pane">' +
            '<input maxlength="15" type="password" id="my-edit-password-edit" placeholder="New your password...">' +
            '</div>' +


            '<div class="ui input" id="my-edit-password-confirm-pane">' +
            '<input maxlength="15" type="password" id="my-edit-password-confirm" placeholder="Confirm your password...">' +
            constructModifPasswordButtons() +
            '</div>' +

            '</div>' ;

        $('#my-edit-password-ask-pane').after(newPasswordForm);

    }else{
        // affichage d un message d erreur
        $('.error').remove();
        var content = '<p>Invalid password.</p>' ;
        var errorMess = createModifError(content) ;
        $('#content-block-password-pane').before(errorMess);

        // reset
        $('#my-edit-password-ask').val("");
        $('.search').remove();
        $('#my-edit-password-ask-pane').append(constructModifPasswordButtons())

    }
}
socket.on('user-password:response',handleResponsePasswordConfirm);

// reponses au pseudo
var handleModifPseudoOK = function(pseudo){
  // Sauvegarde
  app.user.pseudo = pseudo ;
  app.modifs.pseudo = pseudo ;
  sessionStorage.user = JSON.stringify(app.user) ;

  // Affichage de la reponse
  $('#my-edit-pseudo').val(app.user.pseudo) ;
  displayModifReceive('positive' , 'Pseudo' , '') ;
}

var handleModifPseudoNO = function(infos){
  displayModifReceive('negative' , 'Pseudo' , 'not') ;
}

socket.on('modif-profil-pseudo:accept',handleModifPseudoOK);
socket.on('modif-profil-pseudo:reject',handleModifPseudoNO);

// reponses au mot de passe
var handleModifPasswordOK = function(){
  // Affichage de la reponse
  displayModifReceive('positive' , 'Password' , '') ;
}

var handleModifPasswordNO = function(){
  displayModifReceive('negative' , 'Password' , 'not') ;
}

socket.on('modif-profil-password:accept',handleModifPasswordOK);
socket.on('modif-profil-password:reject',handleModifPasswordNO);

/**
 * Fonctions annexes
 */
var constructModifPasswordButtons = function(){
    return '<button class="ui icon button my-edit-save" id="my-edit-password-button">' +
        '<i class="check icon"></i>' +
        '</button>'+
        '<button class="ui icon button" id="my-edit-cancel" >' +
        '<i class="close icon"></i>' +
        '</button>' ;
}