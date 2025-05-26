/**
 * Script qui gere la connection la modification d'un utilisateur (1ere partie , informations globales)
 */

/**
 * Partie Envoie des informations au serveur
 */
 $(document).ready(function () {

    // Ouverture du menu d editing et bouton cancel et bouton save
    $(document).on( 'click' , '.my-edit-button' , async function(e) {
        // reset tout l'affichage
        resetModification() ;
        $('#my-edit-firstname').val(app.user.firstname) ;
        $('#my-edit-lastname').val(app.user.lastname) ;
        $('.my-edit-input').prop('disabled',true) ;
        $('.my-edit-button').show();
        $('.edit-block-selected').removeClass('edit-block-selected');
        $('.my-edit-infos-added').remove();
        $('#my-edit-picture').attr("src" , app.user.pictureSrc);

        // affiche le block selection en tant que selected
        $(this).closest('.my-edit-block').addClass('edit-block-selected');
        $(this).hide();
      }) ;

      $(document).on( 'click' , '#my-edit-cancel' , function(e) {
        // reset l'affichage
        $('.edit-block-selected').removeClass('edit-block-selected');
        $('.my-edit-infos-added').remove();
        $('.my-edit-input').prop('disabled',true) ;
        $('.my-edit-button').show();       
      }) ;

      /**  Partie edition des noms */
      $(document).on( 'click' , '#content-block-names .my-edit-button' , function(e) {
        // creer un bouton save or cancel
        var cancelSaveButton = createSaveCancelButton() ;

        // ajoute le button au DOM
        $('#content-block-lastname-block').after(cancelSaveButton);
        $('#content-block-names .my-edit-input').prop('disabled',false) ;
        $('#my-edit-firstname').focus() ;
      }) ;

      $(document).on( 'click' , '#content-block-names #my-edit-cancel' , function(e) {
        // reset les  valeurs
        app.modifs.lastname = app.user.lastname ;
        app.modifs.firstname = app.user.firstname ;

        // reset l'affichage
        $('#my-edit-firstname').val(app.user.firstname) ;
        $('#my-edit-lastname').val(app.user.lastname) ;           
      }) ;

      $(document).on( 'click' , '#content-block-names #my-edit-save' , function(e) {
        if (correctModifName()){
          socket.emit('modif-profil-names:asked' , {firstname:app.modifs.firstname , lastname:app.modifs.lastname})
          displayModifSend() ;
          $('#my-edit-cancel').trigger('click');
        }
        else{
          $('.error').remove();
          var content = '<ul>' +
          '<li> You did not modify anything.</li>' +
          '<li> Firstname & lastname must only contain letters.</li>' +
          '<li> Firstname & lastname must contain at least 2 letters.</li>' +
          '<ul>' ;
          var errorMess = createModifError(content) ;
          $('#content-block-firstname-block').before(errorMess); // Erreur dans les entrees
        }
      }) ;

      /** Partie edition de la description */
      $(document).on( 'click' , '#content-block-desciption .my-edit-button' , function(e) {
        // creer un bouton save or cancel
        var cancelSaveButton = createSaveCancelButton() ;

        // ajoute le button au DOM
        $('#my-edit-description').after(cancelSaveButton);
        $('#content-block-desciption .my-edit-input').prop('disabled',false) ;
        $('#my-edit-description').focus() ;
      }) ;

      $(document).on( 'click' , '#content-block-desciption #my-edit-cancel' , function(e) {
        // reset les  valeurs
        app.modifs.userDescription = app.user.userDescription ;

        // reset l'affichage
        $('#my-edit-description').val(app.user.userDescription) ;     
      }) ;

      $(document).on( 'click' , '#content-block-desciption #my-edit-save' , function(e) {
        var newDescription = app.modifs.userDescription ;
        if (newDescription == app.user.userDescription){ // On a rien changer donc message erreur
          $('.error').remove();
          var content = '<p>' +
          'You did not modify anything.' +
          '<p>' ;
          var errorMess = createModifError(content) ;
          $('#my-edit-description').before(errorMess);
        }else{
          socket.emit('modif-profil-description:asked' , newDescription) ;
          displayModifSend() ;
          $('#my-edit-cancel').trigger('click');
        }
      }) ;

      /** Partie edition de l'image */
      $(document).on( 'click' , '#content-block-picture .my-edit-button' , function(e) {
        // creer un bouton save or cancel

        var chooseButton = '<input type="file" ' + 
          'id="my-edit-picture-choose" name="my-edit-picture-choose"' + 
          'accept="image/png, image/jpeg" class="my-edit-infos-added">' +
          '<label class="my-edit-infos-added" for="my-edit-picture-choose">'+
          '<button class="ui compact labeled icon button" id="my-pic-upload-button">'+
          '<i class="file image icon"></i> Upload image</button>'+
          '</label>' ;

        var cancelSaveButton = createSaveCancelButton(); 

        // ajoute le button au DOM
        $('#my-edit-picture-buttons-box').append(cancelSaveButton);
        $('#my-edit-picture-choose-box').append(chooseButton);
      }) ;

      $(document).on( 'change' , '#my-edit-picture-choose' , function(e) {
        // changement de la valeur modifie
        app.modifs.pictureSrc = app.user.pseudo ;

        // modification de l'image affiche        
        var inputImage = $('#my-edit-picture-choose')[0] ;
        if (inputImage.files.length > 0) {
          
          var file = inputImage.files[0] ;
          app.modifs.pictureSrc = file.name ;
          var img = document.createElement('img') ;
          img.src = window.URL.createObjectURL(file) ;
          img.id = 'my-edit-picture' ;
          img.classList.add("ui", "medium" , "circular", "image");
          $('#my-edit-picture').remove() ;
          $('#my-edit-picture-box')[0].appendChild(img) ;
        }

      }) ;

      $(document).on( 'click' , '#content-block-picture #my-edit-cancel' , function(e) {
        // reset les  valeurs
        app.modifs.pictureSrc = app.user.pictureSrc ;

        // reset l'affichage
        $('#my-edit-picture').attr("src" , app.user.pictureSrc);    
      }) ;

      $(document).on( 'click' , '#content-block-picture #my-edit-save' , function(e) {
        var imgName = $('#my-edit-picture-choose').val() ;
        if (imgName ==""){ // On a rien changer donc message erreur
          $('.error').remove();
          var content = '<p>' +
          'You did not modify anything.' +
          '<p>' ;
          var errorMess = createModifError(content) ;
          // Ajouter width:100%;margin:2% dans le css.
          $('#content-block-picture-pane').before(errorMess);
        }else{
          var ext = imgName.split('.')[1] ;
          var img = $('#my-edit-picture-choose')[0].files[0] ;
          socket.emit('modif-profil-picture:asked' , {file:img , ext:ext} ) ;
          displayModifSend() ;
          $('#my-edit-cancel').trigger('click');
        }
      }) ;


      $(document).on( 'click' , '#my-pic-upload-button' , function(e){
        $('#my-edit-picture-choose').trigger('click') ;
      }) ;

 });

 /**
  * Partie de reponse du serveur
  */
