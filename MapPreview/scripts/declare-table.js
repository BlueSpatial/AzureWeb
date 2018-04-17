
var activeFeature = null;
var originalColor = null;
var highlightFeature = function (id) {    
    activeFeature = featureLayer.getFeature(id);   
    if (!originalColor && activeFeature.options) {// set orginal color if it null
        originalColor = activeFeature.options.color;
    }
    if (activeFeature.setStyle) {
        activeFeature.setStyle({ color: "#f00" });
        try {
            activeFeature.bringToFront();
        }
        catch(e){ };
    }
}
var removeHighlight = function () {
    if (activeFeature && activeFeature.setStyle
        && originalColor)// if have color symbol
    {
        activeFeature.setStyle({ color: originalColor });
    }
    activeFeature = null;    
}
map.on("click", function (e) {
    removeHighlight();
});

var buildTable = function (layerMetadata) {
    // add highlight
    featureLayer.on("click", function (evt) {
        removeHighlight();
        highlightFeature(evt.layer.feature.id);
    });
    table = [{
        field: "action",
        title: "<i class='fa fa-gear'></i>&nbsp;Action",
        align: "center",
        valign: "middle",
        width: "75px",
        cardVisible: false,
        switchable: false,
        formatter: function (value, row, index) {
            return [
                '<a class="zoom" href="javascript:void(0)" title="Zoom" style="margin-right: 10px;">',
                '<i class="fa fa-search-plus"></i>',
                '</a>',
                '<a class="identify" href="javascript:void(0)" title="Identify">',
                '<i class="fa fa-info-circle"></i>',
                '</a>'
            ].join("");
        },
        events: {
            "click .zoom": function (e, value, row, index) {
                removeHighlight();
                var featureId = row[layerMetadata.objectIdField];
                var feature = featureLayer.getFeature(featureId);
                highlightFeature(featureId);          
                if (feature.getBounds) {// for polygon and line
                    map.fitBounds(activeFeature.getBounds());
                }
                else { // for point
                    map.setView(feature._latlng, 13)
                }
               
            },
            "click .identify": function (e, value, row, index) {
                removeHighlight();
                var featureId = row[layerMetadata.objectIdField];
                var feature = featureLayer.getFeature(featureId);
                featureLayer.openPopup(feature);             
                highlightFeature(featureId);          
            }
        }
    }];

    layerMetadata.fields.forEach(function (field, index) {
        if (field.type != "esriFieldTypeGeometry") { // ignore the geometry column
            table.push({
                field: field.name,
                sortable: true,
                title: field.alias,
                visible: true
            });
        }
    });

    
  
    $("#table").bootstrapTable({
        cache: false,
        height: $("#table-container").height(),
        undefinedText: "",
        striped: false,
        pagination: false,
        minimumCountColumns: 1,
        sortName: "FID",
        sortOrder:"asc",
        toolbar: "#toolbar",
        search: false,
        trimOnSearch: false,
        showColumns: true,
        showToggle: true,
        columns: table,
        onClickRow: function (row) {
            // do something!
        },
        onDblClickRow: function (row) {
            // do something!
        }
    }); 
   

    $(window).resize(function () {
        $("#table").bootstrapTable("resetView", {
            height: $("#table-container").height()
        });
    });
    featureLayer.on('load', function (e) {
        setTimeout(function () {
            buildFilter(layerMetadata);
            applyFilter();
        },1000) // wait for all the values get and build the filter
    });
    $(window).trigger('resize');
}



map.on("moveend", function (e) {
    syncTable();
});


function syncTable() {
    tableFeatures = [];
    var mapBounds = map.getBounds();
    featureLayer.eachFeature(function (feature) {
        if (map.hasLayer(feature)) {// the feature that visible on map (not include feature remove by "featureLayer.removeLayers")
            if ((feature._bounds && mapBounds.contains(feature._bounds)) || // if polygon and line check by bound
                (feature.getLatLng && mapBounds.contains(feature.getLatLng()))) {// if point check by lat lng
                tableFeatures.push(feature.feature.properties);
            }
        }
        
    });
    $("#table").bootstrapTable("load", JSON.parse(JSON.stringify(tableFeatures)));
    var featureCount = $("#table").bootstrapTable("getData").length;
    var featureUnit = " visible features";
    if (featureCount == 1) {
        var featureUnit = " visible feature";
    }
    $("#feature-count").html(featureCount + featureUnit);
    
}

$("#download-csv-btn").click(function () {
    $("#table").tableExport({
        type: "csv",
        ignoreColumn: [0],
        fileName: "data"
    });
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#download-excel-btn").click(function () {
    $("#table").tableExport({
        type: "excel",
        ignoreColumn: [0],
        fileName: "data"
    });
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#download-pdf-btn").click(function () {
    $("#table").tableExport({
        type: "pdf",
        ignoreColumn: [0],
        fileName: "data",
        jspdf: {
            format: "bestfit",
            margins: {
                left: 20,
                right: 10,
                top: 20,
                bottom: 20
            },
            autotable: {
                extendWidth: false,
                overflow: "linebreak"
            }
        }
    });
    $(".navbar-collapse.in").collapse("hide");
    return false;
});