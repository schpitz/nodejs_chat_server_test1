/**
 * Created by Schpitz on 19/06/2016.
 */
(function () {
    var getNode = function (s) {
        return document.querySelector(s);
    };

    // Get required notes
    var textarea = getNode('.chat-text-area');
    var chatname = getNode('.chat-name');
    var messages = getNode('.chat-messages');
    var status = getNode('.chat-status span');
    // Tweaks
//        var messageSender = getNode('.chat-message-sender');
//        var messageContent = getNode('.chat-message-content');


    var statusDefault = status.textContent;
    var setStatus = function (s) {
        status.textContent = s;

        // Set back to default
        if (s !== statusDefault) {
            var delay = setTimeout(function () {
                setStatus(statusDefault);
                clearInterval(delay);
            }, 3000);
        }
    };
    setStatus('Testing.');


    var socket;
    try {
        socket = io.connect('http://127.0.0.1:8080');
    } catch (e) {
        // Warn user
        console.log("error! can't find mongoDB server");
    }


    if (socket != undefined) {

        // Listen for output
        socket.on('output', function (data) {
            console.log(data);

            if (data.length) {

                // loop through results
                for (var x = 0; x < data.length; x++) {

                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
//                        message.textContent = data[x].name + " : " + data[x].message;   // Original

                    var messageSender = document.createElement('div');
                    messageSender.setAttribute('class', 'chat-message-sender');
                    messageSender.textContent = data[x].name;

                    var messageText = document.createElement('div');
                    messageText.setAttribute('class', 'chat-message-content');
                    messageText.textContent = data[x].message;

                    var messageTime = document.createElement('div');
                    messageTime.setAttribute('class', 'chat-message-time');
//                        var d = new Date();
//                        messageTime.textContent = d.toLocaleDateString();
                    var d = new Date(data[x].time);
                    var dDate = d.getDate() +"/"+ (d.getMonth()+1) +"/"+ d.getFullYear();
                    var dTime = d.getHours() +":" + ((d.getMinutes()<10)?("0"):"") + d.getMinutes();
                    messageTime.textContent = dDate +" " + dTime;


                    // Append
                    message.appendChild(messageSender);
                    message.appendChild(messageTime);
                    message.appendChild(messageText);
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);       //
                }
            }
        });

//            function sortToHtML(name,text) {
//
//            }

        // Listen for status
        socket.on('status', function (data) {
            // If we the data is an object-message (string) or object
            setStatus((typeof data === 'object') ? data.message : data);
            if (data.clear === true) {
                textarea.value = '';
            }
        });


        // Listen for keydown -> send message on certain event (enter key)
        textarea.addEventListener('keydown', function (event) {
            var self = this;
            var name = chatname.value;

//                console.log(event);                               // Print the key HEX value

            // Send message only if both ENTER pressed and Shift not-pressed
            if ((event.which === 13) && (event.shiftKey === false)) {
                console.log("message sent!");
                socket.emit('input', {
                        name: name,
                        message: self.value,
                        time: Date.now()
                    }
                );
            }
        })
    }
})();


