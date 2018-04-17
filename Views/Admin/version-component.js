myApp.component('versionComponent', {
    // isolated scope binding
    bindings: {
      
    },
    templateUrl: '/Views/Admin/version-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$filter', '$http', 'authorizeService', 'layerService', 'commonService', function ($rootScope, $filter, $http, authorizeService, layerService, commonService) {
        var $ctrl = this;
        $ctrl.layer = { IsSupportTime: false };
        $ctrl.timeOption = "";
        $ctrl.dataTables = [
            { Name: "All features", DataObjectName: "data" },
            { Name: "Add features", DataObjectName: "addData" },
            { Name: "Delete features", DataObjectName: "deleteData" }
        ];

        var getLayerVersionSetting = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/admin/GetLayerVersions", { params: { layerId: $rootScope.currentLayerId } }).success(function (res) {
                if (!res.Error) {
                    $ctrl.layerVersionSetting = res.LayerVersionSetting;
                    $ctrl.EditHistories = res.EditHistories;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        function convertUTCDateToLocalDate(date) {
            var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

            var offset = date.getTimezoneOffset() / 60;
            var hours = date.getHours();

            newDate.setHours(hours - offset);

            return newDate;
        }
       
        $ctrl.onLayerChange = function () {
            if ($rootScope.currentLayerId) {
                getLayerVersionSetting();
            };
        };
         
           
        this.$onDestroy = $rootScope.$watch('currentLayerId', function () {
            $ctrl.onLayerChange();
        });
        
        $ctrl.enableHistoryTracking = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
           
            $http.post("/Admin/EnableHistoryTracking", { layerId: $rootScope.currentLayerId }
            ).success(function (res) {
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $rootScope.successMessage = "History tracking was enabled successfully!";
                    $ctrl.layerVersionSetting = { IsVersioned: true };
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };
        var getUtcDate = function () {
            if ($ctrl.timeOption == 'history') {
                return $rootScope.jsonToDate($ctrl.editHistory.CreatedAt);
            }
            else {
                var date = new Date($ctrl.date);
                return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            }
        }

        var validateSelectedDate = function () {
            if ((!$ctrl.editHistory || !$ctrl.editHistory.CreatedAt) && !$ctrl.date) {
                $rootScope.errorMessage = "Please select the time or recovery point in the edit history!";
                return false;
            }
            return true;
        }
        var initdata = function() {
            $ctrl.data = null;
            $ctrl.addData = null;
            $ctrl.updateDataNew = null;
            $ctrl.updateDataOld = null;
            $ctrl.deleteData = null;
        };
        $ctrl.viewChange = function () {
            initdata();
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            if (!validateSelectedDate()) return;
            $rootScope.isLoading = true;
           
            $http.get("/Admin/GetHistoryData", { params: { layerId: $rootScope.currentLayerId, date: getUtcDate(), addIds: $ctrl.editHistory.Adds, updateIds: $ctrl.editHistory.Updates, deleteIds: $ctrl.editHistory.Deletes} }
            ).success(function (res) {
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.addData = res.AddData;
                    $ctrl.updateDataNew = res.UpdateDataNew;
                    $ctrl.updateDataOld = res.UpdateDataOld;
                    $ctrl.deleteData = res.DeleteData;
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        }
        $ctrl.revertChange = function () {           
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            if (!validateSelectedDate()) return;
            $rootScope.isLoading = true;

            $http.post("/Admin/RevertChange", { layerId: $rootScope.currentLayerId, date: getUtcDate(), addIds: $ctrl.editHistory.Adds, updateIds: $ctrl.editHistory.Updates, deleteIds: $ctrl.editHistory.Deletes } 
            ).success(function (res) {
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $rootScope.successMessage = "Changeset was reverted successfully!";
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        }

        $ctrl.getLayerDataAtThisTime = function () {
            initdata();
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            if (!validateSelectedDate()) return;
            $rootScope.isLoading = true;

            $http.get("/Admin/GetLayerDataAsOf", { params: { layerId: $rootScope.currentLayerId, date: getUtcDate()} }
            ).success(function (res) {
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $ctrl.data = res.Data;                   
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        }

        $ctrl.rollback = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            if (!validateSelectedDate()) return;
            $rootScope.isLoading = true;
            

            $http.post("/Admin/RollbackLayerData", { layerId: $rootScope.currentLayerId, date: getUtcDate() }
            ).success(function (res) {
                if (res.Error) {
                    $rootScope.errorMessage = res.Message;
                }
                else {
                    $rootScope.successMessage = "Rollback successfully!";
                    getLayerVersionSetting();//to get the history list again
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        };
        $ctrl.dateFormat = 'MMM d, y h:mm a';
        $ctrl.getDisplayText = function (editHistoryItem) {
            if (!editHistoryItem) return;
            var date = convertUTCDateToLocalDate($rootScope.jsonToDate(editHistoryItem.CreatedAt));
            var displayText = $filter('date')(date, $ctrl.dateFormat);
            if (editHistoryItem.UserName) {
                displayText += " - User: " + editHistoryItem.UserName;
            }
            if (editHistoryItem.RollbackTime != "/Date(-62135596800000)/") { //have rollback time
                var rollbackTime = convertUTCDateToLocalDate($rootScope.jsonToDate(editHistoryItem.RollbackTime));
                rollbackTime = $filter('date')(rollbackTime, $ctrl.dateFormat);
                displayText += " (Rollback to "+rollbackTime+" )";
            }
            return displayText;
           //{{$root.jsonToDate($select.selected.CreatedAt)|date:'MMM d, y h:mm a'}} <span ng-if="$select.selected.UserName">- User: {{$select.selected.UserName}}</span></span>
        }

        $ctrl.changeTimeOption = function (option) {
            $ctrl.timeOption = option;
        }
    }]
       
       
});
