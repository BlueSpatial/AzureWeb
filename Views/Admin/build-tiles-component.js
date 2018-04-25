myApp.component('buildTilesComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/build-tiles-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', 'layerService', function ($rootScope, $http, authorizeService, layerService) {
        var $ctrl = this;
        $ctrl.total = { TotalTiles: 0, TilesCreated: 0, Storage: 0 };
        $ctrl.sizePerTile = function () {
            if ($ctrl.total.TilesCreated) { // if have created tile calculartor base on this tile
                return $ctrl.total.Storage / $ctrl.total.TilesCreated;
            }
            return 10240; // 10kb/ tile
        }
        $ctrl.tilesStatuses = [];
        var calculatorTilesTotal = function () {
            $ctrl.total = { TotalTiles: 0, TilesCreated: 0, Storage: 0 };
            $ctrl.tilesStatuses.forEach(function (item) {
                $ctrl.total.TotalTiles += item.TotalTiles;
                $ctrl.total.TilesCreated += item.TilesCreated;
                $ctrl.total.Storage += item.Storage;
            })
        }
        var updateTilesStatuse = function (tilesStatuses) {
            $ctrl.tilesStatuses = tilesStatuses;
            // calculator the total
            calculatorTilesTotal();
        };
        var getCurrentTilesStatuses = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/Export/CurrentTilesStatuses/" + $rootScope.currentServiceId).success(function (res) {
                if (!res.Error) {
                    updateTilesStatuse(res.TilesStatuses);

                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            }).error(authorizeService.onError);
        }
        //get tiles status
        this.$onDestroy = $rootScope.$watch('currentServiceId', function () {
            if ($rootScope.currentServiceId) {
                getCurrentTilesStatuses();
            }
        });
        $ctrl.$routerOnActivate = function (next) {
            // Get the hero identified by the route parameter
           
        };
        $ctrl.clearTileCache = function () {
            if (!authorizeService.isAuthorize()) return;
            var confirmMessage = "Are you sure you want to clear tiles cache of service '" + $rootScope.currentNode.Name + "'?";

            if (confirm(confirmMessage)) {
                $rootScope.successMessage = "";
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.post("/Admin/ClearCache", { serviceId: $rootScope.currentNode.Id }
                ).success(function (res) {
                    if (!res.Error) {
                        getCurrentTilesStatuses();
                        $rootScope.successMessage = "Tiles cache has been cleared successfully!";
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                })
                    .error(authorizeService.onError);
            }
        };
        $ctrl.buildTiles = function () {
            if (!authorizeService.isAuthorize()) return;
            $.connection.hub.start().done(function () {
                $rootScope.errorMessage = "";
                var levels = [];
                $ctrl.tilesStatuses.forEach(function (item, index) {
                    if (item.IsSelected) {
                        levels.push(item.Level);
                    }
                })
                if (!levels.length) {
                    return;
                }
                $ctrl.progressBar = { Value: 0, IsLoading: true, Text: "Connecting...", Max: $ctrl.totalTilesToCreate() };
                
                $.connection.progressHub.server.buildTiles({ Levels: levels, ServiceId: $rootScope.currentServiceId, ConnectionHubId: $.connection.hub.id });
            });
        }

        $ctrl.totalTilesToCreate = function () {
            var total = 0;

            $ctrl.tilesStatuses.forEach(function (item, index) {
                if (item.IsSelected) {
                    total += item.TotalTiles;
                }
            })
            return total;
        }
        $ctrl.updateChecked = function () {
            $ctrl.tilesStatuses.forEach(function (item, index) {
                item.IsSelected = $ctrl.checkAll;
            })
        }

        var initProgress = function () {
            var progressNotifier = $.connection.progressHub;

            // client-side sendMessage function that will be called from the server-side
            progressNotifier.client.updateCreatedTiles = function (level, tilesCreated, storage) {
                $rootScope.$apply(function () {
                    $ctrl.tilesStatuses.forEach(function (item, index) {
                        if (item.Level === level) {
                            item.TilesCreated = tilesCreated;
                            item.Storage = storage;
                            return false; // exit loop
                        }
                    })
                });
            };
            progressNotifier.client.updateProgressMax = function () {
                $rootScope.$apply(function () {
                   
                    $ctrl.progressBar.Max = $ctrl.totalTilesToCreate();
                });
            };
            progressNotifier.client.increaseProgressValue = function () {
                $rootScope.$apply(function () {
                    //var newValue = $ctrl.progressBar.Value + i;
                    //if (newValue > $ctrl.progressBar.Max) { // don allow new value>max;
                    //    newValue = $ctrl.progressBar.Max;
                    //}
                    $ctrl.progressBar.Value +=1;
                });
            };
            progressNotifier.client.updateProgressText = function (text) {
                $rootScope.$apply(function () {
                    $ctrl.progressBar.Text = text;
                });
            };
            progressNotifier.client.buildTilesSuccessCallBack = function () {
                $rootScope.$apply(function () {
                    $ctrl.checkAll = false;
                    $ctrl.updateChecked();// remove all check
                    calculatorTilesTotal();
                    $ctrl.progressBar.IsLoading = false;
                    $.connection.hub.stop();
                });
            };
            progressNotifier.client.buildTilesErrorCallBack = function (message) {
                $rootScope.$apply(function () {
                    $rootScope.errorMessage = message;
                    $ctrl.progressBar.IsLoading = false;
                    $.connection.hub.stop();
                });
            };



        }
        initProgress();

    }]


});
