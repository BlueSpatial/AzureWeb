myApp.component('selectLayerComponent', {
    // isolated scope binding
    bindings: {
        onLayerChange: '='
    },
    templateUrl: '/Views/Admin/select-layer-component.html',

    // The controller that handles our component logic
    controller: ['$location','$rootScope', '$http', 'authorizeService', 'layerService', function ($location,$rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        var getLayers = function () {           
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/Admin/Layers").success(function (res) {
                if (!res.Error) {
                    $ctrl.layers = res.Layers;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            }).error(authorizeService.onError);
        }
        getLayers();
        $ctrl.updateUrlId = function () {
            $location.search({ id: $rootScope.currentLayerId });
        };
    }]
});
