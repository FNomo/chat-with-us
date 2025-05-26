const loader = require('../models/usersLoader') ;


profilManager = {
    handleModifNames : async function(users,infos, socket){
        var ID = socket.userID ;
        var resState = await loader.updateUser(ID,'firstname' , `"${infos.firstname}"`) ;
        resState = resState && await loader.updateUser(ID,'lastname' , `"${infos.lastname}"`) ;
        var name = (socket.userID)?socket.name:'???' ;

        if(resState){
            socket.emit('modif-profil-names:accept' ,infos) ;
            users.all[ID].firstname = infos.firstname ;
            users.all[ID].lastname = infos.lastname ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | firstname : ` + `${infos.firstname}`.green ) ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | lastname : ` + `${infos.lastname}`.green ) ;
        }else{
            socket.emit('modif-profil-names:reject') ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | firstname : ` + `${infos.firstname}`.red ) ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | lastname : ` + `${infos.lastname}`.red ) ;
        }
    } ,

    handleModifDescription : async function(users,newDescription, socket){
        var ID = socket.userID ;
        var resState = await loader.updateUser(ID,'userDescription' , `"${newDescription.replace(/"/g,'\\"')}"`) ;
        var name = (socket.userID)?socket.name:'???' ;

        if(resState){
            socket.emit('modif-profil-description:accept' ,newDescription) ;
            users.all[ID].userDescription = newDescription ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | description : ` + `modified`.green ) ;
        }else{
            socket.emit('modif-profil-description:reject') ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | description : ` + `not modified`.red ) ;
        }
    },

    // Gere la modification de l'image
    handleModifPicture : async function(users,newPicture , ext, socket){
        var ID = socket.userID ;
        var newPictureName = `/datas/user-profil/user${ID}.${ext}`;
        var resState = await loader.uploadFile(newPictureName , newPicture) ;
        if (resState) resState = await loader.updateUser(ID,'pictureSrc' , `"${newPictureName}"`) ;
        var name = (socket.userID)?socket.name:'???' ;

        if(resState){
            socket.emit('modif-profil-picture:accept' ,newPictureName) ;
            users.all[ID].pictureSrc = newPictureName ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | picture : ` + `modified`.green ) ;
        }else{
            socket.emit('modif-profil-picture:reject') ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | picture : ` + `not modified`.red ) ;
        }
    } ,

    // Gere la modification du pseudo
    handleModifPseudo : async function(users,newPseudo, socket){
        var ID = socket.userID ;
        
        var resState = true ;

        for(item in users.all){
            if (users.all[item] == newPseudo){
                resState = false ;
                break;
            }
        }

        if (resState) resState = await loader.updateUser(ID,'pseudo' , `"${newPseudo}"`) ;
        var name = (socket.userID)?socket.name:'???' ;
        var previousName = socket.name ;

        if(resState){
            
            socket.emit('modif-profil-pseudo:accept' ,newPseudo) ;
            var previousPseudo = users.all[ID].pseudo ;
            users.all[ID].pseudo = newPseudo ;

            for(item in users.all[ID].connections){
                users.all[ID].connections[item].name =users.all[ID].connections[item].name.replace(previousPseudo,newPseudo) ;
            }

            console.log('[SERVER] PROFIL '.blue +  `${previousName} --> ${socket.name} | pseudo : ` + `accepted`.green ) ;
        }else{
            socket.emit('modif-profil-pseudo:reject' ) ;
            console.log('[SERVER] PROFIL '.blue +  `${previousName} --> ${newPseudo} | pseudo : ` + `refused`.red ) ;
        }
    },
    handleModifPassword : async function(users,newPassword, socket){
        var ID = socket.userID ;
        var resState = await loader.updateUser(ID,'password' , `"${newPassword.replace(/"/g,'\\"')}"`) ;
        var name = (socket.userID)?socket.name:'???' ;

        if(resState){
            for (item in users.all[ID].connections){
                users.all[ID].connections[item].emit('modif-profil-password:accept' ,newPassword);
            }

            users.all[ID].password = newPassword ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | password : ` + `modified`.green ) ;
        }else{
            socket.emit('modif-profil-password:reject') ;
            console.log('[SERVER] PROFIL '.blue +  `${name} | password : ` + `not modified`.red ) ;
        }
    }
}

module.exports = profilManager ;