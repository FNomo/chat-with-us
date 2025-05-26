/* Parametrage de variable globale */
SET GLOBAL local_infile=1;

/* Creation de la base de donnee */
DROP DATABASE IF EXISTS chat_with_us;
CREATE DATABASE chat_with_us ;
USE chat_with_us ;

/* Creation des tables */
CREATE TABLE users( # Listes de tous les utilisateurs
	ID INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT ,
	firstname VARCHAR(15) ,
	lastname VARCHAR(15) ,
  pseudo VARCHAR(15) NOT NULL UNIQUE,
	password VARCHAR(15) NOT NULL,
	email VARCHAR(50) UNIQUE,
  creationDate DATETIME NOT NULL DEFAULT NOW(),
  pictureSrc VARCHAR(50) NOT NULL DEFAULT '/datas/user-profil/anonym.png',
  userDescription VARCHAR(140)
) ;

CREATE TABLE subcribtions( # Liste de tous les abonnements d utilisateurs
  subscriberID INT UNSIGNED NOT NULL,
  subscribtionID INT UNSIGNED NOT NULL,
  FOREIGN KEY (subscriberID) REFERENCES users(ID),
  FOREIGN KEY (subscribtionID) REFERENCES users(ID),
  CONSTRAINT UC_subcribtions UNIQUE (subscriberID,subscribtionID)
);

CREATE TABLE messages( # Listes de tous les messages
  ID INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
  userID INT UNSIGNED NOT NULL,
  content VARCHAR(140) NOT NULL,
  emitDate DATETIME NOT NULL,
  FOREIGN KEY (userID) REFERENCES users(ID)
) ;

CREATE TABLE mentions(
  messageID INT UNSIGNED NOT NULL,
  userMentionnedID INT UNSIGNED NOT NULL,
  FOREIGN KEY (messageID) REFERENCES messages(ID),
  FOREIGN KEY (userMentionnedID) REFERENCES users(ID),
  CONSTRAINT UC_mentions UNIQUE (messageID,userMentionnedID)
);

CREATE TABLE reactions(
  messageID INT UNSIGNED NOT NULL,
  userID INT UNSIGNED NOT NULL,
  reaction VARCHAR(10) NOT NULL,
  FOREIGN KEY (messageID) REFERENCES messages(ID),
  FOREIGN KEY (userID) REFERENCES users(ID),
  CONSTRAINT UC_reactions UNIQUE (messageID,userID,reaction)
);

/* Remplissage des tables par default */
# Preremplissage ecrit
INSERT INTO users(pseudo,password,email) VALUES ("ANONYM" ,"","") ;

/* Remplissage a l aide d un fichier */

/** Upload des utilisateurs */
LOAD DATA LOCAL INFILE 'public/assets/CSV-content/users.csv'
INTO TABLE users 
FIELDS TERMINATED BY '|' 
IGNORE 1 ROWS 
(@firstname ,@lastname,@pseudo ,@password ,@email,@userDescription) 
SET
firstname =  NULLIF(@firstname,'') ,
lastname =  NULLIF(@lastname,'') ,
pseudo = @pseudo ,
password = @password ,
email = @email,
userDescription = NULLIF(@userDescription,'') ; # Initialisation des utilisateurs

/** Upload des messages */