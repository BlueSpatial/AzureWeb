var factoryName = 'commonService';

myApp.factory(factoryName, ['$http', '$rootScope',  function ($http, $rootScope) {

    var mergeObject = function (source, dest, attrs) { //out dest
        attrs.forEach(function (attr) {
            dest[attr] = source[attr];
        });
    }
    var warmningWhenHaveChange = function ($ctrl) {
        var warningMessage = "You have pending changes. Click OK to undo changes.";
        window.onbeforeunload = function () {
            if ($ctrl.form && $ctrl.form.$dirty) {
                return warningMessage;
            }
        }
        $rootScope.canDeactivate = function () { // return false to not allow navigate to other page
            if ($ctrl.form && $ctrl.form.$dirty) {
                if (confirm(warningMessage)) {
                    return true
                } else {
                    return false;
                };
            }
            return true;
        }
    }
   
    return {
        mergeObject: mergeObject,
        warmningWhenHaveChange: warmningWhenHaveChange
       
    };
}]);