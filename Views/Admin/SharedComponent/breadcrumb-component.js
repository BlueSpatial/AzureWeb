myApp.component('breadcrumbComponent', {
    // isolated scope binding
    bindings: {
        metadataType: '=',
        metadataId: '=',
        hideCopyButton: '=',
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
        //https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
        function copyTextToClipboard(text) {
            var textArea = document.createElement("textarea");

            //
            // *** This styling is an extra step which is likely not required. ***
            //
            // Why is it here? To ensure:
            // 1. the element is able to have focus and selection.
            // 2. if element was to flash render it has minimal visual impact.
            // 3. less flakyness with selection and copying which **might** occur if
            //    the textarea element is not visible.
            //
            // The likelihood is the element won't even render, not even a flash,
            // so some of these are just precautions. However in IE the element
            // is visible whilst the popup box asking the user for permission for
            // the web page to copy to the clipboard.
            //

            // Place in top-left corner of screen regardless of scroll position.
            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;

            // Ensure it has a small width and height. Setting to 1px / 1em
            // doesn't work as this gives a negative w/h on some browsers.
            textArea.style.width = '2em';
            textArea.style.height = '2em';

            // We don't need padding, reducing the size if it does flash render.
            textArea.style.padding = 0;

            // Clean up any borders.
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';

            // Avoid flash of white box if rendered for any reason.
            textArea.style.background = 'transparent';


            textArea.value = text;

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                if (successful) {
                    $rootScope.successMessage = "URL '"+text+"' copied to the clipboard!";
                }
            } catch (err) {
                console.log('Oops, unable to copy');
            }

            document.body.removeChild(textArea);
        }
        $ctrl.copyURL = function (url) {
            url = location.protocol + '//' + location.host+'/'+ url;
            copyTextToClipboard(url)
        }
        
    }]
});