// reponses aux noms
var handleModifNamesOK = function(infos){
  // Sauvegarde
  app.user.firstname = infos.firstname ;
  app.user.lastname = infos.lastname ;
  app.modifs.firstname = infos.firstname ;
  app.modifs.lastname = infos.lastname ;
  sessionStorage.user = JSON.stringify(app.user) ;

  // Affichage de la reponse
  $('#my-edit-firstname').val(app.user.firstname) ;
  $('#my-edit-lastname').val(app.user.lastname) ;
  displayModifReceive('positive' , 'firstname & lastname' , '') ;
}

var handleModifNamesNO = function(infos){
  displayModifReceive('negative' , 'firstname & lastname' , 'not') ;
}

socket.on('modif-profil-names:accept',handleModifNamesOK);
socket.on('modif-profil-names:reject',handleModifNamesNO);

// reponses a la description
var handleModifDesciptionOK = function(description){
  // Sauvegarde
  console.log(description) ;
  app.user.userDescription = description ;
  app.modifs.userDescription = description ;
  sessionStorage.user = JSON.stringify(app.user) ;

  // Affichage de la reponse
  $('#my-edit-description').val(app.user.userDescription) ;
  displayModifReceive('positive' , 'Description' , '') ;
}

var handleModifDesciptionNO = function(infos){
  displayModifReceive('negative' , 'Description' , 'not') ;
}

