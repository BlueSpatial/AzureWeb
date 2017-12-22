var getScopeByController = function (ctrlName) {
    return angular.element(document.querySelector('[ng-controller=' + ctrlName + ']')).scope();
};
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
// config access token
//myApp.factory('htppBearerAuthorizationInterceptor', ['localStorageService', function (localStorageService) {
//    return {
//        'request': function (config) {
//            var auth = localStorageService.get('authorizationData') || {};
//            var accessToken = auth.Token;
//            if (typeof accessToken != 'undefined') {
//                config.headers.Authorization = 'bearer ' + accessToken;
//            }
//            return config;
//        }
//    };
//}]).config(['$httpProvider', function ($httpProvider) {
//    $httpProvider.interceptors.push('htppBearerAuthorizationInterceptor');
//}]);
myApp.config(function ($locationProvider) {
  //  $locationProvider.html5Mode(true);
})

.value('$routerRootComponent', 'myApp')

.component('myApp', {
    template:    
      '<ng-outlet></ng-outlet>\n',
    $routeConfig: [      
      { path: '/ManageServices', name: 'ManageServices', component: 'manageMetadataComponent' },
       { path: '/Renderer', name: 'Renderer', component: 'createRendererComponent' },
       { path: '/FieldConfiguation', name: 'FieldConfiguation', component: 'layerFieldComponent' },
       { path: '/PopupConfiguation', name: 'PopupConfiguation', component: 'popupComponent' },
       { path: '/BuildTiles', name: 'BuildTiles', component: 'buildTilesComponent' },
       { path: '/ManageConnection', name: 'ManageConnection', component: 'manageConnectionComponent' },
       { path: '/ManageUser', name: 'ManageUser', component: 'manageUserComponent' },
       { path: '/Cors', name: 'Cors', component: 'corsComponent' },
       { path: '/OtherSetting', name: 'OtherSetting', component: 'otherSettingComponent' },
       { path: '/AzureAdSetting', name: 'AzureAdSetting', component: 'azureAdSettingComponent' },
      { path: '/LicenseInfo', name: 'LicenseInfo', component: 'licenseInfoComponent' },
      { path: '/UserLogin', name: 'UserLogin', component: 'userLoginComponent', useAsDefault: true },
      { path: '/LayerConfiguation', name: 'LayerConfiguation', component: 'layerConfigComponent' },
      { path: '/EventConfiguation', name: 'EventConfiguation', component: 'eventConfigComponent' },
      { path: '/RelatedRecord', name: 'RelatedRecord', component: 'relatedRecordComponent' },
      { path: '/**', redirectTo: ['UserLogin'] },
    ]
});

myApp.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});
myApp.filter('fileSize', function () {
    return function (size) {
        if (isNaN(size))
            size = 0;

        if (size < 1024)
            return size + ' B';

        size /= 1024;

        if (size < 1024)
            return size.toFixed(2) + ' KB';

        size /= 1024;

        if (size < 1024)
            return size.toFixed(2) + ' MB';

        size /= 1024;

        if (size < 1024)
            return size.toFixed(2) + ' GB';

        size /= 1024;

        return size.toFixed(2) + ' Tb';
    };
});

myApp.directive('ngMin', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            function validate() {
                if (element
                && element[0]
                && element[0].localName === 'input'
                && isNumber(attrs.ngMin)
                && isNumber(element[0].value)
                && parseFloat(element[0].value) < parseFloat(attrs.ngMin)) {
                    if (isNumber(attrs.ngMax)) {
                        element[0].value = parseFloat(attrs.ngMax);
                        if (attrs.hasOwnProperty("ngModel"))
                            $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMax));
                    }
                    else {
                        element[0].value = parseFloat(attrs.ngMin);
                        if (attrs.hasOwnProperty("ngModel"))
                            $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMin));
                    }
                }
            }
            scope.$watch(function () {
                return attrs.ngMin + "-" + element[0].value;
            }, function (newVal, oldVal) {
                if (newVal != oldVal)
                    validate();
            });
            validate();
        }
    };
});
myApp.directive('ngMax', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            function validate() {
                if (element
                && element[0]
                && element[0].localName === 'input'
                && isNumber(attrs.ngMax)
                && isNumber(element[0].value)
                && parseFloat(element[0].value) > parseFloat(attrs.ngMax)) {
                    if (isNumber(attrs.ngMin)) {
                        element[0].value = parseFloat(attrs.ngMin);
                        if (attrs.hasOwnProperty("ngModel"))
                            $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMin));
                    }
                    else {
                        element[0].value = parseFloat(attrs.ngMax);
                        if (attrs.hasOwnProperty("ngModel"))
                            $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMax));
                    }
                }
            }
            scope.$watch(function () {
                return attrs.ngMax + "-" + element[0].value;
            }, function (newVal, oldVal) {
                if (newVal != oldVal)
                    validate();
            });
            validate();
        }
    };
});


myApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter, { 'event': event });
                });

                event.preventDefault();
            }
        });
    };
});
myApp.directive("uiSelectAddRemoveAll", function ($timeout, $rootScope) {

    return {
        restrict: 'A',
        scope: false,
        require: ['^uiSelect'],
        link: function (scope, element, attrs, require) {

            $timeout(function () {
                var originalOnSelectCallback = require[0].onSelectCallback;
                require[0].onSelectCallback = function (self, newItem) {
                    // Call origianl callback (if defined in attribute  data-on-select="..."
                    if (originalOnSelectCallback) {
                        originalOnSelectCallback.apply(this, arguments);
                    }
                    checkIfAddDeleteAll(newItem.$item, self);
                };


            });

            /**
             *
             * @param {string} item - Added item
             * @param {Object} self - Object "this" for uiSelect
             *
             * Appending feature "Add all" and "Remove all"
             */
            function checkIfAddDeleteAll(item, self) {
                var $modelValue = self.$select.ngModel.$modelValue;
                if (item.Id === -1) { //-1 add all, -2 remove all
                    $rootScope.$apply(function ($scope) {
                        // Remove item "ADD ALL"
                        self.$select.selected.pop();

                        self.$select.items.map(function (item) {
                            if (item.Id !== -1 && item.Id !== -2) { // not add ADD ALL and REMOVE ALL
                                if (self.$select.selected.indexOf(item) == -1) // only add if not exist, fix bug duplicate in LRP list in Document Screen
                                    self.$select.selected.push(item);
                            }
                        })
                    });
                }
                if (item.Id === -2) {
                    self.$select.selected = [];
                }

                if (item.Id === -1 || item.Id === -2) {
                    // Update remains item in suggestion. Not work automatically because for bug.
                    // Bug {@see https://github.com/angular-ui/ui-select/issues/918}
                    self.$selectMultiple.updateModel();
                    // Resize input box to right width
                    $timeout(function () {
                        self.$select.sizeSearchInput();
                    }, 200);
                }
            }

        }
    };
});
