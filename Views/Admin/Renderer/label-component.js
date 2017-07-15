myApp.component('labelComponent', {
    bindings: {
        attributes:"<",
        labelFeature:"="
    },
    templateUrl: '/Views/Admin/Renderer/label-component.html',
    controller: ['rendererService', function (rendererService) {
        var $ctrl = this;
        $ctrl.labelFeature.Text = $ctrl.labelFeature.Text || '';
        $ctrl.setDefaultValue=function () {
            $ctrl.labelFeature.TextSize = $ctrl.labelFeature.TextSize || 5;
            $ctrl.labelFeature.HaloSize = $ctrl.labelFeature.HaloSize || 1;
        };
        $ctrl.addAttributeToText = function ($item) {
            $ctrl.labelFeature.Text += '[' + $item.name + ']';
        }
        // Alignment
        $ctrl.alignments = rendererService.alignments;
        $ctrl.visibleRanges = rendererService.visibleRanges;
    }]
});