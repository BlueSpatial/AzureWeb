myApp.component('layerFieldComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/layer-field-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', function ($rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        // get field data
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

       

        $ctrl.$routerOnActivate = function (next) {
            // Get the hero identified by the route parameter
            var id = $ctrl.id = next.params.id;
            var getFields = function () {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.get("/Field/GetFields/" + id).success(function (res) {
                    if (!res.Error) {
                        $ctrl.fields = res.Fields;
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
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                }).error(authorizeService.onError);
            }
            getFields();
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
            
            $http.post("/Field/PostField", { fields: $ctrl.fields, layerId: $ctrl.id, isSupportTime: $ctrl.layer.IsSupportTime, timeFieldId: $ctrl.SelectedTimeField.Id, filterExpression: $ctrl.layer.FilterExpression }
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
            })
            .error(authorizeService.onError);        
         
        };
        $ctrl.updateOtherIsDisplay = function (fieldId, isChecked) {
            if (isChecked) {
                $ctrl.fields.forEach(function (field) {
                    if (field.Id != fieldId) {
                        field.IsDisplay = false;
                    }
                })
            }
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
            if ($ctrl.fieldsForm.$dirty) {
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
