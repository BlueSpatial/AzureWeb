var buildFilter = function (layerMetadata) {
    var filters = [];
    layerMetadata.fields.forEach(function (field, index) {
        if (field.type != "esriFieldTypeGeometry") { // ignore the geometry column
                      
            // Filter config          
            var id;
            var type;
            if (field.type == "esriFieldTypeOID" || field.type == "esriFieldTypeSmallInteger" || field.type == "esriFieldTypeInteger") {
                id = "cast(properties->" + field.name + " as int)";
                type = "integer";
            }
            else if (field.type == "esriFieldTypeDouble" || field.type == "esriFieldTypeSingle") {
                id = "cast(properties->" + field.name + " as double)";
                type = "double";
            }
            else {
                id = "properties->" + field.name;
                type = "string";
            }
            var filter = {
                type: type,
                id: id,
                label: field.alias
            };
            var features = [];
            featureLayer.eachFeature(function (feature) {
                features.push(feature.feature);
            });
             // get the unique items, if less than 30 value
            alasql("SELECT DISTINCT(properties->[" + field.name + "]) AS field FROM ? ORDER BY field ASC", [features], function (results) {
               
                // apply domain setting
                if (field.domain && field.domain.codedValues ||
                    results.length <= 15) {
                    if (field.domain && field.domain.codedValues) { // have coded value
                        filter.values = field.domain.codedValues.map(function (item) { return item.code });
                    }
                    else { // not have coded value
                        var distinctValues = [];
                        $.each(results, function (index, value) {
                            distinctValues.push(value.field);
                        });
                        filter.values = distinctValues;
                    }
                    filter.input = "checkbox";
                    filter.multiple = "true";
                    filter.operators = ["in", "not_in", "equal", "not_equal"];                  
                    filter.vertical = true;
                }
                filters.push(filter);
            });
        }
    });    
    $("#queryBuilder").queryBuilder({
        allow_empty: true,
        filters: filters
    });  
}

$("#viewSqlBtn").click(function () {
    alert($("#queryBuilder").queryBuilder("getSQL", false, false).sql);
});

$("#applyFilterBtn").click(function () {
    applyFilter();
});

$("#resetFilterBtn").click(function () {
    $("#queryBuilder").queryBuilder("reset");
    applyFilter();
});
var filterdFeature = [];
function applyFilter(chartFilterdFeatures) {
    var query = "SELECT * FROM ?";
    var sql = $("#queryBuilder").queryBuilder("getSQL", false, false).sql;
    if (sql.length > 0) {
        query += " WHERE " + sql;
    }

    var features = [];
    featureLayer.eachFeature(function (feature) {
        features.push(feature.feature);
    });
    alasql(query, [features], function (features) {        
        filterdFeature = features;
        // clear all features
       // featureLayer.removeLayers(featureIds);
        // add filtered list
        var filteredIds = features.map(function (item) {
            return item.properties[layerMetadata.objectIdField];
        });
        if (chartFilterdFeatures) {
            // filter again by chartFilterdFeature
            var chartFilteredIds = chartFilterdFeatures.map(function (item) {
                return item.properties[layerMetadata.objectIdField];
            });
            var commonIds = $.grep(filteredIds, function (element) {// get the common id https://stackoverflow.com/questions/22163143/how-to-find-common-elements-only-between-2-arrays-in-jquery
                return $.inArray(element, chartFilteredIds) !== -1;
            });
            filteredIds = commonIds;// get the common ID
        }
        else {// draw chart again if don't have chartFilterdFeatures
            drawChart();
        }
        // if not in this list above, remove it
        featureLayer.eachFeature(function (item) {
            var featureId = item.feature.properties[layerMetadata.objectIdField];
            if (filteredIds.indexOf(featureId) == -1) {
                featureLayer.removeLayers([featureId]);
            }
            else {
                featureLayer.addLayers([featureId]);
            }
        });
        //featureLayer.addLayers(filteredIds);
        syncTable();
    });
}