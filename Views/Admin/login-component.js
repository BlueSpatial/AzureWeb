myApp.component('loginComponent', {
    // isolated scope binding
    bindings: {       
        isLoading: '=?'
    },

    templateUrl: '/Views/Admin/login-component.html',

    // The controller that handles our component logic
    controller: ['$location', '$rootScope', '$http', 'authorizeService', 'localStorageService', function ($location, $rootScope, $http, authorizeService, localStorageService) {
        var $ctrl = this;
        $rootScope.isLoading = true;
        $http.get("/Account/CheckLogin").success(function (res) {
            if (!res.IsLogin) {
                authorizeService.logout();// logout client site when server is timeout
            }
            $ctrl.isFirstTime = res.IsFirstTime;
            $rootScope.isLoading = false;
        });
        if (authorizeService.isAuthorize()) {
            $location.path("/ManageServices");
        }
        
        $ctrl.login = function () {
            $ctrl.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Account/Login", { UserName: $ctrl.userName, Password: $ctrl.password }
            ).success(function (res) {
                if (!res.Error) {
                    localStorageService.set('authorizationData', { UserName: $ctrl.userName /*, Token: res.Token.AccessToken*/ });
                    $location.path("/ManageServices");
                }
                else {
                    $ctrl.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        var validateUserInfo = function () {
            var messages = [];
            if (!$ctrl.userName) {
                messages.push("Username is required!");
            }
            if (!$ctrl.password) {
                messages.push("Password is required!");
            }
            if ($ctrl.password != $ctrl.passwordRetype) {
                messages.push("Confirm password does not match!");
            }
            if (messages.length) {
                $ctrl.errorMessage = messages.join('</br>');
                return false;
            }
            return true;
        }
        $ctrl.saveLoginInfo = function () {
            if (!validateUserInfo()) {
                return;
            }
            $rootScope.isLoading = true;
            // post username and password to server
            $http.post("/Account/CreateLogin", { UserName: $ctrl.userName, Password: $ctrl.password }
            ).success(function (res) {
                if (!res.Error) {
                    localStorageService.set('authorizationData', { UserName: $ctrl.userName /*, Token: res.Token.AccessToken*/ });
                    $location.path("/ManageServices");
                    $ctrl.isFirstTime = false;
                }
                else {
                    $ctrl.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });

        }
    }]
});