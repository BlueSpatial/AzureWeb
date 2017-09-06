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

var map = L.map('map').setView([20.61010242300902, -157.33770751953128], 8);
var layer =L.esri.basemapLayer('Topographic').addTo(map);

var layerUrl = getUrlParameter('layer');
var featureLayer = L.esri.featureLayer({
    url: layerUrl
}).addTo(map);

var getPopupTemplate = function (properties) {
    var template = "";
    for (var key in properties) {
        if (properties.hasOwnProperty(key)) {
            template += '<strong>' + key + ': </strong>{' + key + '}<br>'
        }
    }
    return template;
};
// use ajax to get layer meta data
var relateHtmls = [];
$.ajax({
    url: layerUrl+"?f=json",
    context: document.body,
    success: function (res) {
        var layerMetadata = JSON.parse(res);
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

    }
});





// fix bound
featureLayer.query().bounds(function (error, latlngbounds) {
    map.fitBounds(latlngbounds);
});

//bind popup
var popupTemplate = "";
featureLayer.bindPopup(function (layer) {
    if (!popupTemplate) {
        popupTemplate=getPopupTemplate(layer.feature.properties);
       
    }
    return L.Util.template(popupTemplate, layer.feature.properties);
});

// init legend
L.esri.legendControl([featureLayer]).addTo(map);

var layerLabels;

function setBasemap(basemap) {
    if (layer) {
        map.removeLayer(layer);
    }

    layer = L.esri.basemapLayer(basemap);

    map.addLayer(layer);

    if (layerLabels) {
        map.removeLayer(layerLabels);
    }

    if (basemap === 'ShadedRelief'
        || basemap === 'Oceans'
        || basemap === 'Gray'
        || basemap === 'DarkGray'
        || basemap === 'Imagery'
        || basemap === 'Terrain'
    ) {
        layerLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(layerLabels);
    }
}

function changeBasemap(basemaps) {
    var basemap = basemaps.value;
    setBasemap(basemap);
}