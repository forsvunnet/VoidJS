<?php


function dbm($matrix) {
  //var_dump($matrix);
  foreach ($matrix as $x => $col) {
    if (is_array($col)) {
      foreach ($col as $y => $val) {
        dbm_draw($x,$y,$val);
      }
    } elseif (is_string($col)) {
      for ($y = 0; $y < strlen($col); $y++) {
        dbm_draw($x, $y, $col[$y]);
      }
    }
  }
}

function dbm_draw($x,$y,$val) {
  $size = 5;
  $color = array(
    '#FFF', '#C00', '#F09', '#09F',
    'P' => '#F09', 'A' => '#400', 'X' => '#FFF', '#09F'
    );
  $styles = array(
    'background' => $color[$val],
    'width' => $size . 'px',
    'height' => $size . 'px',
    'position' => 'absolute',
    'top' => $y * $size . 'px',
    'left' => $x * $size . 'px'
    );
  $style = '';
  foreach ($styles as $key => $value) {
    $style .= $key .': '. $value .'; ';
  }
  echo '<div style="'.$style.'"></div>';
}