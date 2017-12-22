myApp.component('createServiceModalComponent', {
    // isolated scope binding
    bindings: {
        connections:'=',
        callback: '=',
        single: '=',
        breadcrumb:'='
    },

    templateUrl: '/Views/Admin/SharedComponent/create-service-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$rootScope', 'authorizeService', 'layerService', 'commonService', function ($http, $rootScope, authorizeService, layerService, commonService) {
        var $ctrl = this;
        $ctrl.serviceTypes = [{ Id: 0, DisplayName: 'Map Service' },
            { Id: 1, DisplayName: 'Feature Service' }];
        //use for only show the link if the value saved
        var setSaveValue = function () {
            $ctrl.single.NewService.IsWMSEnabledSavedValue = $ctrl.single.NewService.IsWMSEnabled;
            $ctrl.single.NewService.IsCachedSavedValue = $ctrl.single.NewService.IsCached;
        };
        $ctrl.creatNewService = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            var _validateService = function () {
                var valid = true;
                var messages = [];
                if (!$ctrl.single.NewService || !$ctrl.single.NewService.ConnectionId) {
                    messages.push("Database connection is required");
                    valid = false;
                }
                if (!$ctrl.single.NewService || !$ctrl.single.NewService.Name) {
                    messages.push("Service name is required");
                    valid = false;
                }
                if (!$ctrl.single.NewService || $ctrl.single.NewService.ServiceType == undefined) {
                    messages.push("Service type is required");
                    valid = false;
                }
                if (!$ctrl.single.NewService||!$ctrl.single.NewService.FolderId) {
                    messages.push("Folder is required");
                    valid = false;
                }
                if ($ctrl.single.NewService.MaxScale < $ctrl.single.NewService.MinScale) {
                    messages.push("Max scale must greater than or equal Min scale");
                    valid = false;
                }
                $rootScope.errorMessage = messages.join(', ');
                return valid;
            }
            if (_validateService()) {
                $rootScope.isLoading = true;
                $ctrl.single.NewService.Id = $ctrl.single.NewService.Id || 0;
                $rootScope.successMessage = "";
                var service = {};
                commonService.mergeObject($ctrl.single.NewService, service, ['Id', 'Name', 'IsCached', 'IsWMSEnabled', 'ServiceType', 'ConnectionId', 'MinScale', 'MaxScale', 'MaxRecordCount', 'IsAllowAnonymous', 'FolderId']);
                $http.post("/Admin/PostService", { service: service }
                ).success(function (res) {
                    if (!res.Error) {
                        if ($ctrl.single.NewService.Id == 0) {
                            $ctrl.single.Layer = {ServiceId: res.Service.Id };
                            $ctrl.single.NewService.Id = res.Service.Id;
                          
                        }
                        else { // when update
                            $rootScope.$emit('changeBreadcrumbServiceName', $ctrl.single.NewService);
                        }
                        $ctrl.callback(res.Service);
                        $rootScope.callIntro(3);
                        $ctrl.form.$setPristine();
                        setSaveValue();
                        $rootScope.currentNode.IsCached = $ctrl.single.NewService.IsCached;
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };                    
                    $rootScope.isLoading = false;
                })
                .error(authorizeService.onError);
            }            
        };

        var getServiceSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetServiceSetting", { params: { serviceId: $rootScope.currentServiceId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.single.NewService = res.ServiceSetting;
                    $rootScope.currentNode.IsCached = $ctrl.single.NewService.IsCached;
                    setSaveValue();
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.reset = function () {
            $ctrl.form.$setPristine();
            if ($ctrl.single.IsEditMode) {
                getServiceSetting();
            }
            else {
              $ctrl.single.NewService.Name="";
                $ctrl.single.NewService.MinScale=0;
                $ctrl.single.NewService.MaxScale=0;
                $ctrl.single.NewService.IsWMSEnabled=true;
                $ctrl.single.NewService.MaxRecordCount=1000;
                $ctrl.single.NewService.IsAllowAnonymous=false;
            }
        }
        this.$onDestroy = $rootScope.$watch('currentServiceId', function () {
            if ($rootScope.currentServiceId) {
                getServiceSetting();
            }
        });
        // waring when have change
        commonService.warmningWhenHaveChange($ctrl);
    }]
});