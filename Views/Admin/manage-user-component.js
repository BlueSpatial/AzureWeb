myApp.component('manageUserComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/manage-user-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', function ($rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        // get field data
        $ctrl.selectedUser = {};
        $ctrl.users = [];
        $ctrl.roles = [];
        $ctrl.addUser = function () {
            $ctrl.isEditMode = false;
            $ctrl.selectedUser = { Id: 0 };
            $("#creatUserModal").modal("show");
        }
        $ctrl.getRoleName = function (roleValue) {
            var roleName = "";
            $ctrl.roles.forEach(function (role) {
                if (roleValue == role.Value) {
                    roleName = role.Name;
                    return false;
                }
            })
            return roleName;
        }
        $ctrl.deleteUser = function (user, idx) {
            if (!authorizeService.isAuthorize()) return;
            var confirmMessage = "Are you sure you want to delete user'" + user.UserName + "'?";
            if (confirm(confirmMessage)) {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.post("/Account/DeleteUser/" + user.Id, null
                ).success(function (res) {
                    if (!res.Error) {
                        $ctrl.users.splice(idx, 1);
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
            var getUsers = function () {
                if (!authorizeService.isAuthorize()) return;
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.get("/Account/GetUsers").success(function (res) {
                    if (!res.Error) {
                        $ctrl.users = res.Users;
                        $ctrl.roles = res.Roles;
                        $ctrl.services = res.Services;
                        $ctrl.services.unshift({ Id: -2, Name: 'Remove All' });
                        $ctrl.services.unshift({ Id: -1, Name: 'Add All' });
                        $ctrl.isAzureADSet = res.IsAzureADSet;
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                }).error(authorizeService.onError);
            }
            getUsers();
        };



        $ctrl.editUser = function (user) {
            $ctrl.isEditMode = true;
            $ctrl.selectedUser = angular.copy(user);
            $("#creatUserModal").modal("show");
        };
       
        $ctrl.saveUser = function (user) {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.successMessage = "";
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Account/PostUser", { user: user }
            ).success(function (res) {
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    if (user.Id == 0) {
                        $ctrl.users.push(res.User);
                        $rootScope.successMessage = "Create user successfully!";
                    }
                    else {
                        var idx = 0;
                        $ctrl.users.forEach(function (v, i) {
                            if (v.Id == user.Id) {
                                idx = i;
                                return false;
                            }
                        });
                        $ctrl.users[idx] = res.User;
                        $rootScope.successMessage = "Update user successfully!";
                    }
                    $ctrl.reset();
                    $("#creatUserModal").modal("hide");
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);

        };
        $ctrl.reset = function () {
            $ctrl.selectedUser = {};            
        };
        
    }]
       
       
});
