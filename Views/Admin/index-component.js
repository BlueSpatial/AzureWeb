myApp.component('indexComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/index-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', '$location', function ($rootScope, $http, authorizeService, $location) {
        var $ctrl = this;
        $rootScope.errorMessage = "";
        $rootScope.successMessage = "";
        $ctrl.getLoginState = authorizeService.getLoginState;
        $ctrl.logout = authorizeService.logout;
        $http.get("/Account/CheckLogin").success(function (res) {
            if (!res.IsLogin) {
                authorizeService.logout();// logout client site when server is timeout
            }
        });
        $ctrl.clearError = function () {
            $rootScope.errorMessage = '';
        }
        $ctrl.clearSuccess = function () {
            $rootScope.successMessage = '';
        }
        $rootScope.isActiveRoutes = function (routes) {
            var isActive = false;
            routes.forEach(function (item, idx) {
                if ($rootScope.isActiveRoute(item)) {
                    isActive = true;
                    return false;
                }
            })
            return isActive;
        }
        $rootScope.isActiveRoute = function (route) {
            return $location.path().substr(0, route.length).toLowerCase() == route.toLowerCase();
        }
        //$rootScope.$watch('[successMessage,errorMessage]', function () {
        //    if ($rootScope.successMessage || $rootScope.errorMessage) {// scroll top when have message
        //        setTimeout(function () {
        //            if (!$rootScope.isHoverMessage) { // auto close after 5 second if not hover
        //                $rootScope.successMessage = $rootScope.errorMessage = "";
        //                $rootScope.$apply();
        //            }
        //        },10000);
        //    }
        //}, true);
        $rootScope.$watch('[errorMessage]', function () {
            if ($rootScope.errorMessage) {// scroll top when have message
                $rootScope.successMessage = "";
            }
        }, true);
        $rootScope.$on('$locationChangeStart', function (next, current) { 
            $rootScope.successMessage = $rootScope.errorMessage = "";
            authorizeService.isAuthorize();// check login every time change route, go to login page if not have login info
        });
        //$("#message").hover(
        //    function () {
        //        $rootScope.isHoverMessage = true;
        //        $rootScope.$apply();
        //    },
        //    function () {
        //        $rootScope.isHoverMessage = false;
        //        setTimeout(function () {  // auto close after 5 second
        //            $rootScope.successMessage = $rootScope.errorMessage = "";
        //            $rootScope.$apply();
        //        },10000);              

        //    }
        //);
       
    }]


});
