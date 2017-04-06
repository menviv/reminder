/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/





///////// Global Variables ///////////////////////
var address;
var addressId;
var userId;
var hour;
var ReminderText;
var minutes = 05;

///////// Time Module ///////////////////////
var moment = require('moment');
var DateFormat = "DD-MM-YYYY HH:mm:ss";
var LogTimeStame = moment().format(DateFormat); 

var now = moment();
//var hour = now.hour();
//





///////// DB Module ///////////////////////
var mongo = require('mongodb');
var connString = 'mongodb://mom:mom@ds147510.mlab.com:47510/violetmom';
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var dbm;
var colUserData;
var colStoreData;
var colEntities;
var colLog;

// Initialize connection once
 
mongo.MongoClient.connect(connString, function(err, database) {
  if(err) throw err;
  
  dbm = database;
  colStoreData = dbm.collection('StoreData');
  colUserData = dbm.collection('UserData'); 
  colEntities = dbm.collection('Entities');
  colLog =  dbm.collection('Log'); 
  
});


var request = require('request');





// Cron Scheduler  //////////////////////////////////////////////////////////////////////
var schedule = require('node-schedule');

function CreateJobToQueue(hour, addressId, userId, ReminderText) {

    

                             var LogRecord = {
                                'CreatedTime': LogTimeStame,
                                'Origin': 'CreateJobToQueue',
                                'hour': hour,
                                'addressId': addressId,
                                'userId': userId
                            }; 

                            colLog.insert(LogRecord, function(err, result){}); 

    var Dailyrule = new schedule.RecurrenceRule();
    var now = moment();
    var minutes = now.minutes()+1;

    Dailyrule.hour = hour;
    Dailyrule.minute = minutes;


    var z = schedule.scheduleJob(Dailyrule, function(){

        bot.beginDialog(address, '/sendDailyReminder', { addressId: addressId, userId: userId, ReminderText: ReminderText });

    });


}



var minuterule = new schedule.RecurrenceRule();
minuterule.minute = new schedule.Range(0, 59, 1)

