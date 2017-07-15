myApp.component('azureAdSettingComponent', {
    // isolated scope binding
    bindings: {
        $router: '<'
    },
    templateUrl: '/Views/Admin/azure-ad-setting-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
        var $ctrl = this;
        $ctrl.azureAdSetting = {};
        $ctrl.$onInit = function () {

            var getAzureAdSetting = function () {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.get("/admin/GetAzureAdSetting").success(function (res) {
                    if (!res.Error) {
                        $ctrl.azureAdSetting = res.AzureAdSetting;
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                });
            }
            getAzureAdSetting();

        }
        $ctrl.saveAzureAdSetting = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/UpdateAzureAdSetting", { azureAdSetting: $ctrl.azureAdSetting }
            ).success(function (res) {
                $ctrl.azureAdSetting = res.AzureAdSetting;
                if (res.Error) {
                  
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $rootScope.successMessage = "Azure AD Setting was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };
       
    }]
       
       
});

