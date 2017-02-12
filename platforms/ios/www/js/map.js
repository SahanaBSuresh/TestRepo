var directionDisplay;
var directionsService;
var map;
var origin = null;
var destination = null;
var waypoints = [];
var markers = [];
var directionsVisible = false;

//Hardcoding current location for demo purpose

window.localStorage.setItem('Latitude',"40.785211");
window.localStorage.setItem('Longitude',"-74.979634");

function loadMap(results,mapId)
{
    origin = null;
    destination = null;
    waypoints = [];
    markers = [];
//    alert("loadMap function");
//    alert("results length :" + results.rows.length);
	setTimeout(function(){initMap(results,mapId);}, 4000);

}

function  initMap(results,mapId)
{
//    alert("init map function");
	directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    var lat_lon = [];
    
    var myOptions = {
    	    center: new google.maps.LatLng(0,0),
    	    zoom: 12,
    	    mapTypeId: google.maps.MapTypeId.ROADMAP,
    	    mapTypeControl: false,
    	    navigationControl: false,
    	    zoomControl: false
    		};

//    map = new google.maps.Map(document.getElementById("map_canvas"),
//    		myOptions);
    map = new google.maps.Map(document.getElementById(mapId),
                              myOptions);


    directionsDisplay.setOptions( { suppressMarkers: true,suppressInfoWindows:true } ); //To suppress automatic addition of marker
    
    directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById("directionsPanel"));
    
//    alert("num of rows = " + results.rows.length);
    
    var k = 0;
    
    for (var i = 0; i < (results.rows.length) ; i++) {
        
 /*       $.ajax({
               url: myUrl,
               dataType: 'json',
               async: false,
               data: myData,
               success: function(data) {
               //stuff
               //...
               }
               });
*/
    	
        var address_text;
        if(results.rows.item(k).STRAS.length > 0)
            address_text = results.rows.item(k).STRAS;
        if(results.rows.item(k).ORT01.length > 0)
            address_text = address_text + ", " + results.rows.item(k).ORT01;
        if(results.rows.item(k).PSTLZ.length > 0)
            address_text = address_text + ", " + results.rows.item(k).PSTLZ;
        if(results.rows.item(k).LAND1.length > 0)
            address_text = address_text + ", " + results.rows.item(k).LAND1;
        var address = address_text;
//    	alert("address = " +address);
        
        $.ajax({
               
               url:'http://maps.googleapis.com/maps/api/geocode/json?address='+address+'&sensor=false',
               dataType:'json',
               async:false,
               success:function (data) {
        	console.log(JSON.stringify(data));
        	var p = data.results[0].geometry.location;
            var latlng = new google.maps.LatLng(p.lat, p.lng);
               
            var marker = new google.maps.Marker({
                position: latlng,
                map: map
            });
               
            var infowindow = new google.maps.InfoWindow();
            markers.push(marker);
            
            waypoints.push({ location: latlng, stopover: true });
            
            lat_lon[k] = latlng;
               
            var text;
            if(results.rows.item(k).NAME_ORG1.length > 0)
               text = results.rows.item(k).NAME_ORG1;
            if(results.rows.item(k).NAME_ORG2.length > 0)
               text = text + ", " + results.rows.item(k).NAME_ORG2;
               
            var cText = text + "<br/>" + address_text;
                  
			var content = text;
             google.maps.event.addListener(marker, 'click', (function(marker, cText) {
                                                                return function() {
                                                                	
                                                                	
                                                                infowindow.setContent("<div class='map-text'>"+cText + "</div>");
                                                                infowindow.open(map, marker);
                                                                }
                                                                })(marker, cText));
             
             
			infowindow.setContent("<div class='map-text'>"+content + "</div>");
			infowindow.open(map, marker);
                  
                  if(results.rows.length == 1 && k == 0)
                    google.maps.event.trigger(marker, 'click');

            if(k == (results.rows.length-1))
            {
            	if(window.localStorage.getItem('Latitude') != "" && window.localStorage.getItem('Latitude') != "null" && window.localStorage.getItem('Latitude') != null)
            	{
            	 var lat_lon1 = [];
            	 lat_lon1[0] = new google.maps.LatLng(window.localStorage.getItem('Latitude'), window.localStorage.getItem('Longitude'));
            	 lat_lon1[1] = lat_lon[0];
            	 origin = lat_lon1[0];
//            	 destination = lat_lon1[0];
            	 var cmarker = new google.maps.Marker({
                     position: lat_lon1[0],
//                     icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00',
                     map: map
                 });
                 var infowindow1 = new google.maps.InfoWindow();
                 infowindow1.setContent("<div class='map-text'>"+ "Current Location" + "</div>");
                 infowindow1.open(map, cmarker);
                 markers.push(cmarker);
               
               google.maps.event.addListener(cmarker, 'click', (function(cmarker) {
                                                               return function() {
                                                               
                                                                infowindow1.open(map, cmarker);
                                                               }
                                                               })(cmarker));   
                  
            	 //drawPolyline(map,lat_lon1,'blue');
            	}
            	//drawPolyline(map,lat_lon,'blue');
            	
//               alert("waypoints = " + waypoints);
               
            	var mode = google.maps.DirectionsTravelMode.DRIVING; 
            	var request = {
            	        origin: origin,
                        destination: origin,
                        waypoints: waypoints,
                        travelMode: mode,
                        optimizeWaypoints: true,
                        avoidHighways: false,
                        avoidTolls: true
            	    };

        /*          var request = {
                            origin: 'Chicago, IL',destination: 'Los Angeles, CA',waypoints: [
                              { location: 'Joplin, MO',stopover: false},{ location: 'Oklahoma City, OK',stopover: true}],travelMode: mode,optimizeWaypoints: true,avoidHighways: false,avoidTolls: true
                    };
         */
               directionsService.route(request, function(response, status) {
                                       if (status == google.maps.DirectionsStatus.OK) {
                                       directionsDisplay.setDirections(response);
                                       }
            	    });
            }
             k++;
             //AutoCenter(map,markers);
               }});
    }
}





function drawPolyline(map,lat_lon,color)
{
	var lineSymbol = {
		    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
		  };
	                            var flightPath = new google.maps.Polyline({
	                              path: lat_lon,
	                              geodesic: true,
	                              strokeColor: color,
	                              strokeOpacity: 1.0,
	                              strokeWeight: 2,
	                              icons: [{
	                                  icon: lineSymbol,
	                                  offset: '100%'
	                                }]
	                            });
	                            
	                            flightPath.setMap(map);

}


function AutoCenter(map,markers) {
    //  Create a new viewpoint bound
    var bounds = new google.maps.LatLngBounds();
    //  Go through each...
    $.each(markers, function (index, marker) {
      bounds.extend(marker.position);
    });
    //  Fit these bounds to the map
    map.fitBounds(bounds);
  }
