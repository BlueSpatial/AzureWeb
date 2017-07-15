myApp.component('createFolderModalComponent', {
    // isolated scope binding
    bindings: {
        callback: '=',
        single: '=',
    },

    templateUrl: '/Views/Admin/SharedComponent/create-folder-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$rootScope', 'authorizeService', 'layerService', function ($http, $rootScope, authorizeService, layerService) {
        var $ctrl = this;
        $ctrl.saveFolder = function (folder) {
            $rootScope.errorMessage = "";
            if (!$ctrl.single.NewFolder.Name) {
                $rootScope.errorMessage = "Folder name is required!";
                return;
            }
            if (!authorizeService.isAuthorize()) return;
           
            $rootScope.isLoading = true;
            $ctrl.single.NewFolder.Id = $ctrl.single.NewFolder.Id || 0;
            $http.post("/Admin/PostFolder", { folder: { Id: $ctrl.single.NewFolder.Id, Name: $ctrl.single.NewFolder.Name } }
            ).success(function (res) {
                if (!res.Error) {
                    if ($ctrl.single.NewFolder.Id == 0) {
                        $ctrl.single.Folder = res.Folder;                       
                    }
                    $ctrl.callback(res.Folder);
                    $ctrl.single.NewFolder = {};
                    $rootScope.callIntro(2);
                    $("#creatFolderModel").modal('hide');
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };               
                $rootScope.isLoading = false;
            })
            .error(authorizeService.onError);
        };
    }]
});