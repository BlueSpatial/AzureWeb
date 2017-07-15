myApp.component('checkboxComponent', {
    transclude: true,
    bindings: {
        chkModel: '=',
    },
    template:'<ng-transclude ng-click="$ctrl.chkModel=!$ctrl.chkModel" class ="check-box" ng-class ="{\'chk-active\':$ctrl.chkModel}"></ng-transclude>'
    
    ,

    controller: function () {
        var $ctrl = this;

    }
});