schedule.scheduleJob(minuterule, function(){

    function GetNewReminderRequests() {

                            var changeTime = moment().format(DateFormat);

                             var LogRecord = {
                                'CreatedTime': changeTime,
                                'Origin': 'GetNewReminderRequests',
                                'hour': hour,
                                'addressId': addressId,
                                'userId': userId
                            }; 

                            colLog.insert(LogRecord, function(err, result){});         

            var cursor = colEntities.find({ 'EntityStatus': 'new' });
            
            var result = [];
            cursor.each(function(err, doc) {
                if(err)
                    throw err;
                if (doc === null) {
                    // doc is null when the last document has been processed


                    if (result.length>0) {

                        for (i=0; i<result.length; i++) {

                            userId = result[0].userId;

                            var EntityId = result[0]._id;

                            ReminderText = result[0].ReminderText;

                            GetCurrentUserAddress(userId, EntityId, ReminderText);

                        }     
 
                    }


                   // return;
                }
                // do something with each doc, like push Email into a results array
                result.push(doc);
            }); 

    }



    function GetCurrentUserAddress(userId, EntityId) {

                           var changeTime = moment().format(DateFormat); 

                           var LogRecord = {
                                'CreatedTime': changeTime,
                                'Origin': 'GetCurrentUserAddress',
                                'hour': hour,
                                'addressId': addressId,
                                'userId': userId
                            }; 

                            colLog.insert(LogRecord, function(err, result){}); 


                        var cursor = colUserData.find({ 'userId': userId });
                        
                        var result = [];
                        cursor.each(function(err, doc) {
                            if(err)
                                throw err;
                            if (doc === null) {
                                // doc is null when the last document has been processed


                                if (result.length>0) {
                                    
                                    
                                    addressId = result[0].addressId;

                                    address = result[0].AddressData; 

                                    CreateJobToQueue(hour, addressId, userId, ReminderText);

                                    var o_ID = new mongo.ObjectID(EntityId); 

                                    var changeTime = moment().format(DateFormat);

                                    colEntities.update (
                                    { "_id": o_ID },
                                    { $set: { 'EntityStatus': 'created', 'ChangedTime': changeTime } }
                                    ) 
            
                                } 


                                return;
                            }
                            // do something with each doc, like push Email into a results array
                            result.push(doc);
                        }); 


    } 



   // GetNewReminderRequests();


});








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
                 
            var cursor = colUserData.find({ "userId": session.message.user.id });
            
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

                            if (session.message.address.id != addressId) {

                                addressId = session.message.address.id;
                                userId = session.message.user.id;
                                session.userData.userId = session.message.user.id;
                                address = session.message.address;

                                colUserData.update (
                                { "userId": userId },
                                { $set: { 'address': address, 'addressId': addressId, 'ChangedTime':LogTimeStame } }
                                ) 

                                
                            }  

                            if (session.userData.PostEntityInsert == 'true') {

                                session.sendTyping();

                                session.send("יופי טופי... אני עובד אצלך. משהו נוסף?");

                                builder.Prompts.choice(session, "איך אני יכול (שוב...) להחליף את מנשה ולעזור לך?", ["תזכיר לי משהו","חפש לי משהו","תגיד למנש שירים טלפון"]);                                               

                            } else {

                                session.sendTyping();

                                session.send("היוש שוב..");

                                builder.Prompts.choice(session, "אז איך אני יכול להחליף את מנשה ולעזור לך?", ["תזכיר לי משהו","חפש לי משהו","תגיד למנש שירים טלפון"]);

                            }                       
                                
                    } else {

                            session.sendTyping();

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

            session.sendTyping();

            session.send("סבבה... אני על זה. רצית ש.." + session.userData.userChoice); 

            if (session.userData.userChoice == 'תזכיר לי משהו') {

                builder.Prompts.choice(session, "משהו קבוע או סתם קפריזה חולפת?", ["קבוע","קפריזה"]);

            } else {

                session.sendTyping();

                session.send("יאללה יאללה... אני לא עובד אצלך! כלומר בגרסה הבאה.. :)");

                session.endDialog();

                session.beginDialog("/");

            }

            
        } else {
            session.send("לא בטוח שהבנתי מה רצית...");
        }
        
    },
    function (session, results) {

        session.userData.ReminderType = results.response;

        session.sendTyping();

        if (session.userData.ReminderType == 'קבוע') {

            builder.Prompts.number(session, "באיזה יום קבוע בשבוע? למשל אם יום רביעי אז נא לציין '4'"); 

        } else {

            builder.Prompts.number(session, "באיזה יום בחודש? למשל: ביום ה- 20 לחודש..."); 
        }
  
    },
    function (session, results) {

        session.userData.ReminderDay = results.response;
        
        session.sendTyping();

        builder.Prompts.number(session, "שעה מועדפת? אם מדובר בשמונה בערב אז כאדי לציין '20'"); 
    },
    function (session, results) {

        session.userData.ReminderTime = results.response;
        
        session.sendTyping();

        builder.Prompts.text(session, "אז מה בעצם להזכיר לך? אנא לציין כותרת קצרה וקולעת כי אני לא מוצלח בלזכור בכללי...סבבה? יופי"); 
    },    
    function (session, results) {

        session.userData.ReminderText = results.response;

        var EntityRecord = {
              'CreatedTime': LogTimeStame,
              'ReminderDay': session.userData.ReminderDay,
              'ReminderTime': session.userData.ReminderTime,
              'ReminderType': session.userData.ReminderType,
              'EntityType': session.userData.userChoice,
              'ReminderText' : session.userData.ReminderText,
              'EntityStatus': 'new',
              'userId': session.userData.userId
        }; 

        colEntities.insert(EntityRecord, function(err, result){}); 

        session.userData.PostEntityInsert = 'true';

        session.sendTyping();

        session.send("סבבה, רשמתי לעצמי להזכיר לך.");

        session.endDialog();

        session.beginDialog("/");
    }
]);



bot.dialog('logoutDialog', function (session, args) {

    session.userData.userId = session.message.user.id;

    session.userData.PostEntityInsert = 'false';

    userId = session.message.user.id;

    session.endDialog("Goodbye.... I'm ending our conversation now by logging out...");

    session.beginDialog("/");


}).triggerAction({ 
    onFindAction: function (context, callback) {
        // Recognize users utterance
        switch (context.message.text.toLowerCase()) {
            case '/logout':
                // You can trigger the action with callback(null, 1.0) but you're also
                // allowed to return additional properties which will be passed along to
                // the triggered dialog.
                callback(null, 1.0, { topic: 'logout' });
                break;
            default:
                callback(null, 0.0);
                break;
        }
    } 
});




bot.dialog('/sendDailyReminder', [

    function (session) {

                            var changeTime = moment().format(DateFormat); 

                             var LogRecord = {
                                'Origin': 'sendDailyReminder',
                                'CreatedTime': changeTime,
                                'hour': hour,
                                'addressId': addressId,
                                'userId': userId
                            }; 

                            colLog.insert(LogRecord, function(err, result){});         
       
        session.send("userId" + userId);

        session.send("addressId" + addressId);

        session.send("ReminderText" + ReminderText);

    }
]);





/*

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


*/


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
