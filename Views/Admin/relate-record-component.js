myApp.component('relatedRecordComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/relate-record-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
        var $ctrl = this;
        $ctrl.relateRecord = {};
        $ctrl.saveRelatedTables = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.relateRecord.SelectedTables = $ctrl.relateRecord.SelectedTables || [];
            var relatetionShips = [];
            $ctrl.relateRecord.SelectedTables.forEach(function (item, idx) {
                relatetionShips.push({
                    id:idx,
                    name:item.Name,
                    relatedTableId:idx
                });
            });
            

            $http.post("/Admin/SaveRelatedTables", { layerId: $ctrl.layerId, relatetionShips: JSON.stringify(relatetionShips) }
            ).success(function (res) {
                if (res.Error) {                   
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $rootScope.successMessage = "Related record was updated successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };

        var getRelateRecord = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetRelatedTables", { params: { layerId: $ctrl.layerId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.tables = res.Tables;
                    $ctrl.relateRecord.SelectedTables=res.SelectTables;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.reset = getRelateRecord;
        $ctrl.$routerOnActivate = function (next) {
            $ctrl.layerId = parseInt(next.params.id);            
            getRelateRecord();           
        };
       
      

    }]


});
