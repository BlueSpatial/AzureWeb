myApp.component('createFolderModalComponent', {
    // isolated scope binding
    bindings: {
        callback: '=',
        single: '=',
    },

    templateUrl: '/Views/Admin/SharedComponent/create-folder-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$rootScope', 'authorizeService', 'layerService', 'commonService', function ($http, $rootScope, authorizeService, layerService, commonService) {
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
                    if ($ctrl.single.NewFolder.Id != 0) {
                        $rootScope.successMessage = "Folder was updated successfully!"; 
                       // update folder name in the breadcrumb
                        $rootScope.$emit('changeBreadcrumbFolderName', $ctrl.single.NewFolder.Name);
                    }
                    else {
                       
                    }
                    $ctrl.callback(res.Folder);
                    $rootScope.callIntro(2);
                    $ctrl.form.$setPristine();
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };               
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);           
        };
        var getFolderSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetFolderSetting", { params: { folderId: $rootScope.currentFolderId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.single.NewFolder = res.FolderSetting;

                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.reset = function () {
            $ctrl.form.$setPristine();
            if($ctrl.single.IsEditMode){
                getFolderSetting();
            }
            else {
                $ctrl.single.NewFolder.Name="";
            }
        };
        this.$onDestroy = $rootScope.$watch('currentFolderId', function () {
            if ($rootScope.currentFolderId) {
                getFolderSetting();
            }
        });
        // waring when have change
        commonService.warmningWhenHaveChange($ctrl);
    }]
});