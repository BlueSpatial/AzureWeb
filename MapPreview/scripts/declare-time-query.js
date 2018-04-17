
var btn = document.getElementById('updateTimeBtn');
var startTimeInput = document.getElementById('from');
var endTimeInput = document.getElementById('to');
var convertDate=function(d) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

var initTimeExtent = function () {
    var fromDate = new Date(layerMetadata.timeInfo.timeExtent[0] * 1000);
    var toDate = new Date(layerMetadata.timeInfo.timeExtent[1] * 1000);
    $(function () {
        $("#from").val(convertDate(fromDate));
        $("#to").val(convertDate(toDate));
    });

}

var disableTime = function () {
    $("#time-ranges").addClass("hidden");
}
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
}

btn.addEventListener('click', function updateTimeRange(e) {
    featureLayer.setTimeRange(new Date(startTimeInput.value), (new Date(endTimeInput.value)).addHours(24) );    
});