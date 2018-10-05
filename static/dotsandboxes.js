/**
 * dotsandboxes.js
 *
 * Template for the Machine Learning Project course at KU Leuven (2017-2018)
 * of Hendrik Blockeel and Wannes Meert.
 *
 * Copyright (c) 2018 KU Leuven. All rights reserved.
 **/

function generateGuid() {
  var result, i, j;
  result = '';
  for(j=0; j<32; j++) {
    if( j == 8 || j == 12|| j == 16|| j == 20) 
      result = result + '-';
    i = Math.floor(Math.random()*16).toString(16).toUpperCase();
    result = result + i;
  }
  return result;
}

// GAME LOGIC

var cur_game = generateGuid();
var cur_player = 1;
var cur_ended = false;
var points = [0, 0, 0];
var timelimit = 0.5;
var nb_cols = 6;
var nb_rows = 6;
var data = new Array(0);
var alertstring = "";

function restart_game() {
  //console.log("Restarting game");
  cur_game = generateGuid();
  alertstring = "";
  nb_cols = parseInt(document.getElementById('nb-cols').value);
  if (nb_cols == "" || isNaN(nb_cols) || nb_cols < 1) {
    nb_cols = 6;
    alertstring += "Invalid number of columns, the default value of " + nb_cols.toString() + " is applied. ";
  }
  nb_rows = parseInt(document.getElementById('nb-rows').value);
  if (nb_rows == "" || isNaN(nb_rows) || nb_rows < 1) {
    nb_rows = 6;
    alertstring += "Invalid number of rows, the default value of " + nb_rows.toString() + " is applied. ";

  }
  timelimit = parseFloat(document.getElementById('timelimit').value);
  if (timelimit == "" || isNaN(timelimit) || timelimit < 0) {
    timelimit = 0.5 ;
    alertstring += "Invalid time limit, the default value of " + timelimit.toString() + " is applied. ";
  }
  if (alertstring != ""){
    alert(alertstring);
  }
  cur_ended = false;
  console.log("Starting game", cur_game);
  points = [0, 0, 0];
  cur_player = 1;
  var old_length = 0;
  for (var ri=0; ri<nb_rows + 1; ri++) {
    if (ri >= data.length) {
      data.push(new Array(0));
    }
    var row = data[ri];
    for (var ci=0; ci<nb_cols + 1; ci++) {
      if (ci >= row.length) {
        row.push({l:0, t:0, p:0, r:0, c:0});
      }
      var l = 0;
      var t = 0;
      var p = 0;
      if (ri == nb_rows) {
        l = undefined;
        p = undefined;
      }
      if (ci == nb_cols) {
        t = undefined;
        p = undefined
      }
      var cell = row[ci];
      cell.l = l;
      cell.t = t;
      cell.p = p;
      cell.r = ri;
      cell.c = ci;
    }
    old_length = row.length;
    for (var ci=nb_cols + 1; ci<old_length; ci++) {
      row.pop();
    }
  }
  old_length = data.length;
  for (var ri=nb_rows + 1; ri<old_length; ri++) {
    data.pop();
  }
}

