myApp.component('createRendererComponent', {
    // isolated scope binding
    bindings: {
    },
    templateUrl: '/Views/Admin/Renderer/create-renderer-component.html',

    // The controller that handles our component logic
    controller: ['$scope', '$rootScope', '$http', 'rendererService', 'authorizeService', 'commonService', function ($scope, $rootScope, $http, rendererService, authorizeService, commonService) {
        $ctrl = this;
        var layerInfo = {};
        $ctrl.geometryType ="";
        $ctrl.filteredAttributes = [];
        $ctrl.sliders = [];
        var initLabels = function () {
            return [{ Id: 0, Name: 'Default symbol', Symbol: {} }];
        };
      
        var defaultClassBreakLabel = {};
            defaultClassBreakLabel = initLabels();
            $ctrl.drawing = {};
            $ctrl.drawing.TotalClasses = 3;
            $ctrl.sliderSetting = {};            
            $ctrl.labels = initLabels();
            $ctrl.activeLabel = {};
            $ctrl.updateActiveLabel = function (label) {
                $ctrl.activeLabel = label
            }
            $ctrl.visibleRanges = rendererService.visibleRanges;
            getRendererInfo = function () {
                $rootScope.errorMessage = "";
                $rootScope.isLoading = true;
                return $http.get("/Renderer/GetRendererInfo").success(function (res) {
                    if (!res.Error) {
                        $ctrl.drawingStyles = res.DrawingStyles;
                        $ctrl.smsStyles = res.SmsStyles;
                        $ctrl.patterns = res.Patterns;
                        $ctrl.symbolTypes = res.SymbolTypes;
                    }
                    else {
                        $rootScope.errorMessage = res.Message;
                    };
                    $rootScope.isLoading = false;
                });
            }
           

       
        
       
        $ctrl.saveRenderer = function () {
            $rootScope.successMessage = "";
            $rootScope.errorMessage = "";
            if (!authorizeService.isAuthorize()) return;
            var messages = rendererService.validateSaveRender($ctrl.drawing, $ctrl.labels, defaultClassBreakLabel, $ctrl.sliders);
            if (messages.length) {// if error 
                $rootScope.errorMessage = messages.join('<br/>');
                return;
            }          
            $rootScope.isLoading = true;
            var drawingInfoObject = rendererService.createDrawingInfo($ctrl.drawing, $ctrl.labels, defaultClassBreakLabel, $ctrl.sliders, $ctrl.sliderSetting);
            drawingInfoObject.labelingInfo = layerInfo.drawingInfo.labelingInfo;// keep labeling info
            var drawingInfoStr = JSON.stringify(drawingInfoObject);
            var postObject = {
                layerId: $ctrl.drawing.Layer.Id,
                drawing: drawingInfoStr,
                layerVisibleRange: $ctrl.drawing.VisibleRange.Value
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
        var getLayerInfo = function () {
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            $http.get("/Renderer/GetLayerInfo/" + $rootScope.currentLayerId).success(function (res) {
                if (!res.Error) {
                    if (res.LayerNotFound) {
                        $rootScope.currentLayerId = null;
                        return;
                    }
                    $ctrl.drawing.Layer = res.Layer;
                    layerInfo = res.LayerInfo;
                    $ctrl.layerUrl = res.LayerBreadCrumb.Url;
                    $ctrl.geometryType = layerInfo.geometryType;
                    

                    // get attribute
                    $ctrl.attributes = [];
                    layerInfo.fields.forEach(function (value, index) {
                        if (value.type != "esriFieldTypeGeometry" && value.type != "esriFieldTypeOID") {
                            $ctrl.attributes.push(value);
                        }
                    });
                    $ctrl.labels = initLabels();
                    $ctrl.sliders = [];
                    $ctrl.renderSlider = false; // if show sliders now some code will make the value to not a number
                    rendererService.updateDrawingInfoToUI(layerInfo.drawingInfo, $ctrl.drawingStyles, $ctrl.patterns, $ctrl.attributes, $ctrl.getFieldValues, layerInfo.minScale,
                                                                $ctrl.drawing, $ctrl.labels, defaultClassBreakLabel, $ctrl.sliders);
                    $rootScope.isLoading = false;
                }
                else {
                    $rootScope.errorMessage = res.Message;
                    $rootScope.isLoading = false;
                };

            });
        }
        $ctrl.reset = getLayerInfo;
        $ctrl.onLayerChange = function () {
            if ($rootScope.currentLayerId) {
                getRendererInfo().then(function () {
                    getLayerInfo();
                });
            }
        }
        this.$onDestroy = $rootScope.$watch('currentLayerId', function () {
            $ctrl.onLayerChange();
        });
        //$ctrl.$routerOnActivate = function (next) {
            
        //    $rootScope.currentLayerId= parseInt(next.params.id);
        //    $ctrl.onLayerChange();
        //};
        $ctrl.onTotalClassChange = function () {
            if ($ctrl.drawing.TotalClasses < 1) {
                $ctrl.drawing.TotalClasses = 1;
            }
            $ctrl.createSliderModel();
        }
        $ctrl.createSliderModel = function (notInitSliderModel) {
            
            $ctrl.renderSlider = false;           

            var min = Math.min.apply(Math, $ctrl.fieldValues);
            var max = Math.max.apply(Math, $ctrl.fieldValues);
            //var min = Math.min(...$ctrl.fieldValues);
            //var max = Math.max(...$ctrl.fieldValues);
                $ctrl.sliderSetting.Floor = min;
                $ctrl.sliderSetting.Ceiling = max;
                if (!notInitSliderModel) {
                    var total = max - min;
                    var numberItemPerRecord = total / $ctrl.drawing.TotalClasses;
                    // add make the slider number equal to the number drawing
                    if ($ctrl.sliders.length > $ctrl.drawing.TotalClasses) {
                        $ctrl.sliders = $ctrl.sliders.slice(0, $ctrl.drawing.TotalClasses);
                    }
                    else {// add if labels smaller
                        var difference = $ctrl.drawing.TotalClasses - $ctrl.sliders.length;
                        for (var i = 0; i < difference; i++) {
                            $ctrl.sliders.push({ color: 'Red', Type: 'ClassBreak', Symbol: {} });
                        };
                    };
                    $ctrl.sliders.forEach(function (slider, index) {
                        var value = max;
                        if (index != ($ctrl.drawing.TotalClasses - 1)) {
                            value = min + Math.round(numberItemPerRecord * (index + 1));
                        }
                        slider.value = value;
                    });
                }
                setTimeout(function () {
                    $ctrl.renderSlider = true;
                    $rootScope.$digest();
                },300);
        };
        var needGetFieldValueAgain = true;
        $scope.$watch("$ctrl.drawing.Attribute", function (newValue, oldValue) {
            if (!needGetFieldValueAgain) {
                needGetFieldValueAgain = true;
                return;
            }
            if (newValue) {
                // for unique value and have value need to confirm and remove all the current value
                if ($ctrl.drawing.DrawingStyle.Value == "UniqueValue" && $ctrl.labels.length > 1) {
                    if (confirm("Changing the render field will remove existing unique values. Are you sure you want to proceed?")) {
                        $ctrl.getFieldValues(newValue);
                        $ctrl.labels = [$ctrl.labels[0]];// remove all current symbol, except the default
                    }
                    else {
                        $ctrl.drawing.Attribute = oldValue;
                        needGetFieldValueAgain = false; // change value back, don't need process change event
                    }
                }
                else { // all other case get Field value
                    $ctrl.getFieldValues(newValue);
                }
            }
        });
        
        $ctrl.getFieldValues = function (attribute, notInitSliderModel) {
            if (!attribute || !attribute.name) {
                return;
            }
            $rootScope.errorMessage = "";
            $rootScope.isLoading = true;
            // todo: change to the group query
            $http.get($ctrl.layerUrl + "/query?f=json&returnGeometry=false&outFields=" + attribute.name).success(function (res) {
                if (!res.Error) {
                    $ctrl.fieldValues = [];
                    res.features.forEach(function (item, idx) {
                        var currentValue = item.attributes[attribute.name];
                        if ($ctrl.fieldValues.indexOf(currentValue) == -1) {
                            $ctrl.fieldValues.push(currentValue);
                        };
                    });
                    // create sliders model
                    $ctrl.createSliderModel(notInitSliderModel)
                    
                }
                else {
                    $rootScope.errorMessage = res.Message;
                };
                $rootScope.isLoading = false;
            });
        }
        $ctrl.clearAtributeToShow = function () {
            // if not exist in attribute list, clear it
            if ($ctrl.filteredAttributes.indexOf($ctrl.drawing.Attribute) == -1) {
                $ctrl.drawing.Attribute = null;
            }
        }
        $ctrl.addLabel = function () {
            if (!$ctrl.drawing.Attribute || !$ctrl.drawing.Attribute.name) {
                $rootScope.errorMessage = 'Please select "Rendering field" first';
                return;
            }
            $ctrl.currentLabel = {};
            $("#selectLabelName").modal('show');
        };
        $ctrl.insertOrUpdateLabel = function () {
            if (!$ctrl.currentLabel.Name) {
                $rootScope.errorMessage = 'Please select a value in the list';
                return;
            }
            if ($ctrl.currentLabel.Symbol) {
                // update do nothing
            } else {
                $ctrl.labels.push({ Name: $ctrl.currentLabel.Name });
            };
            $("#selectLabelName").modal('hide');
        };
        $ctrl.addAllRemainingValue = function () {
            // add all the remaining if not exist yest
            $ctrl.fieldValues.forEach(function (unique) {
                var isExist = false;
                $ctrl.labels.forEach(function (label) {
                    if (label.Name == unique) {
                        isExist = true;
                        return false;
                    }
                })
                if (!isExist) {
                    $ctrl.labels.push({ Name: unique});
                }
            });
        };

        $ctrl.removeLabel = function (l) {
            $ctrl.labels.splice($ctrl.labels.indexOf(l), 1);
        };
        $ctrl.fieldValueFilter = function (labelName) {
            var isAdded = false;
            $ctrl.labels.forEach(function (label, index) {
                if (labelName == label.Name) {
                    isAdded = true;
                    return false;
                }
            });
            return !isAdded;
        }
        $ctrl.filterAttributeByDrawingStyle = function (attribute) {
            if ($ctrl.drawing.DrawingStyle.Id == 2) {// class break
                var isNumeric = false;
                var numericTypes = ["esriFieldTypeInteger", "esriFieldTypeSmallInteger", "esriFieldTypeDouble"]
                if (numericTypes.indexOf(attribute.type) != -1) {
                    isNumeric = true;
                }
                return isNumeric;
            }
            return true;
        }
        var sortByKey=function(array, key) {
            return array.sort(function (a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
        $ctrl.getClassBreakLabels = function () {           
            // sort list slider by value
            sortByKey($ctrl.sliders, 'value');
            // change the name
            $ctrl.sliders.forEach(function (label,i) {
                var minValue = $ctrl.sliderSetting.Floor;
                if (i > 0) {
                    minValue = $ctrl.sliders[i-1].value
                }
                label['Name'] = minValue + "-" + label.value;
            });
            defaultClassBreakLabel.Name = initLabels()[0].Name; // initial to 'default symbol'
            //return [defaultClassBreakLabel, ...$ctrl.sliders]
            return [defaultClassBreakLabel].concat($ctrl.sliders);
        };

        // waring when have change
        commonService.warmningWhenHaveChange($ctrl);
       
        
    }]
});
