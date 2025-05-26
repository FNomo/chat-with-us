/**
 * Fichier servant a lance l'application du cote su client
 */
/**
 * Conection au serveur
 */
const socket = io();

/**
 * Creation de l'application
 */

// prototype de fonction
var followAnUser;

var app = new Vue({
  el: '#app',
  
  data: {
    // donnees presente sur l'application
    user : {} ,
    menu: 'home' ,
    usersOnline : 0,
    anonymsOnline : 0,
    messages : [],
    modifs : {} ,
    loading:false,
    filters : {
      all : true ,
      me : true ,
      forMe : true ,
      forEveryone : true ,
      follows : true ,
      anonyms : true ,
    } ,
    reactionsIcons : {
      like : 'thumbs up outline',
      dislike : 'thumbs down outline',
      basketball : 'basketball ball',
    },
    myMessage : {
      content : ''
    },
    logInStatus : false ,
    signInStatus: false,
    search : [],
  } ,

  methods : {
    addNewMessage: function(message){
      message.selected = false ;
      message.addReaction = false ;
      this.messages.push( message );
    } , 
    handleMessageClick : function(message){
      
      message.selected = ! message.selected ;
    } ,
    /** GEstion des reactions */
    fullReactions : function(message){
      return (message.reactions["like"].length != 0 && message.reactions["dislike"].length != 0 && message.reactions["basketball"].length != 0) ;
    } ,
    handleReaction: function(message , reaction){
      if (this.user.ID == 1)return ;
      socket.emit('new-reaction:send' ,message.ID , reaction) ;
      if (reaction == 'like'){
        if (message.reactions['dislike'].indexOf(this.user.ID) >= 0) socket.emit('new-reaction:send' ,message.ID , 'dislike') ;
      }
      else if (reaction == 'dislike'){
        if (message.reactions['like'].indexOf(this.user.ID) >= 0)socket.emit('new-reaction:send' ,message.ID , 'like') ;
      }
      message.addReaction = false ;
    } ,
    handleAddButtonClick(message){
      message.addReaction = !message.addReaction ;
    },
    /** Gestion des follows */
    handleAddFollowClick :function(userID){
      socket.emit('new-subscriptions:asked' , userID) ;
    },
    handleRemoveFollowClick :function(userID){
      socket.emit('remove-subscriptions:asked' , userID) ;
    },

    returnPseudo : function (message){
      var pseudo = message.usrPseudo ;
      if (this.user.ID == 1) return pseudo ;
      else if (message.userID == this.user.ID) return `<span class="current-user-pseudo"> ${pseudo} </span>` ;
      else if (this.user.subscriptions.indexOf(message.userID) >= 0) return `<span class="follow-user-pseudo"> ${pseudo} </span>` ;
      else if (this.user.subscribers.indexOf(message.userID) >= 0) return `<span class="follower-user-pseudo"> ${pseudo} </span>` ;
      return pseudo ;
    },
    returnReactionClass : function(reaction){
      if (reaction == 'like') return 'my-reaction-like-pane' ;
      else if (reaction == 'dislike') return 'my-reaction-dislike-pane' ;
      return 'my-reaction-basketball-pane' ;
    },

    /** Gestion des filtres*/

    returnFilterClass :function(state){
      return (state)? 'my-filter-active' : '' ;
    },

    handleFilterClick : function(filter){
      this.filters[filter] = !this.filters[filter] ;
      this.filters.all = true ;
      
      for (item in this.filters){
        if(this.filters[item] == false){
          this.filters.all = false ;
          return ;
        }
      }      
    },

    handleFilterAllClick : function(){
      this.filters.all = ! this.filters.all  ;
      
      for (item in this.filters){
        this.filters[item] = this.filters.all ;
      }
    },

    filterMessage: function(message){
      var id = message.userID ;


      var stateForEveryone = (!this.filters.forEveryone)? false : ( message.mentions.indexOf(1) >=0)  ;
      var stateMeAnonym = (this.filters.anonyms)? id == 1 : false;
      
      if (this.user.ID ==1){
        return stateForEveryone ||  stateMeAnonym ;
      }

      var stateMe = (this.filters.me)? id==this.user.ID : false ;
      var stateFollow = (this.filters.follows)? (  this.user.subscriptions.indexOf(id) >=0 ) : false ;     
      var stateForMe = (this.filters.forMe)? (message.mentions.indexOf(this.user.ID) >= 0) : false ;
      

      return stateFollow || stateForMe ||stateForEveryone || stateMe || stateMeAnonym;
    }
  }
});

