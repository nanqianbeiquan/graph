import Vue from 'vue'
import Navbtp from './Navbtp.vue'
import Hints from './Hints.vue'
import Datafilter from './Datafilter.vue'
import Risktable from './Risktable.vue'
import Containerbtp from './Containerbtp.vue'
import Search from './Search.vue'
import $ from 'jquery'
import d3 from 'd3'
import vv from './vv'
import forceRender from './forceRender'
import dataParser from './dataParser'
import simpleExplorableForce from './simpleExplorableForce'

// forceRender.say();
// dataParser.hey();
// dataParser.yo();


require("bootstrap-webpack");
require("./dashboard.css");
// require("./style.css");
require("./style-black.css");

// $("body").css("background-color","red"); 测试是否支持jquery，支持
//debug config
Vue.config.debug = true;

d3.json('data/updateRawGraphData.json', function(d) {
    //原始数据转为节点-边形式===========================
    var rawData = d.data;
    console.log(rawData);
    var forceData = {};
    forceData = iniForceData(rawData);
    console.log(forceData);
    //关系雷西
    var initialRelationsTypes = forceData.linksTypeSet.values();
    // 节点类型，用于筛选
    var initialNodesTypes = ['All', 'Company', 'Person'];
    // 初始图形数据
    var dataSelected = {};
    // 节点名字堆、关系id堆
    dataSelected.nodesIdSet = d3.set();
    dataSelected.linksIdSet = d3.set();
    // 初始节点和关系
    dataSelected.nodes = [];
    dataSelected.links = [];

    prepareSeedNode(forceData, dataSelected);

    //菜单选项键值对应表
    var menuKeyNameList = {
        All: '全部节点',
        Company: '公司节点',
        Person: '个人节点',
        "投资": "投资",
        "法定代表人": "法人",
        "任职": "任职",
        "直系亲属": "亲属"
    }

    //节点与关系筛选对应表
    var nodeRelationFilterScale = d3.scale.ordinal()
        .domain(['All', 'Company', 'Person'])
        .range([["投资", "法定代表人", "任职", "直系亲属"], ["投资", "法定代表人"], ["直系亲属"]]);
    // console.log(nodeRelationFilterScale('Company'));
    // console.log(forceData.linksTypeSet.values());
    //==============================================

    //graph configuration =========================
    var graphConfig = {
        svgWidth: 900, //初始化设置为800,实例化图表时进行覆盖
        svgHeight: 700, //初始化设置为500,实例化图表时进行覆盖
        margin: {
            top: 50,
            bottom:30,
            left: 50,
            right: 50
        },
        containerHorizontalMargin: 0,
        containerVerticalMargin: 0,
        pageNavbarHeight: 50,
        colorCategory10: d3.scale.category10(),
        forceConfig: {
            charge: 70,
            gravity: 0.4
        }
    }
    //==============================================

    //model of mvvm ================================
    var model = {};

    model.data = {
        flag: 'flag here!',
        forceData: forceData, //原始力图节点-边数据，未indexed
        menuKeyNameList: menuKeyNameList, //菜单选项键值对应表
        // forceData.linksTypeSet.values() //["投资", "法定代表人", "任职", "直系亲属"]
        initialRelationsTypes: initialRelationsTypes,
        initialNodesTypes: initialNodesTypes,
        selectedStatus: { //选中的关系类型
            selectedLinksTypeList: ["投资", "法定代表人", "任职", "直系亲属"],
            // linksTypeFilterByNodes:
            selectedNodesType: 'All',
            selectedLinksTypes: [
                {fullType: "投资", shortType: "投资"},
                {fullType: "法定代表人", shortType: "法人"},
                {fullType: "任职", shortType: "任职"},
                {fullType: "直系亲属", shortType: "亲属"}
            ]
        },
        graphConfig: graphConfig,
        riskInfo: forceData.riskInfo
    };

    model.methods = {
        updateForceConfig: updateForceConfig,
        // updateGraph: updateGraph, //只筛选边的关系，更新图表
        nodeRelationFilterScale: nodeRelationFilterScale, //
        updateFiltedGraph: updateFiltedGraph, //筛选节点、边的关系，更新图表
        renderGraphBySearch: renderGraphBySearch //点击搜索按钮，渲染图形
    };

    model.computed = {
        getLinksTypeCheckboxesKeys: function() {
            this.selectedLinksTypeList = this.nodeRelationFilterScale(this.selectedStatus.selectedNodesType);

            return this.selectedLinksTypeList;
        }
    };

    model.events = {
        'updateGraphWithFiltedData': 'updateFiltedGraph',
        'renderGraphBySearchData': 'renderGraphBySearch'
    };

    //vm of mvvm ==================================
    var vm = new Vue({
        el: 'body',
        components: {
            Navbtp,
            Hints,
            Datafilter,
            Risktable,
            Containerbtp,
            Search
        },
        data: model.data,
        methods: model.methods,
        computed: model.computed,
        events: model.events,
        // ready: loadGraph
        // ready: simpleExplor
    });
    //==============================================

    //test area ====================================
    function sayHi() {
        console.log(this.flag);
    }
    //==============================================

    //根据不同类型力图调整引力、斥力大小
    function updateForceConfig(charge, gravity) {
        this.graphConfig.charge = charge;
        this.graphConfig.gravity = gravity;
    }

    function prepareSeedNode(forceData, dataSelected) {
        var seedNodeArray = forceData.nodes.filter(function(node) {
            return node.properties['公司名称'] == '上海美特斯邦威服饰股份有限公司';
        });
        // console.log(seedNodeArray[0]);
        dataSelected.nodes.push(seedNodeArray[0]);
    }

    // 测试下探展开功能简单版
    function simpleExplor() {
        var svg = iniSvg(this.graphConfig, 'vizContainer');
        simpleExplorableForce.render(forceData, dataSelected, svg, this.graphConfig);
    }

    //初始化绘制图表调用函数=================================
    function loadGraph() {
        var filtedData = filterByRelationType(this.forceData, this.forceData.linksTypeSet.values());
        // var filtedDataIndexed = addIndexForceData(filtedData);
        var filtedDataIndexed = vv.data.addIndexOfForceData(filtedData);

        var svg = iniSvg(this.graphConfig, 'vizContainer');

        var mouseTooltip = vv.ini.createMouseTooltip('mouseTooltip');

        generateLegency(svg);

        // drawForce(filtedDataIndexed, svg, this.graphConfig, mouseTooltip);
        forceRender.renderForceGraph(forceData, filtedDataIndexed, svg, this.graphConfig, mouseTooltip); //加载使用外部绘图组件
    }
    //==============================================

    //start render Graph By Search #############################
    function renderGraphBySearch() {
        console.log('hey search button');
    }
    //end render Graph By Search #############################

    //节点关系全筛选-更新图表调用函数=================================
    function updateFiltedGraph() {
        var filtedData = filterData(this.forceData, this.selectedStatus.selectedNodesType, this.selectedStatus.selectedLinksTypeList);
        // var filtedDataIndexed = addIndexForceData(filtedData);
        var filtedDataIndexed = vv.data.addIndexOfForceData(filtedData);

        var svg = iniSvg(this.graphConfig, 'vizContainer');

        var mouseTooltip = vv.ini.createMouseTooltip('mouseTooltip');

        generateLegency(svg);

        drawForce(filtedDataIndexed, svg, this.graphConfig, mouseTooltip);
    }
    //==============================================

    //start filter data by node and links type ===========
    function filterData(data, nodeType, relationType) {
        var filtedData = {};
        var links = data.links;
        var nodes = data.nodes;

        var idNodesDict = data.idNodesDict;// 节点id与node配对词典
        // console.log(links);
        // console.log(nodes);
        var relationTypeSet = d3.set(relationType);
        var filtedNodesIdSet = d3.set();

        var filtedLinks = links.filter(function(d) {
            if (relationTypeSet.has(d.type)) {
                var qualifyLinks;
                //start verity company node ---------
                if (nodeType == 'Company') {
                    qualifyLinks = verifyNodesLabel(d, 'Company');
                    return qualifyLinks;

                }
                //end verity company node ---------

                //start verity person node ---------
                else if (nodeType == 'Person') {
                    qualifyLinks = verifyNodesLabel(d, 'Person');
                    return qualifyLinks;
                }
                //end verity person node ---------

                //start verity all node ---------
                else {
                    //选取两边的节点id
                    if (!filtedNodesIdSet.has(d.source)) {
                        filtedNodesIdSet.add(d.source);
                    }
                    if (!filtedNodesIdSet.has(d.target)) {
                        filtedNodesIdSet.add(d.target);
                    }

                    qualifyLinks = d;
                    return qualifyLinks;
                }
                //end verity all node ---------

                //start verifyNodesLabel ---------
                function verifyNodesLabel(d, nodeLabel) {
                    var isQualifyNode = false;
                    if (idNodesDict[d.source].label==nodeLabel && idNodesDict[d.target].label==nodeLabel) {
                        isQualifyNode = true;
                    }

                    if (isQualifyNode) {
                        //选取两边的节点id
                        if (!filtedNodesIdSet.has(d.source)) {
                            filtedNodesIdSet.add(d.source);
                        }
                        if (!filtedNodesIdSet.has(d.target)) {
                            filtedNodesIdSet.add(d.target);
                        }

                        isQualifyNode = false;

                        return d;
                    }
                }
                //end verifyNodesLabel ---------
            }
        });

        // console.log(filtedLinks);

        var filtedNodes = nodes.filter(function(d) {
            if (filtedNodesIdSet.has(d.id)) {
                //顺便筛选出风险企业
                // console.log(d);
                return d;
            }
        });

        filtedData.nodes = filtedNodes;
        filtedData.links = filtedLinks;

        return filtedData;
    }
    //end filter data by node and links type ===========

    //start filter data by links type ==================
    function filterByRelationType(data, relationType) {
        var filtedData = {};
        var links = data.links;
        var nodes = data.nodes;
        // console.log(links);
        // console.log(nodes);
        var relationTypeSet = d3.set(relationType);
        var filtedNodesIdSet = d3.set();

        var filtedLinks = links.filter(function(d) {
            // console.log(d);
            if (relationTypeSet.has(d.type)) {
                //选取两边的节点id
                if (!filtedNodesIdSet.has(d.source)) {
                    filtedNodesIdSet.add(d.source);
                }
                if (!filtedNodesIdSet.has(d.target)) {
                    filtedNodesIdSet.add(d.target);
                }

                return d;
            }
        });

        var filtedNodes = nodes.filter(function(d) {
            if (filtedNodesIdSet.has(d.id)) {
                return d;
            }
        });

        filtedData.nodes = filtedNodes;
        filtedData.links = filtedLinks;

        return filtedData;
    }
    //end filter data by links type ==================

    //初始化svg画布################
    function iniSvg(graphConfig, vizContainer) {
        if (d3.select('svg')) {
            d3.select('svg').remove();
        }

        setSvgConfig();

        var svg = d3.select('#'+vizContainer).append('svg')
            // .attr('width', graphConfig.svgWidth + graphConfig.margin.left + graphConfig.margin.right)
            .attr('width', graphConfig.svgWidth)
            // .attr('height', graphConfig.svgHeight + graphConfig.margin.top + graphConfig.margin.bottom)
            .attr('height', graphConfig.svgHeight);

        return svg;

        // 设置svg画布参数
        function setSvgConfig() {
            graphConfig.svgWidth = document.getElementById(vizContainer).offsetWidth - graphConfig.containerHorizontalMargin;
            // console.log(graphConfig.svgWidth);
            graphConfig.svgHeight = document.documentElement.clientHeight - graphConfig.pageNavbarHeight - graphConfig.containerVerticalMargin;
            // console.log(graphConfig.svgHeight);
        }
    }

    //start force graph render ================================

    //end force graph render ==================================

    // start draw force =======================================
    function drawForce(data, svg, graphConfig, mouseTooltip) {
        // var width = 900;
        // var height = 650;
        var width = graphConfig.svgWidth;
        var height = graphConfig.svgHeight;

        var nodes = data.nodes;
        var edges = data.links;

        //scale for zoom ===============
        var currentOffset = {x: 0, y: 0};
        var currentZoom = 1.0;

        var xScale = d3.scale.linear()
                .domain([0, width])
                .range([0, width]);

        var yScale = d3.scale.linear()
                .domain([0, height])
                .range([0, height]);

        var zoomScale = d3.scale.linear()
                .domain([1, 6])
                .range([1, 6])
                .clamp(true);
        //===============================

        var force = d3.layout.force()
            .nodes(nodes)   //指定节点数组
            .links(edges)   //指定连线数组
            .size([width,height]) //指定范围
            // .linkDistance(60)  //指定连线长度
            .linkDistance(function(d) {
                var sourceLinksNum = forceData.nodesConnectLinksDict[d.source.id].values().length;
                var targetLinksNum = forceData.nodesConnectLinksDict[d.target.id].values().length;
                // console.log(sourceLinksNum);
                if (sourceLinksNum>7 && targetLinksNum>7) {
                    return 200;
                } else {
                    return 40;
                }

            })
            // .linkStrength(1)
            .charge(-60)  //相互之间的作用力
            .gravity(0.2)
            .friction(0.8)
            // .alpha(0.1)
            // .theta(0.3);

        var drag = force.drag()
            .on("dragstart",function(d,i){
                d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
                // 阻止节点拖动动作冒泡为整个svg拖动
                d3.event.sourceEvent.stopPropagation();
                // 尝试当移动节点的时候图像停止摆动
                // force.stop();
            })
            .on("dragend",function(d,i){
                // 尝试当移动节点的时候图像恢复摆动
                // force.resume();
            })
            .on("drag",function(d,i){
                // d.px += d3.event.dx;
                // d.py += d3.event.dy;
                // d.x += d3.event.dx;
                // d.y += d3.event.dy;
                // tick();
            });

        force.start();  //开始作用
        //总的g包装点
        var networkGraph = svg.append('g').attr('class', 'grpParent');

        // 移动整个svg
        svg.call( d3.behavior.drag()
            .on("drag",dragmove)
        );

        // 缩放整个svg
        svg.call(d3.behavior
            .zoom()
            .x(xScale)
            .y(yScale)
            .scaleExtent([1, 6])
            .on('zoom', doZoom)
        );

        // 箭头
        //================================
        var arrowConfig = {
            id: 'arrow',
            path: "M0,0 L4,2 L0,4 L0,0",
            markerUnits: 'strokeWidth',
            markerWidth: 4,
            markerHeight: 4,
            viewBox: "0 0 4 4",
            refX: 10,
            refY: 2,
            orient: 'auto'
        }
        var arrow = vv.draw.arrow(svg, "#2fafc6", arrowConfig);

        var arrowConfigHighlight = {
            id: 'arrowHighlight',
            path: "M0,0 L4,2 L0,4 L0,0",
            markerUnits: 'strokeWidth',
            markerWidth: 4,
            markerHeight: 4,
            viewBox: "0 0 4 4",
            refX: 6,
            refY: 2,
            orient: 'auto'
        }
        var arrowHighlight = vv.draw.arrow(svg, "#2fafc6", arrowConfigHighlight);

        //关系与样式类对应表
        var edgesStyleScale = d3.scale.ordinal()
                .domain(['法定代表人', '任职', '直系亲属', '投资'])
                .range(['owner', 'job', 'relative', 'invest']);

        //添加连线
        var edgesG = networkGraph.append('g').attr('id', 'edgesG');
        var svg_edges = edgesG.selectAll("line")
        // var svg_edges = edgesG.selectAll("path")
            .data(edges)
            .enter()
            .append("line")
            // .append("path")
            .attr('class', function(d) {
                return edgesStyleScale(d.type);
            })
            .attr('id', function(d) {
                // console.log(d);
                return d.id;
            })
            // .attr("marker-end", 'url(#arrow)');

        //尝试修复ie箭头显示问题
        // d3.selectAll('path.invest')
        d3.selectAll('line.invest')
            .attr("marker-end", 'url(#arrow)');

        //添加描述关系的文字
        var edgesTextG = networkGraph.append('g').attr('id', 'edgesTextG');
        var edges_text = edgesTextG.selectAll(".linetext")
            .data(edges)
            .enter()
            .append("text")
            .attr("class","linetext")
            .style("font-size", 10)
            .style('opacity', 0)
            .text(function(d){
                if (d.type == '任职') {
                    // console.log(d);
                    return d.properties['职位'];
                } else if (d.type == '投资') {
                    if (d.properties['认缴出资']) {
                        return '投资' + d.properties['认缴出资'];
                    }else {
                        return '认缴出资金额不详';
                    }
                } else {
                    return d.type;
                }
            });

        //添加描述节点的文字
        var nodesTextG = networkGraph.append('g').attr('id', 'nodesTextG');
        var svg_texts = nodesTextG.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr('class', 'nodesText')
            .attr('id', function(d) {
                return 'nodesText' + d.id;
            })
            .style("font-size", 10)
            // .style("fill", "black")
            .style('opacity', 0)
            .attr("dx", 0)
            .attr("dy", -4)
            .text(function(d){
                if (d.label == 'Company') {
                    return d.properties['公司名称'];
                }
                else if (d.label == 'Person') {
                    return d.properties['姓名'];
                }
            });

        //添加节点
        var nodesG = networkGraph.append('g').attr('id', 'nodesG');
        var svg_nodes = nodesG.selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r",function(d) {
                if (d.label == 'Company') {
                    return 6;
                } else if ((d.label == 'Person')) {
                    return 4;
                }
            })
            .on("mouseover",function(d,i){
                // console.log(d);
                showMouseTooltip(d);

                //zoom the node r ============================
                var circle = d3.select(this);
                circle.transition(500)
                    .attr("r",function(d) {
                        // if (d.label == 'Company') {
                        //     return 12;
                        // } else if ((d.label == 'Person')) {
                        //     return 10;
                        // }
                        //
                        return 10;
                    });

                // console.log(svg_edges[0]);
                //active in ph3 ===============================
                // //显示连接线上的文字
                edges_text.style("opacity",function(edge){
                    // console.log(edge.source);
                    // console.log(edge.target);
                    if( edge.source === d || edge.target === d){
                        // console.log(edge.id);
                        return 1;
                    } else {
                        return 0;
                    }
                });
                // //加粗连接线
                svg_edges.style("stroke-width",function(edge){
                    // console.log(edge.source);
                    // console.log(edge.target);
                    if( edge.source === d || edge.target === d){
                        // console.log(edge.id);
                        return 3;
                    } else {
                        return 1;
                    }
                });
                //高亮边底色
                svg_edges.style("stroke-opacity",function(edge){
                    // console.log(edge.source);
                    // console.log(edge.target);
                    if( edge.source === d || edge.target === d){
                        // console.log(edge.id);
                        return 1;
                    } else {
                        return 0.7;
                    }
                });

                //高亮周边一度节点标签
                svg_edges.filter(function(edge) {
                    if ( edge.source === d || edge.target === d) {
                        if (edge.source === d) {
                            console.log(edge.target);
                            console.log(d3.select('#nodesText' + edge.target.id));
                            d3.select('#nodesText' + edge.target.id)
                                .style('opacity', 0.8);
                        } else if (edge.target === d) {
                            console.log(edge.source);
                            d3.select('#nodesText' + edge.source.id)
                                .style('opacity', 0.8);
                        }
                    }
                });

                // //红色高亮连接线
                // svg_edges.classed("edgeHighlight",function(edge){
                //     // console.log(edge.source);
                //     // console.log(edge.target);
                //     if( edge.source === d || edge.target === d){
                //         // console.log(edge.id);
                //         console.log(edge);
                //         return true;
                //     } else {
                //         // return false;
                //     }
                // });

                // svg_edges.attr("class",function(edge){
                //     // console.log(edge.source);
                //     // console.log(edge.target);
                //     if( edge.source === d || edge.target === d){
                //         // console.log(edge.id);
                //         // console.log(edge);
                //         return 'edgeHighlight';
                //     } else {
                //         return edgesStyleScale(d.type);
                //     }
                // });

                // 鼠标高亮连接线后出现箭头
                svg_edges.attr("marker-end",function(edge){
                    // console.log(edge.source);
                    // console.log(edge.target);
                    if( edge.source === d || edge.target === d){
                        if(edge.type == '投资') {
                            return 'url(#arrowHighlight)';
                        }
                    } else {
                        if(edge.type == '投资') {
                            return 'url(#arrow)';
                        }
                    }
                });
                //============================================
            })
            .on('mouseout', function(d) {
                hideMouseTooltip();

                //zoom the node r ============================
                var circle = d3.select(this);
                circle.transition(500)
                    .attr("r",function(d) {
                        if (d.label == 'Company') {
                            return 6;
                        } else if ((d.label == 'Person')) {
                            return 4;
                        }
                    });

                //active in ph3 ===============================
                // // 鼠标移出，控制边和边属性说明的特性
                edges_text.style('opacity', 0); //边属性标签不可见
                svg_texts.style('opacity', 0); //节点标签不可见
                svg_edges.style("stroke-width",1); //回复边宽度

                d3.selectAll('line.invest')
                    .attr("marker-end", 'url(#arrow)');

                // d3.selectAll('path.invest')
                //     .attr("marker-end", 'url(arrow)');
                //============================================
            })
            .on("dblclick",function(d,i){ //双击解除位置锁定
                d.fixed = false;
            })
            .on('click', function(d) {
                // console.log(d);
                // console.log(svg_edges[0]);
                // var clickNodesSet = d3.set();
                //
                // svg_edges.filter(function(edge) {
                //     if( edge.source === d || edge.target === d) {
                //         // console.log(edge);
                //         // console.log(edge.source);
                //         // console.log(edge.target);
                //
                //         clickNodesSet.add(edge.source);
                //         clickNodesSet.add(edge.target);
                //         // console.log(typeof(clickNodesSet));
                //         for(var key in clickNodesSet) {
                //             // console.log(clickNodesSet[key]);
                //             var subSet = clickNodesSet.get[key];
                //             console.log(subSet);
                //         }
                //     }
                // });
            })
            .style('fill', function(d) {
                if (d.label == 'Company') {
                    // console.log('got risk record');
                    return '#196cc4';
                } else {
                    return '#aaa';
                }
            })
            .style('fill-opacity', .7)
            .style('stroke', function(d) {
                if (d.properties.hasOwnProperty('风险评级')) {
                    // console.log('got risk record');
                    // console.log(d.properties['风险评级']);
                    // console.log(d.properties['风险指数']);
                    if (d.properties['风险评级'] == '低') {
                        return 'green';
                    } else if (d.properties['风险评级'] == '中') {
                        return 'orange';
                    } else if (d.properties['风险评级'] == '高') {
                        return 'red';
                    }

                }
            })
            .style('stroke-width', function(d) {
                if (d.properties.hasOwnProperty('风险评级')) {
                    // console.log('got risk record');
                    return 3;
                }
            })
            .call(force.drag);  //使得节点能够拖动

        //start tick ========================================
        // 执行放大效果的tick
        force.on('tick', function() {
            repositionGraph(undefined, undefined, 'tick');
        });

        // force.on("tick", function(){  //对于每一个时间间隔
        //     //限制结点的边界
        //     nodes.forEach(function(d,i){
        //         d.x = d.x < 0 ? 0 : d.x ;
        //         d.x = d.x > width ? width : d.x ;
        //         d.y = d.y < 0 ? 0 : d.y ;
        //         d.y = d.y > height ? height : d.y ;
        //     });
        //     //更新连线坐标：直线
        //     svg_edges.attr("x1",function(d){ return d.source.x; })
        //         .attr("y1",function(d){ return d.source.y; })
        //         .attr("x2",function(d){ return d.target.x; })
        //         .attr("y2",function(d){ return d.target.y; });
        //
        //     //更新连线坐标：弧线
        //     // svg_edges.attr("d", linkArc);
        //
        //
        //     //更新节点坐标
        //     svg_nodes.attr("cx",function(d){ return d.x; })
        //         .attr("cy",function(d){ return d.y; });
        //
        //     // 更新文字坐标
        //     svg_texts.attr("x", function(d){ return d.x; })
        //         .attr("y", function(d){ return d.y; });
        //
        //     //更新连接线上文字的位置
        //     edges_text.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; })
        //         .attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });
        //
        // });

        // //end tick ========================================

        force.on('end', function() {
            // console.log('force tick end!');
            //高斯模糊滤镜
            // var filter = createGaussianBlurFilter(svg, 'glow');
            // 阴影滤镜，太影响性能，停用
            // var shadow = vv.svg.shadowFilter(svg, 'shadow');
            // svg_edges.style('filter', 'url(#shadow)');
            // svg_nodes.style('filter', 'url(#shadow)');
        });

        force.on('start', function() {
            console.log('force tick start!');
            // var filter = createGaussianBlurFilter(svg, 'glow');

            // svg_edges.style('filter', 'none');
            // svg_nodes.style('filter', 'none');
        });

        // move graph to new position
        function repositionGraph(offset, zValue, mode) {
            // if transition?
            var doTr = (mode == 'move');
            // drag
            if (offset !== undefined && (offset.x != currentOffset.x || offset.y != currentOffset.y)) {
                var g = d3.select('g.grpParent');

                if(doTr) {
                    g = g.transition().duration(500);
                }

                g.attr('transform', function(d) {
                    return 'translate(' + offset.x + ',' + offset.y + ')';
                });

                currentOffset.x = offset.x;
                currentOffset.y = offset.y;
            }

            // zoom: new value of zoom
            if (zValue === undefined) {
                if (mode != 'tick') {
                    return;
                }

                zValue = currentZoom;
            } else {
                currentZoom = zValue;
            }

            // move links
            var allLinks = doTr ? svg_edges.transition().duration(500) : svg_edges;
            allLinks.attr('x1', function(d) { return zValue*(d.source.x); })
                .attr('y1', function(d) { return zValue*(d.source.y); })
                .attr('x2', function(d) { return zValue*(d.target.x); })
                .attr('y2', function(d) { return zValue*(d.target.y); });

            // move nodes
            var allNodes = doTr ? svg_nodes.transition().duration(500) : svg_nodes;
            allNodes.attr('transform', function(d) {
                return 'translate(' + zValue*d.x + ',' + zValue*d.y + ')';
            });

            //move node text
            // 更新node文字坐标
            var nodesText = doTr ? svg_texts.transition().duration(500) : svg_texts;
            nodesText.attr('transform', function(d) {
                return 'translate(' + zValue*d.x + ',' + zValue*d.y + ')';
            });
            // nodesText.attr("x", function(d){ return d.x; })
            //     .attr("y", function(d){ return d.y; });

            //move edge text
            //更新连接线上文字的位置
            var edgesText = doTr ? edges_text.transition().duration(500) : edges_text;
            edgesText.attr('transform', function(d) {
                return 'translate(' + zValue*((d.source.x + d.target.x)/2) + ',' + zValue*((d.source.y + d.target.y)/2) + ')';
            });
            // edgesText.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; })
            //     .attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });
        }

        // drag graph
        function dragmove(d) {
            var offset = {
                x: currentOffset.x + d3.event.dx,
                y: currentOffset.y + d3.event.dy
            };
            repositionGraph(offset, undefined, 'drag');
        }

        // zoom graph
        function doZoom(increment) {
            var newZoom = increment === undefined ? d3.event.scale : zoomScale(currentZoom+increment);

            if (currentZoom == newZoom) {
                return; //no zoom change
            }

            //get current graph window size
            // s = getViewportSize();
            // width = s.w < WIDTH ? s.w : WIDTH;
            // height = s.h < HEIGHT ? s.h : HEIGHT;

            //compute new offset, so graph center wont move
            var zoomRatio = newZoom / currentZoom;
            var newOffset = {
                x: currentOffset.x*zoomRatio + width/2*(1-zoomRatio),
                y: currentOffset.y*zoomRatio + height/2*(1-zoomRatio)
            };

            //repositionGraph
            repositionGraph(newOffset, newZoom, 'zoom');
        }

        // start 弧线连线===========================
        function linkArc(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);

                return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;

            //二次被塞尔曲线不好看
            // var qx = d.source.x;
            // var qy = d.target.y;
            //     return "M" + d.source.x + "," + d.source.y + " Q" + qx + "," + qy + " " + d.target.x + "," + d.target.y;
        }
        // end  弧线连线===========================

        // start mouse tooltip ===========================
        //出现提示框
        function showMouseTooltip(d) {
            mouseTooltip.style("opacity", 1)
                .style('z-index', 10);

            mouseTooltip.html(generateMouseTooltipContent(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        }

        // 隐藏提示框
        function hideMouseTooltip() {
            mouseTooltip.style("opacity", 0);
        }

        //start 生成提示框内容
        function generateMouseTooltipContent (d) {
            var tooltipContent = [];
            var keyArray = [];
            var htmlContent = '';

            if (d.label == 'Company') {
                htmlContent += "<div>" + d.properties['公司名称'] + "</div>";

                if (d.properties['注册资本']) {
                    htmlContent += "<div>注册资本：" + d.properties['注册资本'] + "</div>";
                }

                if (d.properties.hasOwnProperty('风险指数')) {
                    htmlContent += "<div>风险指数：" + d.properties['风险指数'] + "</div>";
                    htmlContent += "<div>风险评级：" + d.properties['风险评级'] + "</div>";
                }
            }
            else if (d.label == 'Person') {
                htmlContent += "<div>" + d.properties['姓名'] + "</div>";
            }
            return htmlContent;
        }
        //end 生成提示框内容
        // start mouse tooltip ===========================
    }
    //end drawForce ===============================

    // start 初始化力图布局数据
    function iniForceData(rawData) {
        var forceData = {};
        forceData.links = [];
        forceData.nodes = [];
        //节点链接的边列表
        forceData.nodesConnectLinksDict = {};
        // 节点id与节点本身的对应词典，根据id查询nodes本身
        forceData.idNodesDict = {};

        var nodesIdSet = d3.set();
        // ["投资", "法定代表人", "任职", "直系亲属"]
        forceData.linksTypeSet = d3.set();

        forceData.riskInfo = {}; //风险企业信息
        forceData.riskInfo.highRisk = [];
        forceData.riskInfo.normalRisk = [];
        forceData.riskInfo.lowRisk = [];

        rawData.forEach(function(d) {
            // iniLinks(d, forceData.linksTypeSet, forceData.links);
            iniNodes(d, nodesIdSet, forceData.nodes, forceData.nodesConnectLinksDict, forceData.idNodesDict);
            iniLinks(d, forceData.linksTypeSet, forceData.links, forceData.nodesConnectLinksDict);
        });

        //筛选风险企业信息
        forceData.nodes.forEach(function(d) {
            // console.log(d);
            if (d.label=="Company") {
                if (d.properties.hasOwnProperty('风险评级')) {
                    // console.log(d);
                    if (d.properties['风险评级']=='高') {
                        forceData.riskInfo.highRisk.push(d);
                    } else if (d.properties['风险评级']=='中') {
                        forceData.riskInfo.normalRisk.push(d);
                    } else if (d.properties['风险评级']=='低') {
                        forceData.riskInfo.lowRisk.push(d);
                    }
                }
            }
        });

        // console.log(forceData.riskInfo);

        return forceData;
    }
    // end 初始化力图布局数据

    // start 初始化节点数据
    function iniNodes(d, nodesIdSet, nodesHolder, nodesConnectLinksDict, idNodesDict) {
        // console.log(d);forceData.nodesConnectLinksDict
        var nodesArrayData = d.graph.nodes;
        var linksId = d.graph.relationships.id;

        for(var i = 0; i<2; i++) {
            var nodeId = nodesArrayData[i].id;
            if (!nodesIdSet.has(nodeId)) {
                nodesIdSet.add(nodeId);
                // console.log(nodesArrayData[i]);
                var singleNode = {};

                //初始化记录节点连接的线条
                nodesConnectLinksDict[nodeId] = d3.set();
                // singleNode.linksNumber.push(linksId);

                singleNode.id = nodesArrayData[i].id;
                singleNode.label = nodesArrayData[i].labels[0];
                singleNode.properties = nodesArrayData[i].properties;
                // if (singleNode.properties.hasOwnProperty('风险指数')) {
                //     console.log('got risk record');
                // }
                nodesHolder.push(singleNode);

                // 创建以id为索引的节点字典
                idNodesDict[singleNode.id] = singleNode;
                // console.log(idNodesDict);


            }

        }
    }
    // end 初始化节点数据

    // start 初始化边数据
    function iniLinks(d, linksTypeSet,linksHolder, nodesConnectLinksDict) {
        // console.log(d);
        // var nodesArrayData = d.graph.nodes;
        var linksData = d.graph.relationships[0];
        // console.log(linksData);
        var singleLink = {};
        singleLink.source = linksData.startNode;
        singleLink.target = linksData.endNode;
        singleLink.id = linksData.id;
        singleLink.type = linksData.type;
        singleLink.properties = linksData.properties;

        nodesConnectLinksDict[singleLink.source].add(singleLink.id);
        nodesConnectLinksDict[singleLink.target].add(singleLink.id);

        if (!linksTypeSet.has(singleLink.type)) {
            linksTypeSet.add(singleLink.type);
        }

        linksHolder.push(singleLink);
    }
    // end 初始化边数据 ===============================

    //start legency generator =======================
    function generateLegency(svg) {
        var legencyG = svg.append('g')
            .attr('id', 'legencyG')
            .attr('transform', 'translate(10, 20)');

        var circleCompanyLegendConfig = { r: 6, cx: 0, cy: 0, styleClass: 'companyLegend'};
        vv.draw.circle(legencyG, circleCompanyLegendConfig);
        var textCompanyLegendConfig = {x: 10, y: 3, styleClass: 'legend', content: '公司'};
        vv.draw.text(legencyG, textCompanyLegendConfig);

        var circlePersonLegendConfig = { r: 6, cx: 0, cy: 20, styleClass: 'personLegend'};
        vv.draw.circle(legencyG, circlePersonLegendConfig);
        var textPersonLegendConfig = {x: 10, y: 23, styleClass: 'legend', content: '自然人'};
        vv.draw.text(legencyG, textPersonLegendConfig);

        var circleHighRiskLegendConfig = { r: 5, cx: 0, cy: 40, styleClass: 'highRisk'};
        vv.draw.circle(legencyG, circleHighRiskLegendConfig);
        var textHighRiskLegendConfig = {x: 10, y: 43, styleClass: 'legend', content: '风险评级：高'};
        vv.draw.text(legencyG, textHighRiskLegendConfig);

        var circleNormalRiskLegendConfig = { r: 5, cx: 0, cy: 60, styleClass: 'normalRisk'};
        vv.draw.circle(legencyG, circleNormalRiskLegendConfig);
        var textNormalRiskLegendConfig = {x: 10, y: 63, styleClass: 'legend', content: '风险评级：中'};
        vv.draw.text(legencyG, textNormalRiskLegendConfig);

        var circleLowRiskLegendConfig = { r: 5, cx: 0, cy: 80, styleClass: 'lowRisk'};
        vv.draw.circle(legencyG, circleLowRiskLegendConfig);
        var textLowRiskLegendConfig = {x: 10, y: 83, styleClass: 'legend', content: '风险评级：低'};
        vv.draw.text(legencyG, textLowRiskLegendConfig);

        var lineInvestLegendConfig = {x1: -4, y1: 100, x2: 30, y2: 100, styleClass: 'investLegend'};
        vv.draw.line(legencyG, lineInvestLegendConfig);
        var textInvestLegendConfig = {x: 40, y: 103, styleClass: 'legend', content: '投资关系'};
        vv.draw.text(legencyG, textInvestLegendConfig);

        var lineOwnerLegendConfig = {x1: -4, y1: 120, x2: 30, y2: 120, styleClass: 'ownerLegend'};
        vv.draw.line(legencyG, lineOwnerLegendConfig);
        var textOwnerLegendConfig = {x: 40, y: 123, styleClass: 'legend', content: '法人关系'};
        vv.draw.text(legencyG, textOwnerLegendConfig);

        var lineJobLegendConfig = {x1: -4, y1: 140, x2: 30, y2: 140, styleClass: 'jobLegend'};
        vv.draw.line(legencyG, lineJobLegendConfig);
        var textJobLegendConfig = {x: 40, y: 143, styleClass: 'legend', content: '任职关系'};
        vv.draw.text(legencyG, textJobLegendConfig);

        var lineRelativeLegendConfig = {x1: -4, y1: 160, x2: 30, y2: 160, styleClass: 'relativeLegend'};
        vv.draw.line(legencyG, lineRelativeLegendConfig);
        var textRelativeLegendConfig = {x: 40, y: 163, styleClass: 'legend', content: '亲属关系'};
        vv.draw.text(legencyG, textRelativeLegendConfig);

        return legencyG;
    }
    //end legency generator =======================

});
