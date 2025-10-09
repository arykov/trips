<html>

<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="../dist/latest/css/waymark-js.min.css" />
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="../dist/latest/js/waymark-js.min.js"></script>
  <script src="../mymap.js"></script>
  <script>
    const gpxPaths=[
      {% assign gpx_dir = {page.dir}| append: "gpx/" %}
      {% assign files_in_dir = site.static_files | where_exp: "f", "f.path contains gpx_dir" %}
      {% for file in files_in_dir %}
        {% assign quoted_path = '"gpx/'|append: file.name|append: '"'|append: ","%}
        {{ quoted_path }}
      {% endfor %}
    ]
    showMap(gpxPaths)
  </script>
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