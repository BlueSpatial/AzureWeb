myApp.component('loadingComponent', {
    // isolated scope binding
    bindings: { isLoading:"="
    },
    templateUrl: '/Views/Admin/loading-component.html',

    // The controller that handles our component logic
    controller: ['$rootScope', '$http', function ($rootScope, $http) {
        var $ctrl = this;      
       
    }]
       
       
});
