import vv from './vv'

export default {
    // 方法一
    // 将原始数据转换为nodes/links结构 ===================================
    iniForceData: function() {
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

        // start 初始化节点数据 ###########
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
        // end 初始化节点数据 ###########

        // start 初始化边数据 ###########
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
        // end 初始化边数据 ###########
    },
    // end 将原始数据转换为nodes/links结构 ===============================

    // 方法二
    // 根据选项过滤数据 =================================================
    filterData: function(data, nodeType, relationType) {
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
    // end 根据选项过滤数据 =============================================
}
