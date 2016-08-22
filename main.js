var $ = require('jquery');
var _ = require('underscore');
var dateFormat = require('dateformat');

$(function () {

var currentUser;
$('#login').on('click', function() {
    var user = $('#user').val();
    if (user) {
        firebase.database().ref('/users/' + user).once('value').then(function(snapshot) {
            var v = snapshot.val();
            highscore = (v && v.highscore) || [];
            showhighscore();
            currentUser = user;
        });
    }
});

$(document).on('keydown', function(event) {
  if (event.defaultPrevented) {
    return; // Should do nothing if the key event was already consumed.
  }

  switch (event.key) {
    case 'ArrowLeft':
        rotate(false);
        break;
    case 'ArrowRight':
        rotate(true);
        break;
    case 'Enter':
        nextcell();
        break;
/*
    case 'r':
        if (!$(event.target).is('input')) {
            initgame();
        } else {
            return;
        }
        break;
*/
    default:
        return;
  }
  event.preventDefault();
});

$('#play').on('click', function() {
    if (currentUser) {
        initgame();
    }
});

var highscore = [];

function showhighscore() {
    $('table#userscore>tbody>tr').remove();
    _.each(highscore,function(s) {
        var tr = $('<tr>');
        $('<td>').appendTo(tr).text(s.score);
        $('<td>').appendTo(tr).text(dateFormat(s.time));
        $('table#userscore>tbody').append(tr);
    });
}

function addhighscore() {
    var i = _.findIndex(highscore, function (s) { return score > s.score; });
    if (i < 0) {
        i = highscore.length;
    }
    highscore.splice(i, 0, {score:score, time:Date.now()});
    if (highscore.length > 5) {
        highscore.splice(5);
    }
    firebase.database().ref('users/' + currentUser).set({
        "highscore": highscore
    });
    showhighscore();
}

function showscore() {
    $('#score').text(score);
}

var cellImageCenter = 'image/center.png';
var cellImageBorder = 'image/border.png';
var cellImageFrame = 'image/frame.png';
var cellImageSelectedFrame = 'image/selected.png';
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
        _.times(i + 1, function() {
            allpos.push(pos);
            pos = getnextpos(pos, dir);
        });
    });
});

function drawcell(cell, selected) {
    function p() { return $(this).prop('x') === cell.pos.x && $(this).prop('y') === cell.pos.y };
    var celldiv = $('div#board>div.cell').filter(p);
    if (celldiv.length > 0) {
        celldiv.empty();
    } else {
        celldiv = $('<div>').addClass('cell').prop('x', cell.pos.x).prop('y', cell.pos.y);
        celldiv.css('left', 500-50+cell.pos.x*75);
        celldiv.css('top', 400-43+cell.pos.y*86-(cell.pos.x&1)*43);
        $('div#board').append(celldiv);
    }
    if (cell.pos.x === 0 && cell.pos.y === 0) {
        var centerimg = $('<img>').attr('src', cellImageCenter);
        celldiv.append(centerimg);
    } else if (!inboard(cell.pos)) {
        var borderimg = $('<img>').attr('src', cellImageBorder);
        celldiv.append(borderimg);
    } else {
        for (var i = 0; i < cell.path.length; i++) {
            var j = cell.path[i];
            if (i < j) {
                var pathimg = $('<img>');
                var hl = _.some(cell.hlpaths, function(x) { return x === i || x === j; });
                var cip = hl ? cellImageSelectedPaths : cellImagePaths;
                if ((i & 1) === 0) {
                    pathimg.attr('src', cip[j-i]);
                    pathimg.css('transform', 'rotate('+(i*30)+'deg)');
                } else {
                    pathimg.attr('src', cip[12-j+i]);
                    pathimg.css('transform', 'scaleX(-1) rotate('+(-i*30+30)+'deg)');
                }
                celldiv.append(pathimg);
            }
        }    
        var frameimg = $('<img>').attr('src', selected ? cellImageSelectedFrame : cellImageFrame);
        celldiv.append(frameimg);
    }
}

function clearboard() {
    function p() { return inboard({x:$(this).prop('x'), y:$(this).prop('y')}); }
    $('div#board>div.cell').filter(p).remove();
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

drawcell({pos:{x:0, y:0}});
var bpos = {x:0, y:-boardsize-1};
_([4, 6, 8, 10, 0, 2]).each(function(dir) {
    _.times(boardsize + 1, function() {
        drawcell({pos:bpos});
        bpos = getnextpos(bpos, dir);
    });
});

var cells = [];
var score = 0;

function moveforward(cell, enter) {
    var pos = cell.pos;
    while (cell) {
        score += cell.hlpaths.length;
        var exit = cell.path[enter];
        pos = getnextpos(pos, exit);
        enter = getnextenter(exit);
        if (!inboard(pos)) {
            return null;
        }
        cell = _.find(cells, function(c) { return matchpos(c.pos, pos); });
        if (cell) {
            cell.hlpaths.push(enter);
            drawcell(cell);
        }
    }
    return {pos:pos, enter:enter};
}

function randwalk() {
    var pos = {x:0, y:-1}, enter = 7;
    while (true) {
        var cell = {pos:pos, path:randpath(), hlpaths:[enter]};
        cells.push(cell);
        drawcell(cell);
        var nx = moveforward(cell, enter);
        if (!nx) {
            break;
        }
        pos = nx.pos;
        enter = nx.enter;
    }
}

var curcell;
var curenter;

function initgame() {
    clearboard();
    cells = []
    curcell = {pos:{x:0, y:-1}, path:randpath(), hlpaths:[]};
    curenter = 7;
    drawcell(curcell, true);
    score = 0;
    showscore();
    $('#play').prop('disabled', true);
}

function rotate(clockwise) {
    if (!curcell) {
        return;
    }
    var add = clockwise ? 2 : 10;
    var a = _.map(curcell.path, function(x) { return (x + add) % 12; });
    if (clockwise) {
        a.unshift(a.pop());
        a.unshift(a.pop());
    } else {
        a.push(a.shift());
        a.push(a.shift());
    }
    curcell.path = a;
    drawcell(curcell, true);
}

function nextcell() {
    if (!curcell) {
        return;
    }
    curcell.hlpaths = [curenter];
    cells.push(curcell);
    drawcell(curcell);
    var nx = moveforward(curcell, curenter);
    if (nx) {
        curcell = {pos:nx.pos, path:randpath(), hlpaths:[]};
        curenter = nx.enter;
        drawcell(curcell, true);
        showscore();
    } else {
        curcell = null;
        showscore();
        addhighscore();
        $('#play').prop('disabled', false);
    }
}

});
