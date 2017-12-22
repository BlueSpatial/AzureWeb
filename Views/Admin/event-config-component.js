myApp.component('eventConfigComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/event-config-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
        var $ctrl = this;
        $ctrl.layerSetting = {};
        $ctrl.currentHost = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        $ctrl.saveLayerSetting = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.layerSetting.Id = $rootScope.currentLayerId;
            $http.post("/Admin/UpdateLayerEventSetting", { layerSetting: $ctrl.layerSetting }
            ).success(function (res) {
                if (res.Error) {                   
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.layerSetting = res.LayerSetting;
                    $rootScope.successMessage = "Layer event setting was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };

        var getLayerSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetLayerEventSetting", { params: { layerId: $rootScope.currentLayerId } }).success(function (res) {
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
        this.$onDestroy = $rootScope.$watch('currentLayerId', function () {
            if ($rootScope.currentLayerId) {
                getLayerSetting();
            }
        });
       
       
      

    }]


});
