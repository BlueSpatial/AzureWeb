//3
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

//set minimap
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data &copy; OpenStreetMap contributors';
var osm2 = new L.TileLayer(osmUrl, { minZoom: 0, maxZoom: 13, attribution: osmAttrib });
var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, minimized: true, collapsedWidth: 30, collapsedHeight: 30 }).addTo(map);

//coordinates
var coordinates = new L.control.mousePosition().addTo(map);

//scale bar
var scalebar = new L.control.scale().addTo(map);



//full screen
var fullscreen = new L.Control.Fullscreen().addTo(map);

//bubble option
var bubbleOption = {
    property: null,
    legend: true,
    max_radius: 35,
    scale: 'YlGnBu',
    style: {
        radius: 10,
        fillColor: "#74acb8",
        color: "#555",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.5
    },
    tooltip: true
}


//print
L.control.browserPrint().addTo(map);

//locate
var locate = L.control.locate().addTo(map);

var layer=L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);
//var layer =L.esri.basemapLayer('Topographic').addTo(map);

var layerUrl = getUrlParameter('layer');

var featureLayer = {};
var bubbles = {};
var labelFeature = {};
var labels = {};

var declareFeatureLayer = function (timeInfo) {
    if (timeInfo) {
        var startTimeInput = document.getElementById('from');
        var endTimeInput = document.getElementById('to');
        featureLayer = L.esri.featureLayer({
            url: layerUrl,
            timeField: timeInfo.startTimeField, 
            from: new Date(startTimeInput.value),
            to: (new Date(endTimeInput.value)).addHours(24),
        }).addTo(map);
        setTimeout(function () {
            // fix bug first time doesn't load
            featureLayer.setTimeRange(new Date(startTimeInput.value), (new Date(endTimeInput.value)).addHours(24));
        }, 500)
    }
    else {      
        featureLayer = L.esri.featureLayer({
            url: layerUrl,          
        }).addTo(map);
    }
}



var template = "";
var getPopupTemplate = function (properties) {

    const findFieldByName = (fieldName) => {
        let pos = -1;
        layerMetadata.fields.forEach((field, index) => {
            if (field.name === fieldName) {
                pos = index
            }
        })
        return pos;
    }

    if (template === "") {
        for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
                template += '<strong>' + layerMetadata.fields[findFieldByName(key)].alias + ': </strong>{' + key + '}<br>'
            }
        }
    }
    return template;
};
// use ajax to get layer meta data
var relateHtmls = [];
var layerMetadata = {};
$.ajax({
    url: layerUrl+"?f=json",
    context: document.body,
    success: function (res) {
        layerMetadata = res;

        initCrossFilter();
        if (!layerMetadata.timeInfo) {
            disableTime();
        }
        else {
            initTimeExtent();
        }
        declareFeatureLayer(layerMetadata.timeInfo);
        buildTable(layerMetadata);   
      
        fitBound();
        bindPopup();
        // init legend
        L.esri.legendControl([featureLayer]).addTo(map);
        //measure
        var measureControl = new L.Control.Measure({ width: 30, height: 30 }).addTo(map);    

        //bookmarks
        var control = new L.Control.Bookmarks().addTo(map);


        //initEditor(); // init editor after have layerMetadata
        // hide the map type if not point
        if (layerMetadata.geometryType != "esriGeometryPoint") {
            $("#mapTypeMenu").hide();
        }
       
        

        startSignalRConnection(layerMetadata.DbId);
        if (layerMetadata.htmlPopupType === "esriServerHTMLPopupTypeAsHTMLText") {
            $.ajax({
                url: "../Admin/GetPopupContent/" + layerMetadata.DbId,
                success: function (res) {
                    template = res.Popup.PopupContent.replace(/\[/g, '{').replace(/\]/g,'}');
                }
            })
        }

        if (layerMetadata.relationships&&layerMetadata.relationships.length) {// have relation ship
            // query related
            var query = L.esri.Related.query(featureLayer);
            //wire up event listener to fire query when users click on a feature
            featureLayer.on("click", queryRelated);

            function queryRelated(evt) {
                relateHtmls = [];
                layerMetadata.relationships.forEach(function (relationship, idx) {
                    
                    query.objectIds([evt.layer.feature.id]).relationshipId(idx).run(function (error, response, raw) { // query related records for earch relatetionship
                        var currentFeature = featureLayer.getFeature(evt.layer.feature.id);
                        var relateTable = "";
                        if (!response.features.length) {
                            relateTable = "</br><strong>Related records (" + relationship.name+"): </strong>None</br>";
                        }
                        else {
                            // loop al the record to generate th
                            // genereate th
                            var ths = "";
                            for (var key in response.features[0].properties) {
                                if (response.features[0].properties.hasOwnProperty(key)) {
                                    ths += "<th>" + key + "</th>"
                                }
                            }
                            // generate tr
                            var trs = "";
                            response.features.forEach(function (feature, idx) {
                                var tds = "";
                                for (var key in feature.properties) {
                                    if (feature.properties.hasOwnProperty(key)) {
                                        tds += "<td>" + feature.properties[key] + "</td>"
                                    }
                                }
                                trs += ['<tr>',
                                    tds
                                    ,
                                    '</tr>'].join("");
                            });
                            relateTable = ['</br><strong>Related records (' + relationship.name+'): </strong></br>',
                                '<table border="1" cellpadding="1" cellspacing="1">',
                                '<thead><tr>',
                                ths
                                ,
                                '</tr></thead>',
                                '<tbody>',
                                trs,
                                '</tbody>',
                                '</table>'
                            ].join("");

                        }
                        relateHtmls.push(relateTable);
                        if (relateHtmls.length == layerMetadata.relationships.length) { // only bind popup when get all the relate record
                            currentFeature.bindPopup(
                                function () {
                                    return L.Util.template(getPopupTemplate(currentFeature.feature.properties), currentFeature.feature.properties) + relateHtmls.join("");
                                });

                            currentFeature.openPopup();
                        }
                    })

                });

                
            }
        }
        $('#basemaps-wrapper').css('right', $('#right-container').width() + 10 + 'px');
        $(window).trigger('resize');
        setTimeout(function () {
            map.invalidateSize();
        })

        labelFeature = getLabelFeature();
        addLabelFeature();

        getProperties();
    }
});





