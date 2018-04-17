 (function () {
    // Create the connector object
     var myConnector = tableau.makeConnector();

     var map = L.map('invisibleMap');

     myConnector.init = function (initCallback) {
         initCallback();
         tableau.submit();
     };

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
            var tableData = [];
            for (var i = 0, len = result.features.length; i < len; i++) {
                var feature = result.features[i];

                feature.properties.geometry = feature.geometry;
                tableData.push(feature.properties);
            }

            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    
})();
