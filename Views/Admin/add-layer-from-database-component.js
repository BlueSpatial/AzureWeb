﻿myApp.component('addLayerFromDatabaseComponent', {
    // isolated scope binding
    bindings: {
        single: '=',
        callback: '=',
        defaultSRs: '='
    },
    templateUrl: '/Views/Admin/add-layer-from-database-component.html',

    // The controller that handles our component logic
    controller: ['$scope', '$rootScope', '$http', 'authorizeService', 'layerService', function ($scope, $rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        $ctrl.connectionInfo = {};
        //$ctrl.callNewServiceDialog = layerService.callNewServiceDialog;
        //$ctrl.callNewFolderDialog = layerService.callNewFolderDialog;
        //layerService.getMetaDatas().then(function (res) {
        //    $ctrl.folders = res.data.Folders;
        //    $ctrl.services = res.data.Services;
        //    $ctrl.layers = res.data.Layers;
        //});
        
        $ctrl.sR = 102100;
        $ctrl.getTables = function () {
            if (!$ctrl.single.Layer || !$ctrl.single.Layer.ServiceId) {
                return;
            }
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.post("/Admin/ListTables", { serviceId: $ctrl.single.Layer.ServiceId}
           ).success(function (res) {
               if (!res.Error) {
                   $ctrl.tables = res.Tables;
               }
               else {
                   $rootScope.errorMessage = res.Message;
               };
               $rootScope.isLoading = false;
           });
        };        
        $scope.$watch('$ctrl.single.Layer.ServiceId', function () {
            $ctrl.getTables();
        });
        $ctrl.generateHibernateConfig = function () {
            if (!authorizeService.isAuthorize()) return;
            if (!$ctrl.layerName) {
                $rootScope.errorMessage = "Layer name is required";
                return;
            }
            if (!$ctrl.sR) {
                $rootScope.errorMessage = "Spatial reference is required";
                return;
            }
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $rootScope.successMessage = "";
            
            $ctrl.sR = $ctrl.sR || 102100;
            $http.post("/Admin/GenerateHibernateConfig", { connectionInfo: $ctrl.connectionInfo, serviceId: $ctrl.single.Layer.ServiceId, layerName: $ctrl.layerName, isODataEnabled: ($ctrl.isODataEnabled ? true : false) }
           ).success(function (res) {
               if (!res.Error) {
                   $ctrl.callback(res.Layer);
                   $ctrl.single.Layer = res.Layer;
                   //$ctrl.layers.push(res.Layer);
                   var layerNameLower = res.Layer.Name.toLowerCase();
                   $rootScope.successMessage = "Layer \"" + res.Layer.Name + "\" was generated successfully.";
                   $rootScope.isIntro = false;
                   $ctrl.tables = $ctrl.tables || [];
                   $ctrl.tables.forEach(function (item, i) {
                       if (item.Name.toLowerCase() == layerNameLower) {
                           $ctrl.tables.splice(i, 1);
                       }
                   })
                   $("#creatLayerModal").modal('hide');
                   $ctrl.connectionInfo.TableName = "";
                   $ctrl.layerName = "";
                   $rootScope.currentLayerId = res.Layer.Id;
                   $ctrl.sR = 102100;
               }
               else {
                   $rootScope.errorMessage = res.Message;
                   if (res.FullError) {
                       console.log(res.FullError);
                   }
               };
               $rootScope.isLoading = false;
               
           })
           .error(function (res, status) {
               if (status == 401) {
                   authorizeService.logout();
               }
               else {
                   $rootScope.errorMessage = 'Cannot generate Layer "' + $ctrl.uploadFile.TableName + '".';
               }               
           });
        }
       
        $ctrl.pushFolder = function (folder) {
            $ctrl.folders.push(folder);
        }
        $ctrl.pushService = function (service) {
            $ctrl.services.push(service);
        }
    }]
});
