var gadgetGenConfig ={"tableName":"temp_stat_per-", "metric":"_avg"};
var yAxis = gadgetGenConfig.metric.replace('_','').toUpperCase();

//todo: make above also properties of below object
var gadgetConfig = {
    columns: ["timestamp", gadgetGenConfig.metric],
    schema: [{
        "metadata": {
            "names": ["Time", yAxis],
            "types": ["time", "linear"]
        },
        "data": []
    }],
    chartConfig: {
        x: "Time",
        charts: [{ type: "line", y: yAxis }],
        padding: { "top": 30, "left": 60, "bottom": 60, "right": 30 },
        range: true,
        rangeColor: COLOR_BLUE,
        colorScale: [COLOR_BLUE]
    },
    types: [
        { name: TYPE_LANDING, type: 1 }
    ],
    processData: function(data) {
        var result = [];
        var schema = this.schema;
        var columns = this.columns;
        data.forEach(function(row, i) {
            var record = [];
            columns.forEach(function(column) {
                var value = row[column];
                record.push(value);
            });
            // schema[0].data.push(record);
            result.push(record);
        });
        return result;
    }
};

