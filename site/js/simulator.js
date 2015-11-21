var socket = io();
paper = Snap("#svg");


nexus5 = {
  height: 137.9,
  width: 69.2
}

iphone = {
  height: 200,
  width: 100
}

tablet = {
  height: 266,
  width: 178
}

tablet2 = {
  height: 178,
  width: 266
}

drawPhone = function(phone) {
  var rect = paper.rect(-phone.height/2,
                    -phone.width-35,
                     phone.height,
                     phone.width);
  //rect.attr({fill: "rgba(0,0,0,0.2)", cursor: "none" });
  rect.attr({fill: "rgba(0,0,0,0.2)"});
  return rect;
}


phone = drawPhone(nexus5);
//phone = drawPhone(iphone);


////////////////////////////////////////////////

/*  Normal
leftCenterX = -8*6;
leftCenterY = 40;

rightCenterX = 8*6;
rightCenterY = 40;

baseArmRadius = 8*8;
forearmRadius = 8*13;
*/

/* Custom */
leftCenterX = -8*4;
leftCenterY = 40;

rightCenterX = 8*4;
rightCenterY = 40;

baseArmRadius = 8*9;
forearmRadius = 8*13;



////////////////////////////////////////////////
dragBaseArmEvent = function(dx, dy, posx, posy) {
  // Convert the mouse/touch X and Y so that it's relative to the svg element
  var pt = svg.createSVGPoint();
  pt.x = posx;
  pt.y = posy;
  var transformed = pt.matrixTransform(svg.getScreenCTM().inverse());

  moveBaseArm(this, transformed.x, transformed.y);
}

////////////////////////////////////////////////
moveBaseArm = function(arm, posx, posy) {
  var cx = parseInt(arm.attr('cx'));
  var cy = parseInt(arm.attr('cy'));
  var cr = parseInt(arm.attr('cr'));

  var result = limit(posx, posy, cx, cy, cr);
  arm.attr({"x2": result.x, "y2": result.y});

  var forearmName = arm.attr('linkedTo');
  var forearm = window[forearmName];

  var side = arm.attr('side');
  if (side == "left") {
    points = intersection(parseInt(arm.attr('x2')),
                          parseInt(arm.attr('y2')),
                          forearmRadius,
                          parseInt(rightBaseArm.attr('x2')),
                          parseInt(rightBaseArm.attr('y2')),
                          forearmRadius);
  } else {
    points = intersection(parseInt(arm.attr('x2')),
                          parseInt(arm.attr('y2')),
                          forearmRadius,
                          parseInt(leftBaseArm.attr('x2')),
                          parseInt(leftBaseArm.attr('y2')),
                          forearmRadius);
  }

  var forearmName = arm.attr('linkedTo');
  var forearm = window[forearmName];

  if (points[0] == 1) {
    if (side == "left") {
      forearm.attr({"x1": result.x,
                    "y1": result.y,
                    "x2": points[1][2],
                    "y2": points[1][3]
      });
      moveForearm(rightForearm, points[1][2], points[1][3]);
    } else {
      forearm.attr({"x1": result.x,
                    "y1": result.y,
                    "x2": points[1][0],
                    "y2": points[1][1]
      });
      moveForearm(leftForearm, points[1][0], points[1][1]);
    }
  }
}



////////////////////////////////////////////////
dragForearmEvent = function(dx, dy, posx, posy) {
  // Convert the mouse/touch X and Y so that it's relative to the svg element
  var pt = svg.createSVGPoint();
  pt.x = posx;
  pt.y = posy;
  var transformed = pt.matrixTransform(svg.getScreenCTM().inverse());

  moveForearm(this, transformed.x, transformed.y);
}


