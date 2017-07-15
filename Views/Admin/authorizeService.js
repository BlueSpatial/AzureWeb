var factoryName = 'authorizeService';
myApp.factory(factoryName, ['$http', '$rootScope', 'localStorageService', '$location', function ($http, $rootScope, localStorageService, $location) {

    var getLoginState = function () {
        if (!localStorageService.get('authorizationData')) {
            return false;
        }
        return true;
    }
    var isAuthorize = function () {
        var loginState = getLoginState();
        if (!loginState) {
            $location.path("/UserLogin");
        }
        return loginState;
    }
   
    var logout = function () {
        $(".modal-backdrop").remove();
        localStorageService.remove('authorizationData');
        $location.path("/UserLogin");
        $http.post("/Account/Logout").success(function (res) {});
    }
    var onError = function (res, status) {
        if (status == 401) {
            logout();
        }
        else {
            $rootScope.errorMessage = 'Server error ' + status;
        }
        $rootScope.isLoading = false;
    };
   
    return {
        getLoginState: getLoginState,
        isAuthorize: isAuthorize,
        logout: logout,
        onError: onError
    };
}]);