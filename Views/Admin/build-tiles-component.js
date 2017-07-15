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
        //get tiles status
        $ctrl.$routerOnActivate = function (next) {
            // Get the hero identified by the route parameter
            var id = $ctrl.serviceId = next.params.id;
            var getCurrentTilesStatuses = function () {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.get("/Export/CurrentTilesStatuses/" + id).success(function (res) {
                    if (!res.Error) {
                        updateTilesStatuse(res.TilesStatuses);

                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                }).error(authorizeService.onError);
            }
            getCurrentTilesStatuses();
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
                $ctrl.progressBar = { Value: 0,IsLoading: true, Text: "Connecting...", Max: $ctrl.totalTilesToCreate() };
                $http.post("/Export/BuildTiles", { Levels: levels, ServiceId: $ctrl.serviceId, ConnectionHubId: $.connection.hub.id }
                ).success(function (res) {
                    if (res.Error) {
                        $rootScope.errorMessage = res.Message;
                    }
                    else {
                        $ctrl.checkAll = false;
                        $ctrl.updateChecked();// remove all check
                        calculatorTilesTotal();
                    };
                })
                    .error(authorizeService.onError)
                    .finally(function () {
                        $ctrl.progressBar.IsLoading = false;
                        $.connection.hub.stop();
                    });
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
            progressNotifier.client.updateProgressValue = function (i) {
                $rootScope.$apply(function () {
                    $ctrl.progressBar.Value += i;
                });
            };
            progressNotifier.client.updateProgressText = function (text) {
                $rootScope.$apply(function () {
                    $ctrl.progressBar.Text = text;
                });
            };


        }
        initProgress();

    }]


});
