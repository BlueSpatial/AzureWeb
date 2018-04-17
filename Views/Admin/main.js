/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var myApp = angular.module('myApp', ["angular-intro", "ui.bootstrap", "oc.lazyLoad", 'ngComponentRouter', 'about', 'licenseInfo', 'ngSanitize', 'ui.select', 'ui.tree', 'colorpicker.module', 'angularMultiSlider', 'LocalStorageModule', 'ui.bootstrap.progressbar', 'ckeditor', 'ui.bootstrap.contextMenu', 'angularjs-datetime-picker'])


/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
myApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

//AngularJS v1.3.x workaround for old style controller declarition in HTML
myApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
myApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: '../assets',
        globalPath: '../assets/global',
        layoutPath: '../assets/layouts/layout',
    };

    $rootScope.settings = settings;

    $rootScope.jsonToDate = function (jsonDate) {
        if (!jsonDate) {
            return null;
        }
        return new Date(parseInt(jsonDate.substr(6)));
    }

    return settings;
}]);
// this config disable ie cache
myApp.config(['$httpProvider', function ($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

/* Setup App Main Controller */
myApp.controller('AppController', ['$scope', '$rootScope','$location', function ($scope, $rootScope, $location) {
    $scope.$on('$viewContentLoaded', function() {
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
       
    });
    
    
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
myApp.controller('HeaderController', ['$scope',  'localStorageService', function ($scope, localStorageService) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
    $scope.currentUserName = function () {
        return localStorageService.get("authorizationData");
    }
}]);

/* Setup Layout Part - Sidebar */
myApp.controller('SidebarController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(null); // init sidebar      
        
    });
    $rootScope.sidebarShow = true;
}]);

/* Setup Layout Part - Quick Sidebar */
myApp.controller('QuickSidebarController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
       setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);

/* Setup Layout Part - Theme Panel */
myApp.controller('ThemePanelController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
myApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */

/* Init global settings and run the app */
myApp.run(["$rootScope", "settings", function($rootScope, settings) {
    $rootScope.$settings = settings; // setting to be accessed from view
}]);