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
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                });
            }
            getOtherSetting();

        }
        $ctrl.updateDisableCatalog = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/UpdateIsCatalogDisabled", { isCatalogDisabled: $ctrl.setting.IsCatalogDisabled }
            ).success(function (res) {
                if (res.Error) {
                    $ctrl.setting.IsCatalogDisabled = !$ctrl.setting.IsCatalogDisabled;
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $rootScope.successMessage = "Catalog was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };
       
    }]
       
       
});

