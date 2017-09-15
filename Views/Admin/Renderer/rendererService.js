var factoryName = 'rendererService';
myApp.factory(factoryName, ['$http', function ($http) {
    var alignments = [{
        Value: "esriServerPointLabelPlacementAboveLeft",
        Name: "Above Left",
    },
        {
            Value: "esriServerPointLabelPlacementAboveCenter",
            Name: "Above Center",
        },
        {
            Value: "esriServerPointLabelPlacementAboveRight",
            Name: "Above Right",
        },
        {
            Value: "esriServerPointLabelPlacementBelowLeft",
            Name: "Below Left",
        },
        {
            Value: "esriServerPointLabelPlacementBelowCenter",
            Name: "Below Center",
        },
        {
            Value: "esriServerPointLabelPlacementBelowRight",
            Name: "Below Right",
        },
        {
            Value: "esriServerPointLabelPlacementCenterLeft",
            Name: "Center Left",
        },
        {
            Value: "esriServerPointLabelPlacementCenterCenter",
            Name: "Center Center",
        },
        {
            Value: "esriServerPointLabelPlacementCenterRight",
            Name: "Center Right",
        }]
    
    var visibleRanges = [{
        Name: 'World',
        Value: 0,

    },{
        Name: 'Contiment',
        Value: 50000000,

    },{
        Name: 'Countries - Big',
        Value: 25000000,

    },{
        Name: 'Countries - Small',
        Value: 12000000,

    }, {
        Name: 'States / Provinces',
        Value: 6000000,

    }, {
        Name: 'Counties',
        Value: 1500000,

    }, {
        Name: 'County',
        Value: 750000,

    }, {
        Name: 'Metropolitan Area',
        Value: 320000,

    }, {
        Name: 'Cities',
        Value: 160000,

    }, {
        Name: 'City',
        Value: 80000,

    }, {
        Name: 'Town',
        Value: 40000,

    }, {
        Name: 'Neighborhood',
        Value: 20000,

    }, {
        Name: 'Streets',
        Value: 10000,

    }, {
        Name: 'Street',
        Value: 5000,

    }, {
        Name: 'Buildings',
        Value: 2500,

    },{
        Name: 'Building',
        Value: 1250,

    },{
        Name: 'Small Building',
        Value: 800,

    }, {
        Name: 'Rooms',
        Value: 400,

    }, {
        Name: 'Room',
        Value: 100,

    }];
   
    var getColorArray = function (strColor) {
        if (!strColor) {
            strColor = '1,1,1,1'; // set defaut color if we have no color for X and cross
        }
        strColor = strColor.replace("rgba(", "").replace(")", "");
        var array = strColor.split(',', 4);
        for (var i = 0; i < 3; i++) {
            array[i] = array[i] * 1;// convert to number
        };
        array[3] = array[3] * 255;
        return array;
    };
    var getBase64Image = function (img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 37;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
    // input: *
    // output: drawingInfo
    var createDrawingInfo = function (drawing, labels, defaultClassBreakLabel, sliders, sliderSetting, labelFeature) {
        var createLabelingInfo = function () {
            var createLabelSymbol = function () {
                return {
                    angle:0,
                    backgroundColor: null,
                    borderLineColor: null,
                    color: getColorArray(labelFeature.TextColor),
                    font:
                        {
                            size: labelFeature.TextSize*0.75,
                            decoration: labelFeature.Underline ? "underline" : "none",
                            style: labelFeature.Italic ? "italic" : "normal",
                            weight: labelFeature.Bold? "bold" : "normal",
                            family: "Arial Unicode MS"
                        },
                    haloColor: labelFeature.IsHalo ? getColorArray(labelFeature.HaloColor) : null,
                    haloSize: labelFeature.IsHalo ? labelFeature.HaloSize * 0.75 : 0,
                    horizontalAlignment:"center",
                    kerning:true,
                    rightToLeft:false,
                    rotated:false,
                    text:"",
                    type:"esriTS",
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
                    where:null
                }
            ];
        }
        // create symbol
        var createSymbol = function (label) {
            var symbol = {};
            var getLineSymbol = function (symbol) {
                return {
                    type: "esriSLS",
                    color: getColorArray(symbol.Color),
                    style: symbol.Pattern.Value,
                    width: symbol.LineWidth,
                };
            }
            if (drawing.SymbolType == 'PictureMarkerSymbol') {               
                symbol = {
                    type: "esriPMS",
                    contentType: "image/png",
                    angle: 0,
                    height: label.Symbol.Size * 0.75,
                    imageData: getBase64Image($("img[src='" + label.Symbol.ImageUrl + "']")[0]),
                    url: "",
                    width: label.Symbol.Size*0.75,
                    xoffset: 0,
                    yoffset: 0,
                }
            }
            else if (drawing.SymbolType == 'SimpleFillSymbol') {
               
                symbol = {
                    type: "esriSFS",
                    color: getColorArray(label.Symbol.Fill.Color),
                    style: 'esriSFSSolid',
                    outline: getLineSymbol(label.Symbol.Outline) 
                };
            } else if (drawing.SymbolType == 'SimpleLineSymbol') {
                symbol = getLineSymbol(label.Symbol);
            } else if (drawing.SymbolType == 'SimpleMarkerSymbol') {
                symbol.type = 'esriSMS';
                symbol.style = label.Symbol.Style;
                symbol.color = getColorArray(label.Symbol.Color);
                symbol.size = label.Symbol.Size*0.75;
                symbol.angle = symbol.xoffset = symbol.yoffset = 0
                symbol.outline = {};
                symbol.outline.color = getColorArray(label.Symbol.Outline.Color);
                symbol.outline.width = label.Symbol.Outline.Width;
            }

            return symbol;
        };
        var createRendererObject = function () {
            switch (drawing.DrawingStyle.Id) {
                case 0:
                    return {// simple
                        type: "simple",
                        symbol: createSymbol(labels[0])
                    };
                case 1: //uniqueValue
                    var createUniqueValueInfos = function () {
                        var uniqueValueInfos = [];
                        labels.forEach(function (label, index) {
                            if (index != 0) {
                                uniqueValueInfos.push({
                                    value: label.Name,
                                    label: label.Name,
                                    description: "",
                                    symbol: createSymbol(label)
                                });
                            }
                        });
                        return uniqueValueInfos;
                    }
                    return {
                        type: "uniqueValue",
                        field1: drawing.Attribute.name,
                        field2: null,
                        field3: null,
                        fieldDelimiter: ", ",
                        defaultSymbol: createSymbol(labels[0]),
                        uniqueValueInfos: createUniqueValueInfos(),
                        rotationType: "geographic",
                        rotationExpression: "[Rotation] * 2"
                    }
                case 2: //class break
                    var createClassBreakInfos = function () {
                        var classBreakInfos = [];
                        sliders.forEach(function (label, index) {                            
                            classBreakInfos.push({
                                classMaxValue: label.value,
                                label: label.Name,
                                description: "",
                                symbol: createSymbol(label)
                            });                           
                        });
                        return classBreakInfos;
                    }
                    return {
                        type: "classBreaks",
                        field: drawing.Attribute.name,
                        classificationMethod: "esriClassifyManual",
                        defaultSymbol: createSymbol(defaultClassBreakLabel),
                        minValue: sliderSetting.Floor,
                        classBreakInfos: createClassBreakInfos(),
                    };
            }

        };

        var drawingInfo = {
            labelingInfo: labelFeature.IsActive? createLabelingInfo():[],
            transparency: drawing.Transparency,
            renderer: createRendererObject(),
        }
        return JSON.stringify(drawingInfo);
    };
    // input: drawingInfo, drawingStyles, patterns, attributes, getFieldValues,minScale
    //ref: drawing, labels, sliders, labelFeature
    var updateDrawingInfoToUI = function (drawingInfo, drawingStyles, patterns, attributes, getFieldValues,minScale,
                                        drawing, labels, defaultClassBreakLabel, sliders, labelFeature)
    {
        var convertColorArray = function (colors) {
            if (!colors) {
                return "";
            }
            colors[3] = colors[3] / 255;
            return "rgba(" + colors.join(',') + ")"
        };
        var findVisibleRange = function (visibleRange) {
            var visibleRangeItems = visibleRanges.filter(function (item, i) {
                return item.Value == visibleRange;
            })
            if (visibleRangeItems.length == 1) {
                return visibleRangeItems[0];
            }
            return {};
        }
        drawing.VisibleRange = findVisibleRange(minScale);
        var updateLabelFeature = function () {
            if (drawingInfo.labelingInfo && drawingInfo.labelingInfo.length != 0) {
                var labelingInfo = drawingInfo.labelingInfo[0];
                labelFeature.IsActive = true;
                var alignmentItems = alignments.filter(function (item, i) {
                    return item.Value == labelingInfo.labelPlacement;
                })
                if (alignmentItems.length == 1) {
                    labelFeature.Alignment = alignmentItems[0];
                }

                labelFeature.VisibleRange = findVisibleRange(labelingInfo.minScale);
                labelFeature.Text = labelingInfo.labelExpression;
                labelFeature.TextColor = convertColorArray(labelingInfo.symbol.color);
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
                    labelFeature.HaloColor = convertColorArray(labelingInfo.symbol.haloColor);
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
        updateLabelFeature();
        drawing.Transparency = drawingInfo.transparency;
        updateSymbolToUI = function (symbol, label) {
            label = label || {};
            label.Symbol = label.Symbol || {};
            if (!symbol) {
                return;
            }
            switch (symbol.type) {
                case 'esriPMS':
                    drawing.SymbolType = "PictureMarkerSymbol";
                    label.Symbol.Size = symbol.width/0.75;
                    label.Symbol.ImageUrl = "data:image/png;base64," + symbol.imageData;
                    break;
                case 'esriSFS':
                    drawing.SymbolType = "SimpleFillSymbol";
                    label.Symbol.Fill = label.Symbol.Fill || {};
                    label.Symbol.Fill.Color = convertColorArray(symbol.color);
                    label.Symbol.Outline = label.Symbol.Outline || {};
                    label.Symbol.Outline.Color = convertColorArray(symbol.outline.color);
                    label.Symbol.Outline.Pattern = patterns.filter(function (pattern, idx) {
                        return pattern.Value == symbol.outline.style;
                    })[0];
                    label.Symbol.Outline.LineWidth = symbol.outline.width;
                    break;
                case 'esriSLS':
                    drawing.SymbolType = "SimpleLineSymbol";
                    label.Symbol.Color = convertColorArray(symbol.color);
                    label.Symbol.Pattern = patterns.filter(function (pattern, idx) {
                        return pattern.Value == symbol.style;
                    })[0];
                    label.Symbol.LineWidth = symbol.width;
                    break;
                case 'esriSMS':
                    drawing.SymbolType = "SimpleMarkerSymbol";
                    label.Symbol.Color = convertColorArray(symbol.color);
                    label.Symbol.Style = symbol.style;
                    label.Symbol.Size = symbol.size / 0.75;
                    label.Symbol.Outline = label.Symbol.Outline|| {};
                    label.Symbol.Outline.Color = convertColorArray(symbol.outline.color);
                    label.Symbol.Outline.Width = symbol.outline.width;
                    break;
            }
        }
        var updateAttributeToShow = function (name) {
            drawing.Attribute = attributes.filter(function (item, i) {
                return item.name == name;
            })[0];
            getFieldValues(drawing.Attribute,true);
        };
        switch (drawingInfo.renderer.type) {
            case 'simple':
                drawing.DrawingStyle = drawingStyles[0];//simple
                // update the symbol
                updateSymbolToUI(drawingInfo.renderer.symbol, labels[0]);
                break;
            case 'uniqueValue':                
                drawing.DrawingStyle = drawingStyles[1];//uniqueValue
                updateAttributeToShow(drawingInfo.renderer.field1);

                updateSymbolToUI(drawingInfo.renderer.defaultSymbol, labels[0]);
                drawingInfo.renderer.uniqueValueInfos = drawingInfo.renderer.uniqueValueInfos || [];
                drawingInfo.renderer.uniqueValueInfos.forEach(function (item, i) {
                    var currentLabel = { Name: item.value };
                    updateSymbolToUI(item.symbol, currentLabel);
                    labels.push(currentLabel)
                });
                break;
            case 'classBreaks':
                drawing.DrawingStyle = drawingStyles[2];//class break
                updateAttributeToShow(drawingInfo.renderer.field)

                // update list label
                defaultClassBreakLabel.Name = "Default symbol"
                updateSymbolToUI(drawingInfo.renderer.defaultSymbol, defaultClassBreakLabel);
                drawingInfo.renderer.classBreakInfos = drawingInfo.renderer.classBreakInfos || [];
                // update number of class
                drawing.TotalClasses = drawingInfo.renderer.classBreakInfos.length;
                drawingInfo.renderer.classBreakInfos.forEach(function (item, i) {
                    var currentLabel={ value: item.classMaxValue, color: 'Red', Type: 'ClassBreak', Symbol: {} };
                    updateSymbolToUI(item.symbol, currentLabel);
                    sliders.push(currentLabel);
                    // update slider
                });               
                break;
        }
    }

    //input: *
    //output: messages
    var validateLabel = function (label, symbolType, messages, notShowLabelName) {
        var labelName = "";
        if (!notShowLabelName) {
            labelName=label.Name + ": ";
        };
        if (symbolType == 'PictureMarkerSymbol') {
            if (!label.Symbol) {
                messages.push(labelName + "Symbol is required.");
            } else {
                if (!label.Symbol.ImageUrl) {
                    messages.push(labelName + "Image is required.");
                };
                if (!label.Symbol.Size) {
                    messages.push(labelName + "Symbol size is required.");
                };
            }
        }
        else if (symbolType == 'SimpleFillSymbol') {
            if (!label.Symbol) {
                messages.push(labelName + "Symbol is required.");
            }
            else {
                if (!label.Symbol.Fill || !label.Symbol.Fill.Color) {
                    messages.push(labelName + "Fill color is required.");
                };
                if (!label.Symbol.Outline) {
                    messages.push(labelName + "Outline is required.");
                } else {
                    if (!label.Symbol.Outline.Color) {
                        messages.push(labelName + "Outline color is required.");
                    }
                    if (!label.Symbol.Outline.LineWidth) {
                        messages.push(labelName + "Line width is required.");
                    }
                    if (!label.Symbol.Outline.Pattern) {
                        messages.push(labelName + "Pattern is required.");
                    }
                };
            }
        } else if (symbolType == 'SimpleLineSymbol') {
            if (!label.Symbol) {
                messages.push(labelName + "Symbol is required.");
            }
            else {             
              
                if (!label.Symbol.Color) {
                    messages.push(labelName + "Color is required.");
                }
                if (!label.Symbol.LineWidth) {
                    messages.push(labelName + "Line width is required.");
                }
                if (!label.Symbol.Pattern) {
                    messages.push(labelName + "Pattern is required.");
                }
               
            }
        } else if (symbolType == 'SimpleMarkerSymbol') {
            if (!label.Symbol) {
                messages.push(labelName + "Symbol is required.");
            }
            else {

                if (!label.Symbol.Color) {
                    if (['esriSMSCross', 'esriSMSX'].indexOf(label.Symbol.Style) == -1) { // don't required for esriSMSCross and esriSMSX
                        messages.push(labelName + "Color is required.");
                    }
                }
                if (!label.Symbol.Size) {
                    messages.push(labelName + "Size is required.");
                }
                if (!label.Symbol.Style) {
                    messages.push(labelName + "Style is required.");
                }
                label.Symbol.Outline = label.Symbol.Outline || {};
                if (!label.Symbol.Outline.Color) {
                    messages.push(labelName + "Outline color is required.");
                }
                if (!label.Symbol.Outline.Width) {
                    messages.push(labelName + "Outline width is required.");
                }

            }
        };
    };
    var validateSaveRender = function (drawing, labels, defaultClassBreakLabel, sliders, labelFeature) {
       
       
        var messages = [];
        var validateLabelFeature = function () {
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
        };
        validateLabelFeature();
        if (drawing.Transparency != 0 && !drawing.Transparency) {
            messages.push("Transparency is required.");
        }
        if (!drawing.VisibleRange) {
            messages.push("Visible range is required.");
        }
        if (!drawing.DrawingStyle) {
            messages.push("Type of renderer is required.");
        }
        else {
            
            var validateAttributeToShow = function () {
                if (!drawing.Attribute || !drawing.Attribute.name) {
                    messages.push("Rendering field is required.");
                }
            }
            switch (drawing.DrawingStyle.Id) {
                case 0:// simple
                    validateLabel(labels[0],drawing.SymbolType,messages);
                    break;
                case 1://unique value
                    validateAttributeToShow();
                    labels.forEach(function (item, idx) {
                        validateLabel(item, drawing.SymbolType, messages);
                    });
                    break;
                case 2://class break
                    validateAttributeToShow();
                    validateLabel(defaultClassBreakLabel, drawing.SymbolType, messages);
                    sliders.forEach(function (item, idx) {
                        validateLabel(item, drawing.SymbolType, messages);
                    });
                    break;
            }           
        }
        return messages;       
    };
    return {
        createDrawingInfo: createDrawingInfo,
        updateDrawingInfoToUI: updateDrawingInfoToUI,
        validateSaveRender: validateSaveRender,
        alignments: alignments, // data for labeling info
        visibleRanges: visibleRanges,
        validateLabel: validateLabel
    };
}]);