//2
//BEGIN real time

var realtime = L.realtime(undefined, {
    getFeatureId: function (f) { return f.properties.FID; },
    start: false
}).addTo(map);
function update(e) {
    featureLayer.removeLayers([e.properties.FID], true);
    realtime.update(e);
}

function remove(e) {
    realtime.remove(e);
    featureLayer.removeLayers([e.properties.FID], true);
}

realtime.on('update', function (e) {
    var popupContent = function (fId) {
        var feature = e.features[fId];
        var popupTemplate = getPopupTemplate(feature.properties)
        return L.Util.template(popupTemplate, feature.properties);       
    },
        bindFeaturePopup = function (fId) {
            realtime.getLayer(fId).bindPopup(popupContent(fId));
        },
        updateFeaturePopup = function (fId) {
            if (!realtime.getLayer(fId).getPopup()) {
                realtime.getLayer(fId).bindPopup(popupContent(fId));
            }
            else {
                realtime.getLayer(fId).getPopup().setContent(popupContent(fId));
            }
        };

    Object.keys(e.enter).forEach(bindFeaturePopup);
    Object.keys(e.update).forEach(updateFeaturePopup);
    // map.fitBounds(realtime.getBounds(), { maxZoom: 3 });
});

// connect with signalR and call update

$.connection.hub.url = '/signalr';
var layerHub = $.connection.layerEventHub;
layerHub.client.updateFeature = function (actionName, data) {
    if (actionName == "DeleteFeature") {
        remove(data);
    }
    else {
        update(data);
    }
};

var startSignalRConnection = function (layerDBId) {
    $.connection.hub.start().done(function () {
        layerHub.server.joinLayerGroup(layerDBId);
    });
}

//END real time

