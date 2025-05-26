/**
 * Les imports
 */

/**
 * Fonctions annexes
 */
 let correctPseudo = function(pseudo){
    // Au moins 2 caracteres dans le password
    // Uniquement des lettres et des chiffres
    if (pseudo == null) return false ;
    if (pseudo.length < 2) return false ;
    return pseudo.search(/\W/) < 0 ;
}

let correctName = function(name){
    // Au moins 2 caracteres dans le password
    // Uniquement des lettres
    return correctPseudo(name) && (name.search(/\d/) < 0) ;
}

let correctPassword = function(password,pseudo){
    // Different du pseudo
    // Au moins 5 caracteres dans le password
    // Au moins 2 chiffres
    
    if (password == pseudo) return false ;
    if (password.length < 5) return false ;
    if (password.search(/\d.*\d/) < 0) return false ;
    return true ;
}

let resetModification = async function(){
    app.modifs.firstname = app.user.firstname ;
    app.modifs.lastname = app.user.lastname ;
    app.modifs.userDescription = app.user.userDescription ;
    app.modifs.pictureSrc = app.user.pictureSrc ;
    app.modifs.pseudo = app.user.pseudo ;
}