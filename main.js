var $ = require('jquery');
var _ = require('underscore');

$(function () {

var user = firebase.auth().currentUser;

if (user) {
    $('#user').text(user.displayName);
}

$('#login').on('click', function() {
    var provider = new firebase.auth.GithubAuthProvider();
    provider.addScope('email');
    firebase.auth().signInWithRedirect(provider);
});

firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        //var token = result.credential.accessToken;
        // ...
        firebase.auth().signInWithCredential(result.credential);
    }
    // The signed-in user info.
    var user = result.user;
    $('#user').text(user.displayName);
}).catch(function(error) {
    
});

var cellImageFrame = 'image/frame.png';
var cellImageCenter = 'image/center.png';
var cellImageBorder = 'image/border.png';
var cellImagePaths = [
    null,
    'image/n1.png',
    'image/n2.png',
    'image/n3.png',
    'image/n4.png',
    'image/n5.png',
    'image/n6.png',
    'image/n7.png',
    'image/n8.png',
    'image/n9.png',
    'image/n10.png',
    'image/n11.png'];
var cellImageSelectedPaths = [
    null,
    'image/h1.png',
    'image/h2.png',
    'image/h3.png',
    'image/h4.png',
    'image/h5.png',
    'image/h6.png',
    'image/h7.png',
    'image/h8.png',
    'image/h9.png',
    'image/h10.png',
    'image/h11.png'];

var boardsize = 3;
var allpos = [];
_.times(boardsize, function (i) {
    var pos = {x:0, y:-i-1};
    _([4, 6, 8, 10, 0, 2]).each(function(dir) {
        _.times(i + 1, function(j) {
            allpos.push(pos);
            pos = getnextpos(pos, dir);
        });
    });
});

function drawcell(pos, path, selected) {
    var cell = $('div#board>div.cell').filter(function() { return $(this).prop('x') === pos.x && $(this).prop('y') === pos.y});
    if (cell.length > 0) {
        cell.empty();
    } else {
        cell = $('<div>').addClass('cell').prop('x', pos.x).prop('y', pos.y);
        cell.css('left', 500-50+pos.x*75);
        cell.css('top', 400-43+pos.y*86-(pos.x&1)*43);
        $('div#board').append(cell);
    }
    if (pos.x === 0 && pos.y === 0) {
        var centerimg = $('<img>').attr('src', cellImageCenter);
        cell.append(centerimg);
    } else if (!inboard(pos)) {
        var borderimg = $('<img>').attr('src', cellImageBorder);
        cell.append(borderimg);
    } else {
        for (var i = 0; i < path.length; i++) {
            var j = path[i];
            if (i < j) {
                var pathimg = $('<img>');
                var hl = _.some(selected, function(x) { return x === i || x === j; });
                var cip = hl ? cellImageSelectedPaths : cellImagePaths;
                if ((i & 1) === 0) {
                    pathimg.attr('src', cip[j-i]);
                    pathimg.css('transform', 'rotate('+(i*30)+'deg)');
                } else {
                    pathimg.attr('src', cip[12-j+i]);
                    pathimg.css('transform', 'scaleX(-1) rotate('+(-i*30+30)+'deg)');
                }
                cell.append(pathimg);
            }
        }    
        var frameimg = $('<img>').attr('src', cellImageFrame);
        cell.append(frameimg);
    }
}

function randpath() {
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

/*
_.each(allpos, function(cell) {
    drawcell(cell, randpath());
});
*/

function matchpos(p1, p2) { return p1.x === p2.x && p1.y === p2.y; };
function inboard(pos) {
    return _.some(allpos, _.partial(matchpos, pos));
}
function getnextpos(curpos, exit) {
    if (exit === 0 || exit === 1) {
        return { x: curpos.x, y: curpos.y - 1 };
    } else if (exit === 2 || exit === 3) {
        return { x: curpos.x + 1, y: curpos.y - (curpos.x & 1) };
    } else if (exit === 4 || exit === 5) {
        return { x: curpos.x + 1, y: curpos.y + 1 - (curpos.x & 1) };
    } else if (exit === 6 || exit === 7) {
        return { x: curpos.x, y: curpos.y + 1 };
    } else if (exit === 8 || exit === 9) {
        return { x: curpos.x - 1, y: curpos.y + 1 - (curpos.x & 1) };
    } else if (exit === 10 || exit === 11) {
        return { x: curpos.x - 1, y: curpos.y - (curpos.x & 1) };
    }
}
function getnextenter(curexit) {
    return [7, 6, 9, 8, 11, 10, 1, 0, 3, 2, 5, 4][curexit];
}

drawcell({x:0, y:0});
var bpos = {x:0, y:-boardsize-1};
_([4, 6, 8, 10, 0, 2]).each(function(dir) {
    _.times(boardsize + 1, function(j) {
        drawcell(bpos);
        bpos = getnextpos(bpos, dir);
    });
});

var curpos = {x:0, y:-1};
var enter = 7;
var cells = [];
var going = true;
while (going) {
    var path = randpath();
    var selected = [enter];
    drawcell(curpos, path, selected);
    cells.push({pos:curpos, path:path, selected:selected});
    while (true) {
        var curexit = path[enter];
        var nextpos = getnextpos(curpos, curexit);
        if (!inboard(nextpos)) {
            going = false;
            break;
        }
        var existing = _.find(cells, function(c) { return matchpos(c.pos, nextpos); });
        if (!existing) {
            enter = getnextenter(curexit);
            curpos = nextpos;
            break;
        }
        enter = getnextenter(curexit);
        existing.selected.push(enter);
        curpos = nextpos;
        path = existing.path;
        drawcell(curpos, path, existing.selected);
    }
}

});
