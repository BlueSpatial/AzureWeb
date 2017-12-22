var factoryName = 'layerService';

myApp.factory(factoryName, ['$http', '$rootScope', 'authorizeService', function ($http, $rootScope, authorizeService) {
   
    //var getMetaDatas = function () {
    //    $rootScope.errorMessage = "";
    //    $rootScope.isLoading = true;
    //    return $http.get("/Admin/ListMetaDatas").success(function (res) {
    //        if (!res.Error) {             
    //        }
    //        else {
    //            $rootScope.errorMessage = res.Message;
    //        };
    //        $rootScope.isLoading = false;
    //    });

    //}
   
    // update seleted folder and service 
    //var updateSelectedItem = function (selectObjectStr, list) {
    //    var selectObject = $scope.single[selectObjectStr];
    //    if (selectObject && selectObject.Id) {
    //        var idx = -1;
    //        list.forEach(function (item, i) {
    //            if (item.Id == selectObject.Id) {
    //                idx = i;
    //                return false;
    //            }
    //        })
    //        if (idx == -1) {
    //            selectObject = {};
    //        }
    //        else {
    //            selectObject = list[idx];
    //        }
    //    }
    //    $scope.single[selectObjectStr] = selectObject;
    //};
    var callNewFolderDialog = function (item ,single) {
        single.NewFolder = {};       
    };
    var callNewServiceDialog = function (item, single) {
        single.NewService = { };       
    };
   

   
    return {
      
        //getMetaDatas: getMetaDatas,
        callNewFolderDialog: callNewFolderDialog,
        callNewServiceDialog: callNewServiceDialog,

        
    };
}]);