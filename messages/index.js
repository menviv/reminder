/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/





///////// Global Variables ///////////////////////
var address;
var addressId;
var userId;
var EntityToPublishDate;
var EntityId;
var hour;
var ReminderText;

///////// Time Module ///////////////////////
var moment = require('moment');
var DateFormat = "DD-MM-YYYY HH:mm:ss";
var LogTimeStame = moment().format(DateFormat); 

var zone = "America/Los_Angeles";
var momentimezone = require('moment-timezone');
momentimezone().tz("Israel/Jerusalem").format();

var now = moment();
var nowTimezone = momentimezone();
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

/*

    var cursor = colEntities.find({ 'EntityStatus': 'pending' });
                
    var result = [];
    cursor.each(function(err, doc) {
        if(err)
            throw err;
                if (doc === null) {

                    if (result.length>0) {

                        var curDate = new Date(Date.UTC());

                        for (i=0; i<result.length; i++) {

                            EntityToPublishDate = result[i].EntityToPublishDate; 

                            if (EntityToPublishDate == curDate) {

                                EntityId = result[i]._id; 

                                ReminderText = result[i].ReminderText; 

                                bot.beginDialog(result[i].AddressData, '/sendReminder', { ReminderText: session.userData.ReminderText });

                            }

                        }   
                  
                                        
                    } 

                        return;
                    }

                    result.push(doc);
    }); 

      

*/










function CreateJobToQueue(session) {



 //   var Dailyrule = new schedule.RecurrenceRule();
 //   var now = moment();
  //  var minutes = now.minutes()+1;

   // Dailyrule.hour = session.userData.ReminderTime;
   // Dailyrule.minute = minutes;

    session.userData.ReminderMonth = moment().month();
    session.userData.ReminderYear = moment().year();
    

    var LogTimeStame = moment().format(DateFormat); 

        var LogRecord = {
            'CreatedTime': LogTimeStame,
            'Origin': 'CreateJobToQueue',
            'ReminderYear': session.userData.ReminderYear,
            'ReminderMonth': session.userData.ReminderMonth,
            'ReminderTime': session.userData.ReminderTime,
            'addressId': session.message.address.id,
            'reminderText' : session.userData.ReminderText,
            'userId': session.message.user.id
        }; 

        colLog.insert(LogRecord, function(err, result){}); 


    var date = new Date(session.userData.ReminderYear, session.userData.ReminderMonth, session.userData.ReminderDay, session.userData.ReminderTime, 0, 0);

    var j = schedule.scheduleJob(date, function(){
    
            bot.beginDialog(session.message.address, '/sendReminder', { addressId: session.message.address.id, userId: session.message.user.id, ReminderText: session.userData.ReminderText });

    });




/*

    var z = schedule.scheduleJob(Dailyrule, function(){

        bot.beginDialog(session.message.address, '/sendReminder', { addressId: session.message.address.id, userId: session.message.user.id, ReminderText: session.userData.ReminderText });

    });
*/

}







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

                                var LogTimeStame = moment().format(DateFormat); 

                                colUserData.update (
                                { "userId": userId },
                                { $set: { 'address': address, 'addressId': addressId, 'ChangedTime':LogTimeStame } }
                                ) 

                                
                            }  

                            if (session.userData.PostEntityInsert == 'true') {

                                if (userId == '344409174' || userId == '302621400') {

                                    session.sendTyping();

                                    session.send("ברוך שובך..");

                                    builder.Prompts.choice(session, "אז מה תרצו להדגים היום?", "עוזר אישי|בוטביט|אחר");

                                } else {

                                    session.sendTyping();

                                    session.send("יופי טופי... אני עובד אצלך. משהו נוסף?");

                                    builder.Prompts.choice(session, "איך אני יכול (שוב...) להחליף את מנשה ולעזור לך?", ["תזכיר לי משהו","חפש לי משהו","תגיד למנש שירים טלפון"]);                                               

                                }

                            } else {

                                if (userId == '344409174' || userId == '302621400') {

                                    session.sendTyping();

                                    session.send("ברוך שובך..");

                                    builder.Prompts.choice(session, "אז מה תרצו להדגים היום?", "עוזר אישי|בוטביט|אחר");

                                } else {

                                    session.sendTyping();

                                    session.send("היוש שוב..");

                                    builder.Prompts.choice(session, "אז איך אני יכול להחליף את מנשה ולעזור לך?", ["תזכיר לי משהו","חפש לי משהו","תגיד למנש שירים טלפון"]);

                                }


                            }                       
                                
                    } else {

                            session.sendTyping();

                            session.send( "היוש, זאת ההתחברות הראשונה שלך... מזל טוב וזה");
                            builder.Prompts.choice(session, "אז איך אני יכול להחליף את מנשה ולעזור לך?", ["תזכיר לי משהו","חפש לי משהו","תגיד למנש שירים טלפון"]);
                                               
   
                            addressId = session.message.address.id;
                            userId = session.message.user.id;
                            session.userData.userId = session.message.user.id;
                            address = session.message.address;

                            var LogTimeStame = moment().format(DateFormat); 
                                
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

            if (session.userData.userChoice == 'תזכיר לי משהו' ||  session.userData.userChoice == 'עוזר אישי') {

                builder.Prompts.choice(session, "משהו קבוע או סתם קפריזה חולפת?", ["קבוע","קפריזה"]);

            } else if (session.userData.userChoice == 'בוטביט') {

                session.send(results.response.entity);

                //session.endDialog();

                session.beginDialog("/BotBit");

            } else {

                session.sendTyping();

                session.send("אני מבטיח שאלמד לעשות זאת עד הגרסה הבאה");

                session.endDialog();

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

        builder.Prompts.number(session, "שעה מועדפת? אם מדובר בשמונה בערב אז כדאי לציין '20'"); 
    },
    function (session, results) {

        session.userData.ReminderTime = results.response-3;
        
        session.sendTyping();

        builder.Prompts.text(session, "אז מה בעצם להזכיר לך? אנא לציין כותרת קצרה וקולעת כי אני לא מוצלח בלזכור בכללי...סבבה? יופי"); 
    },    
    function (session, results) {

        session.userData.ReminderText = results.response;

        var LogTimeStame = moment().format(DateFormat); 

        var o_id = new mongo.ObjectID();

        var now = moment();
        var minutes = now.minutes()+1;
        var ReminderMonth = moment().month();
        var ReminderYear = moment().year();

        var date = new Date(Date.UTC(ReminderYear, ReminderMonth, session.userData.ReminderDay, session.userData.ReminderTime, minutes, 0));

        var dateTz = nowTimezone.tz(date,zone).format();
        



        var EntityRecord = {
              '_id': o_id,
              'CreatedTime': LogTimeStame,
              'ReminderDay': session.userData.ReminderDay,
              'ReminderTime': session.userData.ReminderTime,
              'ReminderType': session.userData.ReminderType,
              'EntityType': session.userData.userChoice,
              'EntityToPublishDate': dateTz,
              'ReminderText' : session.userData.ReminderText,
              'EntityStatus': 'pending',
              'userId': session.userData.userId
        }; 

        colEntities.insert(EntityRecord, function(err, result){}); 

        session.userData.PostEntityInsert = 'true';

        session.sendTyping();

        session.send("סבבה, רשמתי לעצמי להזכיר לך.");

        //session.endDialog();

        session.beginDialog("/");

        //session.beginDialog("/createReminder");

    },
    function (session, results) {

        session.endDialog();
        
    }
]);





