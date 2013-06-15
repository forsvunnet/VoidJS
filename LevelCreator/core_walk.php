<?php
function walk_scale() { // 10%
  return rand(0, 100);
}
function walk_room($bounds, $start, $end, $scale) { // 50%
  $args = array(&$bounds, &$start, &$end);
  foreach ($args as &$coord){ foreach ($coord as &$value) { $value *= $scale; }}
  // * 0 = empty
  // * 1 = wall
  // * 2 = path
  // * 3 = branch
  $walk = array();//'scale' => $scale);
  $coord = $start;
  //$bounds = bounds();
  for ($x = $bounds[0]; $x <= $bounds[2]; $x++) {
    for ($y = $bounds[1]; $y <= $bounds[3]; $y++) {
      $walk[$x][$y] = 0;
    }
  }
  var_dump($walk);
  dbm($walk); die();
  
  // Punch start into the walk
  list($x, $y) = $start;
  $walk = walk_punch($x, $y, $walk);

  // Loop until we reach the target
  while ($coord[0] != $end[0] && $coord[1] != $end[1]) {
    $next_step = walk_next_step($walk, $coord, $bounds);
    list($x, $y) = $next_step; 
    $sketch = walk_punch($x, $y, $walk);
    // Sketch is now the new theoretical $walk
    // before we can approve the step we need to check that the exit is still accesible
    $astar = astar(
      // .....#x#.
      // .#####x#.
      // .#xxxxx#.
      // .#######.
      // .........
      // Must be:
      // .....#x#.
      // .#.###x#.
      // ..xxxxx#.
      // .#.#####.
      // .........

      walk_free($sketch, $bounds, $next_step),
      $next_step,
      $end
    );
    if ($astar) {
      $walk = $sketch;
    }
  }
}
// Clear a hole in the wall so that astar can walk through
function walk_free($sketch, $bounds, $next_step) { // 100%
  list($x, $y) = $next_step;
  $neighbors = array();
  foreach (walk_neighbor($x, $y, $bounds, FALSE) as $neighbor){
    list($nx, $ny) = $neighbor;
    if ($sketch[$nx][$ny] === 1) {
      // Clear a hole in the wall so that astar can walk through
      $sketch[$nx][$ny] = 0;
    }
  }
  return $sketch;
}

// Pick a random next step given a coord (next step MUST BE WALL type)
function walk_next_step($walk, $coord, $bounds) { // 100%
  list($x, $y) = $coord;
  $neighbors = array();
  foreach (walk_neighbor($x, $y, $bounds, FALSE) as $neighbor){
    list($nx, $ny) = $neighbor;
    if ($walk[$nx][$ny] === 1) {
      $neighbors[] = $neighbor;
    }
  }
  // Pick a random direction within bounds and return coordinates
  return $neighbors[mt_rand(0, count($neighbors)-1)];
}
// Punch the coordinate into the given $walk with walls around
function walk_punch($x, $y, $walk, $path = 2, $fill = 1, $force = FALSE) { // 100%
  $walk[$x][$y] = $path;
  // Walls to the path:
  foreach (walk_neighbor($coord) as $neighbor) {
    list($x, $y) = $neighbor;
    if ($walk[$x][$y] === 0 || $force) {
      $walk[$x][$y] = $fill;
    }
  }
  return $walk;
}
// Walk through the path and generate branches
function walk_branch($walk, $bounds) { // 10%
  foreach ($walk as $x => $row) {
     foreach ($row as $y => $value) {
        if ($value == 1) {
          
          // This is on the path
          if (mt_rand(0, 5) > 4) {
            $clear = walk_branch_neighbor($x, $y, $walk, $bounds);
            list($x, $y) = $clear[mt_rand(0, count($clear)-1)];
            $walk[$x][$y] = 3;
          }

        }
     }
  }
  return $walk;
}

// Find all non-diagonal wall neighbors:
function walk_branch_neighbor($x, $y, $walk, $bounds = FALSE) { //100%
  $neighbors = array();
  foreach (walk_neighbor($x, $y, $bounds, FALSE) as $neighbor) {
    list($x, $y) = $neighbor;
    if ($walk[$x][$y] === 1) {
      $neighbors[] = $neighbor;
    }
  }
  return $neighbors;
}
function walk_neighbor($x, $y, $bounds = FALSE, $diag = TRUE) { // 0%
  
}
function bounds($start, $end) { // Redundant
  // 0 = lowest x
  // 1 = lowest y
  // 2 = highest x
  // 3 = highest y

}