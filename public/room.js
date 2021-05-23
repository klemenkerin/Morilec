var socket = io();

var cas = "noc";
var vloga = "";

var admin = false;

const name = prompt('What is your name? ');
const room = location.pathname.substr(1);
socket.emit('new-user', room, name);

var list = document.getElementById("users");
var items = list.getElementsByTagName("button");
//console.log("items " + items);
var buttonZacetek = document.getElementById("button-zacetek");
if (items.length == 0) {
    buttonZacetek.style.display = "block";
}

function zacniIgro() {
    socket.emit('zacetek-igre', room);
    gumb = document.getElementById("button-zacetek");
    gumb.style.display = "none";
}

function getVote(name) {
    socket.emit('vote', name, cas, room);
}

socket.on('nova-vloga', function (novaVloga) {
    cas = "noc";
    vloga = novaVloga;
    console.log(novaVloga);

    if (vloga == "morilec") {
        for (const key in items) {
            items[key].disabled = false;
        }
    }

    var ozadje = document.getElementById("ozadje");
    ozadje.innerHTML = "<img id=\"ozadje-day\" class=\"ozadje\" src=\"img/ozadje_white_color.png\">"

    var body = document.getElementsByTagName("body");
    body[0].style.background = "black";

    var avatar = document.getElementById("avatar");
    if (novaVloga == "kmet") {
        for (const key in items) {
            items[key].disabled = true;
            items[key].style = "";
        }
        avatar.innerHTML = "<img id=\"kmet-night\" class=\"vloga\" src=\"img/kmet-night.png\">";
    }
    if (novaVloga == "morilec") {
        avatar.innerHTML = "<img id=\"kmet-night\" class=\"vloga\" src=\"img/morilec-night.png\">"
        for (const key in items) {
            items[key].style = "";
        }
    }
});

socket.on("smrt", function (nameSmrt) {
    cas = "dan";
    var avatar = document.getElementById("avatar");
    var ozadje = document.getElementById("ozadje");
    if (name == nameSmrt) {
        vloga = "smrt";
    } else {
        for (const key in items) {
            if (items[key].id == nameSmrt) {
                items[key].style.background = "red";
            }
        }
    }
    var body = document.getElementsByTagName("body");
    body[0].style.background = "white";

    if (vloga == "kmet") {
        avatar.innerHTML = "<img id=\"kmet-day\" class=\"vloga\" src=\"img/kmet-black.png\">"
    }

    if (vloga == "morilec") {
        avatar.innerHTML = "<img id=\"morilec-day\" class=\"vloga\" src=\"img/morilec-black.png\">"
    }

    if (vloga == "smrt") {
        avatar.innerHTML = "<img id=\"smrt-day\" class=\"vloga\" src=\"img/skull-black.png\">";
    }

    ozadje.innerHTML = "<img id=\"ozadje-day\" class=\"ozadje\" src=\"img/ozadje-kri-day.gif\">"

    if (vloga != "smrt") {
        for (const key in items) {
            items[key].disabled = false;
        }
    }
});

socket.on('glasovanje-zmaga', function (morilec) {
    alert("Win! The killer was " + morilec);
    vloga = "";
    cas = "noc";
    if (admin) {
        gumb = document.getElementById("button-zacetek");
        gumb.style.display = "block";
    }
    for (const key in items) {
        items[key].disabled = true;
    }
});

socket.on('glasovanje-poraz', function (morilec) {
    cas = "noc";

    var ozadje = document.getElementById("ozadje");
    ozadje.innerHTML = "<img id=\"ozadje-day\" class=\"ozadje\" src=\"img/ozadje_white_color.png\">"

    var body = document.getElementsByTagName("body");
    body[0].style.background = "black";

    var avatar = document.getElementById("avatar");
    if (vloga == "kmet") {
        avatar.innerHTML = "<img id=\"kmet-night\" class=\"vloga\" src=\"img/kmet-night.png\">"
    }

    if (vloga == "morilec") {
        avatar.innerHTML = "<img id=\"morilec-night\" class=\"vloga\" src=\"img/morilec-night.png\">"
    }

    if (vloga == "smrt") {
        avatar.innerHTML = "<img id=\"smrt-day\" class=\"vloga\" src=\"img/skull-white.png\">";
    }

    for (const key in items) {
        if (vloga == "kmet") {
            items[key].disabled = true;
        }
    }
});

socket.on('morilec-zmaga', function (morilec) {
    alert("The killer was " + morilec);
    vloga = "";
    cas = "noc";
    if (admin) {
        gumb = document.getElementById("button-zacetek");
        gumb.style.display = "block";
    }
    for (const key in items) {
        items[key].disabled = true;
    }
});

socket.on('user-connected', function (name) {
    users.innerHTML += "<button class='button-night' id='" + name + "' onclick='getVote(\"" + name + "\")' disabled>" + name + "</button>";
    if (items[0].innerText === name) {
        admin = true;
    }
});

socket.on('user-disconnected', function (name) {
    var list = document.getElementById("users");
    var items = list.getElementsByTagName("button");
    for (var i = 0; i < items.length; i++) {
        if (items[i].outerText == name) {
            list.removeChild(items[i]);
        }
    }
});