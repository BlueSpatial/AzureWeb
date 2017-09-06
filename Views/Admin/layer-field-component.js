myApp.component('layerFieldComponent', {
    // isolated scope binding
    bindings: {
      
    },
    templateUrl: '/Views/Admin/layer-field-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', function ($rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;     
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
         
       

        $ctrl.$routerOnActivate = function (next) { 
            $rootScope.currentLayerId = parseInt(next.params.id);
            $ctrl.onLayerChange();
        };
       
       
       
        $ctrl.saveFields = function () {
            $rootScope.errorMessage = "";
            $rootScope.successMessage = "";
            if ($ctrl.layer.IsSupportTime) {
                if (!$ctrl.SelectedTimeField || !$ctrl.SelectedTimeField.Id) {
                    $rootScope.errorMessage = "Time field is required!";
                    return;
                }
            }
            $rootScope.isLoading = true;
            $ctrl.fields.forEach(function (item, idx) {                                             
                item.JsonDomain = JSON.stringify(item.Domain);
            });
            $http.post("/Field/PostField", { fields: $ctrl.fields, layerId: $rootScope.currentLayerId, isSupportTime: $ctrl.layer.IsSupportTime, timeFieldId: $ctrl.SelectedTimeField.Id, filterExpression: $ctrl.layer.FilterExpression }
            ).success(function (res) {
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.fields = res.Fields;                  
                    $ctrl.beginFields = angular.copy($ctrl.fields);
                    $rootScope.successMessage = "Save successfully!";
                    $ctrl.fieldsForm.$setPristine();
                };
                $rootScope.isLoading = false;
                $ctrl.updateDisplayField();
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
            $ctrl.fieldsForm.$setPristine();
        };
        var warningMessage = "You have pending changes. Click OK to undo changes.";
        window.onbeforeunload = function () {
            if ($ctrl.fieldsForm&&$ctrl.fieldsForm.$dirty) {
                return warningMessage;
            }
        }
        // waring when have message
        this.$routerCanDeactivate = function () { // return false to not allow navigate to other page
            if ($ctrl.fieldsForm&&$ctrl.fieldsForm.$dirty) {
                if (confirm(warningMessage)) {
                    return true
                } else {
                    return false;
                };
            }
            return true;
        }
    }]
       
       
});
