myApp.component('fieldDomainModalComponent', {
    // isolated scope binding
    bindings: {
        domain: '=',
        connections: '='
    },

    templateUrl: '/Views/Admin/field-domain-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', 'rendererService', '$scope', '$rootScope', function ($http, rendererService, $scope, $rootScope) {
        var $ctrl = this;

        $ctrl.domainTypes = [{ Code: 'none', Name: 'None' },
        { Code: 'range', Name: 'Range' },
        { Code: 'codedValue', Name: 'Coded Value' }
        ];

        $ctrl.addCodedValuesType = [
            { Type: 'addManual', Name: 'Add Manual' },
            { Type: 'addFromDatabase', Name: 'Add From Database' }
        ];

        $ctrl.addCodedValueMethod = {};

        $ctrl.selectedConnection = {};

        $ctrl.getTables = function () {
            if (!$ctrl.selectedConnection || !$ctrl.selectedConnection.Id) {
                return;
            }
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/ListTablesByConnectionId", { connectionId: $ctrl.selectedConnection.Id }
            ).success(function (res) {
                if (!res.Error) {
                    $ctrl.tables = res.Tables;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                }
                $rootScope.isLoading = false;
            });
        };
        $scope.$watch('$ctrl.selectedConnection.Id', function () {
            $ctrl.getTables();
        });


        $ctrl.selectedTable = {
            Name: "",
            ColumnName: ""
        };


        $ctrl.getColumns = function () {
            if (!$ctrl.selectedConnection.Id || !$ctrl.selectedTable.Name) {
                return;
            }
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/ListColumns", { connectionId: $ctrl.selectedConnection.Id, tableName: $ctrl.selectedTable.Name }
            ).success(function (res) {
                if (!res.Error) {
                    $ctrl.columns = res.Columns;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                }
                $rootScope.isLoading = false;
            });
        };

        $scope.$watch('$ctrl.selectedTable.Name', function () {
            $ctrl.getColumns();
        });

        $ctrl.domain = {};
        $rootScope.errorMessage = "";
        $ctrl.addCodedValue = function () {
            var messages = [];
            if (!$ctrl.domain.CodedName) {
                messages.push("Coded name is required!");
            }
            if (!$ctrl.domain.CodedCode) {
                messages.push("Coded code is required!");
            }
            if (messages.length) {
                $rootScope.errorMessage = messages.join("<br/>");
                return;
            }
            $ctrl.domain.codedValues = $ctrl.domain.codedValues || [];
            var currentCoded = {
                name: $ctrl.domain.CodedName,
                code: $ctrl.domain.CodedCode
            };
            if ($ctrl.editingCodeValueIndex == undefined) {
                $ctrl.domain.codedValues.push(currentCoded);
            }
            else {
                $ctrl.domain.codedValues[$ctrl.editingCodeValueIndex] = currentCoded;
                $ctrl.editingCodeValueIndex = undefined;
            }
            $ctrl.domain.CodedName = $ctrl.domain.CodedCode = "";
            $ctrl.editing = false;
        };


        // add coded value from database
        $ctrl.addCodedValueFromDatabase = function () {
            var messages = [];
            if (!$ctrl.selectedConnection.Id) {
                messages.push("Connection is required!");
            }
            if (!$ctrl.selectedTable.Name) {
                messages.push("Table is required!");
            }

            if (!$ctrl.selectedTable.ColumnName) {
                messages.push("Column is required!");
            }
            if (messages.length) {
                $rootScope.errorMessage = messages.join("<br/>");
                return;
            }

            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/ListCodedValues", { connectionId: $ctrl.selectedConnection.Id, tableName: $ctrl.selectedTable.Name, columnName: $ctrl.selectedTable.ColumnName }
            ).success(function (res) {
                if (!res.Error) {
                    $ctrl.domain.codedValues = res.CodedValues;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                }
                $rootScope.isLoading = false;
            });

        };


        $ctrl.deleteCodedValue = function (c, $index) {
            $ctrl.domain.codedValues.splice($index, 1);
        };
        $ctrl.editCodedValue = function (c, $index) {
            $ctrl.domain.CodedName = c.name;
            $ctrl.domain.CodedCode = c.code;
            $ctrl.editingCodeValueIndex = $index;
            $ctrl.editing = true;
        };

        // modal check for error when click OK
        var validateDomain = function () {
            $rootScope.errorMessage = "";
            var messages = [];
            if ($ctrl.domain) {
                if ($ctrl.domain && $ctrl.domain.type && $ctrl.domain.type != 'none') {
                    if (!$ctrl.domain.name) {
                        messages.push("Domain: Name is required!");
                    }
                    switch ($ctrl.domain.type) {
                        case 'range':
                            if (!$ctrl.domain.range || (!$ctrl.domain.range[0] && $ctrl.domain.range[0] != 0)) {
                                messages.push("Domain: Min value is required!");
                            }
                            if (!$ctrl.domain.range || (!$ctrl.domain.range[1] && $ctrl.domain.range[1] != 0)) {
                                messages.push("Domain: Max value is required!");
                            }
                            break;
                        case 'codedValue':
                            if (!$ctrl.domain.codedValues || !$ctrl.domain.codedValues.length) {
                                messages.push("Domain: coded values is required!");
                            }

                            break;
                    }
                }
            }
            return messages;
        };

        $('#fieldDomainModal').on('hidden.bs.modal', function () {
            delete $ctrl.domain.CodedName;
            delete $ctrl.domain.CodedCode;
            switch ($ctrl.domain.type) {
                case 'range':
                    delete $ctrl.domain.codedValues;
                    break;
                case 'codedValue':
                    delete $ctrl.domain.range;
                    break;
                default:
                    $ctrl.domain = {};
                    break;
            }
        });
        $ctrl.saveDomainValues = function () {
            $rootScope.errorMessage = "";
            var messages = validateDomain();
            if (messages.length) {
                // show error
                $rootScope.errorMessage = messages.join('</br>');
            }
            else {
                $ctrl.closeModal();
                // domainAngularObjectToJsObject($ctrl.domain);
            }
        };
        $ctrl.closeModal = function () {
            $('#fieldDomainModal').modal('hide');
        };
    }]
});