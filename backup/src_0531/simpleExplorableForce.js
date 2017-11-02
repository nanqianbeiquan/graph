import vv from './vv'

export default {
    render(forceData, dataSelected, svg, graphConfig) {
        var width = graphConfig.svgWidth;
        var height = graphConfig.svgHeight;

        var dataSelectedIndexed = vv.data.addIndexOfForceData(dataSelected);

        // var nodes = dataSelectedIndexed.nodes;
        // var edges = dataSelectedIndexed.links;
        // 动画计数器
        var tickCounter = 0;
        // 更新图表提示器
        var isUpdateForce = false;
        // 是否有可下探节点
        var isExplorable = false;

        var force = d3.layout.force()
            .size([width, height])
            .nodes(dataSelectedIndexed.nodes)
            .links(dataSelectedIndexed.links)
            .linkDistance(80)
            .charge(-300)  //相互之间的作用力
            .gravity(0.3)
            .on("tick", tick);

        var drag = force.drag()
            .on("dragstart",function(d,i){
                d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
                // 阻止节点拖动动作冒泡为整个svg拖动
                // d3.event.sourceEvent.stopPropagation();
            })
            .on("dragend",function(d,i){

            })
            .on("drag",function(d,i){

            });

        var explorableMark = svg.append("circle")
            .attr('id', 'explorableMark')
            .attr('r', 20)
            .attr('cx', 0)
            .attr('cy', 0)
            .style('fill-opacity', 0);

        var nodesData = force.nodes();
        var linksData = force.links();

        var linksG = svg.append('g').attr('id', 'linksG');
        var linksArray = linksG.selectAll(".link")
                .data(dataSelectedIndexed.links)
                .enter()
                .append("line")
                .classed('link', true)
                // .attr("class", "link");

        var labelsG = svg.append('g').attr('id', 'labelsG');
        var labelsArray = labelsG.selectAll(".label")
                .data(dataSelectedIndexed.nodes)
                .enter()
                .append("text")
                .attr("class", "label")
                .attr('dx', -5)
                .attr('dy', -12)
                .text(function(d) {
                    return d.id;
                });

        var nodesG = svg.append('g').attr('id', 'nodesG');
        var nodesArray = nodesG.selectAll(".nodeCircle")
                .data(dataSelectedIndexed.nodes)
                .enter()
                .append("circle")
                .attr("class", "node")
                .classed('nodeCircle', true)
                .classed('rootNode', true)
                .attr("r", 10)
                .style('fill', 'teal')
                .on('mouseover', function(d) {
                    displayExplorableMark(d);
                })
                .on('mouseout', function() {
                    hideExplorableMark();
                })
                .on('dblclick', function(d) {
                    hideExplorableMark();
                    d.fixed = true;
                    fetchData(d);
                    updateForce();
                })
                .call(force.drag);

        force.start();

        function resetIsUpdateForce() {
            isUpdateForce = false;
        }

        function enableIsUpdateForce() {
            isUpdateForce = true;
        }
        // tick计数器重置
        function resetTickCounter() {
            tickCounter = 0;
        }

        function checkForceAniman() {
            tickCounter++;
            if (tickCounter > 70) {
                force.stop();
            }
        }

        function tick() {
            linksArray.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            labelsArray.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });

            nodesArray.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            // 设定时间停止force图，缩短force晃动时间
            checkForceAniman();
        }

        //start updateForce ====================
        function updateForce() {
            // 检查是否需要更新视图
            if (isUpdateForce) {
                linksData = dataSelectedIndexed.links;
                nodesData = dataSelectedIndexed.nodes;

                // 绑定新增数据
                force.nodes(nodesData).links(linksData);

                linksArray = linksArray.data(linksData);
                linksArray.enter()
                    .insert("line")
                    // .insert("line", ".node")
                    .attr("class", "link");

                labelsArray = labelsArray.data(nodesData);
                labelsArray.enter()
                    .append("text")
                    .attr("class", "label")
                    .attr('dx', -5)
                    .attr('dy', -12)
                    .text(function(d) {
                        return d.id;
                    });

                nodesArray = nodesArray.data(nodesData);
                nodesArray.enter()
                    .insert("circle")
                    .attr("class", "node")
                    .classed('nodeCircle', true)
                    .attr("r", 10)
                    .style('fill', 'teal')
                    .on('mouseover', function(d) {
                        displayExplorableMark(d);
                    })
                    .on('mouseout', function() {
                        hideExplorableMark();
                    })
                    .on('dblclick', function(d) {
                        // d.fixed = true;
                        // resetTickCounter();
                        hideExplorableMark();
                        fetchData(d);
                        updateForce();
                    })
                    .call(force.drag);

                force.start();

                // 更新图表后，重置更新视图标记
                resetIsUpdateForce();
                // 重置force动画计数器
                resetTickCounter();
            } else {
                // 不需要更新
                return;
            }
        }
        //start updateForce ====================

        // 检测节点是否可以展开
        function checkExplorable(d) {
            var linksFilted = forceData.links.filter(function(l) {
                return l.source == d.id || l.target == d.id;
            });

            linksFilted.forEach(function(l) {
                // 压入links到新数据对象
                if (!dataSelected.linksIdSet.has(l.id)) {
                    // 如果出现没有收录的关系，激活更新图表标记
                    return isExplorable = true;
                } else {
                    return isExplorable = false;
                }
            });
        }

        function displayExplorableMark(d) {
            // 检测节点是否可以展开
            checkExplorable(d);

            if (isExplorable) {
                // console.log('explorable node!');
                // var point = d3.mouse();
                // console.log(d3.event.pageX, d3.event.pageY);
                explorableMark
                    .style('fill-opacity', 0.5)
                    .attr('transform', 'translate(' + d.x + ',' + (d.y) + ')');
            }
        }

        function hideExplorableMark() {
            explorableMark
                .style('fill-opacity', 0)
                .attr('transform', 'translate(0,0)');
        }

        //start  fetchData(d) =================
        function fetchData(d) {
            var linksFilted = forceData.links.filter(function(l) {
                return l.source == d.id || l.target == d.id;
            });
            // console.log(linksFilted);

            linksFilted.forEach(function(l) {
                // 压入links到新数据对象
                if (!dataSelected.linksIdSet.has(l.id)) {
                    // 如果出现没有收录的关系，激活更新图表标记
                    enableIsUpdateForce();

                    dataSelected.linksIdSet.add(l.id);
                    dataSelected.links.push(l);
                }
                // 压入links两端的nodes到新数据对象
                if (!dataSelected.nodesIdSet.has(l.source)) {
                    dataSelected.nodesIdSet.add(l.source);

                    var sourceNodeFiltedArray = forceData.nodes.filter(function(n) {
                        return n.id == l.source;
                    });
                    // console.log(sourceNodeFiltedArray[0]);
                    dataSelected.nodes.push(sourceNodeFiltedArray[0]);
                }

                if (!dataSelected.nodesIdSet.has(l.target)) {
                    dataSelected.nodesIdSet.add(l.target)

                    var targetNodeFiltedArray = forceData.nodes.filter(function(n) {
                        return n.id == l.target;
                    });
                    // console.log(targetNodeFiltedArray[0]);
                    dataSelected.nodes.push(targetNodeFiltedArray[0]);
                }
            });

            //问题在这里，返回了一个顺序的对象数组，没有按压入节点对象的先后排序
            // dataSelected.nodes = data.nodes.filter(function(n) {
            //     return dataSelected.nodesNameSet.has(n.name);
            // });

            // console.log(dataSelected);
            dataSelectedIndexed = vv.data.addIndexOfForceData(dataSelected);
            // console.log(dataSelectedIndexed);
            return dataSelectedIndexed;

        }
        //end  fetchData(d) =================

    }
}
