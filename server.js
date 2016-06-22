/**
 * Created by Schpitz on 02-Jun-16.
 */

console.log('server work!!!');

var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;

var fs = require('fs');
var http = require('http');
fs.readFile('chat.html', function (err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});  // <-- HERE!
        response.write(html);  // <-- HERE!
        response.end();
    }).listen(1337);
});



// Note:
// Use mentioned address and specific database (chat), but we need to mention it on the 'mongo.exe' to check it (unless it won't be visible)
// Prompt console -> mongo.exe -> "use chat" (switching to db chat)
// mongo.connect('mongodb://admin:aTM8ZyaE2TQq@127.7.173.130:27017/nodejs' , function( err , db )   // Using: OpenSfhit (online)
mongo.connect('mongodb://guser:guser@ds025449.mlab.com:25449/ludotest' , function( err , db )       // Using: mlab (online)
// mongo.connect('mongodb://127.0.0.1/chat' , function( err , db )                                  // Using: Localhost (offline)
{
    // Show errors
    if (err)
       throw  err;

    client.on('connection' , function (socket){

        var col = db.collection('messages');                // We created a div/class named messages
        var sendStatus = function (stat){
            socket.emit('status' , stat);                   // We send a status as a string
        }



        // Emit all message (retrieve all known messages on start)
        // find() is just like in the MongoDB console
        // we also limit the messages, and sort backward (from last to beginning)
         col.find().limit(100).sort({_id : 1}).toArray(function (err , res) {
             if (err)
                 throw err;
             socket.emit('output' , res);
         })



        // wait for input...
        socket.on('input', function(data){
            // console.log(data);                          // Show the input data
           // Remember we use a json object
            var name = data.name;
            var message = data.message;
            var time = data.time;

            // White-Space check (apparently this is how we check it)
            var whitespacePattern = /^\s*$/;                // Whitespace in code
            var shouldInsertData = true;
            if (whitespacePattern.test(name) || whitespacePattern.test(message))
            {
                console.log('Invalid');
                shouldInsertData = false;       // Don't insert the data
                sendStatus('Both Name and Message are required!');
            }


            // Insert the data
            if (shouldInsertData)
            {
                col.insert({name : name , message : message , time:time}, function () {
                    console.log("new data inserted");

                    // Emit latest message to all clients
                    client.emit('output' , [data]);

                    // Emit status
                    sendStatus({
                        message: "Message sent...",
                        clear: true
                    })
                });
            }
        } )
    });
});



// TEST - listen to when a client is connected (via Socket.IO)
client.on('connection' , function (socket){
    console.log("someone is now connected...");
});