// fit bound
var fitBound = function () {
    featureLayer.query().bounds(function (error, latlngbounds) {
        map.fitBounds(latlngbounds);
    });
}

//bind popup
var popupTemplate = "";
var bindPopup = function () {
    featureLayer.bindPopup(function (layer) {
        if (!popupTemplate) {
            popupTemplate = getPopupTemplate(layer.feature.properties);

        }
        return L.Util.template(popupTemplate, layer.feature.properties);
    });
}



var layerLabels;

function setBasemap(basemap) {
    if (layer) {
        map.removeLayer(layer);
    }

    layer = L.tileLayer.provider(basemap);

    map.addLayer(layer);

    //if (layerLabels) {
    //    map.removeLayer(layerLabels);
    //}

    //if (basemap === 'ShadedRelief'
    //    || basemap === 'Oceans'
    //    || basemap === 'Gray'
    //    || basemap === 'DarkGray'
    //    || basemap === 'Imagery'
    //    || basemap === 'Terrain'
    //) {
    //    layerLabels = L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
    //    map.addLayer(layerLabels);
    //}
}

function changeBasemap(basemaps) {
    var basemap = basemaps.value;
    setBasemap(basemap);
}

function getDocumentPPI() {
    var elem = document.createElement('div');
    elem.style.width = '1in';
    document.body.appendChild(elem);
    var ppi = elem.offsetWidth;
    document.body.removeChild(elem);
    return ppi;
}

function getScale(map) {
    // Reference document
    // https://msdn.microsoft.com/en-us/library/aa940990.aspx?f=255&MSPPError=-2147217396
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
    // https://gis.stackexchange.com/questions/7430/what-ratio-scales-do-google-maps-zoom-levels-correspond-to

    var lat = map.getCenter().lat;
    var zoom = map.getZoom();

    var pixelsPerInch = getDocumentPPI();
    var inchesPerMeter = 39.37;
    var metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);

    var scale = pixelsPerInch * inchesPerMeter * metersPerPixel;

    return scale;
}

function getLabelFeature() {
    var labelFeature = {}
    var labelingInfos = layerMetadata.drawingInfo.labelingInfo;
    labelFeature.IsActive = labelingInfos && labelingInfos.length != 0;

    if (labelFeature.IsActive) {
        var labelingInfo = labelingInfos[0];

        labelFeature.Text = labelingInfo.labelExpression;
        labelFeature.TextColor = convertColorArray(labelingInfo.symbol.color);
        labelFeature.TextSize = labelingInfo.symbol.font.size / 0.75;
        labelFeature.Underline = labelingInfo.symbol.font.decoration == 'underline';
        labelFeature.Italic = labelingInfo.symbol.font.style == 'italic';
        labelFeature.Bold = labelingInfo.symbol.font.weight == 'bold';

        var visibleRangeItems = visibleRanges.filter(function (item, i) {
            return item.Value == labelingInfo.minScale;
        })
        if (visibleRangeItems.length == 1) {
            labelFeature.VisibleRange = visibleRangeItems[0];
        }

        var alignmentItems = alignments.filter(function (item, i) {
            return item.Value == labelingInfo.labelPlacement;
        })
        if (alignmentItems.length == 1) {
            labelFeature.Alignment = alignmentItems[0];
        }

        labelFeature.IsHalo = labelingInfo.symbol.haloColor;
        if (labelFeature.IsHalo) {
            labelFeature.HaloColor = convertColorArray(labelingInfo.symbol.haloColor);
            labelFeature.HaloSize = labelingInfo.symbol.haloSize / 0.75;
        }
    } else {
        // label feature is turn off
    }

    return labelFeature;
}

function createTextLabel(properties, text) {
    layerMetadata.fields.forEach((field, index) => {
        var foundIndex = text.indexOf("[" + field.name + "]");
        if (foundIndex != -1) {
            text = text.replace("[" + field.name + "]", properties[field.name])
        }
    })
    return text;
}

