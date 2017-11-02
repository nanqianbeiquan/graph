import vv from './vv'

export default {
    renderForceGraph(forceData, data, svg, graphConfig, mouseTooltip) {
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
            .friction(0.8);

        var drag = force.drag()
            .on("dragstart",function(d,i){
                d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
                // 阻止节点拖动动作冒泡为整个svg拖动
                d3.event.sourceEvent.stopPropagation();
            })
            .on("dragend",function(d,i){

            })
            .on("drag",function(d,i){

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

        force.on('end', function() {

        });

        force.on('start', function() {

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
}
