<style type="text/css">
table {

}
.lvl-0{
  background: #000;
}
<?php for($i=1;$i<=20;$i++) {$lv=round(255 - ($i*255/21));echo ".lvl-$i { background: rgb(255,$lv,$lv)}";} ?>
td {
  border: 1px solid #999;
  width: 25px;
  height: 25px;
  text-align: center;
}
</style>
<?php
require_once "generator.php";

$level = make_level();

$xo = abs($level['bounds']['x1']);
$yo = abs($level['bounds']['y1']);
$w = $level['bounds']['x2'] + $xo-1;
$h = $level['bounds']['y2'] + $yo-1;

$grid = array();
for ($ix = 0; $ix <= $w; $ix++) {
  $grid[$ix] = array();
  for ($iy = 0; $iy <= $h; $iy++) {
    $grid[$ix][$iy] = 0;
  }
}

for ($i=0; $i < $level['length']; $i++) {
  $box = $level[$i];
  for ($ix = 0; $ix < $box['width']; $ix++) {
    for ($iy = 0; $iy < $box['height']; $iy++) {
      $grid[$box['x'] + $xo + $ix][$box['y'] + $yo + $iy] = $i+1;
    }
  }
}

echo"<table>";
for ($iy = 0; $iy <= $h; $iy++) {
  echo "<tr>";
  for ($ix = 0; $ix <= $w; $ix++) {
    $nr = $grid[$ix][$iy];
    echo "<td class=\"lvl-$nr\">" . $nr . "</td>";
  }
  echo "</tr>";
}
echo"</table>";