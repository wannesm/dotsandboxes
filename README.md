Dots and Boxes application
==========================

Live demo: https://people.cs.kuleuven.be/wannes.meert/dotsandboxes/play

![Screenshot of Dots and Boxes](https://people.cs.kuleuven.be/wannes.meert/dotsandboxes/screenshot.png?v=2)

This setup is part of the course "Machine Learning: Project" (KU Leuven,
Faculty of engineering, Department of Computer Science,
[DTAI research group](https://dtai.cs.kuleuven.be)).


Installation
------------

The example agent is designed for Python 3.6 and requires the
[websockets](https://websockets.readthedocs.io) package. Dependencies can be
installed using pip:

    $ pip install -r requirements.txt


Start the game GUI
------------------

This program shows a web-based GUI to play the Dots and Boxes
game. This supports human-human, agent-human and agent-agent combinations.
It is a simple Javascript based application that runs entirely in the browser.
You can start it by opening the file `static/dotsandboxes.html` in a browser.
Or alternatively, you can start the app using the included simple server:

    $ ./dotsandboxesserver.py 8080

The game can then be played by directing your browser to http://127.0.0.1:8080.


Start the agent client
----------------------

This is the program that runs a game-playing agent. This application listens
to [websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
requests that communicate game information and sends back the next action it
wants to play.

Starting the agent client is done using the following command:

    $ ./dotsandboxesagent <port>

This starts a websocket on the given port that can receveive JSON messages.

The JSON messages given below should be handled by your agent.
Take into account the maximal time allowed to reply.

### Initiate the game

Both players get a message that a new game has started:

    {
        "type": "start",
        "player": 1,
        "timelimit", 0.5,
        "grid": [5, 5],
        "game": "123456"
    }

where `player` is the number assigned to this agent, `timelimit` is the
time in seconds in which you need to send your action back to the server,
and `grid` is the grid size in rows and columns.

If you are player 1, reply with the first action you want to perform:

    {
        "type": "action",
        "location": [1, 1],
        "orientation": "v"
    }

The field `location` is expressed as row and column (zero-based numbering) and
`orientation` is either "v" (vertical) or "h" (horizontal).


### Action in the game

When an action is played, the message sent to both players is:

    {
        "type": "action",
        "game": "123456",
        "player": 1,
        "nextplayer": 2,
        "score": [0, 0],
        "location": [1, 1],
        "orientation": "v"
    }


If it is your turn you should answer with a message that states your next
move:

    {
        "type": "action",
        "location": [1, 1],
        "orientation": "v"
    }


### Game end

When the game ends after an action, the message is slightly altered:

    {
        "type": "end",
        "game": "123456",
        "player": 1,
        "nextplayer": 0,
        "score": [3, 1],
        "location": [1, 1],
        "orientation": "v",
        "winner": 1
    }

The `type` field becomes `end` and a new field `winner` is set to the player
that has won the game.


Contact information
-------------------

- Wannes Meert,        https://people.cs.kuleuven.be/wannes.meert
- Hendrik Blockeel,    https://people.cs.kuleuven.be/hendrik.blockeel
- Arne De Brabandere,  https://people.cs.kuleuven.be/arne.debrabandere
- Sebastijan Dumančić, https://people.cs.kuleuven.be/sebastijan.dumancic
- Pieter Robberechts,  https://people.cs.kuleuven.be/pieter.robberechts

