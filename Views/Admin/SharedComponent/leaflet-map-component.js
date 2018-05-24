myApp.component('leafletMapComponent', {
    // isolated scope binding
    bindings: {
        id: '=',
        features: '=',
        style: '='
    },

    templateUrl: '/Views/Admin/SharedComponent/leaflet-map-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$rootScope', "$scope", 'authorizeService', 'layerService', function ($http, $rootScope, $scope, authorizeService, layerService) {
        var $ctrl = this;
       
        setTimeout(function () {
            var map = L.map($ctrl.id, {
                minZoom: 0,
                maxZoom: 18
            });
            L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

            //console.log("ID:" + $ctrl.id);
            //console.log($ctrl.features);

            var layer = L.geoJSON($ctrl.features);
            layer.addTo(map);

            setTimeout(() => {
                map.invalidateSize();
                map.fitBounds(layer.getBounds());
            }, 500)
        });
    }]
});