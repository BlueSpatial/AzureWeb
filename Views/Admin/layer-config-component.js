myApp.component('layerConfigComponent', {
    // isolated scope binding
    bindings: {
        pushLayer:'='
    },
    templateUrl: '/Views/Admin/layer-config-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'commonService', function ($rootScope, $http, authorizeService, commonService) {
        var $ctrl = this;
        $ctrl.layerSetting = {};
        $ctrl.defaultSRs = {
            '102100': "EPSG:3857 (Pseudo-Mercator)",
            '4326': "EPSG:4326 (WGS84)"
        };
           
        $ctrl.saveLayerSetting = function () {
            $rootScope.errorMessage = "";
            if (!$ctrl.layerSetting.Name) {
                $rootScope.errorMessage = "Layer name is required!";
                return;
            }
            if ($ctrl.layerSetting.MaxScale < $ctrl.layerSetting.MinScale) {
                $rootScope.errorMessage = "Max scale must greater than or equal Min scale";
                return;
            }
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.layerSetting.Id =$rootScope.currentLayerId;
            $http.post("/Admin/UpdateLayerSetting", { layerSetting: $ctrl.layerSetting }
            ).success(function (res) {
                if (res.Error) {                   
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.layerSetting = res.LayerSetting;
                    $ctrl.layerSetting.IsODataEnabledSavedValue = $ctrl.layerSetting.IsODataEnabled;// update the saved value
                    $ctrl.pushLayer($ctrl.layerSetting.Name);
                    $rootScope.successMessage = "Layer configuation was updated successfully!";
                    $ctrl.form.$setPristine();
                    $rootScope.$emit('changeBreadcrumbLayerName', $ctrl.layerSetting.Name);
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };

        var getLayerSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetLayerSetting", { params: { layerId:$rootScope.currentLayerId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.layerSetting = res.LayerSetting;
                    $ctrl.layerSetting.IsODataEnabledSavedValue = $ctrl.layerSetting.IsODataEnabled;// update the saved value
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.reset = function () {
            getLayerSetting();
            $ctrl.form.$setPristine();
        } 
        this.$onDestroy = $rootScope.$watch('currentLayerId', function () {      
            if ($rootScope.currentLayerId) {
                getLayerSetting();
            }
        });
        
        // waring when have change
        commonService.warmningWhenHaveChange($ctrl);
      

    }]


});
