myApp.component('importServiceModalComponent', {
    // isolated scope binding
    bindings: {
        callback: '=',
        single: '=',
        connections: '=',
        breadcrumb:'='
    },

    templateUrl: '/Views/Admin/SharedComponent/import-service-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$scope','$rootScope', 'authorizeService', 'layerService', function ($http,$scope, $rootScope, authorizeService, layerService) {
        var $ctrl = this;
        var setDefaultConnection = function () {
            if ($ctrl.connections.length == 1) {
                $ctrl.connectionId = $ctrl.connections[0].Id;
            }
            else {
                $ctrl.connectionId = undefined;
            }
        }
        $scope.$watch('$ctrl.connections', function () {
            $ctrl.connections = $ctrl.connections || [];
            setDefaultConnection();
        });
        $ctrl.importService = function (folder) {
            $rootScope.errorMessage = "";
            if (!$ctrl.serviceURL) {
                $rootScope.errorMessage = "Service URL is required!";
                return;
            }
            if (!authorizeService.isAuthorize()) return;
           
            $.connection.hub.start().done(function () {
                $rootScope.progressBar = { Value: 0, Text: "Connecting..." };
                $http.post("/Admin/ImportService", { folderId: $ctrl.single.Folder.Id, serviceURL: $ctrl.serviceURL, connectionId: $ctrl.connectionId, connectionHubId: $.connection.hub.id }
                ).success(function (res) {
                    if (!res.Error) {
                        $ctrl.callback().then(function () {
                            $rootScope.successMessage = "Service was imported successfully.";
                            $ctrl.serviceURL = "";
                            setDefaultConnection();
                        });
                        $("#importServiceModal").modal('hide');
                    }
                    else {
                        $ctrl.callback(); // to get the list again because some layer is insert
                        $rootScope.errorMessage = res.Message;                       
                    };
                    $rootScope.progressBar.Text = "";
                    $rootScope.progressBar.Max = 0;
                    $.connection.hub.stop();
                })
                    .error(function () {
                        authorizeService.onError();
                        $rootScope.progressBar.Text = "";
                        $.connection.hub.stop(); 
                    });
            });
        };

        var initProgress = function () {
            var progressNotifier = $.connection.progressHub;

            // client-side sendMessage function that will be called from the server-side
            progressNotifier.client.updateProgressMax = function (max) {
                $scope.$apply(function () {
                    $rootScope.progressBar.Max = max;
                });
            };
            progressNotifier.client.updateProgressValue = function (i) {
                $scope.$apply(function () {
                    $rootScope.progressBar.Value += i;
                });
            };
            progressNotifier.client.updateProgressCurrentValue = function (i) {
                $scope.$apply(function () {
                    $rootScope.progressBar.Value = i;
                });
            };
            progressNotifier.client.updateProgressText = function (text) {
                $scope.$apply(function () {
                    $rootScope.progressBar.Text = text;
                });
            };


        }
        initProgress();
    }]
});