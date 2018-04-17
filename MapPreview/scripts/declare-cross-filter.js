// map change -> applyFilter- > draw chart
// filter change-> applyFilter -> draw chart
// chart change-> applyFilter with chart filter
// init cross filter
var drawChart;
var initCrossFilter = function () {
    var columns = [];
    // init choose column
    $.each(layerMetadata.fields, function (i, item) {
        if (item.type != "esriFieldTypeGeometry") { // ignore the geometry column
            $('#chooseColumnSelect').append($('<option>', {
                value: item.name,
                text: item.alias
            }));
            if (item.type != "esriFieldTypeOID") {
                columns.push(function (d) {
                    return d.properties[item.name];
                });
            }
            else {
                // add id as the first column
                columns.unshift(function (d) {
                    return d.properties[item.name];
                });
            }
        }
    });
    drawChart = function () {
        
        xf = crossfilter(filterdFeature);
        all = xf.groupAll();

        chartDim = xf.dimension(function (d) {
            return d.properties[$("select#chooseColumnSelect option").filter(":selected").val()];
        });
        chartGroup = chartDim.group();

        
        dc.renderAll();
        //materialChart = dc.rowChart("#chart");

        //materialChart
        //    .width(180)
        //    .height(200)
        //    .margins({ top: 10, right: 10, bottom: 30, left: 10 })
        //    .dimension(chartDim)
        //    .group(chartGroup)
        //    //.colors(materialColors)
        //    .elasticX(true)
        //    .gap(2)
        //    //.ordering(function (d) { return newOrderMaterial[d.key]; })
        //    .on("filtered", function () {
        //        applyFilter(chartDim.top(Infinity));
        //    })
        //    .xAxis().ticks(4);
        var chartType = $("select#chartTypeSelect option").filter(":selected").val();
        if (chartType == "pieChart") {
            materialChart = dc.pieChart("#chart");
            materialChart
                .width(380)
                .height(380)
                .slicesCap(4)
                .innerRadius(100)
                .dimension(chartDim)
                .group(chartGroup)
                .label(function (d) {
                    if (materialChart.hasFilter() && !materialChart.hasFilter(d.key)) {
                        return d.key + '(0%)';
                    }
                    var label = d.key;
                    if (all.value()) {
                        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
                    }
                    return label;
                })
        }
        else {
            materialChart = dc.barChart('#chart');
            materialChart
                .width(590)
                .height(380)
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .brushOn(false)
                //.xAxisLabel('Fruit')
                //.yAxisLabel('Quantity Sold')
                .dimension(chartDim)
                .barPadding(0.05)
                .outerPadding(0.05)
                .group(chartGroup);
        }

       
           

        materialChart.on("filtered", function () {
            applyFilter(chartDim.top(Infinity));
        });
      

        dc.renderAll();
    }
    $("#drawChart").click(drawChart);
   
   
}
