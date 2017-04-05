/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/





///////// Global Variables ///////////////////////
var address;
var addressId;
var userId;

///////// Time Module ///////////////////////
var moment = require('moment');
var DateFormat = "DD-MM-YYYY HH:mm:ss";
var LogTimeStame = moment().format(DateFormat); 

var now = moment();
var hour = now.hour();
var minutes = now.minutes()+5;


// Cron Scheduler  //////////////////////////////////////////////////////////////////////
var schedule = require('node-schedule');
var Dailyrule = new schedule.RecurrenceRule();

Dailyrule.hour = hour;
Dailyrule.minute = minutes;
 
var z = schedule.scheduleJob(Dailyrule, function(){

 // bot.beginDialog(address, '/sendDailyReminder', { addressId: addressId, userId: userId });

});





///////// DB Module ///////////////////////
var mongo = require('mongodb');
var connString = 'mongodb://mom:mom@ds147510.mlab.com:47510/violetmom';
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var dbm;
var colUserData;
var colStoreData;
var colEntities;

// Initialize connection once
 
mongo.MongoClient.connect(connString, function(err, database) {
  if(err) throw err;
  
  dbm = database;
  colStoreData = dbm.collection('StoreData');
  colUserData = dbm.collection('UserData'); 
  colEntities = dbm.collection('Entities'); 
  
});


var request = require('request');


"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);




bot.dialog('/', [
    function (session) {
                 
            var cursor = colUserData.find({ "userId": session.userData.userId });
            
            var result = [];
            cursor.each(function(err, doc) {
                if(err)
                    throw err;
                if (doc === null) {
                    // doc is null when the last document has been processed


                    if (result.length>0) {

                            addressId = result[0].addressId;
                            userId = result[0].userId;
                            address = result[0].AddressData;  

                            if (session.userData.PostEntityInsert == 'true') {

                                session.send("יופי טופי... אני עובד אצלך. משהו נוסף?");

                                builder.Prompts.choice(session, "איך אני יכול (שוב...) להחליף את מנשה ולעזור לך?", ["תזכיר לי משהו","חפש לי משהו","תגיד למנש שירים טלפון"]);                                               

                            }                        
                                
                    } else {


                        session.send( "היוש, זאת ההתחברות הראשונה שלך... מזל טוב וזה");
                        builder.Prompts.choice(session, "אז איך אני יכול להחליף את מנשה ולעזור לך?", ["תזכיר לי משהו","חפש לי משהו","תגיד למנש שירים טלפון"]);
                                               
   
                        addressId = session.message.address.id;
                        userId = session.message.user.id;
                        session.userData.userId = session.message.user.id;
                        address = session.message.address;
                                
                        var SessionAddresRecord = {
                                'CreatedTime': LogTimeStame,
                                'AddressData': address,
                                'addressId': addressId,
                                'userId': userId
                         }; 

                        colUserData.insert(SessionAddresRecord, function(err, result){}); 
                    }



                    return;
                }
                // do something with each doc, like push Email into a results array
                result.push(doc);
            });         
            

    },
    function (session, results) {

        if (results.response) {
            session.userData.userChoice = results.response.entity;
            session.send("סבבה... אני על זה. רצית ש..", session.userData.userChoice); 

            if (session.userData.userChoice == 'תזכיר לי משהו') {

                builder.Prompts.choice(session, "משהו קבוע או סתם קפריזה חולפת?", ["קבוע","קפריזה"]);

            } else {

                session.send("יאללה יאללה... אני לא עובד אצלך! כלומר בגרסה הבאה.. :)");

            }

            
        } else {
            session.send("לא בטוח שהבנתי מה רצית...");
        }
        
    },
    function (session, results) {
        session.userData.ReminderType = results.response;

        if (session.userData.ReminderType == 'קבוע') {

            builder.Prompts.number(session, "באיזה יום קבוע בשבוע? למשל אם יום רביעי אז נא לציין '4'"); 

        } else {

            builder.Prompts.number(session, "באיזה יום בחודש? למשל: ביום ה- 20 לחודש..."); 
        }
  
    },
    function (session, results) {
        session.userData.ReminderDay = results.response;
        builder.Prompts.number(session, "שעה מועדפת? אם מדובר בשמונה בערב אז כאדי לציין '20'"); 
    },
    function (session, results) {
        session.userData.ReminderTime = results.response;

        var SessionAddresRecord = {
              'CreatedTime': LogTimeStame,
              'ReminderTime': ReminderTime,
              'ReminderType': ReminderType,
              'EntityType': userChoice,
              'userId': userId
        }; 

        colEntities.insert(SessionAddresRecord, function(err, result){}); 

        session.userData.PostEntityInsert = 'true';
    }
]);


