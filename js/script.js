var map;

// palces used in app
var places = [
  {
    'position': {lat: 55.753, lng: 37.621},
    'place': 'Red Square',
    'wiki_title': 'Red_Square'
  },
  {
    'position': {lat: 55.754, lng: 37.614},
    'place': 'Alexander Garden',
    'wiki_title': 'Alexander_Garden'
  },
  {
    'position': {lat: 55.756, lng: 37.614},
    'place': 'Manege Square',
    'wiki_title': 'Manezhnaya_Square,_Moscow'
  },
  {
    'position': {lat: 55.757, lng: 37.617},
    'place': 'Starbucks',
    'wiki_title': 'Starbucks'
  },
  {
    'position': {lat: 55.751, lng: 37.597},
    'place': 'The Arbat',
    'wiki_title': 'Arbat_Street'
  }
];
var observablePlaces = places.slice();

var markers = [];
var infoWindows = [];

// ajax request to wikipedia for image thumbnail
function fillInfoWindow(i){
  $.ajax({
      type: "GET",
      url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=" +
            places[i].wiki_title +
            "&pithumbsize=200",
      contentType: "application/json; charset=utf-8",
      async: false,
      dataType: "jsonp",
      success: function (data, textStatus, jqXHR) {
          key = Object.keys(data.query.pages)[0];
          src = data.query.pages[key].thumbnail.source;
          infoWindows[i].setContent("<h4>" + places[i].place + "</h4><img src='" + src + "' alt='" +places[i].place+ "'>");
      },
      error: function (errorMessage) {
        console.log("Something went wrong.");
      }
  });

}

// init map when google api script loaded
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 55.752, lng: 37.604},
    zoom: 15
  });

  for (var i = 0; i < places.length; i++) {
    var marker = new google.maps.Marker({
      position: places[i].position,
      map: map,
      animation: google.maps.Animation.DROP
    });
    var infowindow = new google.maps.InfoWindow({
      content: ''
    });
    markers.push(marker);
    infoWindows.push(infowindow);
    fillInfoWindow(i);
  }

  // add click listeners to markers
  for (var i = 0; i < places.length; i++) {
    google.maps.event.addListener(markers[i], 'click', function(i) {
      return function() {
          infoWindows[i].open(map, markers[i]);
          if (markers[i].getAnimation() !== null) {
            markers[i].setAnimation(null);
          } else {
            markers[i].setAnimation(google.maps.Animation.BOUNCE);
          }
      };
    }(i));
  }

  // list of places view
  function placeList() {
      var self = this;

      self.observablePlaces = ko.observableArray(observablePlaces);
      self.filteredPlaces = places;

      self.proccessClick = function(i) {
          new google.maps.event.trigger( markers[i], 'click' );
        // infoWindows[i].open(map, markers[i]);
      };

      self.checkVisibility = function(i) {
        return self.filteredPlaces.indexOf(places[i]) > -1;
      };
      self.changeVisibility = function() {
        visibleMarkers = [];
        visibleInfoWindows = [];
        for(var i = 0; i < observablePlaces.length; i++){
          ko.applyBindingsToNode(document.getElementById(i.toString()), {'visible': self.checkVisibility(i)});
          if (self.checkVisibility(i)) {
            visibleMarkers.push(markers[i]);
            visibleInfoWindows.push(i);
          }
        }
        closeInfoWindows();
        clearMarkers();
        setMapOnAll(visibleMarkers);
        if (visibleInfoWindows.length < places.length) {
          showInfoWindows(visibleInfoWindows);
        }
      };
      self.filter = function(data, event) {
          text = event.target.value;
          if (text.length == 0) {
              self.filteredPlaces = places.slice();
          } else {
              self.filteredPlaces = ko.utils.arrayFilter(places, function(p) { return p.place.toLowerCase().startsWith(text); });
          }
          self.changeVisibility();
      };
  }
  ko.applyBindings(new placeList());
  closeInfoWindows();
}

// Showes some info windows.
function showInfoWindows(indexes) {
  for (var i = 0; i < indexes.length; i++) {
    infoWindows[indexes[i]].open(map, markers[indexes[i]]);
  }
}
// Closes all info windows.
function closeInfoWindows() {
  for (var i = 0; i < places.length; i++) {
    infoWindows[i].close();
  }
}
// Sets the map on all markers in the array.
function setMapOnAll(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
