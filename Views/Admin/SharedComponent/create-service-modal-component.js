myApp.component('createServiceModalComponent', {
    // isolated scope binding
    bindings: {
        connections:'=',
        callback: '=',
        single: '=',
        breadcrumb:'='
    },

    templateUrl: '/Views/Admin/SharedComponent/create-service-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$rootScope', 'authorizeService', 'layerService', function ($http, $rootScope, authorizeService, layerService) {
        var $ctrl = this;
        $ctrl.serviceTypes = [{ Id: 0, DisplayName: 'Map Service' },
                              { Id: 1, DisplayName: 'Feature Service' }];
        $ctrl.creatNewService = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            var _validateService = function () {
                var valid = true;
                var messages = [];
                if (!$ctrl.single.NewService || !$ctrl.single.NewService.ConnectionId) {
                    messages.push("Database connection is required");
                    valid = false;
                }
                if (!$ctrl.single.NewService || !$ctrl.single.NewService.Name) {
                    messages.push("Service name is required");
                    valid = false;
                }
                if (!$ctrl.single.NewService || $ctrl.single.NewService.ServiceType == undefined) {
                    messages.push("Service type is required");
                    valid = false;
                }
                if (!$ctrl.single.Folder || !$ctrl.single.Folder.Id) {
                    messages.push("Folder is required");
                    valid = false;
                }
                $rootScope.errorMessage = messages.join(', ');
                return valid;
            }
            if (_validateService()) {
                $rootScope.isLoading = true;
                $ctrl.single.NewService.Id = $ctrl.single.NewService.Id || 0;
                $http.post("/Admin/PostService", { service: { Id: $ctrl.single.NewService.Id, Name: $ctrl.single.NewService.Name, FolderId: $ctrl.single.Folder.Id, ServiceType: parseInt($ctrl.single.NewService.ServiceType), IsCached: $ctrl.single.NewService.IsCached, ConnectionId: parseInt($ctrl.single.NewService.ConnectionId) } }
                ).success(function (res) {
                    if (!res.Error) {
                        if ($ctrl.single.NewService.Id == 0) {
                            $ctrl.single.Service = res.Service;
                        }
                        $ctrl.callback(res.Service);
                       
                        $ctrl.single.NewService = {};
                        $rootScope.callIntro(3);
                        $("#creatServiceModel").modal('hide');
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };                    
                    $rootScope.isLoading = false;
                })
                .error(authorizeService.onError);
            }            
        };
    }]
});