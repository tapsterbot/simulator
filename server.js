var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var argv = require('minimist')(process.argv.slice(2));
var five = require("johnny-five");

if (argv.noboard === true) {
  // Create a fake board
  var board = {};
  board.on = function(){};
  board.isReady = false;
} else {
  var board = new five.Board({repl:true});
}

var servo;

//SERVO_MIN = 37;
//SERVO_MAX = 163;
LEFT_SERVO_MIN = 42;
LEFT_SERVO_MAX = 155;
RIGHT_SERVO_MIN = 24;
RIGHT_SERVO_MAX = 137;


// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.use('/', express.static(__dirname + '/site'));

io.on('connection', function (socket) {
  socket.on('angle', function (data) {
    if (board.isReady) {
      console.log(data);
      if (data.side == "left") {
        if (data.angle >=0 && data.angle <= 180) {
          leftServo.to((data.angle).map(0, 180, LEFT_SERVO_MIN, LEFT_SERVO_MAX))
        }
      } else if (data.side == "right") {
        if (data.angle >=0 && data.angle <= 180) {
          rightServo.to((data.angle).map(0, 180, RIGHT_SERVO_MIN, RIGHT_SERVO_MAX))
        }      
      }
    }
  });
});

server.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});

board.on("ready", function() {
  leftServo = new five.Servo({
    controller: "PCA9685",
    pin: 0,
    invert: true
  });

  rightServo = new five.Servo({
    controller: "PCA9685",
    pin: 1,
    invert: true
  });  

  this.repl.inject({
    leftServo: leftServo,
    rightServo: rightServo
  });
});

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}