myApp.component('loginButtonComponent', {
    // isolated scope binding
    bindings: {       
        isLoading: '=?'
    },

    templateUrl: '/Views/Admin/login-button-component.html',

    // The controller that handles our component logic
    controller: ['$location', '$rootScope', '$http', 'authorizeService', 'localStorageService', function ($location, $rootScope, $http, authorizeService, localStorageService) {
        var $ctrl = this;
        $ctrl.logout = function () {
            $(".modal-backdrop").remove();
            localStorageService.remove('authorizationData');
            document.location.href = '/admin#/UserLogin';
            $http.post("/Account/Logout").success(function (res) { });
        };
        var currentUser = localStorageService.get("authorizationData");
        $ctrl.getCurrentUser = function () {
            return currentUser;
        }
    }]
});