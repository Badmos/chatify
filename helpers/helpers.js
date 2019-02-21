'use strict'
const moment = require('moment')

// create individual users
class User {
    constructor() {
        this.userList = [];
    }
    addUser(id, name, room) {
        let user = { id, name, room };
        this.userList.push(user);
        return user;
    }
    removeUser(id) {
        let user = this.getUser(id);

        if (user) {
            this.userList = this.userList.filter(userInstance => userInstance.id !== id);
        }
        return user
    }
    getUser(id) {
        let user = this.userList.filter(user => user.id === id)[0];
        return user;
    }
    getUserList(room) {
        let roomParticipants = this.userList.filter(user => user.room === room)
        let participantNames = roomParticipants.map(participant => participant.name)
        return participantNames;
    }
}

//do string validation
function isValidString(str) {
    return typeof str === 'string' && str.trim().length > 0
}

//Handle message data
function dataHandler(from, text) {
    var date = new Date();
    var dateNow = date.getTime();
    return {
        from,
        text,
        createdAt: moment.valueOf()
    }
};

// Handle location message
function locationHandler(from, latitude, longitude, url) {
    var date = moment.valueOf();
    return {
        from,
        latitude,
        longitude,
        url,
        createdAt: date
    }
}

module.exports.User = User;
module.exports.isValidString = isValidString;
module.exports.dataHandler = dataHandler;
module.exports.locationHandler = locationHandler;