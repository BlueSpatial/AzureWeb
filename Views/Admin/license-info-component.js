﻿(function (angular) {
    'use strict';
    angular.module('licenseInfo', []).component('licenseInfoComponent', {
        // isolated scope binding
        bindings: {

        },
        templateUrl: '/Views/Admin/license-info-component.html',


        // The controller that handles our component logic
        controller: ['$scope', '$rootScope', '$http', 'authorizeService', function ($scope, $rootScope, $http, authorizeService) {
            var $ctrl = this;
            $ctrl.jsonToDate = function (jsonDate) {
                if (!jsonDate) {
                    return null;
                }
                return new Date(parseInt(jsonDate.substr(6)));
            }
            $ctrl.uploadFile = {};
            var validateUploadFile = function () {
                var isValid = true;
                var messages = [];

                if (!$ctrl.uploadFile) {
                    messages.push("Upload file info is required");
                    isValid = false;
                } else {

                    if (!$ctrl.uploadFile.File) {
                        messages.push("File is required");
                        isValid = false;
                    };
                }
                $rootScope.errorMessage = messages.join(", ");
                return isValid;
            };
            $ctrl.upload = function () {
                if (!authorizeService.isAuthorize()) return;

                // validate error
                if (!validateUploadFile()) {
                    return;
                };
                $rootScope.errorMessage = "";
                $rootScope.successMessage = "";
                $rootScope.isLoading = true;

                var formData = new FormData();
                formData.append("file", $ctrl.uploadFile.File);

                $http.post("/Admin/UploadLicense", formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }
                ).success(function (res) {
                    if (!res.Error) {
                        $rootScope.licenseInfo = res.LicenseInfo;
                        $rootScope.successMessage = "License was update successfully.";
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                }).error(authorizeService.onError);
            };


            $scope.changeFile = function (files) {
                $scope.$apply();
                $ctrl.uploadFile.File = files[0];
            }


        }]

    });
})(window.angular);
