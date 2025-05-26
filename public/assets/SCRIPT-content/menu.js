/**
 * Gestion du passage entre different menu
 */

$(document).ready(function () {

    $(document).on( 'click' , '.my-menu' , function(e) {
        app.search = [] ;
        $('.my-menu').removeClass('active');
        $(this).addClass('active');
        var menu =  $(this).attr('id').replace(/menu-/, '');
        app.menu = menu ;
        window.location.replace("#menu-bar");
    }) ;// fermeture de message d'erreur

    $(document).on( 'click' , '#log-in-menu-button' , function(e) {
        app.signInStatus = false ;
        if (app.logInStatus)app.logInStatus = false ;
        else app.logInStatus = true ;
    }) ;// Ouverture et fermeture du panneau de coonnection

    $(document).on( 'click' , '#sign-in-menu-button' , function(e) {
        app.logInStatus = false ;
        if (app.signInStatus)app.signInStatus = false ;
        else app.signInStatus = true ;
    }) ;// Ouverture et fermeture du panneau d'inscription

});