function user_click(cell, o) {
  if (cur_ended) {
    //console.log('Game ended, ignoring click');
    return;
  }
  console.log('User click', cell, o);
  var won_cell = false;
  var c = cell.c;
  var r = cell.r;
  var msg = {
    type: "action",
    game: cur_game,
    player: cur_player,
    nextplayer: cur_player,
    score: [points[1], points[2]],
    location: [r, c],
    orientation: o
  };
  if (o == "h") {
    if (cell.t != 0) {
      return;
    }
    cell.t = cur_player;
    // Above
    if (r > 0) {
      if (data[r - 1][c].l != 0
        && data[r - 1][c + 1].l != 0
        && data[r - 1][c].t != 0
        && data[r][c].t != 0) {
        won_cell = true;
        points[cur_player] += 1;
        data[r - 1][c].p = cur_player;
      }
    }
    // Below
    if (r < nb_rows) {
      if (data[r][c].l != 0
        && data[r][c + 1].l != 0
        && data[r][c].t != 0
        && data[r + 1][c].t != 0) {
        won_cell = true;
        points[cur_player] += 1;
        data[r][c].p = cur_player;
      }
    }
  }

  if (o == "v") {
    if (cell.l != 0) {
      return;
    }
    cell.l = cur_player;
    // Left
    if (c > 0) {
      if (data[r][c - 1].l != 0
        && data[r][c].l != 0
        && data[r][c - 1].t != 0
        && data[r + 1][c - 1].t != 0) {
        won_cell = true;
        points[cur_player] += 1;
        data[r][c - 1].p = cur_player;
      }
    }
    // Right
    if (c < nb_cols) {
      if (data[r][c].l != 0
        && data[r][c + 1].l != 0
        && data[r][c].t != 0
        && data[r + 1][c].t != 0) {
        won_cell = true;
        points[cur_player] += 1;
        data[r][c].p = cur_player;
      }
    }
  }

  msg["score"] = [points[1], points[2]];

  if (!won_cell) {
    cur_player = 3 - cur_player;
    msg.nextplayer = cur_player;
  }
  update_board();
  if (points[1] + points[2] == nb_cols * nb_rows) {
    // Game over
    var winner = 1
    if (points[2] == points[1]) {
      winner = 0;
    }
    if (points[2] > points[1]) {
      winner = 2;
    }
    cur_ended = true;
    msg.type = "end";
    msg.nextplayer = 0;
    msg.winner = winner;
  }
  send_to_agents(msg);
}

var field_margin = 10;
var cell_width = 40;
var cell_margin = 4;
var player_height = 40;
var width = 400;
var height = 600;
var line_width = 5;

var player_color = [
  "#E6E6E6",
  "#FC6666",
  "#0F80FF"
];

var svg = d3.select("#playing-area").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate("+field_margin+","+field_margin+")");

var player = svg.append("g")
  .attr("class", "player")
  .attr("transform", "translate(0,10)");

var field = svg.append("g")
  .attr("class", "field")
  .attr("transform", "translate(0,"+player_height+")");


function update_board() {
  // PLAYERS - enter & update
  var player_text = player.selectAll("text")
    .data([cur_player, cur_player]);

  player_text = player_text.enter().append("text")
    .attr("x", function(c, i) { return i * 100;})
    .merge(player_text)
      .text(function(c, i) {return "Player " + (i + 1) + ": "+points[i + 1];})
      .attr("fill", function(c, i) {
        if (c == i + 1) {
          return player_color[c];
        } else {
          return player_color[0];
        }
      });

  // ROWS - enter & update
  var rows = field.selectAll(".row")
    .data(data)
      .attr("fill", function() {return null;});

  rows.exit().remove();

  rows = rows.enter().append("g")
      .attr("class", "row")
      .attr("transform", function(row, i) {return "translate(0," + cell_width * i + ")";})
    .merge(rows);

  // COLS - enter & update
  var cols = rows.selectAll(".col")
    .data(function(col) {return col;});

  cols.exit().remove();

  var cols_enter = cols.enter().append("g")
      .attr("class", "col")
      .attr("transform", function(col, ri) {return "translate("+cell_width * ri+",0)";});

  // CELL - enter
  cols_enter.append("rect")
    .attr("class", "cell")
    .attr("rx", cell_margin)
    .attr("ry", cell_margin)
    .attr("opacity", 0.25)
    .attr("x", cell_margin)
    .attr("y", cell_margin)
    .attr("width", cell_width - 2*cell_margin)
    .attr("height", cell_width - 2*cell_margin);

  // HLINE - enter
  cols_enter.append("line")
    .attr("class", "hline")
    .attr("x1", function(cell, ci) {return cell_margin;})
    .attr("x2", function(cell, ci) {return cell_width - cell_margin;})
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke-linecap", "round")
    .attr("stroke", function(cell) {return player_color[cell.t];});

  cols_enter.append("path")
    .attr("d", "M"+cell_margin+",0"+
               "L"+(cell_width/2)+",-"+(cell_width/3)+
               "L"+(cell_width-cell_margin)+",0"+
               "L"+(cell_width/2)+","+(cell_width/3)+"Z")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("opacity", "0")
    .on("click", function(cell) {
      if (agents[cur_player].active == true) {
        console.log("Ignoring click, automated agent")
      } else {
        user_click(cell, "h");
      }
    });

  // VLINE - enter
  cols_enter.append("line")
    .attr("class", "vline")
    .attr("y1", function(cell, ci) {return cell_margin;})
    .attr("y2", function(cell, ci) {return cell_width - cell_margin;})
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("stroke-linecap", "round")
    .attr("stroke", function(cell) {return player_color[cell.l];});

  cols_enter.append("path")
    .attr("d", "M0,"+cell_margin+
               "L-"+(cell_width/3)+","+(cell_width/2)+
               "L0,"+(cell_width-cell_margin)+
               "L"+(cell_width/3)+","+(cell_width/2)+"Z")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("opacity", "0")
    .on("click", function(cell) {
      if (agents[cur_player].active == true) {
        console.log("Ignoring click, automated agent");
      } else {
        user_click(cell, "v");
      }
    });

  cols = cols_enter
    .merge(cols);

  // HLINE - update
  cols.selectAll(".hline")
    .attr("stroke-width", function(cell) {
      if (typeof(cell.t) == "undefined") {
        return 0;
      }
      return line_width;
    })
    .attr("stroke", function(cell) {return player_color[cell.t];});

  // VLINE - update
  cols.selectAll(".vline")
    .attr("stroke-width", function(cell, ci) {
      if (typeof(cell.l) == "undefined") {
        return 0;
      }
      return line_width;
    })
    .attr("stroke", function(cell) {return player_color[cell.l];});

  // CELL - update
  cols.selectAll(".cell")
    .attr("fill", function(cell) {
      if (cell.p == undefined) {
        return "white";
      }
      return player_color[cell.p];
    });
}


