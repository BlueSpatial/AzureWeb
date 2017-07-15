(function (angular) {
    'use strict';
    angular.module('about', []).component('aboutComponent', {
        // isolated scope binding
        bindings: {

        },
        templateUrl: '/Views/Admin/about-component.html',


        // The controller that handles our component logic
        controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
            var $ctrl = this;
            $rootScope.licenseInfo = { VersionType: 4 };
            $rootScope.isNotFullVersion = function () {//pro and basic version can't use feature service, map cache service
                if ($rootScope.licenseInfo.VersionType == 0 || $rootScope.licenseInfo.VersionType == 2){ 
                    return true;
                }
                return false;
            }
            $rootScope.isBasicVersion = function () { // basic version can't use multi connection
                if ($rootScope.licenseInfo.VersionType == 2) {
                    return true;
                }
                return false;
            }
            $ctrl.getVersionName = function () {
                if (!$rootScope.licenseInfo || $rootScope.licenseInfo.VersionType === undefined) {
                    return "";
                }
                switch ($rootScope.licenseInfo.VersionType) {
                    case 0:
                        return 'PRO';
                    case 1:
                        return 'TRIAL';
                    case 2:
                        return 'BASIC';
                    case 3:
                        return 'ENTERPRISE';
                }
            }
            $http.get("/Admin/GetLicenseInfo").success(function (res) {
                if (!res.Error) {
                    $rootScope.licenseInfo = res.LicenseInfo;                   
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            }).error(authorizeService.onError);


        }]

    });
})(window.angular);
