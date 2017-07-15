myApp.component('createLayerModalComponent', {
    // isolated scope binding
    bindings: {
        callback: '=',
        single: '=',
    },

    templateUrl: '/Views/Admin/SharedComponent/create-layer-modal-component.html',

    // The controller that handles our component logic
    controller: ['$http', '$rootScope', 'authorizeService', 'layerService', function ($http, $rootScope, authorizeService, layerService) {
        var $ctrl = this;
        $ctrl.layerTypes = [{ Id: 0, Name: "Add layer from file" }, { Id: 1, Name: "Add layer from database" }];
        $ctrl.single.AddLayerType = $ctrl.layerTypes[0];

    }]
});