/**
 * functions d'aides
 */
let createAnonymUser = async  function(){
  var user = {};
  user.ID = 1;
  user.fisrtname = null;
  user.lastname = null ;
  user.pseudo = 'ANONYM';
  user.email = null;
  user.userDescription = null ;
  user.pictureSrc = '/datas/user-profil/anonym.png' ;
  user.creationDate = moment() ;
  sessionStorage.user = JSON.stringify(user);
  return user ;
}


/**
 * Inialisation des donnees de l'application
 */
if ( ! sessionStorage.user) createAnonymUser();
app.user = JSON.parse(sessionStorage.user);

if (app.user.ID == 1)socket.emit('anonym')
else {
  socket.emit('user' , app.user.ID) ;
  resetModification();
}

var notificationID = 1 ;// Servira a enumerer les notifications recus

/**
 * Inialisation de l'affichage et des evenements principaux du dom HTML
 */
$(document).ready(function () {

  $(document).on( 'click' , '.message .close' , function(e) {
    $(this).closest('.message').transition('fade');
    $(this).closest('.message').remove();
  }) ;// fermeture de message d'erreur
});

/**
 * Gestions des evenements principaux
 */
socket.on('userOnlineModified' , function(newUsersOnline){
  app.usersOnline = newUsersOnline ;
});

socket.on('anonymOnlineModified' , function(newAnonymsOnline){
  app.anonymsOnline = newAnonymsOnline ;
});

/**
 * Gestions des evenements pour les follows
 */

var handleNewFollows = function (state , array,pseudo){
  var title ;
  var content ;

  if (state == 'follows') {
    title = 'New follow' ;
    content = `You are now following ${pseudo}.`
    app.user.subscriptions = array ;
    displayFollowMessage('positive' , title , content);
  }
  else {
    title = 'New follower' ;
    content = `${pseudo} follow you now.`
    app.user.subscribers = array ;
    displayFollowMessage('info' , title , content);
  }

  sessionStorage.user = JSON.stringify(app.user) ;
}

var handleRemoveFollows = function (state , array,pseudo){
  var title ;
  var content ;

  if (state == 'follows') {
    title = 'Remove follow' ;
    content = `You no longer follow ${pseudo}.`
    app.user.subscriptions = array ;
    
    displayFollowMessage('info' , title , content);
  }
  else {
    app.user.subscribers = array ;
  }
  sessionStorage.user = JSON.stringify(app.user) ;
}

socket.on('new-subscriptions:receive' , handleNewFollows);
socket.on('remove-subscriptions:receive' , handleRemoveFollows);

/** Gestion de l'envoi de recherche */

$(document).ready(function () {
  $(document).on( 'click' , '#my-input-search-button' , function(e) {
    // initialise et tire la valeur de la recherhe
    app.search = [] ;
    var pseudo = $('#my-input-search').val() ;

    // Envoie de la requete
    if( pseudo.length > 0 ){
      socket.emit('search:send' , pseudo);
    }

  }) ;
});

/** Gestion de la reponse de recherche */

var handleSearchResponse = function(array){
  app.search = array ;
}

socket.on('search:receive' ,handleSearchResponse )

/**
 * Fonctions annexes
 */

var displayFollowMessage = function(type , title , content){
  var id = `notification${++notificationID}`
    var createSendMess = `<div class="ui ${type} message" id="${id}">`+
        '<i class="close icon"></i>' +
        '<div class="header">'+
        title+
        '</div>'+
        `<p>${content}.</p>`+
        '</div>' ;

    window.location.replace("#menu-bar");
    $('#page-main-pane').prepend(createSendMess) ;
  
    setTimeout(function(){ 
    $(`#${id}`).queue( function() { 
      $(`#${id}`).slideUp(400).dequeue() 
    }).queue( function() { 
      $(`#${id}`).remove().dequeue() 
    });
    }, 2000);
}