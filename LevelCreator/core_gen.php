<?php
// Bring in the books
require_once "core_blueprint.php";
require_once "core_walk.php";
require_once "core_carve.php";
require_once "core_stamps.php";


// Set the seed:
mt_srand(5);

// Begin the map
$map = array();

// Generate the blueprint roomes
$blueprints = generate_blueprint(); // 90%
$level_length = count($blueprints);

// For each room
foreach ($blueprints as $depth => $room) {

  // In order to add extra depth to the complexity of each level
  // we'll generate walks at different scales
  $scale = walk_scale(); // 0%;

  // Generate a path (using global coordinates)
  $walk = walk_room(
    $room['bounds'],
    $room['start'],
    $room['end'],
    $scale
  ); // 80%

  // Use the walk to generate branches
  // $walk = walk_branch($walk); // 10%

  // We have no further need of the room nor the walk beyond this point
  // The level can now be carved in stone
  // The walk is just a 2d array of numbers (0, 1 and 2's)
  // * 0 = empty
  // * 1 = wall
  // * 2 = path
  // * 3 = branch
  carve($map, $walk); // 0%

  // One special finishing touch is to "join" the rooms
  // This is done using stamps
  if ($depth === 0) {
    stamp_start($map, $room['start']);
  } else {
    stamp_join($map, $room['start']);
  }
  if ($depth === $level_length -1) {
    stamp_exit($map, $room['end']);
  }
}

// Use JS to draw in canvas ..
echo json_encode($map);