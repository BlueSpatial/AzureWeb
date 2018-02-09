myApp.component('symbolComponent', {
    // isolated scope binding
    bindings: {
        label: '=',       
        symbolType: '=',
        patterns:'=',
        transparency:'<',
        onUpdateActiveLabel: '&',
        smsStyles: '=',
    },

    templateUrl: '/Views/Admin/Renderer/symbol-component.html',

    // The controller that handles our component logic
    controller: function () {
        var $ctrl = this;
        this.showSymbolModal = function () {
            // set default value if not have
            if ($ctrl.symbolType == 'SimpleFillSymbol') {
                $ctrl.label.Symbol = $ctrl.label.Symbol || { };
                $ctrl.label.Symbol.Outline = $ctrl.label.Symbol.Outline || {};
                $ctrl.label.Symbol.Outline.Color = $ctrl.label.Symbol.Outline.Color || 'rgba(95, 90, 90, 1)';
                $ctrl.label.Symbol.Outline.LineWidth = $ctrl.label.Symbol.Outline.LineWidth || 2;                
                $ctrl.label.Symbol.Outline.Pattern = $ctrl.label.Symbol.Outline.Pattern || $ctrl.patterns[0];
            }
            else if ($ctrl.symbolType == 'SimpleLineSymbol') {
                $ctrl.label.Symbol = $ctrl.label.Symbol || {};
                $ctrl.label.Symbol.LineWidth = $ctrl.label.Symbol.LineWidth || 2;
                $ctrl.label.Symbol.Pattern = $ctrl.label.Symbol.Pattern || $ctrl.patterns[0];
            }
            else if ($ctrl.symbolType == 'SimpleMarkerSymbol') {
                $ctrl.label.Symbol = $ctrl.label.Symbol || {};
                $ctrl.label.Symbol.Size = $ctrl.label.Symbol.Size || 10;
                $ctrl.label.Symbol.Style = $ctrl.label.Symbol.Style || $ctrl.smsStyles[0].Value;
                $ctrl.label.Symbol.Outline = $ctrl.label.Symbol.Outline || {};
                $ctrl.label.Symbol.Outline.Color = $ctrl.label.Symbol.Outline.Color || 'rgba(95, 90, 90, 1)';
                $ctrl.label.Symbol.Outline.Width = $ctrl.label.Symbol.Outline.Width || 2;
               
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