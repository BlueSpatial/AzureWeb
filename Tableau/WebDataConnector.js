 (function () {
    // Create the connector object
     var myConnector = tableau.makeConnector();

     var map = L.map('invisibleMap');

    //myConnector.init = function (initCallback) {
    //    initCallback();
    //    //tableau.submit();
    //};
    
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
    
    // Define the schema
    myConnector.getSchema = function (schemaCallback) {

        var layerUrl = getUrlParameter('layer');
        $.getJSON(layerUrl + "?f=json", function (resp) {
            var cols = [];
            for (var i = 0, len = resp.fields.length; i < len; i++) {
                var field = resp.fields[i];
                var fieldType = "";
                switch (field.type) {
                    case "esriFieldTypeString":
                    case "esriFieldTypeGlobalID":
                    case "esriFieldTypeGUID":
                        fieldType = tableau.dataTypeEnum.string;
                        break;
                    case "esriFieldTypeOID":
                        fieldType = tableau.dataTypeEnum.int;
                        break;
                    case "esriFieldTypeInteger":
                    case "esriFieldTypeSmallInteger":
                        fieldType = tableau.dataTypeEnum.int;
                        break;
                    case "esriFieldTypeDouble":
                    case "esriFieldTypeSingle":
                        fieldType = tableau.dataTypeEnum.float;
                        break;
                    case "esriFieldTypeDate":
                        fieldType = tableau.dataTypeEnum.datetime;
                        break;
                    case "esriFieldTypeGeometry":
                        fieldType = tableau.dataTypeEnum.geometry;
                        break;
                }

                if (fieldType === tableau.dataTypeEnum.geometry) {
                    var col = { id: "geometry", alias: "geometry", dataType: "geometry" }
                }
                else {
                    var col = { id: field.name, alias: field.alias, dataType: fieldType }
                }
                cols.push(col);
            }

            var tableSchema = {
                id: resp.name,
                alias: resp.name,
                columns: cols
            };

            schemaCallback([tableSchema]);
        });
    };

    // Download the data
    myConnector.getData = function (table, doneCallback) {
        var url = getUrlParameter('layer') + "/query?returnGeometry=true&where=1%3D1&outSr=4326&outFields=*&f=geojson";
        $.getJSON(url, function (result) {
            var query = "SELECT * FROM ?";

            //var sql = getUrlParameter('sql');
            var sql = "";
            var url = window.location.search;
            if (url.indexOf("sql") != -1) {
                sql = decodeURIComponent(url.substr(url.indexOf("sql") + 4));
            }

            if (sql && sql.length > 0) {
                query += " WHERE " + sql;
            }
            alasql(query, [result.features], function (features) {
                var tableData = [];
                for (var i = 0, len = features.length; i < len; i++) {
                    var feature = features[i];
                    feature.properties.geometry = feature.geometry;
                    tableData.push(feature.properties);
                }

                table.appendRows(tableData);
                doneCallback();
            });
        });
    };

    tableau.registerConnector(myConnector);

    // Create filter UI
    $.ajax({
        url: getUrlParameter('layer') + "?f=json",
        context: document.body,
        success: function (res) {
            // Query field data
            var layerMetadata = res;

            // Query features data
            var features = [];
            var url = getUrlParameter('layer') + "/query?returnGeometry=true&where=1%3D1&outSr=4326&outFields=*&f=geojson";
            $.getJSON(url, function (result) {
                features = result.features;
                
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
            });
        }
    });

    $("#applyFilterBtn").click(function () {
        var url = window.location.href;
        var separator = (url.indexOf("?") === -1) ? "?" : "&";
        var newParam = separator + "sql=" + $("#queryBuilder").queryBuilder("getSQL", false, false).sql;
        var newUrl = "";

        // check old url have sql param?
        var sqlIndex = url.indexOf("sql=");
        if (sqlIndex != -1) {
            var removedSqlUrl = window.location.href.substring(0, sqlIndex - 1);
            newUrl = removedSqlUrl + newParam;
        } else {
            newUrl = url + newParam;
        }

        window.location.href = newUrl;
    });

    $("#resetFilterBtn").click(function () {
        $("#queryBuilder").queryBuilder("reset");
    });

    $("#getAllDataBtn").click(function () {
        var url = window.location.href;
        var sqlIndex = url.indexOf("sql=");
     
        window.location.href = sqlIndex != -1 ? url.substring(0, sqlIndex - 1) : url;
    });
   
    if (document.referrer != "") {
        setTimeout(function () {
            tableau.submit();
        });
    }
})();