function convertColorArray(colors) {
    if (!colors) {
        return "";
    }
    colors[3] = colors[3] / 255;
    return "rgba(" + colors.join(',') + ")"
};

var alignments = [
    {
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
    }
]

var visibleRanges = [
    {
        Name: 'World',
        Value: 0,

    }, {
        Name: 'Contiment',
        Value: 50000000,

    }, {
        Name: 'Countries - Big',
        Value: 25000000,

    }, {
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

    }, {
        Name: 'Building',
        Value: 1250,

    }, {
        Name: 'Small Building',
        Value: 800,

    }, {
        Name: 'Rooms',
        Value: 400,

    }, {
        Name: 'Room',
        Value: 100,

    }
];

function addLabelFeature() {
    featureLayer.on('createfeature', function (e) {
        if (labelFeature.IsActive) {
            var id = e.feature.id;
            var feature = featureLayer.getFeature(id);
            var center = null;

            if (feature.feature.geometry.type === "Point") {
                center = feature.getLatLng();
            } else { // LineString, Polygon
                center = feature.getBounds().getCenter();
            }

            // add CSS
            var styles = `color: ${labelFeature.TextColor}; font-size: ${labelFeature.TextSize}pt;`;
            if (labelFeature.Underline) {
                styles += `text-decoration: underline;`;
            }
            if (labelFeature.Italic) {
                styles += `font-style: italic;`;
            }
            if (labelFeature.Bold) {
                styles += `font-weight: bold;`;
            }

            if (labelFeature.Alignment) {
                switch (labelFeature.Alignment.Value) {
                    case "esriServerPointLabelPlacementAboveLeft":
                        styles += `left: unset; right: 100%; margin-right: 15px; padding-right: unset; bottom: 15px;`;
                        break;
                    case "esriServerPointLabelPlacementAboveCenter":
                        styles += `bottom: 15px;`
                        break;
                    case "esriServerPointLabelPlacementAboveRight":
                        styles += `left: unset; margin-left: 5px; bottom: 15px;`;
                        break;

                    case "esriServerPointLabelPlacementBelowLeft":
                        styles += `left: unset; right: 100%; margin-right: 15px; padding-right: unset; top: 15px;`;
                        break;
                    case "esriServerPointLabelPlacementBelowCenter":
                        styles += `top: 15px;`
                        break;
                    case "esriServerPointLabelPlacementBelowRight":
                        styles += `left: unset; margin-left: 5px; top: 15px;`;
                        break;

                    case "esriServerPointLabelPlacementCenterLeft":
                        styles += `left: unset; right: 100%; margin-right: 15px; padding-right: unset`;
                        break;
                    case "esriServerPointLabelPlacementCenterCenter":
                        break;
                    case "esriServerPointLabelPlacementCenterRight":
                        styles += `left: unset; margin-left: 5px;`;
                        break;
                }
            }
            var label = L.marker(
                center,
                {
                    icon: L.divIcon({
                        iconSize: null,
                        className: 'label',
                        html: `<div style="${styles}">${createTextLabel(e.feature.properties, labelFeature.Text)}</div>`
                    })
                }
            )
            if (getScale(map) < labelFeature.VisibleRange.Value) {
                label.addTo(map);
            }
            //.addTo(map);
            labels[id] = label;
            L.MarkerOptions
        }
        //console.log("createfeature");
    });

    //featureLayer.on('addfeature', function (e) {
    //    var label = labels[e.feature.id];
    //    if (label) {
    //        label.addTo(map);
    //    }
    //    console.log("addfeature");
    //});

    //featureLayer.on('removefeature', function (e) {
    //    var label = labels[e.feature.id];
    //    if (label) {
    //        map.removeLayer(label);
    //    }
    //    console.log("removefeature");
    //});
}
var labelVisibleStatus = false;

map.on('zoomend', function () {
    //console.log("zoomend");

    if (labelFeature.IsActive && getScale(map) < labelFeature.VisibleRange.Value) {
        if (!labelVisibleStatus) {
            labelVisibleStatus = true;
            // show label
            for (var key in labels) {
                if (labels.hasOwnProperty(key)) {
                    //if (labels[key].getLatLng && map.getBounds().contains(labels[key].getLatLng())) {
                    labels[key].addTo(map);
                    //}
                }
            }
        }
    }
    else {
        if (labelFeature.IsActive && labelVisibleStatus) {
            labelVisibleStatus = false;
            // hide label
            for (var key in labels) {
                if (labels.hasOwnProperty(key)) {
                    map.removeLayer(labels[key]);
                }
            }
        }
    }
});

function getProperties() {
    var bubbleOptionProperty = ""
    layerMetadata.fields.forEach(function (field) {
        if (field.type === 'esriFieldTypeDouble' || field.type === 'esriFieldTypeInteger') {
            bubbleOptionProperty += `<option value=${field.name}>${field.alias}</option>`;
        }
    })
    $('#bubbleOptionProperty')[0].innerHTML = bubbleOptionProperty;
}