// circle-intersect.js
// Determine the points where 2 circles in a common plane intersect.
//
//  intersection(
//               // 1st circle - center coordinates and radius
//               x0, y0, r0,
//               // 2nd circle
//               x1, y1, r1)
//  returns:
//               // status code (0 for error, 1 for success)
//               [ status_code,
//               // 1st intersection point
//               [x3, y3,              
//               // 2nd intersection point
//               x4, y4x]]
//
// Based on "Intersection of two circles" (http://paulbourke.net/geometry/circlesphere/)
// C version by Tim Voght 3/26/2005. "This is a public domain work."
// Port of C version to JavaScript, Copyright (c) 2014 Jason R. Huggins (MIT License)

function intersection(x0, y0, r0, x1, y1, r1) {
  var a, dx, dy, d, h, rx, ry;
  var x2, y2;

  // dx and dy are the vertical and horizontal distances between
  // the circle centers.
  dx = x1 - x0;
  dy = y1 - y0;

  // Determine the straight-line distance between the centers.
  d = Math.sqrt((dy*dy) + (dx*dx));

  // Check for solvability.
  if (d > (r0 + r1)) {
    // No solution. Circles do not intersect.
    return [0, []];
  }
  if (d < Math.abs(r0 - r1)) {
    // No solution. One circle is contained in the other
    return [0, []];
  }

  // 'Point 2' is the point where the line through the circle
  // intersection points crosses the line between the circle
  // centers.

  // Determine the distance from point 0 to point 2.
  a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d) ;

  // Determine the coordinates of point 2.
  x2 = x0 + (dx * a/d);
  y2 = y0 + (dy * a/d);

  // Determine the distance from point 2 to either of the
  // intersection points.
  h = Math.sqrt((r0 * r0) - (a * a));

  // Now determine the offsets of the intersection points from
  // point 2.
  rx = -dy * (h/d);
  ry = dx * (h/d);

  // Determine the absolute intersection points.
  x3 = x2 + rx;
  y3 = y2 + ry;  

  x4 = x2 - rx;
  y4 = y2 - ry;

  return [1, [x3, y3, x4, y4]];
};

function test_intersection(x0, y0, r0, x1, y1, r1) {
  console.log("x0=%d, y0=%d, r0=%d, x1=%d, y1=%d, r1=%d :\n",
          x0, y0, r0, x1, y1, r1);
  
  result = intersection(x0, y0, r0, x1, y1, r1);
  
  console.log(result + '\n')
};

function runTests() {
  test_intersection(-1, -1, 1.5, 1, 1, 2);
  test_intersection(1, -1, 1.5, -1, 1, 2);
  test_intersection(-1, 1, 1.5, 1, -1, 2);
  test_intersection(1, 1, 1.5, -1, -1, 2);
}