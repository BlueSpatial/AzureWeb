myApp.component('manageMetadataComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/manage-metadata-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', 'ngIntroService', function ($rootScope, $http, authorizeService, layerService, ngIntroService ) {
        var $ctrl = this;
        $ctrl.activeLayer = function (node) {
            if (node.MetadataType == 2) {
                $rootScope.currentLayerId = node.Id;
            }
        }
        $ctrl.introOptions = {
            steps: [
                {
                    element: '#intro1',
                    intro: "To get started add a folder. Folders help you organize Map Services and Feature Services.",
                    position: 'left'
                },
                {
                    element: '#intro2',
                    intro: "Now you can add a Map Service or Feature Service.",
                },
                {
                    element: '#intro3',
                    intro: "You can add a layer to a service by uploading a file or by connecting to a table in a database."
                }
            ]
        }
        $rootScope.callIntro = function (step) {
            if ($rootScope.isIntro) {
                setTimeout(function () {
                    $ctrl.callIntro(step);
                }, 500);
            }
        }
        $ctrl.single = {};
        $ctrl.single.NewFolder = {};
        $ctrl.single.NewService = {};
        $ctrl.connections = [];
        // get connection
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
        
        $ctrl.updateLayerBoolField = function (fieldName, layer) {
            layerService.updateLayerBoolField(fieldName, layer);
        }
        $ctrl.updateServiceCachedState = function (service) {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/UpdateServiceIsCached", { serviceId: service.Id, isCached: service.IsCached }
            ).success(function (res) {
                if (res.Error) {
                    service.IsCached = !service.IsCached;
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            })
            .error(authorizeService.onError);
        }
        $ctrl.updateServiceAllowAnonymousState = function (service) {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/UpdateServiceIsAllowAnonymous", { serviceId: service.Id, isAllowAnonymous: service.IsAllowAnonymous }
            ).success(function (res) {
                if (res.Error) {
                    service.IsAllowAnonymous = !service.IsAllowAnonymous;
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        }
        $ctrl.clearTileCache = function (scope) {
            if (!authorizeService.isAuthorize()) return;
            var confirmMessage = "Are you sure you want to clear tiles cache of service '" + scope.node.Name + "'?";

            if (confirm(confirmMessage)) {
                $rootScope.successMessage = "";
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.post("/Admin/ClearCache", { serviceId: scope.node.Id }
                ).success(function (res) {
                    if (!res.Error) {
                        $rootScope.successMessage = "Tiles cache has been cleared successfully!";
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                })
                .error(authorizeService.onError);
            }
        };
        $ctrl.getNodeLink = function (scope, idx) {
            var getServiceLink = function (serviceScope) {
                var folderName = serviceScope.$parentNodeScope.$modelValue.Name;
                var serviceName = serviceScope.node.Name;
                var serviceType = serviceScope.node.ServiceType ? "FeatureServer" : "MapServer"; // 1 for feature server
                links.push(folderName);
                links.push(serviceName);
                links.push(serviceType);
            }
            var links = ["/ArcGIS/rest/services"];
            switch (scope.node.MetadataType) {
                case 0:
                    links.push(scope.node.Name);
                    break;
                case 1:
                    if (scope.$parentNodeScope) { // fix bug when parrent node null
                        getServiceLink(scope);
                    }
                    break;
                case 2:
                    if (scope.$parentNodeScope) { // fix bug when parrent node null
                        getServiceLink(scope.$parentNodeScope);
                        links.push(idx);
                    }
                    break;
            }
            return links.join("/");
        }
        $ctrl.getNodeTypeName = function (scope, idx) {
            switch (scope.node.MetadataType) {
                case 0: return "";
                case 1: return scope.node.ServiceType ? "(Feature Service)" : "(Map Service)"; //1 for feature service
                case 2: return "(Layer " + idx + ")";
            }
        }
        $ctrl.removeMetadata = function (scope) {
            if (!authorizeService.isAuthorize()) return;
            var confirmMessage = "Are you sure you want to delete layer '" + scope.node.Name + "'?";
            if (scope.node.MetadataType == 0) {
                confirmMessage = "Are you sure you want to delete folder '" + scope.node.Name + "'? This will also delete all child services.";
            }
            else if (scope.node.MetadataType == 1) {
                confirmMessage = "Are you sure you want to delete service '" + scope.node.Name + "'? This will also delete all child layers.";
            };
            if (confirm(confirmMessage)) {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.post("/Admin/DeleteMetadata", { id: scope.node.Id, type: scope.node.MetadataType }
                ).success(function (res) {
                    if (!res.Error) {
                        scope.remove();
                        if (scope.node.MetadataType == 2 && scope.node.Id == $rootScope.currentLayerId) {
                            $rootScope.currentLayerId = null;
                        }
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                })
                .error(authorizeService.onError);
            }
        };

        $ctrl.toggle = function (scope) {
            scope.toggle();
        };


        $ctrl.collapseAll = function () {
            $rootScope.$broadcast('angular-ui-tree:collapse-all');
        };

        $ctrl.expandAll = function () {
            $rootScope.$broadcast('angular-ui-tree:expand-all');
        };
        var getMetadataTree = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            return $http.get("/Admin/GetMetadataTree").success(function (res) {
                if (!res.Error) {
                    $ctrl.data = res.Data;
                    if (!$ctrl.data.length) {
                        $ctrl.callIntro();
                        $rootScope.isIntro = true;
                    }
                    $ctrl.havePreview = res.HavePreview;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            }).error(authorizeService.onError);
        }
        getMetadataTree();
        $ctrl.importServiceCallBack = getMetadataTree;

       $ctrl.pushFolder = null; // this function difference for create and update
        $ctrl.pushService = null;

        $ctrl.addNewFolder = function () {
            $ctrl.single.IsEditMode = false;
            $ctrl.single.NewFolder = {};
            $("#creatFolderModel").modal('show');
            $ctrl.pushFolder = function (folder) {
                $ctrl.data.push({
                    Id: folder.Id,
                    Name: folder.Name,
                    MetadataType: 0,// 0 for foler
                    Nodes: []
                });
                $rootScope.successMessage = "Folder \"" + folder.Name + "\" was generated successfully.";
            }
        };
        $ctrl.showLayerModal = function (scope) {
            var nodeService = scope.$modelValue;
            var nodeFolder = scope.$parentNodeScope.$modelValue;
            $ctrl.single.Folder = nodeFolder;
            $ctrl.single.Service = nodeService;
            var $layerModal = $("#creatLayerModal");
            $layerModal.modal('show');
            $ctrl.saveLayerCallback = function (layer) {
                layer.Nodes = [];
                layer.MetadataType = 2;// 2 for layer
                nodeService.Nodes.push(layer);
            }
        }
        var generateFolderBreadcrumb = function (scope) {
            $ctrl.folderBreadcrumb = [{
                Url: $ctrl.getNodeLink(scope, 0),
                MetadataType: 0,
                Name: scope.$modelValue.Name,
            }];
        }
       
        $ctrl.addNewService = function (scope) {
           
            $ctrl.single.IsEditMode = false;
            $ctrl.single.NewService = { IsCached: false };
            if ($rootScope.isNotFullVersion()) {
                // auto select the default connection for basic version
                //if ($rootScope.isBasicVersion()) {
                //    $ctrl.connections.forEach(function (item, index) {
                //        if (item.IsDefault) {
                //            $ctrl.single.NewService.ConnectionId = item.Id;
                //        }
                //    });
                //}
                // map service for all not full version
                $ctrl.single.NewService.ServiceType = 0;
            }
           
            // select the first connection if have only one connection
            if ($ctrl.connections.length == 1) {
                $ctrl.single.NewService.ConnectionId = $ctrl.connections[0].Id;
            }
            
            var nodeFolder = scope.$modelValue;
            generateFolderBreadcrumb(scope);
            var folder = {Id: nodeFolder.Id, Name: nodeFolder.Name};
            $ctrl.single.Folder = folder;
            $("#creatServiceModel").modal('show');
            $ctrl.pushService = function (service) {
                service.MetadataType = 1;
                service.Nodes = [];
                nodeFolder.Nodes.push(service);
                $rootScope.successMessage = "Service \"" + service.Name + "\" was generated successfully.";
            }
            
        };

        $ctrl.editNode = function (scope) {
            $ctrl.single.IsEditMode = true;
            var currentNode = scope.node;
            if (currentNode.MetadataType == 0) {// folder
                $ctrl.single.NewFolder.Id = currentNode.Id;
                $ctrl.single.NewFolder.Name = currentNode.Name;
                $("#creatFolderModel").modal('show');                
                $ctrl.pushFolder=function(folder){
                    currentNode.Name = folder.Name;
                }
            }
            else if (currentNode.MetadataType == 1) {// service
                $ctrl.single.NewService.Id = currentNode.Id;
                $ctrl.single.NewService.Name = currentNode.Name;
                $ctrl.single.NewService.IsCached = currentNode.IsCached;
                var folder = scope.$parentNodeScope.$modelValue;
                generateFolderBreadcrumb(scope.$parentNodeScope);
                $ctrl.single.Folder = { Id: folder.Id, Name: folder.Name };
                $ctrl.single.NewService.ServiceType = currentNode.ServiceType;
                $ctrl.single.NewService.ConnectionId = currentNode.ConnectionId;
                $("#creatServiceModel").modal('show');
                $ctrl.pushService = function (service) {
                                    currentNode.Name = service.Name;
                                    currentNode.ServiceType = service.ServiceType;
                                    currentNode.IsCached = service.IsCached;
                                };
            }
        };
        $ctrl.isFeatureLayer = function (scope) {
            if (scope.node.MetadataType != 2) { // !layer
                return false;
            };
            if (scope.$parentNodeScope.$modelValue.ServiceType == 1) {// if service is feature service
                return true;
            };
            return false;

        }
        
        $ctrl.getDisableTitle = function (node) {
            if (!node.IsDisabled) {
                return "";
            }
            else {
                var metaName = "";
                if (node.MetadataType == 2) {
                    metaName = "layer";
                }
                else if (node.MetadataType == 1) {
                    metaName = "service";
                }
                return ["This ", metaName, " was disabled, please upgrade to PRO version to unlock it"].join("");
            }
        }     
        $ctrl.openImportServiceDialog = function (scope) {
            var nodeFolder = scope.$modelValue;
            var folder = { Id: nodeFolder.Id, Name: nodeFolder.Name };
            $ctrl.single.Folder = folder;
            $('#importServiceModal').modal('show');
            generateFolderBreadcrumb(scope);
        }
         
    }]
});
