


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
    } else if (view == "show-chart") {
        $("#chart-view").html("Hide Chart");

        $("#left-container").css("width", "calc(68% - 2.5px)");
        $("#right-container").show();
        $("#right-container").css("width", "calc(32% - 2.5px)");
        $(window).resize();
        if (map) {
            map.invalidateSize();
        }
        $('#basemaps-wrapper').css('right', $('#right-container').width() + 10 + 'px');
        drawChart();
    } else if (view == "hide-chart") {
        $("#chart-view").html("Show Chart");

        $("#left-container").css("width", "100%");
        $("#right-container").hide();
        $(window).resize();
        if (map) {
            map.invalidateSize();
        }
        $('#basemaps-wrapper').css('right', '10px');
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

var initSplitChart = false;
$("#chart-btn").click(function () {
    if ($("#chart-view").html() === "Show Chart") {
        if (!initSplitChart) {
            Split(['#left-container', '#right-container'], {
                direction: 'horizontal',
                gutterSize: 5,
                sizes: [70, 30],
                minSize: [screen.availWidth - 620, 410],
                onDragEnd: function () {
                    $(window).trigger('resize');
                    map.invalidateSize();
                },
                onDrag: function () {
                    $('#basemaps-wrapper').css('right', $('#right-container').width() + 10 + 'px');
                }
            });
            initSplitChart = true;
        }
        switchView("show-chart");
    } else if ($("#chart-view").html() === "Hide Chart"){
        switchView("hide-chart");
    }
})

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
    map.removeLayer(bubbles);
    $(".legend")[0] ? $(".legend")[0].remove() : undefined
    if (this.id === "mapTypeNormal") {
        $("#mapType").html("Simple Map");
        declareFeatureLayer(layerMetadata.timeInfo);
    } else if (this.id === "mapTypeCluster") {
        $("#mapType").html("Cluster Map");
        featureLayer = L.esri.Cluster.featureLayer({
            url: layerUrl,
        }).addTo(map);
        bindPopup();
    } else if (this.id === "mapTypeHeat") {
        $("#mapType").html("Heat Map");
        featureLayer = L.esri.Heat.featureLayer({
            url: layerUrl,
            radius: 20
        }).addTo(map);
    } else if (this.id === "mapTypeBubble") {
        $("#mapType").html("Bubble Map");
        //var featureCollection = {
        //    type: "FeatureCollection",
        //    features: []
        //}
        //featureLayer.eachFeature(function (feature) {
        //    featureCollection.features.push(feature.feature);
        //});
        //bubbleOption.property = 'POINTNUM';
        //bubbles = L.bubbleLayer(featureCollection, bubbleOption);
        //bubbles.addTo(map);
    }
});

$("#getBubbleMap").click(function () {
    var data = $('.bubbleOption');
    bubbleOption.property = data[0].value;

    bubbleOption.legend = data[1].checked;
    bubbleOption.tooltip = data[2].checked;

    bubbleOption.max_radius = +data[3].value;
    bubbleOption.scale = data[4].value;

    bubbleOption.style.radius = +data[5].value;
    bubbleOption.style.weight = +data[6].value;

    bubbleOption.style.color = data[7].value;
    bubbleOption.style.opacity = data[8].value / 100;;

    bubbleOption.style.fillColor = data[9].value;
    bubbleOption.style.fillOpacity = data[10].value / 100;

    console.log(bubbleOption);

    var featureCollection = {
        type: "FeatureCollection",
        features: []
    }
    featureLayer.eachFeature(function (feature) {
        featureCollection.features.push(feature.feature);
    });
    bubbles = L.bubbleLayer(featureCollection, bubbleOption);
    bubbles.addTo(map);

    $('#mapTypeBubbleModal').modal('hide');
});

$('#resetBubbleMap').click(function () {
    var data = $('.bubbleOption');
    data[1].checked = true;
    data[2].checked = true;

    data[3].value = 35;
    data[4].value = 'YlGnBu';

    data[5].value = 10;
    data[6].value = 1;

    data[7].value = "#555555";
    data[8].value = 80

    data[9].value = "#74acb8";
    data[10].value = 50;
})
Split(['#map-container', '#table-container'], {
    direction: 'vertical',
    gutterSize: 5,
    onDragEnd: function () { $(window).trigger('resize'); map.invalidateSize()}
});
