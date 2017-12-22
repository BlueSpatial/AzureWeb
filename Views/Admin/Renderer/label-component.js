myApp.component('labelComponent', {
    bindings: {
    },
    templateUrl: '/Views/Admin/Renderer/label-component.html',
    controller: ['rendererService', '$rootScope', '$http', 'authorizeService', 'commonService', function (rendererService, $rootScope, $http, authorizeService, commonService) {
        var $ctrl = this;
        var layerInfo = {};
        $ctrl.labelFeature = {};
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
       
        var updateLabelFeature = function (drawingInfo, labelFeature) { // in: drawing info,out : labelFeature
            if (drawingInfo.labelingInfo && drawingInfo.labelingInfo.length != 0) {
                var labelingInfo = drawingInfo.labelingInfo[0];
                labelFeature.IsActive = true;
                var alignmentItems = rendererService.alignments.filter(function (item, i) {
                    return item.Value == labelingInfo.labelPlacement;
                })
                if (alignmentItems.length == 1) {
                    labelFeature.Alignment = alignmentItems[0];
                }

                labelFeature.VisibleRange = rendererService.findVisibleRange(labelingInfo.minScale);
                labelFeature.Text = labelingInfo.labelExpression;
                labelFeature.TextColor = rendererService.convertColorArray(labelingInfo.symbol.color);
                labelFeature.TextSize = labelingInfo.symbol.font.size / 0.75;
                if (labelingInfo.symbol.font.decoration == 'underline') {
                    labelFeature.Underline = true;
                };
                if (labelingInfo.symbol.font.style == 'italic') {
                    labelFeature.Italic = true;
                };
                if (labelingInfo.symbol.font.weight == 'bold') {
                    labelFeature.Bold = true;
                };
                if (labelingInfo.symbol.haloColor) {
                    labelFeature.IsHalo = true;
                    labelFeature.HaloColor = rendererService.convertColorArray(labelingInfo.symbol.haloColor);
                    labelFeature.HaloSize = labelingInfo.symbol.haloSize / 0.75;
                };
            }
            else {
                // init label feature
                labelFeature.IsActive = null;
                labelFeature.Alignment = null;
                labelFeature.VisibleRange = null;
                labelFeature.Text = "";
                labelFeature.TextColor = null;
                labelFeature.TextSize = null;
                labelFeature.Underline = null;
                labelFeature.Italic = null;
                labelFeature.Bold = null;
                labelFeature.IsHalo = null;
                labelFeature.HaloColor = null;
                labelFeature.HaloSize = null;
            };
        };
        var getLayerInfo = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/Renderer/GetLayerInfo/" + $rootScope.currentLayerId).success(function (res) {
                if (!res.Error) {
                    if (res.LayerNotFound) {
                        $rootScope.currentLayerId = null;
                        return;
                    }
                    layerInfo = res.LayerInfo;
                    $ctrl.labelFeature.GeometryType = layerInfo.geometryType;
                    // get attribute
                    $ctrl.attributes = [];
                    layerInfo.fields.forEach(function (value, index) {
                        if (value.type != "esriFieldTypeGeometry" && value.type != "esriFieldTypeOID") {
                            $ctrl.attributes.push(value);
                        }
                    });                  
                    updateLabelFeature(layerInfo.drawingInfo, $ctrl.labelFeature);
                    $rootScope.isLoading = false;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                    $rootScope.isLoading = false;
                };

            });
        }
        $ctrl.reset = getLayerInfo;
        this.$onDestroy = $rootScope.$watch('currentLayerId', function () {
            if ($rootScope.currentLayerId) {
                getLayerInfo();
            }
        });
       
        var validateLabelFeature = function (labelFeature) {
            var messages = [];
            if (labelFeature.IsActive) {
                if (!labelFeature.Text) {
                    messages.push("Label: text is required.");
                };
                if (!labelFeature.TextSize) {
                    messages.push("Label: text size is required.");
                };
                if (!labelFeature.TextColor) {
                    messages.push("Label: text color is required.");
                };
                if (labelFeature.IsHalo) {
                    if (!labelFeature.HaloSize) {
                        messages.push("Label: Halo size is required.");
                    }
                    if (!labelFeature.HaloColor) {
                        messages.push("Label: Halo color is required.");
                    }
                };
                if (labelFeature.GeometryType == 'esriGeometryPoint' && !labelFeature.Alignment) {
                    messages.push("Label: Alignment is required.");
                };
                if (!labelFeature.VisibleRange) {
                    messages.push("Label: Visible range is required.");
                };
            }
            return messages;
        };
        var createLabelingInfo = function (labelFeature) {
            var createLabelSymbol = function () {
                return {
                    angle: 0,
                    backgroundColor: null,
                    borderLineColor: null,
                    color: rendererService.getColorArray(labelFeature.TextColor),
                    font:
                    {
                        size: labelFeature.TextSize * 0.75,
                        decoration: labelFeature.Underline ? "underline" : "none",
                        style: labelFeature.Italic ? "italic" : "normal",
                        weight: labelFeature.Bold ? "bold" : "normal",
                        family: "Arial Unicode MS"
                    },
                    haloColor: labelFeature.IsHalo ? rendererService.getColorArray(labelFeature.HaloColor) : null,
                    haloSize: labelFeature.IsHalo ? labelFeature.HaloSize * 0.75 : 0,
                    horizontalAlignment: "center",
                    kerning: true,
                    rightToLeft: false,
                    rotated: false,
                    text: "",
                    type: "esriTS",
                    xoffset: 0,
                    yoffset: 0
                }
            }
            return [
                {
                    labelPlacement: (labelFeature.GeometryType == 'esriGeometryPoint') ? labelFeature.Alignment.Value : "esriServerPolygonPlacementAlwaysHorizontal",
                    labelExpression: labelFeature.Text,
                    symbol: createLabelSymbol(),
                    maxScale: 0,
                    minScale: labelFeature.VisibleRange.Value,
                    useCodedValues: true,//todo
                    where: null
                }
            ];
        }

        $ctrl.saveRenderer = function () {
            $rootScope.successMessage = "";
            $rootScope.errorMessage = "";
            if (!authorizeService.isAuthorize()) return;
            var messages = validateLabelFeature($ctrl.labelFeature);
            if (messages.length) {// if error 
                $rootScope.errorMessage = messages.join('<br/>');
                return;
            }
            $rootScope.isLoading = true;          
            var drawingInfo = {
                labelingInfo: $ctrl.labelFeature.IsActive ? createLabelingInfo($ctrl.labelFeature) : [],
                transparency: layerInfo.drawingInfo.transparency,// keep that
                renderer: layerInfo.drawingInfo.renderer// keep that
            };
            drawingInfoStr = JSON.stringify(drawingInfo);
            var postObject = {
                layerId: $rootScope.currentLayerId,
                drawing: drawingInfoStr,
                layerVisibleRange: layerInfo.drawingInfo.transparency// keep that
            };
            $http.post("/Renderer/PostRenderer", postObject).success(function (res) {
                if (!res.Error) {
                    $rootScope.successMessage = "Save successful!";
                    $ctrl.form.$setPristine();
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            })
                .error(authorizeService.onError);

        }

        // waring when have change
        // waring when have change
        commonService.warmningWhenHaveChange($ctrl);
    }]
});