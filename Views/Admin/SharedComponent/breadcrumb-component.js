myApp.component('breadcrumbComponent', {
    // isolated scope binding
    bindings: {
        metadataType: '=',
        metadataId: '=',
    },

    templateUrl: '/Views/Admin/SharedComponent/breadcrumb-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$rootScope', "$scope", 'authorizeService', 'layerService', function ($http, $rootScope, $scope, authorizeService, layerService) {
        var $ctrl = this;
        $scope.$watch("$ctrl.metadataId", function () {
            if (!$ctrl.metadataId) {
                $ctrl.breadcrumb = {};
                return;
            }           
            $rootScope.isLoading = true;
            $http.get("/Admin/GetBreadcrumb/" + $ctrl.metadataType + "/" + $ctrl.metadataId).success(function (res) {
                if (!res.Error) {
                    if (res.LayerNotFound) {
                        $rootScope.currentLayerId = null;
                    } else {
                        $ctrl.breadcrumb = res.Breadcrumb;
                    }
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            }).error(authorizeService.onError);
            
        })

        $rootScope.$on('changeBreadcrumbServiceName', function (event, service) {
            if (!$ctrl.breadcrumb || !$ctrl.breadcrumb[1]){
                return;
            }
            $ctrl.breadcrumb[1].Name = service.Name;// update service name
            // update service url
            var serviceType = service.ServiceType ? "FeatureServer" : "MapServer";
            var urls = $ctrl.breadcrumb[1].Url.split("/");
            urls[urls.length - 1] = serviceType;
            urls[urls.length - 2] = service.Name;
            $ctrl.breadcrumb[1].Url = urls.join("/");
            $ctrl.breadcrumb[1].ServiceType = service.ServiceType;
        });
        $rootScope.$on('changeBreadcrumbLayerName', function (event, layerName) {
            if (!$ctrl.breadcrumb || !$ctrl.breadcrumb[2] ) {
                return;
            }
            $ctrl.breadcrumb[2].Name = layerName;
        });
        $rootScope.$on('changeBreadcrumbFolderName', function (event, folderName) {
            if (!$ctrl.breadcrumb || !$ctrl.breadcrumb[0]) {
                return;
            }
            $ctrl.breadcrumb[0].Name = folderName;
            var urls = $ctrl.breadcrumb[0].Url.split("/");
            urls[urls.length - 1] = folderName;           
            $ctrl.breadcrumb[0].Url = urls.join("/");
        });
        
    }]
});