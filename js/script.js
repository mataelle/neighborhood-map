var map;

// palces used in app
var places = [
  {
    position: {lat: 55.753, lng: 37.621},
    place: 'Red Square',
    wiki_title: 'Red_Square'
  },
  {
    position: {lat: 55.754, lng: 37.614},
    place: 'Alexander Garden',
    wiki_title: 'Alexander_Garden'
  },
  {
    position: {lat: 55.756, lng: 37.614},
    place: 'Manege Square',
    wiki_title: 'Manezhnaya_Square,_Moscow'
  },
  {
    position: {lat: 55.757, lng: 37.617},
    place: 'Starbucks',
    wiki_title: 'Starbucks'
  },
  {
    position: {lat: 55.751, lng: 37.597},
    place: 'The Arbat',
    wiki_title: 'Arbat_Street'
  }
];

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
      dataType: "jsonp"
  }).done( function (data, textStatus, jqXHR) {
      key = Object.keys(data.query.pages)[0];
      if (data.query.pages[key].thumbnail != undefined) {
        src = data.query.pages[key].thumbnail.source;
        infoWindows[i].setContent("<h4>" + places[i].place + "</h4><img src='" + src + "' alt='" +places[i].place+ "'>");
      }
      else {
        infoWindows[i].setContent("<h4>" + places[i].place + "</h4> <div class='error'>Can't find image.</div>");
      }
  }).fail( function (errorMessage) {
      infoWindows[i].setContent("<h4>" + places[i].place + "</h4> <div class='error'>Can't load image.</div>");
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
          map.panTo(markers[i].getPosition())
          closeInfoWindows();
          infoWindows[i].open(map, markers[i]);
          markers[i].setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(i) { markers[i].setAnimation(null) }, 700, i);
      };
    }(i));
  }

  // viewmodel of places list
  function placesModel() {
      var self = this;
      self.observablePlaces = ko.observableArray(places);
      self.filter = ko.observable("");
      self.filteredPlaces = ko.computed(function() {
        var filter = this.filter().toLowerCase();
        if (!filter) {
          // show all markers
          for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(true);
          }
          return this.observablePlaces();
        } else {
          var stringStartsWith = function (string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length)
                return false;
            return string.substring(0, startsWith.length) === startsWith;
          };
          var filtered =  ko.utils.arrayFilter(this.observablePlaces(), function(p) {
              return stringStartsWith(p.place.toLowerCase(), filter);
          });
          // filter markers
          clearMarkers();
          for (var i = 0; i < markers.length; i++) {
            if (filtered.indexOf(self.observablePlaces()[i]) > -1) {
              markers[i].setVisible(true);
            }
          }
          return filtered;
        }
      }, this);

      self.proccessClick = function(data) {
        var i = self.observablePlaces.indexOf(data);
        new google.maps.event.trigger( markers[i], 'click' );
      };
  }

  ko.applyBindings(new placesModel());
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
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setVisible(false);
  }
}

function initMapError() {
  console.log('Failed to load map');
}

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
