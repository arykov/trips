    colors = ["black", "gray", "navy", "blue", "teal", "aqua", "green", "lime", "olive", "yellow", "maroon", "red", "purple", "fuchsia"]
    function calculateGeoJsonMetrics(geojson) {
      function haversineDistance(coord1, coord2) {
	      
          const [lon1, lat1] = coord1;
          const [lon2, lat2] = coord2;

          const R = 6371; // Earth radius in km
          const toRad = (angle) => (angle * Math.PI) / 180;

          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          return R * c; // Distance in km
      }


      let totalDistance = 0;
      let totalElevationGain = 0;
      let totalElevationLoss = 0;

      return geojson.features.map(feature => {
        if(feature.geometry.type === 'LineString'){
          metrics = feature.geometry.coordinates.reduce((acc, coord) => {
            acc.distance += haversineDistance(acc.lastCoord, coord)

            const elevationDiff = coord[2] - acc.lastCoord[2]
            if (elevationDiff > 0) {
              acc.ascent += elevationDiff;
            } else {
              acc.descent -= elevationDiff;
            }
            acc.lastCoord = coord
            return acc

          }, { "distance": 0, "ascent": 0, "descent": 0, "lastCoord": feature.geometry.coordinates.length > 0 ? feature.geometry.coordinates[0] : [0, 0, 0] })
          return { "distance": metrics.distance.toFixed(2), "ascent": metrics.ascent.toFixed(2), "descent": metrics.descent.toFixed(2) }
      } else return { "distance": 0, "ascent": 0, "descent": 0 }

      })
    }
    function sort(features){
      function distanceZeroIfNull(feature){
        try{
          return a.properties.metrics.distance
        }catch{
          return 0
        }
      }
      features.sort((a, b) => distanceZeroIfNull(a) - distanceZeroIfNull(b))
    }
    function downloadGpxFile(){
      console.log(this.value)
      const a = document.createElement('a');
      a.href = this.value;
      //a.download = filename;
      a.click();
    }
    function navigate(){
      console.log(this.value)
      const a = document.createElement('a');
      a.href = this.value;
      a.target = '_blank'
      //a.download = filename;
      a.click();
    }
    async function loadMaps() {
      try {
        const poiResponse = await fetch('poi.json')
        if (poiResponse.ok) {
          poiGeoJson = await poiResponse.json()

        } else {
          console.error('No POI file')
          poiGeoJson = { "type": "FeatureCollection", "features": [] }
        }

        const response = await fetch('maps.json');
        if (!response.ok) {
          throw new Error("Unable to load maps.json: ${response.status}");
        }

        const maps = await response.json();
        console.log(maps)
        const gpxDownloadSelect = document.getElementById('downloadGpxSelect');
        const navigateSelect = document.getElementById('navigateSelect');
        gpxDownloadSelect.addEventListener('change', downloadGpxFile)
        navigateSelect.addEventListener('change', navigate)
        const fetchAll = async () => {
          

          try {
            // Fetch all URLs in parallel
            const responses = await Promise.all(maps.map(url => fetch(url).then(res => {
              if (!res.ok) {
                throw new Error('Response not ok')
              }
              const option = document.createElement('option');
              option.text = url.split('/').filter(Boolean).pop().split('.')[0];
              option.value = url;
              gpxDownloadSelect.add(option); 
              return res.text()
            }).then(text => {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(text, 'text/xml')
              g = toGeoJSON.gpx(xmlDoc)
              geoJsonMetrics = calculateGeoJsonMetrics(g)
              for (i = 0; i < g.features.length; i++) {
                delete geoJsonMetrics[i].descent
                g.features[i].properties.metrics = geoJsonMetrics[i]
                g.features[i].properties.url = url
                g.features[i].properties.type = url.split('/').filter(Boolean).pop().split('.')[0]
                //problematic if multiple tracks in the same gpx
                if(g.features[i].geometry.type === 'LineString'){                  
                  const option = document.createElement('option');                  
                  option.text = url.split('/').filter(Boolean).pop().split('.')[0];                  
                  option.value = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${g.features[i].geometry.coordinates[0][1]},${g.features[i].geometry.coordinates[0][0]}`;
                  navigateSelect.add(option); 
                }
              }

              return g
            })));

            // Reduce responses into a single array (not necessary, but keeping it for flexibility)
            //const reducedData = responses.reduce((acc, data) => [...acc, data], []);
            const geoJson = responses.reduce((acc, geoJson) => {
              acc.features.push(...geoJson.features)
              return acc
            }, poiGeoJson);


            options = { "map_options": { "line_types": [] } }
            sort(geoJson.features)
            
            for (i = 0; i < geoJson.features.length; i++) {
              if (geoJson.features[i].geometry.type === 'LineString') {
                const info = `${geoJson.features[i].properties.metrics.distance}km asc:${geoJson.features[i].properties.metrics.ascent}m`                
                geoJson.features[i].properties.name = info
                options.map_options.line_types.push(
                  {
                    "line_title": geoJson.features[i].properties.type,
                    "line_colour": colors[i % colors.length],
                    "line_weight": "5",
                    "line_opacity": "0.7",
                    "line_display": "1",
                    "line_submission": "1"
                  }
                )
              }

            }
            const viewer = window.Waymark_Map_Factory.viewer();
            viewer.init(options);
            viewer.load_json(geoJson)


            console.log("Reduced Responses:", geoJson);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
        fetchAll()

      } catch (error) {
        console.error(error.message);
      }
    }

    loadMaps();    
