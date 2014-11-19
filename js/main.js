var fileLocation = './libs/zrender-original';
require.config({
    paths: {
        'zrender/zrender': fileLocation,
        'zrender/shape/Image': fileLocation,
        'zrender/shape/Line' :fileLocation,
        'zrender/shape/Isogon' :fileLocation
    }
});

// 获取zrender依赖
require(["zrender/zrender", 'zrender/shape/Image', 'zrender/shape/Line', 'zrender/shape/Isogon'], function (zrender, ImageShape, LineShape, IsogonShape) {

    // 遍历数据，创建节点
    function create_nodes_from(json) {
        // 浏览器环境
        var nodes_data = json.nodes;
        // php环境
        //var nodes_data = JSON.parse(json).nodes;

        for (var i = 0; i < nodes_data.length; i++) {

            var style = nodes_data[i];
            var style_width = JSON.parse(style.width);
            var style_height = JSON.parse(style.height);
            var highlight_x = width * JSON.parse(style.x[0]) / JSON.parse(style.x[1]);
            var highlight_y = height * JSON.parse(style.y[0]) / JSON.parse(style.y[1]);
            var style_x = highlight_x - style_width / 2;
            var style_y = highlight_y - style_height / 2;
            var ip = style.ip;

            zr.addShape(new ImageShape({
                style: {
                    x: style_x,
                    y: style_y,
                    image: style.image,
                    width: style_width,
                    height: style_height,
                    text: style.text,
                    textColor: style.textColor,
                    textPosition: style.textPosition
                },
                ip: ip,
                draggable: false,   // default true
                highlightStyle: {
                    width: style_width + 20,
                    height: style_height + 20,
                    x: style_x - 10,
                    y: style_y - 10,

                    text: ip ? ip.substring(8) : "",
                    textPosition: 'specific',
                    textX: highlight_x + style_width * 1.2,
                    textY: highlight_y,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    textColor: 'dark',
                    textFont: 'bold 10px verdana'
                },
                clickable: true,
                onclick: function (params) {
                    var ip = params.target.ip;
                    // 新页面中打开url
                    if (ip) window.open(ip);
                }
            }));

        }
    }

    // 遍历数据，创建连线
    function create_edges_from(json) {
        // 浏览器环境
        var edges_data = json.edges;
        // php环境
        //var edges_data = JSON.parse(json).edges;

        for (var i = 0; i < edges_data.length; i++) {

            var style = edges_data[i];
            var xStart = width * JSON.parse(style.xStart[0]) / JSON.parse(style.xStart[1]);
            var yStart = height * JSON.parse(style.yStart[0]) / JSON.parse(style.yStart[1]);
            var xEnd = width * JSON.parse(style.xEnd[0]) / JSON.parse(style.xEnd[1]);
            var yEnd = height * JSON.parse(style.yEnd[0]) / JSON.parse(style.yEnd[1]);
            var arrayPercent = JSON.parse(style.arrayPercent);
            var x = point(xStart, xEnd, arrayPercent);
            var y = point(yStart, yEnd, arrayPercent);

            //  直线
            zr.addShape(new LineShape({
                style: {
                    xStart: xStart,
                    yStart: yStart,
                    xEnd: x,
                    yEnd: y,
                    strokeColor: "#4169E1",
                    lineWidth: 2
                },
                hoverable: false,   // default true
                draggable: false    // default true
            }));

            //  正n边形
            if (arrayPercent) {
                zr.addShape(new IsogonShape({
                    style: {
                        x: x,
                        y: y,
                        r: 5,
                        n: 3,
                        color: "#4169E1"
                    },
                    rotation: [angle(xStart, yStart, xEnd, yEnd), x, y],
                    hoverable: false,   // default true
                    draggable: false    // default true
                }));
            }
        }
    }

    //求直线上某一比例的点
    function point(start, end, percent) {
        return end - (end - start) * percent;
    }

    //求两直角边正切弧度
    function angle(xStart, yStart, xEnd, yEnd) {
        var diff_x = xEnd - xStart,
            diff_y = yEnd - yStart;
        var result;
        if (diff_x > 0 && diff_y > 0) {
            result = Math.PI / 2 * 3 - Math.atan(diff_y / diff_x);
        } else if (diff_x > 0 && diff_y < 0) {
            result = Math.PI / 2 * 3 + Math.atan(diff_y / diff_x);
        } else if (diff_x < 0 && diff_y < 0) {
            result = Math.PI / 2 - Math.atan(diff_y / diff_x);
        } else if (diff_x < 0 && diff_y > 0) {
            result = Math.PI / 2 - Math.atan(diff_y / diff_x);
        } else if (diff_x == 0 && diff_y > 0) {
            result = Math.PI;
        } else if (diff_x == 0 && diff_y < 0) {
            result = 0;
        }
        //返回弧度
        return result;
    }


    // 初始化zrender
    var zr = zrender.init(document.getElementById("Main"));

    // 获取画布宽高
    var width = Math.ceil(zr.getWidth());
    var height = Math.ceil(zr.getHeight());

    $.get("data/map.json", function (json) {
        // 清空画布
        zr.clear();

        // 解析关系连线数据
        create_edges_from(json);

        // 解析节点数据
        create_nodes_from(json);

        // 渲染画布
        zr.render();
    });


});
