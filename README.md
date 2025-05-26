# Projet de PW6

Ce projet est le travail demander par l'option programmation web du 6eme semestre de licence d'informatique. Il a ete Realise par Franc Zobo Nomo et Amaury Rayane.

## Pre-requis

Il vous faut :

* Un serveur mysql
* node.js

## Installation

* Desarchiver le fichier ChatWithUs.zip.
* Ouvrer un terminal
* Placer vous dans le repertoire chat-with-us

### Initialisation de la base de donnee

* Lancer la commande suivante (commande de lancement):

>``` mysql --local-infile -u username -p ``` 
*username represente votre nom d'utilisateur.*

* Taper ensuite votre mot de passe

* Taper ensuite la commande :

>```SOURCE init/initDatabase.sql;```

* Tapez ensuite la commande (commande d'arret) :

>```EXIT;```

Votre base de donnee est normalement initialiser.

* Pour installez le reste des modules nodejs tapez la commande :
  
>```npm install```

Les modules sont installee.

### Verificatin de l'installation

* Relancer la communication le serveur avec la commande de lancement

* Tapez la liste de commande suivantes :

	> * ``` USE chat_with_us ; ```

	> * ``` SHOWS TABLES ;```

* Normalement, une table vous est renvoyer contenant les champs suivants.

 	* users 
 	* subcribtion
 	* messages
 	* mentions
 	* reactions

 * Lorsque vous tapez les commandes suivantes vous devez voir des champs tous remplies (certains seront nulls) :

 	> * ``` SELECT * FROM users ; ```

 * Vous pouvez arreter la communication


## Fonctionnement

### Lancement de l'application

* Taper ensuite la commande :

> ```npm start```

* Ne fermer pas votre terminal

* Ouvrer votre navigateur et visiter ensuite cette [page](http://localhost:8080/chat-with-us).