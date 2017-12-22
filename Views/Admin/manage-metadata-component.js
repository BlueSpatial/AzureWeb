myApp.component('manageMetadataComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/manage-metadata-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', 'ngIntroService', 'commonService', function ($rootScope, $http, authorizeService, layerService, ngIntroService, commonService ) {
        var $ctrl = this;
        $ctrl.menuOptions = [
            ['<span class="glyphicon glyphicon-remove"></span> Delete', function ($itemScope, $event) {
                $ctrl.removeMetadata($itemScope)
            }]
        ]
        $ctrl.layerTabs = [{ Id: 0, Name: 'Layer' },
            { Id: 1, Name: 'Fields' },
            { Id: 2, Name: 'Styles' },
            { Id: 3, Name: 'Labels' },           
            { Id: 4, Name: 'HTML' },
            { Id: 5, Name: 'Related Records' },
            { Id: 6, Name: 'Events' }
        ];
        $ctrl.currentLayerTab = 0;
        $ctrl.serviceTabs = [{ Id: 0, Name: 'Service' },
        { Id: 1, Name: 'Build Tiles' },        
        ];
        $ctrl.currentServiceTab = 0;
        $ctrl.activeLayerTab = function (id) {
            if ($rootScope.canDeactivate && !$rootScope.canDeactivate()) {
                return; // can't navigate away if have unsaved change
            }
            $ctrl.currentLayerTab = id;
        }
        $ctrl.activeServiceTab = function (id) {
            if ($rootScope.canDeactivate && !$rootScope.canDeactivate()) {
                return; // can't navigate away if have unsaved change
            }
            $ctrl.currentServiceTab = id;
        }

        $ctrl.activeNode = function (scope, idx) {
            if ($rootScope.canDeactivate&&!$rootScope.canDeactivate()) {
                return; // can't navigate away if have unsaved change
            }
            $rootScope.currentNodeIndex = idx;
            $rootScope.currentScope = scope;
            $rootScope.currentNode = scope.node;
            editNode(scope);
        }
        var activeNodeManually = function (node) {
            setTimeout(function () {
                var currentScope = angular.element("#node" + node.MetadataType + "_" + node.Id).scope();
                $ctrl.activeNode(currentScope.$nodeScope, currentScope.$index);
                $rootScope.$digest();
            });
        };
        var inactiveNode = function (scope, idx) {
            $rootScope.currentNodeIndex = -1;
            $rootScope.currentScope = {};
            $rootScope.currentNode = {};           
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
        
        
        
       
        
        $ctrl.getNodeLink = function (scope, idx) {
            var getServiceLink = function (serviceScope) {
                var folderName = serviceScope.$parentNodeScope.$modelValue.Name;
                var serviceName = serviceScope.node.Name;
                var serviceType = serviceScope.node.ServiceType ? "FeatureServer" : "MapServer"; // 1 for feature server
                links.push(folderName);
                links.push(serviceName);
                links.push(serviceType);
            }
            var links = ["/bluespatial/gsr/services"];
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
                case 1: return scope.node.ServiceType ? "(Feature Service)" : "(Map Service)"; //1 for feature service
                //case 2: return "(Layer " + idx + ")";
                default: return "";
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
                        inactiveNode();
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
            if ($rootScope.canDeactivate && !$rootScope.canDeactivate()) {
                return; // can't navigate away if have unsaved change
            }
            $ctrl.single.IsEditMode = false;
            $ctrl.single.NewFolder = {};
            $rootScope.currentNode = { Id: 0, MetadataType: 0 }; // MetadataType:0 for folder
            $rootScope.currentScope = {};
           
            $ctrl.pushFolder = function (folder) {
                var folderNode = {
                    Id: folder.Id,
                    Name: folder.Name,
                    MetadataType: 0,// 0 for foler
                    Nodes: []
                };
                $ctrl.data.push(folderNode);
                activeNodeManually(folderNode);                
                // copy current node to continue edit
                $ctrl.single.NewFolder.Id = folderNode.Id;                
                $rootScope.successMessage = "Folder \"" + folder.Name + "\" was generated successfully.";
                // update the pushFolder function, since after first push the second time is edit
                //$ctrl.pushFolder = function (folder) {
                //    folderNode.Name = folder.Name;
                //}
            }
        };
        $ctrl.showLayerModal = function (scope) {
            var nodeService = scope.$modelValue;           
            
            $ctrl.single.Layer = { ServiceId:nodeService.Id };
            var $layerModal = $("#creatLayerModal");
            $layerModal.modal('show');
            $ctrl.saveLayerCallback = function (layer) {
                layer.Nodes = [];
                layer.MetadataType = 2;// 2 for layer                
                nodeService.Nodes.push(layer);
                activeNodeManually(layer);
               
            }
        }
        var generateFolderBreadcrumb = function (scope) {
            $ctrl.folderBreadcrumb = [{
                Url: $ctrl.getNodeLink(scope, 0),
                MetadataType: 0,
                Name: scope.$modelValue.Name,
            }];
        }
        var attrsToMerge = ['Id', 'Name', 'ServiceType','IsDisabled'];
        $ctrl.addNewService = function (scope) {
           
            $ctrl.single.IsEditMode = false;
            $ctrl.single.NewService = { IsCached: false, IsWMSEnabled: true, IsAllowAnonymous: false, MaxRecordCount:1000, MinScale:0, MaxScale:0 };
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
            $rootScope.currentNode = { Id: 0, MetadataType:1 };// MetadataType=1 for service
            
            var nodeFolder = scope.$modelValue;
            $ctrl.single.NewService.FolderId = nodeFolder.Id;
            generateFolderBreadcrumb(scope);
            $ctrl.pushService = function (service) {
                service.MetadataType = 1;
                service.Nodes = [];
                nodeFolder.Nodes.push(service);
                activeNodeManually(service);               
                $rootScope.successMessage = "Service \"" + service.Name + "\" was generated successfully.";
                // the second time this will be edit service
               
                //$ctrl.pushService = function (s) {
                //    commonService.mergeObject(s, service, attrsToMerge);
                //    service.MetadataType = 1;
                //    service.Nodes = [];
                //    $rootScope.successMessage = "Service \"" + service.Name + "\" was updated successfully.";
                //}

            }
            
        };
      

        var editNode = function (scope) {
            $ctrl.single.IsEditMode = true;
            var currentNode = scope.node;
            $rootScope.currentFolderId = 0;
            $rootScope.currentLayerId = 0;
            $rootScope.currentServiceId = 0;
            if (currentNode.MetadataType == 0) {// folder             
                           
                $ctrl.pushFolder=function(folder){
                    currentNode.Name = folder.Name;
                }
                $rootScope.currentFolderId = currentNode.Id;
            }
            else if (currentNode.MetadataType == 1) {// service
               
            
                //$("#creatServiceModel").modal('show');
                $ctrl.pushService = function (service) {
                    commonService.mergeObject(service, currentNode, attrsToMerge);
                    $rootScope.successMessage = "Service \"" + service.Name + "\" was updated successfully.";
                };
                $rootScope.currentServiceId = currentNode.Id;
                if (currentNode.ServiceType==1){ // for feature service active tab 0 b/c we don't have tab 1
                    $ctrl.currentServiceTab = 0;
                }
            }
            else if (currentNode.MetadataType == 2) {// layer
                $ctrl.single.NewLayer = {};
                $ctrl.single.NewLayer.Id = currentNode.Id;
                $ctrl.single.NewLayer.Name = currentNode.Name;
                $ctrl.single.NewLayer.IsODataEnabled = currentNode.IsODataEnabled;
                //("#editLayerModal").modal('show');
                $ctrl.pushLayer = function (layerName) {
                    currentNode.Name = layerName;
                };
                $rootScope.currentLayerId = currentNode.Id;
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
        };    
        $ctrl.openImportServiceDialog = function (scope) {
            $('#importServiceModal').modal('show');
            generateFolderBreadcrumb(scope);
        };
        setTimeout(function () {
            $("#tree-root").slimScroll({
                height: 'calc(100vh - 120px)'
            });
        });

        this.$routerCanDeactivate = $rootScope.canDeactivate;
         
    }]
});
