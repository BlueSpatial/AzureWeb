


function switchView(view) {
    if (view == "split") {
        $("#view").html("Split View");
        location.hash = "#split";
        $("#table-container").show();
        $("#table-container").css("height", "55%");
        $("#map-container").show();
        $("#map-container").css("height", "45%");
        $(window).resize();
        if (map) {
            map.invalidateSize();
        }
    } else if (view == "map") {
        $("#view").html("Map View");
        location.hash = "#map";
        $("#map-container").show();
        $("#map-container").css("height", "100%");
        $("#table-container").hide();
        if (map) {
            map.invalidateSize();
        }
    } else if (view == "table") {
        $("#view").html("Table View");
        location.hash = "#table";
        $("#table-container").show();
        $("#table-container").css("height", "100%");
        $("#map-container").hide();
        $(window).resize();
    }
}

$("[name='view']").click(function () {
    $(".in,.open").removeClass("in open");
    if (this.id === "map-graph") {
        switchView("split");
        return false;
    } else if (this.id === "map-only") {
        switchView("map");
        return false;
    } else if (this.id === "graph-only") {
        switchView("table");
        return false;
    }
});

$("#extent-btn").click(function () {
    fitBound();
});

var initWidgetSetting = function () {

    var generateChk = function (chkId, name) {
        return ['<div class="form-group">',
            '<label><input id="', chkId, '" checked type="checkbox" /> ', name, '</label>',
            '</div>'].join("");
    }

    // generate check box and event
    var widgets = [
        {
            ChkId: "chkZoom",
            Name: "Zoom control",
            DOM: ".leaflet-control-zoom"
        },
        {
            ChkId: "chkFullScreen",
            Name: "Fullscreen",
            DOM: ".leaflet-control-fullscreen"
        },
        {
            ChkId: "chkPrint",
            Name: "Print",
            DOM: ".leaflet-control-browser-print"
        },
        {
            ChkId: "chkLocate",
            Name: "Locate",
            DOM: ".leaflet-control-locate"
        },
        {
            ChkId: "chkScaleControl",
            Name: "Scale control",
            DOM: ".leaflet-control-scale"
        },
        {
            ChkId: "chkMousePositioni",
            Name: "Mouse position",
            DOM: ".leaflet-control-mouseposition"
        },
        {
            ChkId: "chkMapBase",
            Name: "Base map switcher",
            DOM: "#basemaps-wrapper"
        },
        {
            ChkId: "chkMeasurement",
            Name: "Measurement",
            DOM: ".leaflet-control-measure"
        },
        {
            ChkId: "chkBookmarks",
            Name: "Bookmarks",
            DOM: ".leaflet-bookmarks-control"
        },
        {
            ChkId: "chkLegend",
            Name: "Legend",
            DOM: ".leaflet-legend-control"
        },

        {
            ChkId: "chkMiniMap",
            Name: "Mini map",
            DOM: ".leaflet-control-minimap"
        },


    ];
    widgets.forEach(function (widget, i) {
        // generate checkbox
        if (i < 6) {
            $("#widgetsModalBody .column-1").append(generateChk(widget.ChkId, widget.Name));
        }
        else {
            $("#widgetsModalBody .column-2").append(generateChk(widget.ChkId, widget.Name));
        }
        // generate checkbox event
        $("#" + widget.ChkId).click(function () {
            if ($("#" + widget.ChkId).is(":checked")) {
                $(widget.DOM).show();
            }
            else {
                $(widget.DOM).hide();
            }
        });
    });
}
initWidgetSetting();


$("[name='mapType']").click(function () {
    $(".in,.open").removeClass("in open");
    map.removeLayer(featureLayer);
    if (this.id === "mapTypeNormal") {
        $("#mapType").html("Simple Map");      
        declareFeatureLayer(layerMetadata.timeInfo);
    } else if (this.id === "mapTypeCluster") {
        $("#mapType").html("Cluster Map");
        featureLayer = L.esri.Cluster.featureLayer({
            url: layerUrl,
        }).addTo(map);
    } else if (this.id === "mapTypeHeat") {
        $("#mapType").html("Heat Map");
        featureLayer = L.esri.Heat.featureLayer({
            url: layerUrl,
            radius: 20
        }).addTo(map);
    }
});
Split(['#map-container', '#table-container'], {
    direction: 'vertical',
    gutterSize: 5,
    onDragEnd: function () { $(window).trigger('resize'); map.invalidateSize()}
});