bot.dialog('/sendDailyReminder', [
    function (session) {
       
            
            var cursor = colEntities.find({ "userId": userId });
            
            var result = [];
            cursor.each(function(err, doc) {
                if(err)
                    throw err;
                if (doc === null) {
                    // doc is null when the last document has been processed


                    if (result.length>0) {
                        
                        session.send("תזכורת וזה.." + result[0].ReminderType);
 
                                
                    } else {
                        
                        session.send("לא זוכר כלום טוב? יופי");
                     
                                               
                    }


                    return;
                }
                // do something with each doc, like push Email into a results array
                result.push(doc);
            });         
            

    }
]);







bot.dialog('/sendMomDailyReminder', [
    function (session) {
       
            
            var cursor = colUserData.find({ "addressId": session.message.address.id });
            
            var result = [];
            cursor.each(function(err, doc) {
                if(err)
                    throw err;
                if (doc === null) {
                    // doc is null when the last document has been processed


                    if (result.length>0) {
                        
                        addressId = result[0].addressId;
                        userId = result[0].userId;
                        address = result[0].AddressData;                     
 
                        session.send("ערב טוב לאמא שלי...");
                        builder.Prompts.number(session, "אז תזכירי לי, כמה ג׳ובות נכנסו היום לקופה?");
                                
                    } else {
                        
                        addressId = session.message.address.id;
                        userId = session.message.user.id;
                        address = session.message.address;
                        
                         var SessionAddresRecord = {
                            'CreatedTime': LogTimeStame,
                            'AddressData': address,
                            'addressId': addressId,
                            'userId': userId
                        };         
                    
                        colUserData.insert(SessionAddresRecord, function(err, result){}); 
                        
                        session.send("ערב טוב לאמא שלי...");
                        builder.Prompts.number(session, "אז תזכירי לי, כמה ג׳ובות נכנסו היום לקופה?");                        
                                               
                    }



                    return;
                }
                // do something with each doc, like push Email into a results array
                result.push(doc);
            });         
            

    },
    function (session, results) {
        session.userData.TotalIncome = results.response;
        builder.Prompts.number(session, "מה סכום האשראי?"); 
    },   
    function (session, results) {
        session.userData.TotalCC = results.response;
        builder.Prompts.number(session, "מה סכום המזומן?"); 
    },     
    function (session, results) {
        session.userData.TotalCash = results.response;
        builder.Prompts.number(session, "כמה זרים מכרת?"); 
    },
    function (session, results) {
        session.userData.NumFlowerbouquet = results.response;
        builder.Prompts.number(session, "ועציצים?"); 
    },
    function (session, results) {
        session.userData.NumPlants = results.response.entity;
        session.send("הבנתי.. הפדיון שלך היה  " + session.userData.TotalIncome + 
                    " ויש לך בכיס מזומן: " + session.userData.TotalCash + " מבטיח לזכור את זה.");
                    
 
             var DailyDateRecord = {
                'CreatedTime': LogTimeStame,
                'TotalIncome': session.userData.TotalIncome,
                'TotalCC': session.userData.TotalCC,
                'TotalCash': session.userData.TotalCash,
                'NumFlowerbouquet': session.userData.NumFlowerbouquet,
                'NumPlants': session.userData.NumPlants
            };
            
            colStoreData.insert(DailyDateRecord, function(err, result){});                      
                    
    }
]);





if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
