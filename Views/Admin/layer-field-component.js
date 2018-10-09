myApp.component('layerFieldComponent', {
    // isolated scope binding
    bindings: {
        connections:'='
    },
    templateUrl: '/Views/Admin/layer-field-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', 'commonService', function ($rootScope, $http, authorizeService, layerService, commonService) {
        var $ctrl = this;
        $ctrl.layer = { IsSupportTime: false };
        $ctrl.domains = {
            none: "None",
            range: "Range",
            codedValue: "Coded Value"
        };
        $ctrl.openDomainModal = function (domain) {
            //domainJsObjectToAngularObject(domain);
            $ctrl.activeDomain = domain;
            $ctrl.activeDomain.range = $ctrl.activeDomain.range || [];
            $("#fieldDomainModal").modal("show");
        }

       
        // get field data
        var getFields = function (id) {           
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/Field/GetFields/" + $rootScope.currentLayerId).success(function (res) {
                if (!res.Error) {
                    if (res.LayerNotFound) {
                        $rootScope.currentLayerId = null;
                    } else {
                        $ctrl.fields = res.Fields;                        
                        $ctrl.updateDisplayField();
                        $ctrl.beginFields = angular.copy($ctrl.fields);
                        $ctrl.fieldTypes = res.FieldTypes;
                        $ctrl.layer = res.Layer;
                        $ctrl.connection = res.Connection;
                        // map to select time field
                        if (res.Layer.TimeFieldId != -1) {
                            $ctrl.beginFields.forEach(function (v, i) {
                                if (v.Id == res.Layer.TimeFieldId) {
                                    $ctrl.SelectedTimeField = v;
                                };
                            });
                        }
                        else {
                            $ctrl.SelectedTimeField = {};
                        };
                    }
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            }).error(authorizeService.onError);
        }
        $ctrl.selectedField = {};
        $ctrl.fieldTypes = [];
        $ctrl.fields = [];
        $ctrl.beginFields = [];// the field saved to database
        $ctrl.haveIncludeDateTimeField = function () {
            var result = false;
            $ctrl.beginFields.forEach(function (v, i) {
                if (v.Type == 5 && v.IsIncluded) {
                    result = true;
                    return false; //exit loop
                }
            });
            return result;
        }
        $ctrl.onLayerChange = function () {
            if ($rootScope.currentLayerId) {
                getFields($rootScope.currentLayerId);
            };
        };
         
       

        //$ctrl.$routerOnActivate = function (next) { 
        //    $rootScope.currentLayerId = parseInt(next.params.id);
        //    $ctrl.onLayerChange();
        //};
        this.$onDestroy = $rootScope.$watch('currentLayerId', function () {
            $ctrl.onLayerChange();
        });
        var beginUpdateField = function () {
            $rootScope.errorMessage = "";
            $rootScope.successMessage = "";
            if ($ctrl.layer.IsSupportTime) {
                if (!$ctrl.SelectedTimeField || !$ctrl.SelectedTimeField.Id) {
                    $rootScope.errorMessage = "Time field is required!";
                    return;
                }
            }
            // replace the filter
            $ctrl.layer.FilterExpression = $ctrl.layer.FilterExpression || "";
            $ctrl.layer.FilterExpression = $ctrl.layer.FilterExpression.replace(/"/g, "'");
            $rootScope.isLoading = true;
            $ctrl.fields.forEach(function (item, idx) {
                item.JsonDomain = JSON.stringify(item.Domain);
            });
        }
        var updateFieldCallBack = function (res, message) {
            if (res.Error) {
                $rootScope.errorMessage = res.Message;
            }
            else {
                $ctrl.fields = res.Fields;
                $ctrl.layer.IsSupportTime = res.IsSupportTime;
                $ctrl.SelectedTimeField = $ctrl.SelectedTimeField||{};
                $ctrl.SelectedTimeField.Id = res.TimeFieldId;
                $ctrl.beginFields = angular.copy($ctrl.fields);
                $rootScope.successMessage = message;
                $ctrl.form.$setPristine();
            };
            $rootScope.isLoading = false;
            $ctrl.updateDisplayField();
        }

        $ctrl.syncLayerToTable = function () {
            beginUpdateField();
            $http.post("/Field/SyncLayerToTable", { fields: $ctrl.fields, layerId: $rootScope.currentLayerId, isSupportTime: $ctrl.layer.IsSupportTime, timeFieldId: $ctrl.SelectedTimeField.Id, filterExpression: $ctrl.layer.FilterExpression }
            ).success(function (res) {
                updateFieldCallBack(res, "Sync successfull!");
            })
        }; 
       
        $ctrl.saveFields = function () {
            beginUpdateField();
            $http.post("/Field/PostField", { fields: $ctrl.fields, layerId: $rootScope.currentLayerId, isSupportTime: $ctrl.layer.IsSupportTime, timeFieldId: $ctrl.SelectedTimeField.Id, filterExpression: $ctrl.layer.FilterExpression }
            ).success(function (res) {
                updateFieldCallBack(res, "Save successfull!");
            })
            .error(authorizeService.onError);        
         
        };
        $ctrl.updateIsDisplay = function () {            
            $ctrl.fields.forEach(function (field) {
                field.IsDisplay = false;
                if (field.Id == $ctrl.displayField) {
                    field.IsDisplay = true;
                }
            })           
        }
        $ctrl.updateDisplayField = function () {
            $ctrl.fields.forEach(function (field) {               
                if (field.IsDisplay ==true) {
                    $ctrl.displayField = field.Id;
                    return false;
                }
            })
        }
        $ctrl.reset = function () {
            $ctrl.fields = angular.copy($ctrl.beginFields);
            $ctrl.form.$setPristine();
        };
        // waring when have change
        commonService.warmningWhenHaveChange($ctrl);
        
    }]
       
       
});
