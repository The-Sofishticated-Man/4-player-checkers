<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div class="board">
        <?php
            for ($i = 0; $i < 8; $i++) { 
            for ($j = 0; $j < 8; $j++) {
              $color = (($i + $j) % 2 == 0) ? 'light' : 'dark';
              echo "<div class='cell $color' data-i='$i' data-j='$j'>
              </div>";
            }
            }
        ?>
    </div>
    <script src="logic.js"></script>
  </body>
</html>