socket.on('modif-profil-description:accept',handleModifDesciptionOK);
socket.on('modif-profil-description:reject',handleModifDesciptionNO);

// reponses a l image
var handleModifPictureOK = function(picture){
  // Sauvegarde
  app.user.pictureSrc = picture ;
  app.modifs.pictureSrc = picture ;
  sessionStorage.user = JSON.stringify(app.user) ;

  // Affichage de la reponse
  $('#my-edit-picture').attr("src" , app.user.pictureSrc); 
  displayModifReceive('positive' , 'Picture' , '') ;
}

var handleModifPictureNO = function(infos){
  displayModifReceive('negative' , 'Picture' , 'not') ;
}

socket.on('modif-profil-picture:accept',handleModifPictureOK);
socket.on('modif-profil-picture:reject',handleModifPictureNO);

 /**
  * fonctions annexes
  */
// creation d element
var createSaveCancelButton = function(){
  return '<div class="ui buttons my-edit-infos-added" id="my-buttons-save-or-cancel">' + 
          '<button class="ui positive button" id="my-edit-save">Save</button>' +
          '<div class="or"></div>' + 
          '<button class="ui negative button" id="my-edit-cancel">Cancel</button>' +
          '</div>';
};

var createModifMessage = function (status , field ,state,id) { 
  return  `<div class="ui ${status} message" id="${id}">`+
    '<i class="close icon"></i>' +
    '<div class="header">'+
    `Your information has ${state} been updated`+
    '</div>'+
    `<p>Your <b>${field}</b> .</p>`+
    '</div>' ;
};

var createModifSend = function (id ) { 
  return  `<div class="ui info message" id="${id}">`+
    '<i class="close icon"></i>' +
    '<div class="header">'+
    'Profil information modified'+
    '</div>'+
    '<p>Your modification has been send.</p>'+
    '</div>' ;
};

var createModifError = function(content){
  return '<div class="ui error message my-edit-infos-added" id="log-in-error-message">' + 
  '<i class="close icon"></i>' + 
  '<div class="header">' + 
  'Your information has not been modified' + 
  '</div>' +
  content + 
  '</div>' ;
}

// verification
var correctModifName = function(){
  if (app.modifs.firstname == app.user.firstname && app.modifs.lastname == app.user.lastname) return false ;
  if (!correctName(app.modifs.firstname) ) return false;
  if (!correctName(app.modifs.lastname) ) return false;
  return true ;
}


// affichage d'element
var displayModifSend = function(){
  // retourne en au de la page et on affiche le message
  window.location.replace("#menu-bar");
  var id = `notification${++notificationID}`
  var createSendMess = createModifSend(id) ;
  $('#page-main-pane').prepend(createSendMess) ;
  
  setTimeout(function(){ 
    $(`#${id}`).queue( function() { 
      $(`#${id}`).slideUp(400).dequeue() 
    }).queue( function() { 
      $(`#${id}`).remove().dequeue() 
    });
  }, 2000);
}

var displayModifReceive = function(status , field ,state,id){
  // retourne en au de la page et on affiche le message
  window.location.replace("#menu-bar");
  var id = `notification${++notificationID}`
  var createOKMess = createModifMessage(status , field ,state,id) ;
  $('#page-main-pane').prepend(createOKMess) ;

  setTimeout(function(){ 
      $(`#${id}`).queue( function() { 
        $(`#${id}`).slideUp(400).dequeue() 
      }).queue( function() { 
        $(`#${id}`).remove().dequeue() 
      });
    }, 3000
  );
}

