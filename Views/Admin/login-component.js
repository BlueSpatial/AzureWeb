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
        $ctrl.haveConnectionString = true;// Fix bug first time it show connection string and then hide
        var checkLogin = function () {
            $http.get("/Account/CheckLogin").success(function (res) {
                if (!res.IsLogin) {
                    authorizeService.logout();// logout client site when server is timeout
                }
                $ctrl.isFirstTime = res.IsFirstTime;
                $ctrl.haveConnectionString = res.HaveConnectionString;
                $rootScope.isLoading = false;
            });
        }
        checkLogin();
        if (authorizeService.isAuthorize()) {
            if (localStorageService.get('authorizationData').Role == "Admin") {
                $location.path("/ManageServices");
            }
            else {
                document.location.href = "/";
            }
        }
        
        $ctrl.login = function () {
            $ctrl.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Account/Login", { UserName: $ctrl.userName, Password: $ctrl.password }
            ).success(function (res) {
                if (!res.Error) {
                    localStorageService.set('authorizationData', { UserName: $ctrl.userName, Role: res.Role });
                    if (res.Role == "Admin") {
                        $location.path("/ManageServices");
                    }
                    else {
                        document.location.href = "/";
                    }
                }
                else {
                    $ctrl.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        };
        var validateUserInfo = function () {
            var messages = [];
            if (!$ctrl.userName) {
                messages.push("Username is required!");
            }
            if (!$ctrl.password) {
                messages.push("Password is required!");
            }
            if ($ctrl.password !== $ctrl.passwordRetype) {
                messages.push("Confirm password does not match!");
            }
            if (messages.length) {
                $ctrl.errorMessage = messages.join('</br>');
                return false;
            }
            return true;
        };
        $ctrl.saveLoginInfo = function () {
            $ctrl.errorMessage = "";
            if (!validateUserInfo()) {
                return;
            }
            $rootScope.isLoading = true;
            // post username and password to server
            $http.post("/Account/CreateLogin", { UserName: $ctrl.userName, Password: $ctrl.password }
            ).success(function (res) {
                if (!res.Error) {
                    localStorageService.set('authorizationData', { UserName: $ctrl.userName, Role: 'Admin' });
                    $location.path("/ManageServices");
                    $ctrl.isFirstTime = false;
                }
                else {
                    $ctrl.errorMessage = res.Message;
                }
                $rootScope.isLoading = false;
            });

        };

        //initial default value for database
        $ctrl.initialDatabase = "BlueSpatial";

        $ctrl.changePort = function () {
            switch ($ctrl.databaseType) {

                case "postgres":
                    $ctrl.port = "5432";
                    break;

                case "mysql":
                    $ctrl.port = "3306";
                    break;

                default:
                    $ctrl.port = "1433";
                    break;
            }
        };


        var validateDatabaseInfo = function () {
            var messages = [];
            if (!$ctrl.databaseType) {
                messages.push("Database type is required!");
            }
            if (!$ctrl.host) {
                messages.push("Host is required!");
            }    
            //if (!$ctrl.port) {
            //    messages.push("Port is required!");
            //}  
            if (!$ctrl.initialDatabase) {
                messages.push("Initial database is required!");
            }  
            if (!$ctrl.userNameOfDb) {
                messages.push("User name is required!");
            }
            if (!$ctrl.passwordOfDb) {
                messages.push("Password is required!");
            }  
            if (messages.length) {
                $ctrl.errorMessage = messages.join('</br>');
                return false;
            }
            return true;
        };
        $ctrl.saveDatabaseInfo = function () {
            $ctrl.errorMessage = "";
            if (!validateDatabaseInfo()) {
                return;
            }
            $rootScope.isLoading = true;
            // save connection info to server
            $http.post("/Admin/SaveDatabaseInfo", {
                DatabaseType: $ctrl.databaseType,
                Host: $ctrl.host,
                Port: $ctrl.port,
                InitialDatabase: $ctrl.initialDatabase,
                UserName: $ctrl.userNameOfDb,
                Password: $ctrl.passwordOfDb
            }
            ).success(function (res) {
                if (!res.Error) {
                    $ctrl.haveConnectionString = true;
                    //create database if not exist, update existing database
                    checkLogin();
                }
                else {
                    $ctrl.errorMessage = res.Message;
                }
                $rootScope.isLoading = false;
            });

        };
    }]
});