moveForearm = function(arm, posx, posy) {
  var side = arm.attr('side');
  if (side == "left") {
    points = intersection(leftCenterX,leftCenterY,baseArmRadius, posx, posy, forearmRadius);
  } else {
    points = intersection(rightCenterX,rightCenterY,baseArmRadius, posx, posy, forearmRadius);
  }

  var baseArmName = arm.attr('linkedTo');
  var baseArm = window[baseArmName];

  if (points[0] == 1) {
    // points are inside the limit
    if (side == "left") {
      arm.attr({"x2": posx,
                 "y2": posy,
                 "x1": points[1][2],
                 "y1": points[1][3]
      });
    } else {
      arm.attr({"x2": posx,
                "y2": posy,
                "x1": points[1][0],
                "y1": points[1][1]
      });
    }

    var armAngle = angle360(baseArm.attr('x1').toFloat(),
                         baseArm.attr('y1').toFloat(),
                         baseArm.attr('x2').toFloat(),
                         baseArm.attr('y2').toFloat())

    if (side == "left") {
      armAngle -= 135;
      baseArm.attr({"x2": points[1][2],
                    "y2": points[1][3]});
    } else {
      armAngle -= 225;
      if (armAngle <= 0) {
        armAngle = 360 + armAngle;
      }
      baseArm.attr({"x2": points[1][0],
                    "y2": points[1][1]});
    }
    
    socket.emit('angle', { side: side, angle: armAngle});
    
  } else {
    // points are outside the limits
    var cx = parseInt(arm.attr('x1'));
    var cy = parseInt(arm.attr('y1'));
    var cr = parseInt(arm.attr('cr'));
    var result = limit(posx, posy, cx, cy, cr);
    arm.attr({"x2": result.x, "y2": result.y});
    if (side == "left") {
      var result = limit(posx, posy, leftCenterX, leftCenterY, baseArmRadius);
    } else {
      var result = limit(posx, posy, rightCenterX, rightCenterY, baseArmRadius);
    }
    arm.attr({"x1": result.x, "y1": result.y});
    baseArm.attr({"x2": result.x, "y2": result.y});
  }

}
Simulator = function(){};
Simulator.prototype.leftBoundaryCirle = paper.circle(leftCenterX, leftCenterY, baseArmRadius+forearmRadius);
Simulator.prototype.leftBoundaryCirle.attr({ class: "boundary-circle" });

Simulator.prototype.rightBoundaryCirle = paper.circle(rightCenterX, rightCenterY, baseArmRadius+forearmRadius);
Simulator.prototype.rightBoundaryCirle.attr({ class: "boundary-circle" });

////////////////////////////////////////////////
Simulator.prototype.leftBaseCircle = paper.circle(leftCenterX, leftCenterY, baseArmRadius);
Simulator.prototype.leftBaseCircle.attr({ class: "base-circle" });

Simulator.prototype.leftStepper = paper.rect(leftCenterX-20,leftCenterY-20,40,40,5,5);
Simulator.prototype.leftStepper.attr({ class: "stepper" });

////////////////////////////////////////////////
Simulator.prototype.rightBaseCircle = paper.circle(rightCenterX, rightCenterY, baseArmRadius);
Simulator.prototype.rightBaseCircle.attr({ class: "base-circle" });

Simulator.prototype.rightStepper = paper.rect(rightCenterX-20,rightCenterY-20,40,40,5,5)
Simulator.prototype.rightStepper.attr({ class: "stepper" });

////////////////////////////////////////////////
leftBaseArm = paper.line(leftCenterX,
                         leftCenterY,
                         leftCenterX,
                         leftCenterY-(baseArmRadius));
leftBaseArm.attr({
  class: "base-arm",
  cx: leftCenterX,
  cy: leftCenterY,
  cr: baseArmRadius,
  linkedTo: "leftForearm",
  side: "left"
});

leftBaseArm.drag(dragBaseArmEvent);

////////////////////////////////////////////////
leftForearm = paper.line(leftCenterX,
                         leftCenterY-baseArmRadius,
                         leftCenterX+forearmRadius,
                         leftCenterY-baseArmRadius);
leftForearm.attr({
  class: "forearm",
  cr: forearmRadius,
  linkedTo: "leftBaseArm",
  side: "left"
});

leftForearm.drag(dragForearmEvent);

//leftForearm.move = function(){ return this; };

////////////////////////////////////////////////
rightBaseArm = paper.line(rightCenterX, rightCenterY, rightCenterX, rightCenterY-baseArmRadius);
rightBaseArm.attr({
  class: "base-arm",
  cx: rightCenterX,
  cy: rightCenterY,
  cr: baseArmRadius,
  linkedTo: "rightForearm",
  side: "right"
});

rightBaseArm.drag(dragBaseArmEvent);

////////////////////////////////////////////////
rightForearm = paper.line(rightCenterX,
                          rightCenterY-baseArmRadius,
                          rightCenterX+forearmRadius,
                          rightCenterY-baseArmRadius);
