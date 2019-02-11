var socket = io();
let param;
socket.on("connect", () => {
    console.log("connected to server ");
    param = convertQueryStringToObject()
        //make roomName case insensitive
    param.roomName = param.roomName.toLowerCase();
    socket.emit("join", param, (err) => {
        console.log(param)
        if (err) {
            window.location.href = "/";
            console.log(err)
        } else {
            console.log("worked")
        }
    })
});
socket.on("disconnect", () => {
    console.log("connection lost ")
});

socket.on('updatedUserData', (users) => {
    let ol = jQuery('<ol></ol>');

    users.forEach(function(user) {
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
});

//scroll to page bottom when new message arrives
function autoScrollDown() {
    let messages = jQuery("#messages");
    let mostRecentMessage = messages.children("li:last-child");
    let secondToTheLastMessage = mostRecentMessage.prev();

    let clientHeight = messages.prop("clientHeight");
    let scrollTop = messages.prop('scrollTop');
    let scrollHeight = messages.prop("scrollHeight");
    let mostRecentMessageHeight = mostRecentMessage.innerHeight();
    let secondToTheLastMessageHeight = secondToTheLastMessage.innerHeight()
    let totalHeight = clientHeight + scrollTop + mostRecentMessageHeight + secondToTheLastMessageHeight;
    if (totalHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}
// client listens to the processed message from server and formats it appriopriately
socket.on("newMessage", function(message) {
    var presentTime = moment(message.createdAt).format("h:mm a");
    let template = jQuery("#message-template").html();
    //use template engine
    let html = Mustache.render(template, {
        createdAt: presentTime,
        from: message.from,
        content: message.text
    });
    jQuery("#messages").append(html);
    autoScrollDown();
})

// client listens to formatted message from server and does a little formatting
socket.on("newLocation", function(location) {
    var presentTime = moment(location.createdAt).format("h:mm a");
    let template = jQuery("#location-template").html();
    let html = Mustache.render(template, {
        from: location.from,
        createdAt: presentTime,
        url: location.url
    })
    jQuery("#messages").append(html);
    autoScrollDown();

});

$("#message-form").on("submit", function(e) {
    e.preventDefault();
    // client creates new message and server listens for response
    socket.emit("createMessage", {
        from: param.username,
        text: $("[name=input-field]").val()
    }, function(acknowledgeMessage) {
        console.log("Event Acknowleged from ", acknowledgeMessage);
    });

    $("[name=input-field]").val("")
})

$("#send-location").on("click", function() {
    if (!navigator.geolocation) {
        alert("your browser does not support geolocation")
    }

    $("#send-location").attr("disabled", "disabled").text("sending...")
    navigator.geolocation.getCurrentPosition((position) => {
        // client creates user location and server listens
        socket.emit("createLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
        $("#send-location").removeAttr("disabled").text("Get location")
    }, () => {
        alert("unable to fetch location")
        $("#send-location").removeAttr("disabled").text("send location")
    });
});

//Query string looks rough.. let's convert convert it to an Object, yeah?
function convertQueryStringToObject() {
    let inputArray = window.location.search.slice(1).split('&');
    let convertedInput = {};
    inputArray.forEach((input) => {
        input = input.split('=');
        convertedInput[input[0]] = decodeURIComponent(input[1].replace(/\+/g, '%20') || '');
        //We can also do: convertedInput[input[0]] = decodeURIComponent(input[1] || ''); It just doesn't handle spaces 
    });

    return JSON.parse(JSON.stringify(convertedInput));
};


//we'll use this to check if user already exists in group
// let findDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item.name) != index)
// if (findDuplicates(users)) {
//     console.log("Duplicate user")
// }

//its variant is shown below but its verbose so we won't use. Plus, one-liners rock!
// function uniqueUsername(userArray) {
//     let foundItem = []
//     userArray.forEach((object) => {
//         // console.log(object)
//         // object.name = object.name.toLowerCase()
//         if (foundItem[object.name]) {
//             console.log("username exists");
//             return true
//         } else {
//             foundItem[object.name] = true
//         }
//     })
// }