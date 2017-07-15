myApp.component('manageConnectionComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/manage-connection-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', function ($rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        // get field data
        $ctrl.selectedConnection = {};
        $ctrl.connections = [];
        $ctrl.addConnection = function () {
            $ctrl.isEditMode = false;
            $ctrl.connections.unshift({ Id: 0 });
            $ctrl.selectedConnection = { Id: 0 };
            $("#creatConnectionModal").modal("show");
        }
        $ctrl.deleteConnection = function (connection, idx) {
            if (!authorizeService.isAuthorize()) return;
            var confirmMessage = "Are you sure you want to delete connection'" + connection.Name +'.'+connection.DatabaseName+ "'?";
            if (confirm(confirmMessage)) {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.post("/Connection/DeleteConnection", { id: connection.Id }
                ).success(function (res) {
                    if (!res.Error) {
                        $ctrl.connections.splice(idx, 1);
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                })
                .error(authorizeService.onError);
            }
        };
    
        $ctrl.$routerOnActivate = function (next) {
            // Get the hero identified by the route parameter            
            var getConnections = function () {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.get("/Connection/GetConnections").success(function (res) {
                    if (!res.Error) {
                        $ctrl.connections = res.Connections;
                       
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                }).error(authorizeService.onError);
            }
            getConnections();
        };


       
        $ctrl.editConnection = function (connection) {
            $ctrl.isEditMode = true;
            $ctrl.selectedConnection = angular.copy(connection);
            $("#creatConnectionModal").modal("show");
        };
        $ctrl.getDatabases = function () {
            $ctrl.databases = [];
            $ctrl.connectionDatabaseMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/ListDatabases", { connectionInfo: { ServerName: $ctrl.selectedConnection.Name, UserName: $ctrl.selectedConnection.UserName, Password: $ctrl.selectedConnection.Password } }
            ).success(function (res) {
                if (res.Error) {
                    $ctrl.connectionDatabaseMessage = res.Message;
                }
                else {
                    $ctrl.connectionDatabaseMessage = "Connected, please select database in the list below.";
                    $ctrl.databases = res.Databases;
                };
                $rootScope.isLoading = false;
            })
            .error(authorizeService.onError);
        }
        $ctrl.saveConnection = function (connection) {
            if (!authorizeService.isAuthorize()) return;
            $ctrl.connectionDatabaseMessage = "";
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Connection/PostConnection", { connection: connection }
            ).success(function (res) {
                if (res.Error) {
                    $ctrl.connectionDatabaseMessage  = res.Message;
                }
                else {
                    if (connection.Id == 0) {
                        $ctrl.connections.push(res.Connection);
                    }
                    else {
                        var idx = 0;
                        $ctrl.connections.forEach(function (v, i) {
                            if (v.Id == connection.Id) {
                                idx = i;
                                return false;
                            }
                        });
                        $ctrl.connections[idx] = res.Connection;
                    }                   
                    $ctrl.reset();                   
                    $("#creatConnectionModal").modal("hide");
                };
                $rootScope.isLoading = false;
            })
            .error(authorizeService.onError);

        };
        $ctrl.reset = function () {
            $ctrl.selectedConnection = {};
            if ($ctrl.connections[0].Id == 0) {
                $ctrl.connections.splice(0, 1);// delete the add object
            }
        };
    }]
       
       
});