bot.dialog('/BotBit', [
    function (session) {

        session.sendTyping();

        session.send("שלום לקוח יקר שלנו, שמי בוטביט ואני אנסה לסייע לך להשלים את תהליך אימות הנתונים לקראת הנפקת פוליסת ביטוח המקיף לרכב שלך.");

        builder.Prompts.choice(session, "שנתחיל?", "כן|לא");

    },
    function (session, results) {

            session.sendTyping();

            session.userData.StartImut = results.response.entity;

            builder.Prompts.text(session, "מה סוג הרכב שלך?"); 
            
    },
    function (session, results) {

            session.sendTyping();

            session.userData.CarType = results.response.entity;

            builder.Prompts.number(session, "אחלה רכב! ושנת הייצור?"); 
            
    },
    function (session, results) {

            session.sendTyping();

            session.userData.Year = results.response.entity;

            builder.Prompts.choice(session, "תאונות כלשהן?", "כן|לא");
            
    },
    function (session, results) {

            session.sendTyping();

            session.userData.Accidents = results.response.entity;

            builder.Prompts.choice(session, " האם קיימת מערכת מיגון?", "כן|לא");
            
    },
    function (session, results) {

            session.sendTyping();

            session.userData.Migun = results.response.entity;

            builder.Prompts.attachment(session, ".עכשיו...אשמח אם תוכל לצלם את הרכב ולשלוח לי את התמונה שלו.. יאללה מחכה לזה..");
            
    },
    function (session, results) {

            session.userData.CarImage = results.response[0].thumbnailUrl;

            session.sendTyping();

            session.send("תודה רבה לך על המידע שמסרת!");

            builder.Prompts.choice(session, " האם אתם מאשרים שכל הנתונים שסיפקתם הם אמיתיים ומשקפים את המצב הנוכחי של הרכב?", "כן|לא");
            
    },
    function (session, results) {

            session.userData.ApproveData = results.response.entity;

            session.send("שוב תודה. עכשיו אני אבצע את הפנייה בשמך אל הגורמים המתאימים בחברת הביטוח על מנת לאשר את הפוליסה. בהצלחה לשנינו :)");

            session.endDialog();

            session.beginDialog("/BotBit");
            
    },
]);







