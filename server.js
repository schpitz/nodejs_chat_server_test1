/**
 * Created by Schpitz on 02-Jun-16.
 */

console.log('server work!!!');

var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;




var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
//Port number to use
var port = process.argv[2] || 1080;
//Colors for CLI output
var WHT = "\033[39m";
var RED = "\033[91m";
var GRN = "\033[32m";

//Create the server
http.createServer(function (request, response) {

    //The requested URL like http://localhost:8000/file.html
    var uri = url.parse(request.url).pathname;
    //get the file.html from above and then find it from the current folder
    var filename = path.join(process.cwd(), uri);

    //Setting up MIME-Types
    var contentTypesByExtension = {
        '.html': "text/html",
        '.css':  "text/css",
        '.js':   "text/javascript",
        ".json": "text/json"
    };

    //Check if the requested file exists
    fs.exists(filename, function(exists) {
        //If it doesn't
        if (!exists) {
            //Output a red error pointing to failed request
            console.log(RED + "FAIL: " + filename);
            //Redirect the browser to the 404 page
            filename = path.join(process.cwd(), '/404.html');
            //If the requested URL is a folder, like http://localhost:8000/catpics
        } else if (fs.statSync(filename).isDirectory()) {
            //Output a green line to the console explaining what folder was requested
            console.log(GRN + "FLDR: " + WHT + filename);
            //redirect the user to the index.html in the requested folder
            filename += './public/chat.html';
        }

        //Assuming the file exists, read it
        fs.readFile(filename, "binary", function(err, file) {
            //Output a green line to console explaining the file that will be loaded in the browser
            console.log(GRN + "FILE: " + WHT + filename);
            //If there was an error trying to read the file
            if (err) {
                //Put the error in the browser
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            //Otherwise, declar a headers object and a var for the MIME-Type
            var headers = {};
            var contentType = contentTypesByExtension[path.extname(filename)];
            //If the requested file has a matching MIME-Type
            if (contentType) {
                //Set it in the headers
                headers["Content-Type"] = contentType;
            }

            //Output the read file to the browser for it to load
            response.writeHead(200, headers);
            response.write(file, "binary");
            response.end();
        });

    });

}).listen(parseInt(port, 10));

//Message to display when server is started
console.log(WHT + "Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");





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