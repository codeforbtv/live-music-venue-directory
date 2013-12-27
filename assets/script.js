
function initialize() {
  var tableId = '1PVlLXmOAgG7suxKiqrxfaaFFnupf4XuajSbOW8o';
  var locationColumn = 'Location';
  
  var mapOptions = {
    center: new google.maps.LatLng(44.2035, -72.5623),
    zoom: 10,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    }
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  // Create the search box and link it to the UI element.
  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var layer = new google.maps.FusionTablesLayer({
    query: {
      select: locationColumn,
      from: tableId
    },
  });
  
  layer.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initialize);
