USE chat_with_us ;

DELETE FROM subcribtions;
INSERT INTO subcribtions VALUES (13 , 2) ;
INSERT INTO subcribtions VALUES (6 , 2) ;
INSERT INTO subcribtions VALUES (2 , 13) ;
INSERT INTO subcribtions VALUES (2 , 9) ;
INSERT INTO subcribtions VALUES (13 , 9) ;
INSERT INTO subcribtions VALUES (6 , 9) ;
INSERT INTO subcribtions VALUES (5 , 6) ;

INSERT INTO messages VALUES (1, 2 , "Hello @everyone I'm the goat." , '2018-08-13 08:00:00') ;
INSERT INTO messages VALUES (2, 13 , 'Hello MJ' , '2018-08-13 08:00:03') ;
INSERT INTO messages VALUES (3, 9 , 'Harden is the MVP, MJ and SPIDA.' , '2018-08-13 08:13:19') ;
INSERT INTO messages VALUES (4, 6 , "You talk too mutch, SPIDA. I think he can't hear me." , '2018-08-13 10:00:00') ;
INSERT INTO messages VALUES (5, 1 , "I'm the real GOAT." , '2018-08-13 10:04:00') ;
INSERT INTO messages VALUES (6, 5 , "@KING I hear you." , '2018-08-13 10:04:03') ;
INSERT INTO messages VALUES (7, 1 , 'I m like a bee. Im like Ali.' , '2018-08-13 11:07:00') ;

DELETE FROM mentions;
INSERT INTO mentions VALUES (1,1) ;
INSERT INTO mentions VALUES (6,6) ;

DELETE FROM reactions;
INSERT INTO reactions VALUES (1,13 , "like") ;
INSERT INTO reactions VALUES (1,3 , "like") ;
INSERT INTO reactions VALUES (3,9 , "basketball" ) ;
INSERT INTO reactions VALUES (3,9 , "like" ) ;
INSERT INTO reactions VALUES (4,5, "dislike" ) ;