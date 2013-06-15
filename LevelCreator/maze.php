<?php

require_once "astar.php";
// Example with maze

$width  = 49;
$height = 49;

$map = array_fill(0, $height, str_repeat('A', $width));

function node($x, $y) {
    global $width;
    return $y * $width + $x;
}

function coord($i) {
    global $width;
    $x = $i % $width;
    $y = ($i - $x) / $width;
    return array($x, $y);
}

function neighbors($i) {
    global $map, $width, $height;
    list ($x, $y) = coord($i);
    $neighbors = array();
    if ($x-1 >= 0      && $map[$y][$x-1] == 'X') $neighbors[node($x-1, $y)] = 1;
    if ($x+1 < $width  && $map[$y][$x+1] == 'X') $neighbors[node($x+1, $y)] = 1;
    if ($y-1 >= 0      && $map[$y-1][$x] == 'X') $neighbors[node($x, $y-1)] = 1;
    if ($y+1 < $height && $map[$y+1][$x] == 'X') $neighbors[node($x, $y+1)] = 1;
    return $neighbors;
}

function heuristic($i, $j) {
    list ($i_x, $i_y) = coord($i);
    list ($j_x, $j_y) = coord($j);
    return abs($i_x - $j_x) + abs($i_y - $j_y);
}

function generate($i) {
    global $map, $width, $height;
    list ($x, $y) = coord($i);
    $map[$y][$x] = 'X';
    $next = array();
    if ($x-2 > 0)         $next[] = array(-2, 0);
    if ($x+2 < $width-1)  $next[] = array(+2, 0);
    if ($y-2 > 0)         $next[] = array(0, -2);
    if ($y+2 < $height-1) $next[] = array(0, +2);
    shuffle($next);
    foreach ($next as $d)
        if ($map[$y+$d[1]  ][$x+$d[0]  ] != 'X') {
            $map[$y+$d[1]/2][$x+$d[0]/2]  = 'X';
            generate(node($x+$d[0], $y+$d[1]));
        }
}

generate(node(rand(1, ($width +$width %2)/2-1)*2-1,
              rand(1, ($height+$height%2)/2-1)*2-1));

$start  = node(1, 1);
$target = node($width+$width%2-3, $height+$height%2-3);

$path = a_star($start, $target, 'neighbors', 'heuristic');

array_unshift($path, $start);
foreach ($path as $i) {
    list ($x, $y) = coord($i);
    $map[$y][$x] = 'P';
}
//echo "<pre>";var_dump($map);die();
require_once "core_debug.php";
dbm($map);
die();

?>
<html>
<head>
<style type="text/css">
.P {
  background: #09F;
  color: #9EF;
}
.A {
  background: #000
}
.X {
  color: #CCC;
}
table {
  border-spacing: 0;
}
td {
  width: 10px;
  height: 10px;
  overflow: hidden;
  position: relative;
  font-size: 5px;
}
</style>
</head>
<body><table>
<?php
foreach ($map as $line) {
    $line = '<td class="' . implode('">*</td><td class="', str_split($line)) . '">*</td>';
    echo "<tr>$line</tr>";
  }
?>
</table></body></html>
