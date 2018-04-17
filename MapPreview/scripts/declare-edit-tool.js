//4
//https://esri.github.io/esri-leaflet/examples/editable.html
// create a feature layer and add it to the map


// create a generic control to invoke editing
L.EditControl = L.Control.extend({
    options: {
        position: 'topleft',
        callback: null,
        kind: '',
        html: ''
    },
    // when the control is added to the map, wire up its DOM dynamically and add a click listener
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = 'Create a new ' + this.options.kind;
        link.innerHTML = this.options.html;
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function () {
                window.LAYER = this.options.callback.call(map.editTools);
            }, this);
        return container;
    }
});

L.NewMarkerControl = L.EditControl.extend({

    options: {
        position: 'topleft',
        callback: map.editTools.startMarker,
        kind: 'marker',
        html: '🖈'
    }

});
// extend the control to draw polygons
L.NewPolygonControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: map.editTools.startPolygon,
        kind: 'polygon',
        html: '▰'
    }
});

// extend the control to draw rectangles
L.NewRectangleControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: map.editTools.startRectangle,
        kind: 'rectangle',
        html: '⬛'
    }
});

L.NewLineControl = L.EditControl.extend({

    options: {
        position: 'topleft',
        callback: map.editTools.startPolyline,
        kind: 'line',
        html: '\\/\\'
    }

});

var initEditor = function () {
    if (layerMetadata.capabilities.indexOf("Editing") == -1) { // don't allow edit for map service
        return;
    }
    // add the two new controls to the map
    switch (layerMetadata.geometryType) {
        case "esriGeometryPoint":
            map.addControl(new L.NewMarkerControl());
            break;
        case "esriGeometryPolygon":
            map.addControl(new L.NewPolygonControl());
            map.addControl(new L.NewRectangleControl());
            break;
        case "esriGeometryPolyline":
            map.addControl(new L.NewLineControl());
            break;
    }
   
 
    

    // when users CMD/CTRL click an editable feature, remove it from the map and delete it from the service
    featureLayer.on('click', function (e) {
        if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && e.layer.editEnabled()) {
            e.layer.editor.deleteShapeAt(e.latlng);
            // delete expects an id, not the whole geojson object
            featureLayer.deleteFeature(e.layer.feature.id);
        }
    });

    // when users double click a graphic toggle its editable status
    // when deselecting, pass the geometry update to the service
    featureLayer.on('dblclick', function (e) {
        e.layer.toggleEdit();
        if (!e.layer.editEnabled()) {
            featureLayer.updateFeature(e.layer.toGeoJSON());
        }
    });

    // when a new feature is drawn using one of the custom controls, pass the edit to the service
    map.on('editable:drawing:commit', function (e) {
        featureLayer.addFeature(e.layer.toGeoJSON());
        e.layer.toggleEdit();
    });
}