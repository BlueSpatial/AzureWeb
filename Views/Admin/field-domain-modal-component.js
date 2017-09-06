myApp.component('fieldDomainModalComponent', {
    // isolated scope binding
    bindings: {
        domain: '=',       
    },

    templateUrl: '/Views/Admin/field-domain-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', 'rendererService', '$scope', '$rootScope', function ($http, rendererService, $scope, $rootScope) {
       
        var $ctrl = this;

        $ctrl.domainTypes = [{ Code: 'none', Name: 'None' },
            { Code: 'range', Name: 'Range' },
            { Code: 'codedValue', Name: 'Coded Value' },
        ];
        $ctrl.domain = {};
       
        $ctrl.addCodedValue = function () {
            $rootScope.errorMessage ="";
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
            $ctrl.domain.codedValues = $ctrl.domain.codedValues|| [];
            var currentCoded = {
                name: $ctrl.domain.CodedName,
                code: $ctrl.domain.CodedCode,
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
        }

        $ctrl.deleteCodedValue = function (c, $index) {
            $ctrl.domain.codedValues.splice($index, 1);
        }
        $ctrl.editCodedValue = function (c, $index) {
            $ctrl.domain.CodedName = c.name;
            $ctrl.domain.CodedCode = c.code;
            $ctrl.editingCodeValueIndex = $index;
            $ctrl.editing = true;
        }
        // modal check for error when click OK
        var validateDomain = function () {
            $rootScope.errorMessage = "";
            var messages = [];
            if ($ctrl.domain) {
                if ($ctrl.domain && $ctrl.domain.type != 'none') {
                    if (!$ctrl.domain.name) {
                        messages.push("Domain: Name is required!");
                    }
                    switch ($ctrl.domain.type) {
                        case 'range':
                            if (!$ctrl.domain.range[0] && $ctrl.domain.range[0] != 0) {
                                messages.push("Domain: Min value is required!");
                            }
                            if (!$ctrl.domain.range[1] && $ctrl.domain.range[1] != 0) {
                                messages.push("Domain: Max value is required!");
                            }
                            break;
                        case 'codedValue':
                            if (!$ctrl.domain.codedValues.length) {
                                messages.push("Domain: coded values is required!");
                            }
                           
                            break;
                    }
                }
            }
            return messages;
        }

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
        $ctrl.closeModal = function () {
            $rootScope.errorMessage = "";
            var messages = validateDomain();
            if (messages.length) {
                // show error
                $rootScope.errorMessage = messages.join('</br>');
            }
            else {
                $('#fieldDomainModal').modal('hide');
               // domainAngularObjectToJsObject($ctrl.domain);
            }           
        };
       
    }]
});