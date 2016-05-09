var TOPIC = "subscriber";
var PUBLISHER_TOPIC = "chart-zoomed";
var page = gadgetUtil.getCurrentPageName();
var qs = gadgetUtil.getQueryString();
var type;
var rangeStart;
var rangeEnd;

var CONTEXT = "/portal/iot/esbanalytics.jag";

if (gadgetConfig) {
    type = gadgetUtil.getRequestType(page, gadgetConfig);
}

$(function() {
    if (page != TYPE_LANDING && qs[PARAM_ID] == null) {
        $("#canvas").html(gadgetUtil.getDefaultText());
        return;
    }
    var timeFrom = gadgetUtil.timeFrom();
    var timeTo = gadgetUtil.timeTo();
    console.log("LINE_CHART[" + page + "]: TimeFrom: " + timeFrom + " TimeTo: " + timeTo);
    gadgetUtil.fetchData(CONTEXT, {
        id: qs.id,
        tableName: gadgetGenConfig.tableName,
        metric: gadgetGenConfig.metric,
        timeFrom: timeFrom,
        timeTo: timeTo,
        entryPoint: qs.entryPoint
    }, onData, onError);
});

gadgets.HubSettings.onConnect = function() {
    gadgets.Hub.subscribe(TOPIC, function(topic, data, subscriberData) {
        onTimeRangeChanged(data);
    });
};

function onTimeRangeChanged(data) {
    gadgetUtil.fetchData(CONTEXT, {
        id: qs.id,
        tableName: gadgetGenConfig.tableName,
        metric: gadgetGenConfig.metric,
        timeFrom: data.timeFrom,
        timeTo: data.timeTo,
        entryPoint: qs.entryPoint
    }, onData, onError);
};


function onData(response) {
    try {
        var data = response.message;
        if (data.length == 0) {
            $('#canvas').html(gadgetUtil.getEmptyRecordsText());
            return;
        }
        //sort the timestamps
        data.sort(function(a, b) {
            return a.timestamp - b.timestamp;
        });
        //perform necessary transformation on input data
        gadgetConfig.schema[0].data = gadgetConfig.processData(data);
        //finally draw the chart on the given canvas
        gadgetConfig.chartConfig.width = $('body').width();
        gadgetConfig.chartConfig.height = $('body').height();

        var vg = new vizg(gadgetConfig.schema, gadgetConfig.chartConfig);
        $("#canvas").empty();
        vg.draw("#canvas",[{type:"range", callback:onRangeSelected}]);
    } catch (e) {
        $('#canvas').html(gadgetUtil.getErrorText(e));
    }
};

function onError(msg) {
    $("#canvas").html(gadgetUtil.getErrorText(msg));
};

// $(window).resize(function() {
//     // if (page != TYPE_LANDING && qs[PARAM_ID]) {
//         drawChart();
//     // }
// });

document.body.onmouseup = function() {
    // var div = document.getElementById("dChart");
    // div.innerHTML = "<p> Start : " + rangeStart + "</p>" + "<p> End : " + rangeEnd + "</p>";

    if((rangeStart) && (rangeEnd) && (rangeStart.toString() !== rangeEnd.toString())){
        var message = {
            timeFrom: new Date(rangeStart).getTime(),
            timeTo: new Date(rangeEnd).getTime(),
            timeUnit: "Custom"
        };
        gadgets.Hub.publish(PUBLISHER_TOPIC, message);
    }
}

var onRangeSelected = function(start, end) {
    rangeStart = start;
    rangeEnd = end;
};