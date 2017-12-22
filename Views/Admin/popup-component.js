myApp.component('popupComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/popup-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', function ($rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        var getPopupContent = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/Admin/GetPopupContent/" + $rootScope.currentLayerId).success(function (res) {
                if (!res.Error) {
                    if (res.LayerNotFound) {
                        $rootScope.currentLayerId = null;
                        return;
                    }
                    $ctrl.popupTypes = res.PopupTypes;
                    $ctrl.popup = res.Popup;
                    $ctrl.defaultContents = res.DefaultContents;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        // get field data
        $ctrl.onLayerChange = function () {
            if ($rootScope.currentLayerId) {
                getPopupContent();
            }
        };
        //$ctrl.$routerOnActivate = function (next) {
        //    // Get the layer Id by the route parameter
        //    $rootScope.currentLayerId =parseInt(next.params.id);     
        //    $ctrl.onLayerChange();
        //};
        this.$onDestroy = $rootScope.$watch('currentLayerId', function () {
            $ctrl.onLayerChange();
        });
        $ctrl.save = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.popup.Id = $rootScope.currentLayerId;
            $http.post("/Admin/UpdatePopupContent", { popup: $ctrl.popup}
            ).success(function (res) {               
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.popup = res.Popup;
                    $rootScope.successMessage = "Popup was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };
        $ctrl.options = {
            allowedContent: true,
            entities: false
        };
        $ctrl.reset = function () {
            getPopupContent();
        }
        $ctrl.onChangePopupType = function () {
            if (!$ctrl.popup.PopupType) {
                $ctrl.popup.PopupContent = "";
            }
            else {
                $ctrl.popup.PopupContent = $ctrl.defaultContents[$ctrl.popup.PopupType];
            }
        };
       
    }]
       
       
});