// AGENT CONNECTIONS

var agents = [
  {},
  {address: undefined, active: false, socket: undefined},
  {address: undefined, active: false, socket: undefined}
];

var msg_queue = [];


function start_connections() {
  for (var i=1; i<3; i++) {
    agents[i] = {address:undefined, active: false, socket: undefined};
    var address = document.getElementById('agent'+i).value;
    console.log('Address agent'+i+': '+address);
    if (address != "") {
      //console.log("Starting websocket for agent "+i+" on address "+address);
      var agent = agents[i];
      agent.address = address;
      agent.socket = new WebSocket(address);
      agent.socket.onopen = (function (ii, iagent) { return function(event) {
        console.log("Agent "+ii+" connected")
        iagent.active = true;
        iagent.socket.onmessage = function(event) {
          var msg = JSON.parse(event.data);
          //console.log("Get msg from agent "+ii, msg);
          if (msg.type == "action") {
            if (cur_player == ii) {
              console.log("Received action from ACTIVE player "+ii, msg);
              user_click(data[msg.location[0]][msg.location[1]], msg.orientation);
            } else {
              console.log("Received action from NON-ACTIVE player "+ii, msg);
            }
          }
          return false;
        };
        iagent.socket.onclose = function(event) {
          console.log("Closing connection to agent "+ii);
        };
        iagent.socket.onerror = function(event) {
          console.log("Error on connection to agent "+ii, event);
        };
        msg = {
          "type": "start",
          "player": ii,
          "timelimit": timelimit,
          "game": cur_game,
          "grid": [nb_rows, nb_cols]
        };
        iagent.socket.send(JSON.stringify(msg));
      };}(i, agent));
    }
  }
}


function send_to_agents(msg) {
  msg_queue.push(JSON.stringify(msg));
  try_sending_to_agents();
}


function try_sending_to_agents() {
  var all_connected = true;
  for (var i=1; i<3; i++) {
    if (agents[i].address !== undefined && agents[i].active == false) {
      all_connected = false;
      break;
    }
  }
  if (!all_connected) {
    // Wait until all are connected
    setTimeout(try_sending_to_agents, 100);
  } else {
    if (msg_queue.length == 0 ) {
      return;
    }
    var msg = msg_queue.shift();
    console.log("Send msg to agents", msg);
    for (var i=1; i<3; i++) {
      if (agents[i].active == true) {
        agents[i].socket.send(msg);
      }
    }
  }
}


// STARTUP

function restart() {
  restart_game();
  update_board();
  start_connections();
}

var restartbtn = document.getElementById("restart-btn");
restartbtn.onclick = function() {
  console.log("Restart game");
  restart();
};

restart();
