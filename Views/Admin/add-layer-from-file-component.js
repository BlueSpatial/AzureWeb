myApp.component('addLayerFromFileComponent', {
    // isolated scope binding
    bindings: {
        single: '=',
        callback: '=',
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
       
        $ctrl.supportedFormats = ".zip, .geojson, .json, .kmz, .kml, .gpx, .gml, .rss";
        //$ctrl.callNewServiceDialog = layerService.callNewServiceDialog;
        //$ctrl.callNewFolderDialog = layerService.callNewFolderDialog;
        $ctrl.uploadFile = {};
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
            if (!$ctrl.single.Service) {
                messages.push("Service is required");
                isValid = false;
            }
            if (!$ctrl.uploadFile) {
                messages.push("Upload file info is required");
                isValid = false;
            } else {
                if (!$ctrl.uploadFile.TableName) {
                    messages.push("Layer name is required");
                    isValid = false;
                };
                if (!$ctrl.uploadFile.File) {
                    messages.push("File is required");
                    isValid = false;
                };
            }
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
                //ServerName, UserName, Password, DatabaseName, TableName
                //formData.append("ServerName", $ctrl.connectionInfo.ServerName);
                //formData.append("UserName", $ctrl.connectionInfo.UserName);
                //formData.append("Password", $ctrl.connectionInfo.Password);
                //formData.append("DatabaseName", $ctrl.connectionInfo.DatabaseName);
                formData.append("tableName", $ctrl.uploadFile.TableName);
                formData.append("serviceId", $ctrl.single.Service.Id);
                formData.append("connectionHubId", $.connection.hub.id);

                $rootScope.progressBar = { Value: 0, Text: "Uploading..." };

                $http.post("/Admin/UploadShapFile", formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }
                    ).success(function (res) {
                        if (!res.Error) {
                            $rootScope.successMessage = "Layer \"" + res.Layer.Name + "\" was generated successfully.";
                            $rootScope.isIntro = false;
                            $ctrl.single.Layer = res.Layer;
                            //$ctrl.layers.push(res.Layer);
                            $ctrl.callback(res.Layer);
                            //$ctrl.getTables();
                            $("#creatLayerModal").modal('hide');
                            $ctrl.uploadFile = {};
                            $('#shapeFile').val("");
                            $rootScope.progressBar.Max = 0;
                            $rootScope.currentLayerId = res.Layer.Id;
                        }
                        else {
                            $rootScope.errorMessage = res.Message;
                            if (res.FullError) {
                                console.log(res.FullError);
                            }
                        };
                        $rootScope.progressBar.Text = "";
                        $.connection.hub.stop();
                       
                    }).error(function (res, status) {
                        if (status == 401) {
                            authorizeService.logout();
                        }
                        else {
                            $rootScope.errorMessage = 'Server error ' + status;
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

       
        $ctrl.filterByFolder = function (service) {
            if (service.Id == -1 || !$ctrl.single.Folder || service.FolderId == $ctrl.single.Folder.Id) {
                return true;
            }
            return false;
        };
        $ctrl.pushFolder = function (folder) {
            $ctrl.folders.push(folder);
        }
        $ctrl.pushService = function (service) {
            $ctrl.services.push(service);
        }
    }]
   


});
