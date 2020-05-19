require.undef('share');

define('share', ['google'], function (google) {
    function draw(container, data, width, height) {
        window.google.charts.load('42', {'packages':['treemap']});

        window.google.charts.setOnLoadCallback(function () {
            drawMarketShare(container, data, width, height);
        });
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function drawMarketShare(container, data, width, height) {
        width = width || 960;
        height = height || 400;

        data = window.google.visualization.arrayToDataTable(data);

        var totalSales = new Object();

        var ancestor = data.getValue(0, 0);
        totalSales[ancestor] = 0;

        for (var i = 0; i < data.getNumberOfRows(); i++) {
            var name = data.getValue(i, 0);
            var parent = data.getValue(i, 1);
            var sales = data.getValue(i, 2);

            if (name === ancestor) { continue; }

            if (parent === ancestor && !(name in totalSales)) {
                totalSales[name] = 0;
                continue;
            }

            totalSales[ancestor] += sales;
            totalSales[parent] += sales;
        }

        var tree = new window.google.visualization.TreeMap(container);

        tree.draw(data, {
            highlightOnMouseOver: false,
            maxDepth: 1,
            maxPostDepth: 2,
            minColor: '#009688',
            midColor: '#f7f7f7',
            maxColor: '#ee8100',
            headerHeight: 15,
            fontColor: 'black',
            showScale: false,
            height: height,
            width: width,
            useWeightedAverageForAggregation: true,
            generateTooltip: showTooltip
        });

        function showTooltip(row, size, value) {
            var ancestor = data.getValue(0, 0);
            var parent = data.getValue(row, 1);

            var name = data.getValue(row, 0);
            if (/\(Others:/.test(name))
                name = '(Others)';

            var percentage = 0;
            if (name !== ancestor) {
                percentage = size / totalSales[parent] * 100;
                percentage = percentage.toFixed(2);
            }

            var type = (ancestor === parent) ? 'Category' : 'Item';

            parent = (type === 'Item') ? ('<br/>Category: <b>' + parent + '</b>') : '';

            var tooltip = '<div class="tooltip">' +
                    '<div class="arrow"></div>' +
                    '<div class="tooltip-inner">' +
                        '<b>' + name + '</b>' +
                        '<br/>' +
                        '<br/>' +
                        'Type: <b>' + type + '</b>' +
                        parent +
                        '<br/>' +
                        'Share: <b>' + numberWithCommas(size) + '</b> (<b>' + percentage + '%</b>)' +
                    '</div>' +
                '<div>';

            return (ancestor === name) ? null : tooltip;
        }
    }

    return draw;
});
