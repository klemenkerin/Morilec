const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.set('views', './views');
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

const rooms = {}
var userRoles = {};
var votes = {}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/createRoom', (req, res) => {
    var room = createNewRoom();
    res.redirect(room);
})

app.post('/joinRoom', (req, res) => {
    if (rooms[req.body.room] == null) {
        return res.redirect('/')
    }
    res.redirect(req.body.room);
})

app.get('/:room', (req, res) => {
    var room = req.params.room;
    if (rooms[room] == null) {
        return res.redirect('/');
    }
    var allUsers = [];
    for (const key in rooms[room].users) {
        allUsers.push(rooms[room].users[key]);
    }
    res.render('room', {allUsers});
});

function createNewRoom() {
    var room = Math.random().toString(36).substring(2, 7);
    rooms[room] = {users: {}};
    return room;
}

io.on('connection', function (socket) {
    console.log("new connection");
    socket.on('new-user', (room, name) => {
        socket.join(room);
        rooms[room].users[socket.id] = name;
        io.in(room).emit('user-connected', name);
        console.log(rooms);
    });
    socket.on("zacetek-igre", (room) => {
        userRoles = addUserRoles(room);
        for (const key in userRoles) {
            io.to(key).emit("nova-vloga", userRoles[key]);
        }
        votes = {};
    });
    socket.on("vote", (name, cas, room) => {
        if (cas == "noc") {
            for (const key in userRoles) {
                if (getSocketFromName(name, room) == key) {
                    userRoles[key] = "smrt";
                    console.log(userRoles);
                }
            }
            io.in(room).emit('smrt', name);
        }
        console.log("cas " + cas);
        if (cas == "dan") {
            var activeRoles = 0;
            for (const key in userRoles) {
                if (userRoles[key] != "smrt") {
                    activeRoles++;
                }
            }
            console.log("activeroles " + activeRoles);

            if (votes[name] == null) {
                votes[name] = 1;
            } else {
                votes[name] += 1;
            }
            console.log(votes);

            var oddaniGlasovi = 0;
            for (const key in votes) {
                oddaniGlasovi += votes[key];
            }

            if (oddaniGlasovi === activeRoles) {
                var max = 0;
                var morilec = "";
                for (const key in votes) {
                    if (votes[key] > max) {
                        max = votes[key];
                        morilec = key;
                    }
                }
                for (const key in userRoles) {
                    if (userRoles[key] == "morilec") {
                        if (getNameFromSocket(key, room) == morilec) {
                            io.in(room).emit('glasovanje-zmaga', morilec);
                            oddaniGlasovi = 0;
                            votes = {};
                            userRoles = {};
                        } else if (activeRoles === 2) {
                            io.in(room).emit('morilec-zmaga', getNameFromSocket(key, room));
                            console.log("morilec zmaga");
                            oddaniGlasovi = 0;
                            votes = {};
                            userRoles = {};
                        } else {
                            io.in(room).emit('glasovanje-poraz', morilec);
                            oddaniGlasovi = 0;
                            votes = {};
                            userRoles = {};
                        }
                    }
                }
            }
        }
    });
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            io.in(room).emit('user-disconnected', rooms[room].users[socket.id]);
            delete rooms[room].users[socket.id];
            console.log(rooms);
        });
    });
});

function addUserRoles(room) {
    var users = {};
    var len = Object.keys(rooms[room].users).length;

    var roles = [];

    var random = Math.floor(Math.random() * len);
    for (var i = 0; i < len; i++) {
        if (i == random) {
            roles[i] = "morilec"
        } else {
            roles[i] = "kmet";
        }
    }

    var i = 0;
    for (const key in rooms[room].users) {
        users[key] = roles[i];
        i++;
    }
    return users
}

function getSocketFromName(name, room) {
    for (const key in rooms[room].users) {
        if (name == rooms[room].users[key]) {
            return key;
        }
    }
}

function getNameFromSocket(socket, room) {
    for (const key in rooms[room].users) {
        if (key == socket) {
            return rooms[room].users[key];
        }
    }
}

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name);
        return names;
    }, []);
}

http.listen(port, () => {
    console.log("Port 3000");
});