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
            if ($ctrl.metadataId != undefined && $ctrl.metadataId != null) {
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
            }
        })
        
    }]
});