<?php

function make_level () {
  $seed = mt_rand(1,100);
  mt_srand($seed);
  echo "<h1>$seed</h1>";
  $blocks = mt_rand(10, 20);
  $boxes = generate_blocks($blocks);
  $boxes['length'] = count($boxes);

  $bounds = array('x1' => 0, 'y1' => 0, 'x2' => 0, 'y2' => 0);
  for ($i=0; $i < $boxes['length']; $i++) {
    $box = $boxes[$i];
    if ($box['x'] < $bounds['x1']) {
      $bounds['x1'] = $box['x'];
    }
    if ($box['x'] + $box['width'] > $bounds['x2']) {
      $bounds['x2'] = $box['x'] + $box['width'];
    }
    if ($box['y'] < $bounds['y1']) {
      $bounds['y1'] = $box['y'];
    }
    if ($box['y'] + $box['height'] > $bounds['y2']) {
      $bounds['y2'] = $box['y'] + $box['height'];
    }
  }
  $boxes['bounds'] = $bounds;
  return $boxes;
  // Foreach block
  //   # STAGE 1
  // - Generate paths
  // - Generate walls
  //   # STAGE 2
  // - Generate start + exit
  // - Generate destructibles
  // - Generate Collectibles
  // - Generate AI

}

$dir = array();
$dir['x'] = array(1,0,-1,0);
$dir['y'] = array(0,-1,0,1);

function generate_blocks($blocks) {
  // The creation snake
  // Middgarsormen!
  global $dir;
  $grid = array();
  // OD = old direction
  $od = -1; $x = 0; $y = 0;
  $boxes = array();
  for ($i=0; $i < $blocks; $i++) {
    // Timeout in case the snake bites its own tail!
    $timeout = 10;
    do {
      $direction = mt_rand(0,3);
      $length = mt_rand(1,3);
      if ($od != $direction) {
        $timeout--;
        $is_clear = true;
        for ($j = 1; $j <= $length; $j++) {
          $tx = $x + $j * $dir['x'][$direction];
          $ty = $y + $j * $dir['y'][$direction];

          if (
            array_key_exists($tx, $grid) &&
            is_array($grid[$tx]) &&
            array_key_exists($ty, $grid[$tx]) &&
            $grid[$tx][$ty] == 1
          ) { // This spot in the grid is taken!
            $is_clear = false;
          }
        }
      }
    } while (!$is_clear && $timeout > 0);

    if ($timeout <= 0) {
      break;
    }
    $od = $direction;

    // Claim space in grid
    for ($j = 0; $j <= $length; $j++) {
      $tx = $x + $j * $dir['x'][$direction];
      $ty = $y + $j * $dir['y'][$direction];
      if (array_key_exists($tx, $grid)) {
        $grid[$tx][$ty] = 1;
      }
      else {
        $grid[$tx] = array();
        $grid[$tx][$ty] = 1;
      }
    }

    // Create a box
    $box = array(
      'dir' => $direction,
      'xd' => $length*$dir['x'][$direction],
      'yd' => $length*$dir['y'][$direction],
    );
    $box['width'] = abs($box['xd'])+1;
    $box['height'] = abs($box['yd'])+1;
    $box['x'] = (($box['xd'] >= 0) ? $x : $x + $box['xd']);
    $box['y'] = (($box['yd'] >= 0) ? $y : $y + $box['yd']);
    $box['start'] = array(
      'x' => (($box['xd'] >= 0) ? 0 : $box['width']),
      'y' => (($box['yd'] >= 0) ? 0 : $box['height'])
    );
    $box['end'] = array(
      'x' => (($box['xd'] >= 0) ? $box['width'] : 0),
      'y' => (($box['yd'] >= 0) ? $box['height'] : 0)
    );

    // Set new x and y
    $x += $box['xd'];
    $y += $box['yd'];

    $boxes[] = $box;
  }

  return $boxes;
}