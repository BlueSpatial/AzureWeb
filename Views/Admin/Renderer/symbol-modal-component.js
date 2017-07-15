myApp.component('symbolModalComponent', {
    // isolated scope binding
    bindings: {
        symbolType: '=',
        label:'=',
        patterns: '=',
        errorMessage: '=?',
        isLoading:'=?'
    },

    templateUrl: '/Views/Admin/Renderer/symbol-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', 'rendererService', '$scope', '$rootScope', function ($http, rendererService, $scope, $rootScope) {
       
        var $ctrl = this;
        $ctrl.activeTab = 0;
        $ctrl.supportedImageFormats = ".png, .jpg , .ico, .svg, .gif";
        $ctrl.uploadFile = {};
        // active correct tab
        $scope.$watch('$ctrl.symbolType', function () {
            if (!$ctrl.symbolType) {
                return;
            }
            if ($ctrl.symbolType.Value == 'PictureMarkerSymbol') {
                $ctrl.activeTab = 0;
            } else if ($ctrl.symbolType.Value == 'SimpleFillSymbol') {
                $ctrl.activeTab = 1;
            }
        })       
        $scope.changeFile = function (files) {
            $scope.$apply();
            $ctrl.uploadFile.File = files[0];
        }
        var validateUploadFile = function () {
            var isValid = true;            
            if (!$ctrl.uploadFile.File) {
                $ctrl.uploadImageDirectlyErrorMessage="File is required";
                isValid = false;
            };           
            return isValid;
        };
        $ctrl.uploadImageDirectly = function () {
            // validate error
            if (!validateUploadFile()) {
                return;
            };
            $ctrl.isLoading = true;
            $ctrl.uploadImageDirectlyErrorMessage = "";
            var formData = new FormData();
            formData.append("file", $ctrl.uploadFile.File);           

            $http.post("/Renderer/UploadImageDirectly", formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }
                ).success(function (res) {
                    if (!res.Error) {
                        $ctrl.showUploadImage = false;
                        $ctrl.label.Symbol.ImageUrl = res.ImageUrl;
                    }
                    else {
                        $ctrl.uploadImageDirectlyErrorMessage = res.Message;
                    };
                    $ctrl.isLoading = false;
                })
        };
        $ctrl.showImageLinkInput = false;
        getIcons = function () {
            this.errorMessage = "";
            this.isLoading = true;
            $http.get("/Renderer/ListIcons").success(function (res) {
                if (!res.Error) {
                    $ctrl.icons = res.Icons;
                }
                else {
                    this.errorMessage = res.Message;
                };
                this.isLoading = false;
            });
        }
        getIcons();
        $ctrl.uploadImage = function () {
            $ctrl.uploadImageErrorMessage = "";
            $ctrl.isLoading = true;
         
            $http.post("/Renderer/UploadImageByLink", { url: $ctrl.imageLink }).success(function (res) {
                if (!res.Error) {
                    $ctrl.showImageLinkInput = false;
                    $ctrl.label.Symbol.ImageUrl = res.ImageUrl;
                }
                else {
                    $ctrl.uploadImageErrorMessage = res.Message;
                };
                $ctrl.isLoading = false;
            });

        };
        // modal check for error when click OK
        $ctrl.validateSymbolError = function () {
            $rootScope.errorMessage = "";
            var messages = [];
            // validate label 
            rendererService.validateLabel($ctrl.label, $ctrl.symbolType, messages, true);
            if (messages.length) {
                // show error
                $rootScope.errorMessage = messages.join('</br>');
            }
            else {
                $('#symbolModal').modal('hide');
            }
        };
       
    }]
});