var $ = require('jquery');
var _ = require('underscore');

$(function () {

var user = firebase.auth().currentUser;

if (user) {
    $('#user').text(user.displayName);
}

$('#login').on('click', function() {
    var provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithRedirect(provider);
});

firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        var token = result.credential.accessToken;
        // ...
    }
    // The signed-in user info.
    var user = result.user;
}).catch(function(error) {
    
});

var cellPaths = [
    'image/image002.png',
    'image/image005.png',
    'image/image007.png',
    'image/image009.png',
    'image/image011.png',
    'image/image013.png',
    'image/image015.png',
    'image/image017.png',
    'image/image019.png',
    'image/image021.png',
    'image/image023.png',
    'image/image025.png'];

function addcell(x, y, path) {
    var cell = $('<div>').addClass('cell');
    $('div#board').append(cell);
    cell.css('left', x);
    cell.css('top', y);
    for (var i = 0; i < path.length; i++) {
        var j = path[i];
        var pathimg = $('<img>');
        if (i < j) {
            if ((i & 1) === 0) {
                pathimg.attr('src', cellPaths[j-i]);
                pathimg.css('transform', 'rotate('+(i*30)+'deg)');
            } else {
                pathimg.attr('src', cellPaths[12-j+i]);
                pathimg.css('transform', 'scaleX(-1) rotate('+(-i*30+30)+'deg)');
            }
        }
        cell.append(pathimg);
    }    
}

function randPath() {
    var path = new Array(12);
    var s = 0;
    for (var i = 0; i < 6; i++) {
        var dist = Math.floor(Math.random() * (11 - i * 2)) + 1;
        while (path[s] !== undefined) {
            s++;
        }
        for (var e = s; dist > 0; dist--) {
            do {
                e = (e + 1) % 12;
            } while (path[e] !== undefined);
        }
        path[s] = e;
        path[e] = s;
    }
    return path;
}

addcell(150, 150, [1, 0, 3, 2, 5, 4, 7, 6, 9, 8, 11, 10]);
addcell(300, 150, [11, 2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 0]);
addcell(450, 150, randPath());
});
