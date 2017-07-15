myApp.component('corsComponent', {
    // isolated scope binding
    bindings: {
        $router: '<'
    },
    templateUrl: '/Views/Admin/cors-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', 'authorizeService', function ($rootScope, $http, authorizeService) {
        var $ctrl = this;
        $ctrl.domains = {};

        $ctrl.$onInit = function () {
            
            var getOriginDomains = function () {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.get("/admin/ListDomains").success(function (res) {
                    if (!res.Error) {
                        $ctrl.domains = res.OriginDomains;
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                });
            }
            getOriginDomains();

        }
        $ctrl.addNewDomain = function () {
            $ctrl.domain = {};
            $("#createDomainModel").modal('show');
        }
        $ctrl.saveDomain = function () {
            if (!authorizeService.isAuthorize()) return;
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $ctrl.domain.Id = $ctrl.domain.Id || 0;
            $http.post("/Admin/PostOriginDomain", { originDomain: { Id: $ctrl.domain.Id, Name: $ctrl.domain.Name } }
            ).success(function (res) {
                if (!res.Error) {
                    if ($ctrl.domain.Id == 0) {
                        $ctrl.domains.push(res.Domain);
                    }
                    else {
                        var currentDomain = $ctrl.domains.filter(function (item, idx) {
                            return item.Id == $ctrl.domain.Id
                        })[0];
                        var idx = $ctrl.domains.indexOf(currentDomain);
                        $ctrl.domains[idx] = res.Domain;
                    }
                    $ctrl.domain = {};
                    $("#createDomainModel").modal('hide');
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };

                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);
        }
        $ctrl.deleteDomain = function (domain, idx) {
            if (!authorizeService.isAuthorize()) return;
            var confirmMessage = "Are you sure you want to delete domain '" + domain.Name + "'?";
            if (confirm(confirmMessage)) {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                $http.post("/Admin/DeleteMetadata", { id: domain.Id, type: 3 }// 3 for domain
                ).success(function (res) {
                    if (!res.Error) {
                        $ctrl.domains.splice(idx, 1);
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                })
                    .error(authorizeService.onError);
            }
        };

        $ctrl.editDomain = function (domain) {
            $ctrl.domain = $.extend({}, domain);
            $("#createDomainModel").modal('show');
        };
    }]
       
       
});