bot.dialog('restartDialog', function (session, args) {

    session.userData.userId = session.message.user.id;

    userId = session.message.user.id;

    session.userData.PostEntityInsert = 'false';

    session.endDialog("אז מתחילים מחדש..");

    session.beginDialog("/");


}).triggerAction({ 
    onFindAction: function (context, callback) {
        // Recognize users utterance
        switch (context.message.text.toLowerCase()) {
            case '/restart':
                // You can trigger the action with callback(null, 1.0) but you're also
                // allowed to return additional properties which will be passed along to
                // the triggered dialog.
                callback(null, 1.0, { topic: 'restart' });
                break;
            default:
                callback(null, 0.0);
                break;
        }
    } 
});




bot.dialog('/createReminder', [

    function (session) {

            session.userData.ReminderMonth = moment().month();
            var ReminderYear = moment().year();

            var LogTimeStame = moment().format(DateFormat); 

                var LogRecord = {
                    'CreatedTime': LogTimeStame,
                    'Origin': 'CreateJobToQueue',
                    'EntityId': session.userData.o_id,
                    'ReminderYear': ReminderYear,
                    'ReminderMonth': session.userData.ReminderMonth,
                    'ReminderTime': session.userData.ReminderTime,
                    'addressId': session.message.address.id,
                    'reminderText' : session.userData.ReminderText,
                    'userId': session.message.user.id
                }; 

                colLog.insert(LogRecord, function(err, result){}); 

                var now = moment();
                var minutes = now.minutes()+1;
                
                var date = new Date(Date.UTC(ReminderYear, session.userData.ReminderMonth, session.userData.ReminderDay, session.userData.ReminderTime, minutes, 0));

                j = schedule.scheduleJob(date, function(){
                
                        bot.beginDialog(session.message.address, '/sendReminder', { addressId: session.message.address.id, userId: session.message.user.id, ReminderText: session.userData.ReminderText, o_id: session.userData.o_id });

                });

                session.endDialog();

                session.beginDialog("/");


    }
]);





bot.dialog('/sendReminder', [

    function (session) {

                            var changeTime = moment().format(DateFormat); 

                             var LogRecord = {
                                'Origin': 'sendReminder',
                                'Entityid': EntityId,
                                'CreatedTime': changeTime,
                                'ReminderText': ReminderText,
                                'address': address
                            }; 

                            colLog.insert(LogRecord, function(err, result){});   


                            colEntities.update (
                                { "_id": EntityId },
                                { $set: { 'EntityStatus': 'processed', 'ProcessedTime':changeTime } }
                            );                                   
       
        session.send("ReminderText: "+ ReminderText);

        session.endDialog();

        session.beginDialog("/");

    }
]);






bot.dialog('killDialog', function (session, args) {

    session.send("nowTimezone: " +nowTimezone);

    session.endDialog();

    session.beginDialog("/");


}).triggerAction({ 
    onFindAction: function (context, callback) {
        // Recognize users utterance
        switch (context.message.text.toLowerCase()) {
            case '/kill':
                // You can trigger the action with callback(null, 1.0) but you're also
                // allowed to return additional properties which will be passed along to
                // the triggered dialog.
                callback(null, 1.0, { topic: 'kill' });
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
       
        session.endDialog();

        session.beginDialog("/");

    }
]);








bot.dialog('momDialog', function (session, args) {

    //session.endDialog("momDialog");

    session.beginDialog("/sendMomDailyReminder");


}).triggerAction({ 
    onFindAction: function (context, callback) {
        // Recognize users utterance
        switch (context.message.text.toLowerCase()) {
            case '/mom':
                callback(null, 1.0, { topic: 'mom' });
                break;
            default:
                callback(null, 0.0);
                break;
        }
    } 
});







bot.dialog('/sendMomDailyReminder', [
    function (session) {
        
            GetUserAddress("302621400"); //358985845 


            function GetUserAddress(MomuserId) {

                           var changeTime = moment().format(DateFormat); 

                           var LogRecord = {
                                'CreatedTime': changeTime,
                                'Origin': 'GetUserAddress',
                                'userId': MomuserId
                            }; 

                            colLog.insert(LogRecord, function(err, result){}); 


                        var cursor = colUserData.find({ 'userId': MomuserId });
                        
                        var result = [];
                        cursor.each(function(err, doc) {
                            if(err)
                                throw err;
                            if (doc === null) {
                                // doc is null when the last document has been processed


                                if (result.length>0) {
                                    
                                    
                                    addressId = result[0].addressId;

                                    address = result[0].AddressData;  
            
                                } 


                                return;
                            }
                            // do something with each doc, like push Email into a results array
                            result.push(doc);
                        }); 


            } 



            function SendMessageToMom() {

                bot.beginDialog(address, '/sendMom', { addressId: addressId, userId: userId, ReminderText: ReminderText });

            }

            SendMessageToMom();

    }
]);



bot.dialog('/sendMom', [
    function (session) {
            
                var cursor = colUserData.find({ "addressId": addressId });
                
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

            session.endDialog();                  
                    
    }
]);





///////////// Global Functions 358985845 /////////////////////////////////////////










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
