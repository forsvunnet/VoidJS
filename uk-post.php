<?php
if (isset($_GET['p'])) {
  $items = 10000;
  $off = (int) $_GET['p'];
  $off*= $items;
  $db = new PDO('mysql:host=localhost;dbname=uk_postcodes;charset=utf8', 'root', 'root');
  $stmt = $db->query('SELECT PZ_Long, PZ_Lat FROM `uk-post-codes-2009` LIMIT '. $off .' , ' . $items);
  $results = $stmt->fetchAll(PDO::FETCH_NUM);
  echo(json_encode($results));
  die();
}
?><html>
 <head>
  <meta charset="UTF-8" />
  <title>UK post codes</title>
  <style type="text/css">
    body{margin: 0;}
  </style>
 </head>
 <body>
  <div id="fps" style="position: fixed; color: #FFF; left: 10px; top: 10px; font-family: arial;"></div>
  <canvas id="canvas" width="1200" height="1200" ></canvas>
 <script type="text/javascript" src="jquery-2.0.3.min.js"></script>
<script type="text/javascript">
  var planet_size = 1200;
  var bounds = [49.724, -11.470, 62, 1.450];
  var _scale = planet_size  * 0.9/ (bounds[3] - bounds[1]);
  var ctx, image, image_data, x, y, i, j;
  var draw_pixel = function(vec, radius) {
    x = vec[1];
    y = vec[0];
    if (x === "0" && y ==="0") {
      return 0;
    }
    x = parseFloat(x);
    y = parseFloat(y);
    x-= bounds[0]; y-= bounds[1];
    if (x * _scale >= planet_size || y * _scale >= planet_size) debugger;
    if (x * _scale < 0 || y * _scale < 0) debugger;
    x = planet_size - parseInt(x * _scale, 10);
    y = parseInt(y * _scale, 10);
    i = x * planet_size + y;
    for (j = 0; j < 3; j++) {
      if (image.data[i * 4+j] > 1)
        image.data[i * 4+j]--;
      if (image.data[i * 4+j] == 0) {
        image.data[i * 4+j] = 254;
      }
    }
    image.data[i * 4+3] = 255;
    return 1;
  }
  $(document).ready(function() {
    var canvas = $('#canvas')[0];
    ctx = canvas.getContext('2d');
    var json, vec;
    var start_n = function (n) {
      $.get('?p=' + n, function(data) {
        json = JSON.parse(data);
        image = ctx.getImageData(0, 0, planet_size, planet_size);
        for (var i = 0; i < json.length; i++) {
          vec = json[i];
          draw_pixel(vec, 2);
        }
        image.data = image_data;
        ctx.putImageData( image, 0, 0 );
        if (json.length) {start_n(n+1);}
      });
    };
    start_n(1);
  });
</script>
 </body>
</html>