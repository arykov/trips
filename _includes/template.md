<html>

<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="../dist/latest/css/waymark-js.min.css" />
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="../dist/latest/js/waymark-js.min.js"></script>
  <script src="../mymap.js"></script>

</head>

<body>
  <!-- Map Container -->

  <div id="waymark-map">
    <div id="export-here" style="position: absolute; bottom: 20px; left: 20px; z-index: 1000">
      <select id="downloadGpxSelect">
        <option value="">Download GPX ...</option>
      </select>
      <select id="navigateSelect">
        <option value="">Navigate to ...</option>
      </select>
    </div>
  </div>
  
</body>

</html>