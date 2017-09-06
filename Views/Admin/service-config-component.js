myApp.component('serviceConfigComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/service-config-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', function ($rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        $ctrl.serviceSetting = {};
        $ctrl.saveServiceSetting = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.serviceSetting.Id = $ctrl.serviceId;
            $http.post("/Admin/UpdateServiceSetting", { serviceSetting: $ctrl.serviceSetting }
            ).success(function (res) {
                if (res.Error) {                   
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.serviceSetting = res.ServiceSetting;
                    $rootScope.successMessage = "Service configuation was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };

        var getServiceSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetServiceSetting", { params: { serviceId: $ctrl.serviceId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.serviceSetting = res.ServiceSetting;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.reset = getServiceSetting;
        $ctrl.$routerOnActivate = function (next) {
            $ctrl.serviceId = parseInt(next.params.id);            
            getServiceSetting();           
        };
       
      

    }]


});
