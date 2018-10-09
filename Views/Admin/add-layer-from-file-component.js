myApp.component('addLayerFromFileComponent', {
    // isolated scope binding
    bindings: {
        single: '=',
        callback: '=',
        defaultSRs: '='
    },
    templateUrl: '/Views/Admin/add-layer-from-file-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$scope', '$http', 'authorizeService', 'layerService', function ($rootScope, $scope, $http, authorizeService, layerService) {
        var $ctrl = this;

        //layerService.getMetaDatas().then(function (res) {
        //    $ctrl.folders = res.data.Folders;
        //    $ctrl.services = res.data.Services;
        //    $ctrl.layers = res.data.Layers;
        //});

        $ctrl.supportedFormats = ".zip, .geojson, .json, .kmz, .kml, .gpx, .gml, .rss, .gdb.zip, .csv";
        //$ctrl.callNewServiceDialog = layerService.callNewServiceDialog;
        //$ctrl.callNewFolderDialog = layerService.callNewFolderDialog;
        var initUploadFile = function () {
            return { SR: 102100 };
        }
        $ctrl.uploadFile = initUploadFile(); // init the default sr
        var validateUploadFile = function () {
            var isValid = true;
            var messages = [];
            //if (!$ctrl.connectionInfo) {
            //    messages.push("Connection info is required");
            //    isValid = false;
            //}
            //else {
            //    if (!$ctrl.connectionInfo.ServerName) {
            //        messages.push("Server name is required");
            //        isValid = false;
            //    };
            //    if (!$ctrl.connectionInfo.UserName) {
            //        messages.push("User name is required");
            //        isValid = false;
            //    };
            //    if (!$ctrl.connectionInfo.Password) {
            //        messages.push("Password is required");
            //        isValid = false;
            //    };
            //    if (!$ctrl.connectionInfo.DatabaseName) {
            //        messages.push("Database name is required");
            //        isValid = false;
            //    };
            //}
            if (!$ctrl.single.Layer || !$ctrl.single.Layer.ServiceId) {
                messages.push("Service is required");
                isValid = false;
            }
            $ctrl.uploadFile = $ctrl.uploadFile || initUploadFile();
        
            if (!$ctrl.uploadFile.TableName) {
                messages.push("Layer name is required");
                isValid = false;
            };
            if (!$ctrl.uploadFile.SR) {
                messages.push("Spatial Reference is required");
                isValid = false;
            };
            if (!$ctrl.uploadFile.File) {
                messages.push("File is required");
                isValid = false;
            };
            
            $rootScope.errorMessage = messages.join(", ");
            $scope.$evalAsync(); // something like $apply but not get already in progress error
            return isValid;
        };
        $ctrl.upload = function () {
            if (!authorizeService.isAuthorize()) return;
            // validate error
            $rootScope.errorMessage = "";
            $rootScope.successMessage = "";
            $scope.$evalAsync();
            if (!validateUploadFile()) {
                return;
            };
            $.connection.hub.start().done(function () {



                var formData = new FormData();
                formData.append("file", $ctrl.uploadFile.File);

                formData.append("tableName", $ctrl.uploadFile.TableName);
               

                $rootScope.progressBar = { Value: 0, Text: "Uploading..." };

                $http.post("/Admin/UploadFile", formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }
                ).success(function (res) {
                    if (!res.Error) {
                        // call the long method to add layer from file
                        //filePath, tableName, serviceId, connectionHubId, isODataEnabled
                        $.connection.progressHub.server.addLayerFromFile(res.FilePath, $ctrl.uploadFile.TableName,
                            $ctrl.single.Layer.ServiceId, $.connection.hub.id, $ctrl.uploadFile.IsODataEnabled ? true : false);
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                        $rootScope.progressBar.Text = "";
                        $.connection.hub.stop();
                    };
                   

                }).error(function (res, status) {
                    if (status == 401) {
                        authorizeService.logout();
                    }
                    else {
                        $rootScope.errorMessage = 'Cannot generate Layer "' + $ctrl.uploadFile.TableName + '".';
                    }
                    $rootScope.progressBar.Text = "";
                    $.connection.hub.stop();
                });
            });

        };
        $scope.changeFile = function (files) {
            $scope.$apply();
            $ctrl.uploadFile.File = files[0];
        }



        $ctrl.pushFolder = function (folder) {
            $ctrl.folders.push(folder);
        }
        $ctrl.pushService = function (service) {
            $ctrl.services.push(service);
        }
        var intProgressBar = function() {
            var progressNotifier = $.connection.progressHub;
            progressNotifier.client.addLayerSuccessCallBack = function (layers) {
                $scope.$apply(function () {
                    $rootScope.isIntro = false;
                    $ctrl.single.Layer = layers[0];
                    //$ctrl.layers.push(res.Layer);
                    var layerNames = "";
                    layers.forEach(function (item, idx) {
                        $ctrl.callback(item);
                        layerNames += item.Name;
                        if (idx != layers.length - 1) { // not the last item
                            layerNames += ", ";
                        }
                    });
                    $rootScope.successMessage = "Layer \"" + layerNames + "\" was generated successfully.";
                    //$ctrl.getTables();
                    $("#creatLayerModal").modal('hide');
                    $ctrl.uploadFile = initUploadFile();
                    $('#shapeFile').val("");
                    $rootScope.progressBar.Max = 0;
                    $rootScope.currentLayerId = layers[0].Id;
                    $rootScope.progressBar.Text = "";
                    $.connection.hub.stop();
                });
            };
            progressNotifier.client.addLayerErrorCallBack = function (message) {
                $scope.$apply(function () {
                    $rootScope.errorMessage = message;
                    $rootScope.progressBar.Text = "";
                    $.connection.hub.stop();
                });
            };
        }
        intProgressBar();
    }]



});
