<<<<<<< Updated upstream
﻿myApp.component('layerConfigComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/layer-config-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
        var $ctrl = this;
        $ctrl.layerSetting = {};
        $ctrl.saveLayerSetting = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.layerSetting.Id = $ctrl.layerId;
            $http.post("/Admin/UpdateLayerSetting", { layerSetting: $ctrl.layerSetting }
            ).success(function (res) {
                if (res.Error) {                   
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.layerSetting = res.LayerSetting;
                    $rootScope.successMessage = "Layer configuation was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };

        var getLayerSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetLayerSetting", { params: { layerId: $ctrl.layerId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.layerSetting = res.LayerSetting;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.reset = getLayerSetting;
        $ctrl.$routerOnActivate = function (next) {
            $ctrl.layerId = parseInt(next.params.id);            
            getLayerSetting();           
        };
       
      

    }]


});
=======
﻿myApp.component('layerConfigComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/layer-config-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
        var $ctrl = this;
        $ctrl.layerSetting = {};
        $ctrl.saveLayerSetting = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.layerSetting.Id = $ctrl.layerId;
            $http.post("/Admin/UpdateLayerSetting", { layerSetting: $ctrl.layerSetting }
            ).success(function (res) {
                if (res.Error) {                   
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.layerSetting = res.LayerSetting;
                    $rootScope.successMessage = "Layer configuation was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };

        var getLayerSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetLayerSetting", { params: { layerId: $ctrl.layerId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.layerSetting = res.LayerSetting;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.reset = getLayerSetting;
        $ctrl.$routerOnActivate = function (next) {
            $ctrl.layerId = parseInt(next.params.id);            
            getLayerSetting();           
        };
       
      

    }]


});
>>>>>>> Stashed changes
