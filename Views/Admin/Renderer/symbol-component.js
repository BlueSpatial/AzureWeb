myApp.component('symbolComponent', {
    // isolated scope binding
    bindings: {
        label: '=',       
        symbolType: '=',
        patterns:'=',
        transparency:'<',
        onUpdateActiveLabel: '&'
    },

    templateUrl: '/Views/Admin/Renderer/symbol-component.html',

    // The controller that handles our component logic
    controller: function () {
        var $ctrl = this;
        this.showSymbolModal = function () {
            // set default value if not have
            if ($ctrl.symbolType.Value == 'SimpleFillSymbol') {
                $ctrl.label.Symbol = $ctrl.label.Symbol || { };
                $ctrl.label.Symbol.Outline = $ctrl.label.Symbol.Outline || {};
                $ctrl.label.Symbol.Outline.LineWidth = $ctrl.label.Symbol.Outline.LineWidth || 2;                
                $ctrl.label.Symbol.Outline.Pattern = $ctrl.label.Symbol.Outline.Pattern || $ctrl.patterns[0];
            }
            else if ($ctrl.symbolType.Value == 'SimpleLineSymbol') {
                $ctrl.label.Symbol = $ctrl.label.Symbol || {};
                $ctrl.label.Symbol.LineWidth = $ctrl.label.Symbol.LineWidth || 2;
                $ctrl.label.Symbol.Pattern = $ctrl.label.Symbol.Pattern || $ctrl.patterns[0];
            }
            else {
                $ctrl.label.Symbol = $ctrl.label.Symbol || {};
                $ctrl.label.Symbol.Size = $ctrl.label.Symbol.Size || 20;
            }           

            $("#symbolModal").modal('show');
            // update active lable
            $ctrl.onUpdateActiveLabel({label:$ctrl.label});
        }
    }
});