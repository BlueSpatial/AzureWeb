(function(angular) {
    'use strict';
    angular.module('security', []).component('securityComponent', {
        // isolated scope binding
        bindings: {
            $router: '<'
        },
        templateUrl: '/Views/Admin/security-component.html',

        // The controller that handles our component logic
        controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
            var $ctrl = this;
           
          
            $ctrl.$onInit = function () {
          
                $ctrl.generateAccessToken = function () {
                    $rootScope.errorMessage = "";
                    $rootScope.isLoading = true;
                    $http.post("/admin/GenerateAPIAccessToken", { clientId: $ctrl.client.Id, clientSecret: $ctrl.client.Secret }).success(function (res) {
                        if (!res.Error) {
                            $ctrl.token = res;
                            if(res.Token==null){
                                $rootScope.errorMessage = "Client Id or Client Secret not valid!";
                            };
                        }
                        else {
                            $rootScope.errorMessage = res.Message;
                        };
                        $rootScope.isLoading = false;
                    })
                    .error(function () {
                        $rootScope.errorMessage = "Can't access Identity Server.";
                        $rootScope.isLoading = false;
                    });
                }

              

            }

           
       
        }]
       
       
    });
})(window.angular);
