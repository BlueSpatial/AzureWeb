myApp.component('otherSettingComponent', {
    // isolated scope binding
    bindings: {
        $router: '<'
    },
    templateUrl: '/Views/Admin/other-setting-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
        var $ctrl = this;
        $ctrl.setting = {};
        $ctrl.$onInit = function () {

            var getOtherSetting = function () {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.get("/admin/GetOtherSetting").success(function (res) {
                    if (!res.Error) {
                        $ctrl.setting.IsCatalogDisabled = res.IsCatalogDisabled;
                        $ctrl.setting.MapboxToken = res.MapboxToken;
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    }
                    $rootScope.isLoading = false;
                });
            };
            getOtherSetting();

        };
        $ctrl.saveSettings = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/SaveSettings", { isCatalogDisabled: $ctrl.setting.IsCatalogDisabled, mapboxToken: $ctrl.setting.MapboxToken }
            ).success(function (res) {
                if (res.Error) {                   
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $rootScope.successMessage = "Settings were updated successfully!";
                }
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };
       
    }]
       
       
});

