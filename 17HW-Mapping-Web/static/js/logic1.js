var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


d3.json(queryUrl, function(data) {
    var earthquakes = L.geoJSON(data.features, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
              "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        },
        pointToLayer: function (feature, latlng) {
        var color;
        var r = 255;
        var g = Math.floor(255-80*feature.properties.mag);
        var b = Math.floor(255-80*feature.properties.mag);
        color= "rgb("+r+" ,"+g+","+ b+")"
        
        var geojsonMarkerOptions = {
            radius: 4*feature.properties.mag,
            fillColor: color,
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });

    var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
    });

    var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
    });

    var baseMaps = {
        Light: light,
        Dark: dark
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [light, earthquakes]
    });

    L.control.layers(baseMaps,overlayMaps).addTo(myMap);

    // set legend

    function getColor(c) {
        return c < 1 ? 'rgb(255,255,255)' :
              c < 2  ? 'rgb(255,225,225)' :
              c < 3  ? 'rgb(255,195,195)' :
              c < 4  ? 'rgb(255,165,165)' :
              c < 5  ? 'rgb(255,135,135)' :
              c < 6  ? 'rgb(255,105,105)' :
              c < 7  ? 'rgb(255,75,75)' :
              c < 8  ? 'rgb(255,45,45)' :
              c < 9  ? 'rgb(255,15,15)' :
                          'rgb(255,0,0)';
    };
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function(map) {

        var div = L.DomUtil.create("div", "info legend");
        levels = [0, 1, 2, 3, 4, 5, 6, 7, 8],
        
        div.innerHTML = "Earthquake Magnitude <br><hr>"

        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(levels[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

});