rightForearm.attr({
  class: "forearm",
  cr: forearmRadius,
  linkedTo: "rightBaseArm",
  side: "right"
});

rightForearm.drag(dragForearmEvent);

////////////////////////////////////////////////
dragPointerEvent = function(dx, dy, posx, posy) {
  // Convert the mouse/touch X and Y so that it's relative to the svg element
  var pt = svg.createSVGPoint();
  pt.x = posx;
  pt.y = posy;
  var transformed = pt.matrixTransform(svg.getScreenCTM().inverse());

  // Floor
  if (transformed.y > -10) {
    transformed.y = -10;
  }

  // Ceiling
  //if (transformed.y < -109) {
  //  transformed.y = -109;
  //}

  // Wall
  //if (Math.abs(transformed.x) > 110) {
  //  transformed.x = Math.abs(transformed.x) / transformed.x * 110;
  //}

  // Check to see new point is outside the boundary
  var leftDistance = Math.sqrt(Math.pow(leftCenterX - transformed.x, 2) +
                               Math.pow(leftCenterY - transformed.y, 2));

  // Subtract 4 from radius to keep the arm slightly bent and prevent a singularity.
  // (Yes, *the* singularity. You've been warned...)
  var inLeftCircle = (leftDistance <= baseArmRadius + forearmRadius - 4);

  // Check to see new point is outside the boundary
  var rightDistance = Math.sqrt(Math.pow(rightCenterX - transformed.x, 2) +
                                Math.pow(rightCenterY - transformed.y, 2));

  // Subtract 4 from radius to keep the arm slightly bent and prevent a singularity.
  // (Yes, *the* singularity. You've been warned...)
  // (And, yes, it's a paradox that there could be two singularities. Best to not think about it...)
  var inRightCircle = (rightDistance <= baseArmRadius + forearmRadius - 4);

  if (inLeftCircle && inRightCircle) {
    this.attr({"cx": transformed.x, "cy": transformed.y});
    moveForearm(leftForearm, transformed.x, transformed.y);
    moveForearm(rightForearm, transformed.x, transformed.y);
  } else {
    if (this.attr('cx') <= 0) {
      var result = limit(transformed.x, transformed.y, rightCenterX, rightCenterY, baseArmRadius+forearmRadius-4);
    } else {
      var result = limit(transformed.x, transformed.y, leftCenterX, leftCenterY, baseArmRadius+forearmRadius-4);
    }
    this.attr({"cx": result.x, "cy": result.y});
    moveForearm(leftForearm, result.x, result.y);
    moveForearm(rightForearm, result.x, result.y);
  }
}

pointer = paper.circle(0, -75, 4);
pointer.attr({ class: "pointer" });

pointer.click(function(){
  console.log('Pointer clicked!');
});

pointer.drag(dragPointerEvent);


moveForearm(leftForearm, 0, pointer.attr('cy'));
moveForearm(rightForearm, 0, pointer.attr('cy'))

////////////////////////////////////////////////
Simulator.prototype.showCircles = function() {
  this.leftBaseCircle.attr({visibility:"visible"});
  this.rightBaseCircle.attr({visibility:"visible"});
  this.leftBoundaryCirle.attr({visibility:"visible"});
  this.rightBoundaryCirle.attr({visibility:"visible"});
};

Simulator.prototype.hideCircles = function() {
  this.leftBaseCircle.attr({visibility:"hidden"});
  this.rightBaseCircle.attr({visibility:"hidden"});
  this.leftBoundaryCirle.attr({visibility:"hidden"});
  this.rightBoundaryCirle.attr({visibility:"hidden"});
};


////////////////////////////////////////////////
yAxis = paper.line(0, 1000, 0, -1000);
yAxis.attr({class: 'axis'});

xAxis = paper.line(-500, 0, 500, 0);
xAxis.attr({class: 'axis'});

showAxes = function() {
  xAxis.attr({visibility:"visible"});
  yAxis.attr({visibility:"visible"});
}

hideAxes = function() {
  xAxis.attr({visibility:"hidden"});
  yAxis.attr({visibility:"hidden"});
}

showAxes();

////////////////////////////////////////////////
// Inital UI Setup:
//showCircles();
sim = new Simulator();

