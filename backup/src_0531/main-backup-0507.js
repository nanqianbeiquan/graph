import $ from 'jquery'
import Vue from 'vue'
import d3 from 'd3'
// import _ from 'lodash'
import saveSvgAsPng from 'save-svg-as-png'
import d3_save_svg from 'd3-save-svg'
import Navbtp from './Navbtp.vue'
import Hints from './Hints.vue'
import Datafilter from './Datafilter.vue'
import Risktable from './Risktable.vue'
import Riskanalyse from './Riskanalyse.vue'
// import Containerbtp from './Containerbtp.vue'
import Nodeinfo from './Nodeinfo.vue'
import Modalinfo from './Modalinfo.vue'
import Modalsvg from './Modalsvg.vue'
import vv from './vv'
// import forceRender from './forceRender'
// import dataParser from './dataParser'
// import simpleExplorableForce from './simpleExplorableForce'
require("bootstrap-webpack");
require("./dashboard.css");
// require("./style.css"); //原白色主题
require("./style-black.css");

//***************************************************************************
//start 测试区
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// $.post("getCompanyInfo",
//     {
//         // compName: "北京华夏汇海科技有限公司"
//         compName: '中央汇金投资有限责任公司'
//     },
//     function(data,status){
//         console.log(data);
//         console.log(status);
//         // var leaglInfo = data['案件信息'];
//
//     },
//     "json"
// );

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 测试区
//***************************************************************************

//***************************************************************************
//start 载入初始化
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// 移除载入动画
d3.select('#loader').remove();
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 载入初始化
//***************************************************************************

//***************************************************************************
//start 调试设置
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$("body").css("background-color","white"); //测试是否支持jquery，支持
Vue.config.debug = true;
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 调试设置
//***************************************************************************

//***************************************************************************
//start 设置全局变量
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//start 筛选数据存储器定义 =============================
// 存储筛选功能需要的数据
var dataStore = createDataStore('dataStore');

// 存放数据快照的堆栈，用于撤销(数据初始化、数据增加、数据删除时候记录快照)
var dataStoreStack = [];
//end 筛选数据存储器定义 ===============================

// 公司节点全名标签的透明度，控制新载入节点
var showFullNodesLables = 0;

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 设置全局变量
//***************************************************************************

//***************************************************************************
//start 设置mvvm参数
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// start model data configuration ==============
// 节点类型，用于筛选
// var initialNodesTypes = ['All', 'Company', 'Person']; //屏蔽亲属需求更改0328
var initialNodesTypes = ['All', 'Company'];
// 关系类型，用于筛选
// var initialRelationsTypes = ["投资", "法定代表人", "任职", "直系亲属"]; //屏蔽亲属需求更改0328
var initialRelationsTypes = ["投资", "法定代表人", "任职"];
//菜单选项键值对应表
var menuKeyNameList = {
    All: '全部节点',
    Company: '公司节点',
    // Person: '个人节点', //屏蔽亲属需求更改0328
    "投资": "投资",
    "法定代表人": "法人",
    "任职": "任职",
    "直系亲属": "亲属"
}

//节点与关系筛选对应表
var nodeRelationFilterScale = d3.scale.ordinal()
    // .domain(['All', 'Company', 'Person']) //屏蔽亲属需求更改0328
    // .range([["投资", "法定代表人", "任职", "直系亲属"], ["投资", "法定代表人"], ["直系亲属"]]);
    .domain(['All', 'Company'])
    .range([["投资", "法定代表人", "任职"], ["投资", "法定代表人"]]);

//图形渲染参数（暂时没用到）
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
// end model data configuration ==========

//start model of mvvm ================================
// 定义模型
var model = {};

// model数据定义
model.data = {
    flag: 'flag here!',
    // forceData: forceData, //原始力图节点-边数据，未indexed
    menuKeyNameList: menuKeyNameList, //菜单选项键值对应表
    // forceData.linksTypeSet.values() //["投资", "法定代表人", "任职", "直系亲属"]
    initialRelationsTypes: initialRelationsTypes, //直接设定，不从每条边关系检测
    initialNodesTypes: initialNodesTypes,
    searchForm: {
        searchMode:'single', //搜索模式
        searchDimension: '1', //搜索维度
        firstSearchBox: '',
        secondSearchBox: ''
    },
    selectedStatus: { //选中的关系类型
        // selectedLinksTypeList: ["投资", "法定代表人", "任职", "直系亲属"], //屏蔽亲属需求更改0328
        selectedLinksTypeList: ["投资", "法定代表人", "任职"],
        selectedNodesType: 'All',
        selectedLinksTypes: [
            {fullType: "投资", shortType: "投资"},
            {fullType: "法定代表人", shortType: "法人"},
            {fullType: "任职", shortType: "任职"}
            // {fullType: "直系亲属", shortType: "亲属"} //屏蔽亲属需求更改0328
        ]
    },
    graphConfig: graphConfig,
    riskInfo: '', //风险提示框
    nodeInfo: {
        basicInfo: {
            "公司名称": "",
            "成立时间": "",
            "登记状态": "",
            "注册资本": "",
            "注册号": "",
            "风险指数": "",
            "风险评级": ""
        },
        leaglInfo: '', //司法摘要信息
        suitDetail: '', //司法详情
        testPara: "测试\<br\>中文\<br\>\<br\>换行\<br\>\<br\>\<br\>\<br\>要替换字符"
    },
    // disableExportSvg: true, //禁用svg输出按钮，当没有svg/force在动；停下可以截图
    optionsConfig: { //检测是否选中显示全名按钮
        optionsHandler: []
    }
};
// model方法定义
model.methods = {
    updateForceConfig: updateForceConfig,
    // updateGraph: updateGraph, //只筛选边的关系，更新图表
    nodeRelationFilterScale: nodeRelationFilterScale, //
    updateFiltedGraph: updateFiltedGraph, //筛选节点、边的关系，更新图表
    renderGraphBySearch: renderGraphBySearch, //点击搜索按钮，渲染图形
    renderGraphByFilter: renderGraphByFilter, //新的筛选功能函数
    renderGraphByRedo: renderGraphByRedo, //撤销操作，重新绘图
    getNodeInfo: getNodeInfo, //点击获取公司详情，显示到侧边栏
    shotScreen: shotScreen, //导出svg图片
    fetchLegalDetail: fetchLegalDetail, //获取司法详情
    toggleDisplayCompanyName: toggleDisplayCompanyName, //显示或隐藏公司节点的全名称字符串
    exportPngGraph: exportPngGraph, //输出png格式
    exportSvgGraph: exportSvgGraph //输出svg格式
};
// model计算属性定义
model.computed = {
    // 暂时测试屏蔽
    // 计算选中的节点类型
    getLinksTypeCheckboxesKeys: function() {
        this.selectedLinksTypeList = this.nodeRelationFilterScale(this.selectedStatus.selectedNodesType);

        return this.selectedLinksTypeList;
    },
    // 检测是否关联公司搜索模式
    isMultiSearchMode: function() {
        if (this.searchForm.searchMode == 'multi') {
            return true;
            // multiBoxVisible = true;
        } else {
            // multiBoxVisible = false;
            return false;
        }
    },
    // 检测是否单公司搜索模式
    isSingleSearchMode: function() {
        if (this.searchForm.searchMode == 'single') {
            return false;
            // multiBoxVisible = true;
        } else {
            // multiBoxVisible = false;
            return true;
        }
    },
    // 根据搜索模式改变搜索框占位符
    searchBoxPlaceholder: function() {
        if (this.searchForm.searchMode == 'batch') {
            return '用英文半角逗号分隔';
            // multiBoxVisible = true;
        } else {
            // multiBoxVisible = false;
            return '请输入公司全名';
        }
    }
};
// model事件定义
model.events = {
    'updateGraphWithFiltedData': 'renderGraphByFilter',  //点击筛选按钮
    'renderGraphBySearchData': 'renderGraphBySearch',  //点击搜索框搜索按钮
    'shotScreenCalled': 'shotScreen', //导出svg图片
    'clickedSuitTitle': 'fetchLegalDetail', //点击侧边栏司法信息面板的诉讼条目后，拉取判决信息
    'changeDisplayCompanyName': 'toggleDisplayCompanyName', //显示或隐藏公司节点的全名称字符串
    'exportPngCalled': 'exportPngGraph', //输出png格式图片
    'exportSvgGraphCalled': 'exportSvgGraph',  //输出svg格式图片
    'renderGraphByRedoCalled': 'renderGraphByRedo'
};
//end model of mvvm ================================

//start 过滤器 ==================================
// 将司法信息中案件标题过滤为14个字
Vue.filter('summaryLegalTitle', function (title) {
    var summaryTitle = title.substr(0, 9) + '...';
    return summaryTitle;
});

// 实现文本换行
Vue.filter('createParagraphSymbol', function (content) {
    var contentArray = content.split('<br>');
    var processedContent = '';

    contentArray.forEach(function(str) {
        if(!str) {
            processedContent += str;
            processedContent += '\n';
        }
    });

    return processedContent;
});
//start 过滤器 ==================================

//start vm of mvvm ==================================
var vm = new Vue({
    el: 'body',
    components: {
        Navbtp, //导航栏
        Hints, //用户提示框
        Datafilter, //筛选面板
        Risktable, //风险提示面板
        Riskanalyse, //风险分析面板
        // Containerbtp, //容器，没有用到
        Nodeinfo, //公司节点信息面板，包括工商登记、司法信息
        Modalinfo, //司法详情模态框
        Modalsvg  //svg图片输出模态框
    },
    data: model.data,
    methods: model.methods,
    computed: model.computed,
    events: model.events,
    // ready: loadGraph
    // ready: simpleExplor
});
//end vm of mvvm ======================================
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 设置mvvm参数
//***************************************************************************

//***************************************************************************
//start 工具函数
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//start 设定为true函数 ================================
function setParaTrue(para) {
    para = true;
    return para;
}
//end 设定为true函数 ================================

//start 设定为false函数 ================================
function setParaFalse(para) {
    para = false;
    return para;
}
//end 设定为false函数 ================================
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 工具函数
//***************************************************************************

//***************************************************************************
//start 数据处理函数
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//start 数据存储器定义 ================================
function createDataStore(store) {
    // 存储力图结构数据
    var store = {};

    // properties ---------------------------------
    // 节点名字堆、关系id堆
    store.nodesIdSet = d3.set();
    store.linksIdSet = d3.set();
    // 初始节点和关系
    store.nodes = [];
    store.links = [];
    // 存储搜索的中心目标节点
    store.searchTargetNode = d3.set();
    //  设置存储画布的缩放和偏移位置
    store.scaleTransformRecord = {};
    store.scaleTransformRecord.offsetX = 0; //初始化偏移
    store.scaleTransformRecord.offsetY = 0; //初始化偏移
    store.scaleTransformRecord.zoomScale = 1; //初始化缩放
    store.scaleTransformRecord.scaleRatio = 1; //初始化相对缩放比例

    //methonds -----------------------------------
    // 清空重置节点数据方法，通过每次搜索触发
    store.reset = resetDataStore;
    // 增加数据方法，每次搜索、探索节点触发
    store.addData = addDataStore;
    // 删除数据方法，右击节点选择菜单触发
    store.removeData = removeDataStore;
    //  设置存储搜索的中心目标节点
    store.setSearchTargetNode = setSearchTargetNode;
    // 记录偏移量
    store.setTransformOffset = setTransformOffset;
    // 记录缩放比例
    store.setZoomScale = setZoomScale;
    // 记录相对缩放比例
    store.setScaleRatio = setScaleRatio;

    return store;

    // 清空重置节点数据方法，通过每次搜索触发
    function resetDataStore() {
        // 节点名字堆、关系id堆
        this.nodesIdSet = d3.set();
        this.linksIdSet = d3.set();
        // 初始节点和关系
        this.nodes = [];
        this.links = [];
    }
    // 增加数据方法，每次搜索、探索节点触发
    function addDataStore(newForceData) {
        // 闭包传不了外部this，要重新命名传入
        var thisDataStore = this; //avoid clousure problem for 'this'
        // 载入节点数据
        newForceData.nodes.forEach(function(n) {
            thisDataStore.nodes.push(n);
        });
        // 载入关系数据
        newForceData.links.forEach(function(l) {
            thisDataStore.links.push(l);
        });

        // console.log('info from dataStore addDataStore method:');
        // console.log(this);
    }
    // 删除数据方法，右击节点选择菜单触发
    function removeDataStore(idArray) {
        if(idArray.length == 0) {
            return;
        }

        // 闭包传不了外部this，要重新命名传入
        var thisDataStore = this; //avoid clousure problem for 'this'
        // console.log('未删除数据之前的datastore');
        // console.log(thisDataStore);
        // console.log('links id set: ' + thisDataStore.linksIdSet.values());

        // 先删除不需要的节点id
        idArray.forEach(function(removeId) {
            thisDataStore.nodesIdSet.remove(removeId);
        });
        // 根据留存的节点id过滤出剩下的节点
        var newNodeArray = thisDataStore.nodes.filter(function(node) {
            return thisDataStore.nodesIdSet.has(node.id);
        });
        // 重新定义节点数组
        thisDataStore.nodes = newNodeArray;

        //根据节点筛选边
        var newLinkArray = thisDataStore.links.filter(function(link) {
            return thisDataStore.nodesIdSet.has(link.startNode) && thisDataStore.nodesIdSet.has(link.endNode);
        });

        // 需要从linksIdSet删除已经不存在的边 @@@@@@@@@@@@@@@@@@@@@
        var newLinksIdSet = d3.set();
        newLinkArray.forEach(function(l) {
            if (!newLinksIdSet.has(l.id)) {
                newLinksIdSet.add(l.id);
            }
        });
        // 重新定义LinksIdSet
        thisDataStore.linksIdSet = newLinksIdSet;

        // 重新定义节点数组
        thisDataStore.links = newLinkArray;

        // console.log('删除数据之后的datastore');
        // console.log(thisDataStore);
        // console.log('links id set: ' + thisDataStore.linksIdSet.values());
    }
    //  设置存储搜索的中心目标节点
    function setSearchTargetNode(targetNode) {
        if(targetNode) {
            // this.searchTargetNode = targetNode;
            this.searchTargetNode.add(targetNode);
        }
    }
    // 记录偏移量
    function setTransformOffset(offsetX, offsetY) {
        if (offsetX != 0 || offsetY != 0) {
            this.scaleTransformRecord.offsetX = offsetX;
            this.scaleTransformRecord.offsetY = offsetY;
        }
    }
    // 记录缩放比例
    function setZoomScale(zoomScale) {
        if (zoomScale != 1) {
            this.scaleTransformRecord.zoomScale = zoomScale;
        }
    }

    // 记录相对缩放比例
    function setScaleRatio(zoomScaleRatio) {
        if (zoomScaleRatio) {
            this.scaleTransformRecord.zoomScaleRatio = zoomScaleRatio;
        }
    }
}
//end 数据存储器定义 =============================

// start 堆栈操作datastore ======================
function setDataStoreStack(dataStoreStack, dataStore) {
    var tmpDataStore = {};
    // var tmpDataStore = createDataStore('tmpDataStore');

    // for(var key in dataStore) {
    //     tmpDataStore[key] = dataStore[key];
    // }
    // 节点名字堆、关系id堆
    // tmpDataStore.nodesIdSet = dataStore.nodesIdSet;
    // tmpDataStore.linksIdSet = dataStore.linksIdSet;
    tmpDataStore.nodesIdSet = d3.set();
    var nodesIdSetArray = dataStore.nodesIdSet.values();
    nodesIdSetArray.forEach(function(nodeId) {
        tmpDataStore.nodesIdSet.add(nodeId);
    });

    tmpDataStore.linksIdSet = d3.set();
    var linksIdSetArray = dataStore.linksIdSet.values();
    linksIdSetArray.forEach(function(nodeId) {
        tmpDataStore.linksIdSet.add(nodeId);
    });
    // 初始节点和关系
    tmpDataStore.nodes = [];
    dataStore.nodes.forEach(function(n) {
        tmpDataStore.nodes.push(n);
    });

    tmpDataStore.links = [];
    dataStore.links.forEach(function(n) {
        tmpDataStore.links.push(n);
    });
    // 存储搜索的中心目标节点
    tmpDataStore.searchTargetNode = dataStore.searchTargetNode;
    //  设置存储画布的缩放和偏移位置
    var scaleTransformRecord = dataStore.scaleTransformRecord;
    tmpDataStore.scaleTransformRecord = scaleTransformRecord;
    var offsetX = dataStore.scaleTransformRecord.offsetX;
    tmpDataStore.scaleTransformRecord.offsetX = offsetX; //初始化偏移
    var offsetY = dataStore.scaleTransformRecord.offsetY;
    tmpDataStore.scaleTransformRecord.offsetY = offsetY; //初始化偏移
    var zoomScale = dataStore.scaleTransformRecord.zoomScale;
    tmpDataStore.scaleTransformRecord.zoomScale = zoomScale; //初始化缩放
    var scaleRatio = dataStore.scaleTransformRecord.scaleRatio;
    tmpDataStore.scaleTransformRecord.scaleRatio = scaleRatio; //初始化相对缩放比例

    // 方法保留------------------
    //methonds -----------------------------------
    // 清空重置节点数据方法，通过每次搜索触发
    tmpDataStore.reset = dataStore.reset;
    // 增加数据方法，每次搜索、探索节点触发
    tmpDataStore.addData = dataStore.addData;
    // 删除数据方法，右击节点选择菜单触发
    tmpDataStore.removeData = dataStore.removeData;
    //  设置存储搜索的中心目标节点
    tmpDataStore.setSearchTargetNode = dataStore.setSearchTargetNode;
    // 记录偏移量
    tmpDataStore.setTransformOffset = dataStore.setTransformOffset;
    // 记录缩放比例
    tmpDataStore.setZoomScale = dataStore.setZoomScale;
    // 记录相对缩放比例
    tmpDataStore.setScaleRatio = dataStore.setScaleRatio;

    dataStoreStack.push(tmpDataStore);
}
// end 堆栈操作datastore ======================

//start 原始数据转换为节点－边形式 =================
function iniForceData(rawData) {
    var forceData = {};
    forceData.links = [];
    forceData.nodes = [];

    forceData.nodesIdSet = d3.set();
    forceData.linksIdSet = d3.set();
    // 建立id和节点对应表
    forceData.idNodesDict = {};

    rawData.forEach(function(item) {
        // 节点原始数据组
        var rawNodesArray = item.graph.nodes;
        // console.log(rawNodesArray);
        // 将没出现过的节点压入绘图容器
        rawNodesArray.forEach(function(rawNode) {
            // console.log(rawNode.id);
            if (!forceData.nodesIdSet.has(rawNode.id)) {
                // 加入节点
                forceData.nodesIdSet.add(rawNode.id);
                forceData.nodes.push(rawNode);
                // 加入节点id对应堆
                forceData.idNodesDict[rawNode.id] = rawNode;
            }
        });
        // 将没出现过的边压入绘图容器
        var rawRelationshipsArray = item.graph.relationships;
        // console.log(rawRelationshipsArray);
        if (rawRelationshipsArray.length) {
            rawRelationshipsArray.forEach(function(rawLink) {
                // console.log(rawLink.id);
                if (!forceData.linksIdSet.has(rawLink.id)) {
                    forceData.linksIdSet.add(rawLink.id);
                    forceData.links.push(rawLink);
                }
            });
        } else {
            // console.log('isolate nodes without links');
        }

    });
    // console.log(forceData);
    return forceData;
}
//end 原始数据转换为节点－边形式 ===================

//start 为节点－边数据添加力图索引 =================
function addIndex(data) {
    // 临时返回数据存放对象
    var dataIndexed = {};
    dataIndexed.nodesIdSet = data.nodesIdSet;
    dataIndexed.linksIdSet = data.linksIdSet;

    var nodesArray = []; //存放node的id，用于检索links两头的位置
    var inputDataNodes = data.nodes; //nodesData
    var inputDataLinks = data.links; //linksData
    var linkIndexed;

    // 为了解决节点之间有重叠关系线@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //存储重叠关系查询表
    createLinksArcTable(data, dataIndexed);

    // // 将风险数据传回模型挂载点
    // vm.$data.riskInfo = dataIndexed.riskInfo;
    vm.$data.riskInfo = getNodeRiskInfo(dataIndexed, data);
    // console.log(dataIndexed.riskInfo);
    // end 风险信息收集 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    //存放node的id，用于检索links两头的位置
    for(var keys in inputDataNodes) {
        nodesArray.push(inputDataNodes[keys].id);
    }
    // 查找边两端节点位置，创建索引
    linkIndexed = inputDataLinks.map(function(link) {
        var sourceNode = link.startNode;
        var targetNode = link.endNode;

        var sourceIndex = nodesArray.indexOf(sourceNode);
        var targetIndex = nodesArray.indexOf(targetNode);

        // 为了解决节点之间有重叠关系线@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // 添加节点关系唯一标识符
        var linkUniqId = createUniqRelationId(link);

        return {source: sourceIndex, target: targetIndex, id: link.id, linkUniqId:linkUniqId, type: link.type, properties: link.properties};
    });

    dataIndexed.nodes = inputDataNodes;
    dataIndexed.links = linkIndexed;

    // console.log(dataIndexed);
    return dataIndexed;
}
//end 为节点－边数据添加力图索引  ================

//start 节点信息处理，注册资本、成立时间 ===========
function getNodeRiskInfo(dataIndexed, data) {
    // start 风险信息收集 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // 原风险预警面板数据收集
    dataIndexed.riskInfo = {}; //风险企业信息
    dataIndexed.riskInfo.highRisk = [];
    dataIndexed.riskInfo.normalRisk = [];
    dataIndexed.riskInfo.lowRisk = [];
    // 现风险分析面板数据收集
    dataIndexed.riskInfo.analyse = {}; //分析总挂载点
    dataIndexed.riskInfo.analyse.associateCompanyNumber = 0; //关联企业总数初始化0
    dataIndexed.riskInfo.analyse.averageCapital = 0; //平均注册资本初始化0
    dataIndexed.riskInfo.analyse.capitalLessOneMillion = 0; //注册资本100万及以下
    dataIndexed.riskInfo.analyse.capitalOneToFiveMillion = 0; //注册资本100-500万
    dataIndexed.riskInfo.analyse.capitalFiveToTenMillion = 0; //注册资本500-1000万
    dataIndexed.riskInfo.analyse.capitalTenToHunderdMillion = 0; //注册资本1000-10000万
    dataIndexed.riskInfo.analyse.capitalMoreThanHunderdMillion = 0; //注册资本>10000万
    dataIndexed.riskInfo.analyse.averageYear = 0; //平均成立年限初始化0
    dataIndexed.riskInfo.analyse.underOneYear = 0; //<1年
    dataIndexed.riskInfo.analyse.oneToThreeYear = 0; //1~3年
    dataIndexed.riskInfo.analyse.threeToFiveYear = 0; //3~5年
    dataIndexed.riskInfo.analyse.fiveToEightYear = 0; //5~8年
    dataIndexed.riskInfo.analyse.moreThanEightYear = 0; //>8年
    dataIndexed.riskInfo.analyse.highRisk = 0; //高风险企业数量
    dataIndexed.riskInfo.analyse.normalRisk = 0; //中风险企业数量
    dataIndexed.riskInfo.analyse.lowRisk = 0; //低风险企业数量
    dataIndexed.riskInfo.analyse.safe = 0; //安全企业数量

    // 临时数据存放变量
    var associateCompanyNumber = 0; //公司总量计数器@@@@@@@@@@@@@@@@@@@@@@@@@@@

    var totalCompanyCapital = 0; //所有公司注册资本合计
    var capitalLessOneMillion = 0; //注册资本100万及以下
    var capitalOneToFiveMillion = 0; //注册资本100-500万
    var capitalFiveToTenMillion = 0; //注册资本500-1000万
    var capitalTenToHunderdMillion = 0; //注册资本1000-10000万
    var capitalMoreThanHunderdMillion = 0; //注册资本>10000万

    var averageYear = 0; //平均成立年限初始化0
    var underOneYear = 0; //<1年
    var oneToThreeYear = 0; //1~3年
    var threeToFiveYear = 0; //3~5年
    var fiveToEightYear = 0; //5~8年
    var moreThanEightYear = 0; //>8年

    // 抽取公司节点信息
    data.nodes.forEach(function(d) {
        // console.log(d);
        if (d.labels[0] == "Company") {

            associateCompanyNumber++; //公司数量计数 @@@@@@@@@@@@@@@@@@@@@@@@@@
            // 注册资本分类信息
            if (d.properties['注册资本']) {
                var singleCompanyCapital = +d.properties['注册资本']; //字符串转数字
                totalCompanyCapital += singleCompanyCapital; //累加注册资本

                if (singleCompanyCapital < 1000000) {
                    capitalLessOneMillion++;
                } else if (singleCompanyCapital >= 1000000 && singleCompanyCapital < 5000000) {
                    capitalOneToFiveMillion++;
                } else if (singleCompanyCapital >= 5000000 && singleCompanyCapital < 10000000) {
                    capitalFiveToTenMillion++;
                } else if (singleCompanyCapital >= 10000000 && singleCompanyCapital < 100000000) {
                    capitalTenToHunderdMillion++;
                } else if (singleCompanyCapital >= 100000000) {
                    capitalMoreThanHunderdMillion++;
                }
            }
            // 风险评级分类
            if (d.properties.hasOwnProperty('风险评级')) {
                // console.log(d);
                if (d.properties['风险评级']=='高风险') {
                    console.log(d);
                    dataIndexed.riskInfo.highRisk.push(d);
                } else if (d.properties['风险评级']=='中风险') {
                    console.log(d);
                    dataIndexed.riskInfo.normalRisk.push(d);
                } else if (d.properties['风险评级']=='低风险') {
                    // console.log(d);
                    dataIndexed.riskInfo.lowRisk.push(d);
                }
            }

            // 成立时间分类
            if (d.properties['成立时间']) {
                var establishedYears = getCompanyEstablishedYears(d.properties['成立时间']);
                // 计算所有公司成立年数加总
                averageYear += establishedYears;

                if (establishedYears > 8) {
                    moreThanEightYear++;
                } else if (establishedYears <= 8 && establishedYears > 5) {
                    fiveToEightYear++;
                } else if (establishedYears <= 5 && establishedYears > 3) {
                    threeToFiveYear++;
                } else if (establishedYears <= 3 && establishedYears > 1) {
                    oneToThreeYear++;
                } else if (establishedYears <= 1) {
                    underOneYear++;
                }
            }

        }
    });

    //公司总量
    dataIndexed.riskInfo.analyse.associateCompanyNumber = associateCompanyNumber;
    //平均注册资本
    dataIndexed.riskInfo.analyse.averageCapital = Math.floor((totalCompanyCapital/associateCompanyNumber)/10000);
    // 注册资本分类计数
    dataIndexed.riskInfo.analyse.capitalLessOneMillion = capitalLessOneMillion; //注册资本100万及以下
    dataIndexed.riskInfo.analyse.capitalOneToFiveMillion = capitalOneToFiveMillion; //注册资本100-500万
    dataIndexed.riskInfo.analyse.capitalFiveToTenMillion = capitalFiveToTenMillion; //注册资本500-1000万
    dataIndexed.riskInfo.analyse.capitalTenToHunderdMillion = capitalTenToHunderdMillion; //注册资本1000-10000万
    dataIndexed.riskInfo.analyse.capitalMoreThanHunderdMillion = capitalMoreThanHunderdMillion; //注册资本>10000万

    dataIndexed.riskInfo.analyse.averageYear = (averageYear / associateCompanyNumber).toFixed(1); //平均成立年限初始化0
    dataIndexed.riskInfo.analyse.underOneYear = underOneYear; //<1年
    dataIndexed.riskInfo.analyse.oneToThreeYear = oneToThreeYear; //1~3年
    dataIndexed.riskInfo.analyse.threeToFiveYear = threeToFiveYear; //3~5年
    dataIndexed.riskInfo.analyse.fiveToEightYear = fiveToEightYear; //5~8年
    dataIndexed.riskInfo.analyse.moreThanEightYear = moreThanEightYear; //>8年

    //高风险企业数量
    dataIndexed.riskInfo.analyse.highRisk = dataIndexed.riskInfo.highRisk.length;
    //中风险企业数量
    dataIndexed.riskInfo.analyse.normalRisk = dataIndexed.riskInfo.normalRisk.length;
    //低风险企业数量
    dataIndexed.riskInfo.analyse.lowRisk = dataIndexed.riskInfo.lowRisk.length;
    //安全企业数量
    dataIndexed.riskInfo.analyse.safe = dataIndexed.riskInfo.analyse.associateCompanyNumber - dataIndexed.riskInfo.analyse.highRisk - dataIndexed.riskInfo.analyse.normalRisk - dataIndexed.riskInfo.analyse.lowRisk;

    return dataIndexed.riskInfo;
}
//end 节点信息处理，注册资本、成立时间 ===========

//start 过滤存储在store中的数据 ===========
function filterStoreData(data, nodeType, relationType) {
    // console.log(data);
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
                //选取两边的节点id endNode
                if (!filtedNodesIdSet.has(d.startNode)) {
                    filtedNodesIdSet.add(d.startNode);
                }
                if (!filtedNodesIdSet.has(d.endNode)) {
                    filtedNodesIdSet.add(d.endNode);
                }

                qualifyLinks = d;
                return qualifyLinks;
            }
            //end verity all node ---------

            //start verifyNodesLabel ---------
            function verifyNodesLabel(d, nodeLabel) {
                var isQualifyNode = false;
                // console.log(d);
                // console.log(idNodesDict[d.startNode]);
                if (idNodesDict[d.startNode].labels[0]==nodeLabel && idNodesDict[d.endNode].labels[0]==nodeLabel) {
                    isQualifyNode = true;
                }

                if (isQualifyNode) {
                    //选取两边的节点id
                    if (!filtedNodesIdSet.has(d.startNode)) {
                        filtedNodesIdSet.add(d.startNode);
                    }
                    if (!filtedNodesIdSet.has(d.endNode)) {
                        filtedNodesIdSet.add(d.endNode);
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
            return d;
        }
    });

    filtedData.nodes = filtedNodes;
    filtedData.links = filtedLinks;

    return filtedData;
}
//end 过滤存储在store中的数据 ===========

// start 为dataStore增加新的下探数据=====
function addExploreDataToStore(forceExploreData, dataStore) {
    // 将新下探数据压入绘图数据容器
    forceExploreData.links.forEach(function(l) {
        // 压入links到新数据对象
        if (!dataStore.linksIdSet.has(l.id)) {
            // 压入新关系数据到绘图数据容器
            dataStore.linksIdSet.add(l.id);
            dataStore.links.push(l);
        }
        // 压入links两端的nodes到新数据对象
        if (!dataStore.nodesIdSet.has(l.startNode)) {
            dataStore.nodesIdSet.add(l.startNode);

            var sourceNodeFiltedArray = forceExploreData.nodes.filter(function(n) {
                return n.id == l.startNode;
            });
            // 将节点添加到id和节点对应堆
            dataStore.idNodesDict[l.startNode] = sourceNodeFiltedArray[0];

            // console.log(sourceNodeFiltedArray[0]);
            dataStore.nodes.push(sourceNodeFiltedArray[0]);
        }
        // 压入links两端的nodes到新数据对象
        if (!dataStore.nodesIdSet.has(l.endNode)) {
            dataStore.nodesIdSet.add(l.endNode)

            var targetNodeFiltedArray = forceExploreData.nodes.filter(function(n) {
                return n.id == l.endNode;
            });

            // 将节点添加到id和节点对应堆
            dataStore.idNodesDict[l.endNode] = targetNodeFiltedArray[0];

            // console.log(targetNodeFiltedArray[0]);
            dataStore.nodes.push(targetNodeFiltedArray[0]);
        }
    });
}
// end 为dataStore增加新的下探数据=====

// 为了解决节点之间有重叠关系线
// start 存储重叠关系查询表==============================
function createLinksArcTable(data, dataIndexed) {
    // 为外部存dataIndexed添加储重叠关系查询表属性
    dataIndexed.linksArcTable = {};

    data.links.forEach(function(link) {
        var startNodeNumber = +link.startNode; //数字化开始节点的id
        var endNodeNumber = +link.endNode; //数字化结束节点的id
        var linkUniqId;// 节点之间唯一的共用关系标识符，指向一个数组，数组里存储重叠关系的各个id

        if (startNodeNumber < endNodeNumber) { //用小的id连接大的id，字符串，唯一标识符
            linkUniqId = link.startNode + link.endNode;
            // console.log(linkUniqId);
        } else {
            linkUniqId = link.endNode + link.startNode;
            // console.log(linkUniqId);
        }

        if(!dataIndexed.linksArcTable[linkUniqId]) {
            // 如果重叠关系查询表没有该关系的id，创建该id记录
            dataIndexed.linksArcTable[linkUniqId] = [];
            // 将关系id存入表的数组
            dataIndexed.linksArcTable[linkUniqId].push(link.id);
        } else {
            // 将关系id存入表的数组
            dataIndexed.linksArcTable[linkUniqId].push(link.id);
        }
    });

}
// end 存储重叠关系查询表==============================

// 为了解决节点之间有重叠关系线
// start 添加节点关系共用标识符========================
function createUniqRelationId(link) {
    var startNodeNumber = +link.startNode; //数字化开始节点的id
    var endNodeNumber = +link.endNode; //数字化结束节点的id
    var linkUniqId;// 节点之间唯一的共用关系标识符，指向一个数组，数组里存储重叠关系的各个id

    if (startNodeNumber < endNodeNumber) { //用小的id连接大的id，字符串，唯一标识符
        linkUniqId = link.startNode + link.endNode;
        // console.log(linkUniqId);
    } else {
        linkUniqId = link.endNode + link.startNode;
        // console.log(linkUniqId);
    }

    return linkUniqId;
}
// end 添加节点关系共用标识符========================

// start 计算日期间隔，以年为单位 ====================
function getCompanyEstablishedYears(establishedDate) {
    var currentDate = new Date();
    var processedEstablishedDate = new Date(establishedDate);
    var establishedYears = (currentDate - processedEstablishedDate)/(1000*60*60*24*365);

    return establishedYears;
}
// end 计算日期间隔，以年为单位 ======================
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 数据处理函数
//***************************************************************************

//***************************************************************************
//start 交互逻辑
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//start 导航栏搜索触发器 =========================
function renderGraphBySearch() {
    // 取回搜索框参数
    var searchForm = getSearchParas(this.searchForm);

    if  (searchForm.searchMode == '') {
        alert('请输入完整查询参数');
        return;
    }

    // 这里需要执行dataStore清空数据 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    dataStore.reset();

    if (searchForm.searchMode == 'single') { //单公司搜索
        if(!searchForm.firstSearchBox) {
            alert('请输入查询主体名称');
            return;
        } else {
            renderSearchData(searchForm.firstSearchBox); //单公司搜索
        }
    } else if (searchForm.searchMode == 'multi') { //关联公司搜索
        if(!searchForm.firstSearchBox || !searchForm.secondSearchBox || !searchForm.searchDimension) {
            alert('请输入完整查询参数');
            return;
        } else {
            //关联公司搜索
            renderAssociateSearchData(searchForm.firstSearchBox, searchForm.secondSearchBox, searchForm.searchDimension);
        }
    } else if (searchForm.searchMode == 'batch') { //批量公司搜索
        if(!searchForm.firstSearchBox || !searchForm.searchDimension) {
            alert('多个公司名称请用英文半角逗号(,)隔开');
            return;
        } else {
            //批量公司搜索
            renderListSearchData(searchForm.firstSearchBox, searchForm.searchDimension);
        }
    }
}

// 将searchForm参数从model中取回
function getSearchParas(searchForm) {
    return searchForm;
}
//end render Graph By Search ===================

//start 单个公司搜索 =============================
function renderSearchData(queryCompanyName) {
    // var queryCompany = "BC教育咨询（北京）有限公司";
    // 设置存储搜索的中心目标节点@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    dataStore.setSearchTargetNode(queryCompanyName);

    var queryCompany = queryCompanyName;
    // 返回数据类型必须设定为json，默认是string字符串
    var dataType = "json";

    $.post("function1ForAjax",
        {
            // compNameAjax是接口设定的参数名称
            compNameAjax: queryCompany
        },
        function(data,status){
            // results[0].data是返回json对象包含的提取数据入口
            var rawData = data.results[0].data;
            // console.log(rawData);
            // 载入图形
            loadGraphViaSearch(rawData);
        },
        // 返回数据类型必须设定为json
        dataType
    );
}
//end 单个公司搜索 =============================

//start 关联公司搜索 =============================
function renderAssociateSearchData(queryFirstCompany, querySecondCompany, relationshipsDepth) {
    // 设置存储搜索的中心目标节点@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    dataStore.setSearchTargetNode(queryFirstCompany);
    dataStore.setSearchTargetNode(querySecondCompany);

    var queryFirstCompany = queryFirstCompany;
    var querySecondCompany = querySecondCompany;
    var relationshipsDepth = relationshipsDepth;
    var dataType = "json";
    // $.post("http://localhost:8080/hh/index/function2ForAjax",
    $.post("function2ForAjax",
        {
            compName21Ajax: queryFirstCompany,
            compName22Ajax: querySecondCompany,
            depthAjax: relationshipsDepth
        },
        function(data,status){
            // results[0].data是返回json对象包含的提取数据入口
            var rawData = data.results[0].data;
            // 载入图形
            loadGraphViaSearch(rawData);
        },
        dataType
    );
}
//end 关联公司搜索=============================

//start 批量公司搜索 ============================
function renderListSearchData(queryCompanyList, listRelationshipsDepth) {
    // 设置存储搜索的中心目标节点@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    var queryCompanyListArray = queryCompanyList.split(',');
    queryCompanyListArray.forEach(function(companyName) {
        if (companyName) {
            dataStore.setSearchTargetNode(companyName);
        }
    });

    var queryCompanyList = queryCompanyList;
    var listRelationshipsDepth = listRelationshipsDepth;
    // 返回数据类型必须设定为json，默认是string字符串
    var dataType = "json";
    // $.post("http://localhost:8080/hh/index/function3ForAjax",
    $.post("function3ForAjax",
        {
            // compNameAjax是接口设定的参数名称
            compNameAjax: queryCompanyList,
            depthAjax: listRelationshipsDepth
        },
        function(data,status){
            // results[0].data是返回json对象包含的提取数据入口
            var rawData = data.results[0].data;
            // 载入图形
            loadGraphViaSearch(rawData);
        },
        // 返回数据类型必须设定为json
        dataType
    );
}
//end 批量公司搜索 =============================

// ！！！！！！这是搜索绘图函数@@@@@@@@@@@@@@@@@@@@
//start 调用数据处理器，绘图函数 =================
function loadGraphViaSearch(rawData) {
    var svgWidth = document.getElementById('vizContainer').offsetWidth + 50;
    // console.log(graphConfig.svgWidth);
    var svgHeight = document.documentElement.clientHeight - 70;
    // // svg和force涉及的参数设置
    var graphConfig = {svgWidth: svgWidth, svgHeight:svgHeight};

    // //删除前次搜索绘图
    if (d3.select('svg')) {
        d3.select('svg').remove();
    }
    // 创建svg画布
    var svg = d3.select("body")
        .select('#vizContainer') //暂时写死
        .append("svg")
        .attr('id', 'svgGraph')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // 绘制背景白色，为了导出图片
    svg.append('rect')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr('x', 0)
        .attr('y', 0)
        .style('stroke', 'none')
        .style('fill', '#fff');

    // 绘图数据容器
    var dataSelected = createDataStore('dataSelected');
    // 存储每个节点静止后的位置，用于确定新载入节点的初始位置
    dataSelected.nodesStaticPosition = {};

    //原始数据转为力图未索引数据
    var forceData = iniForceData(rawData);

    // 这里需要执行为dataStore添加初始数据 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    dataStore.links = forceData.links;
    dataStore.nodes = forceData.nodes;
    dataStore.nodesIdSet = forceData.nodesIdSet;
    dataStore.linksIdSet = forceData.linksIdSet;
    dataStore.idNodesDict = forceData.idNodesDict;

    // 这里需要记录最初dataStore，添加进dataStoreStack @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    setDataStoreStack(dataStoreStack, dataStore);

    // 渲染力图
    renderForce(forceData, dataSelected, graphConfig, svg);
}
//end 调用数据处理器，绘图函数=====================

//start 撤销功能，绘图触发器 =========================
function renderGraphByRedo() {
    // 防止过度撤销删图
    if (dataStoreStack.length <= 1) {
        alert('提示： 不存在可以撤销的操作。');
        return;
    }

    var svgWidth = document.getElementById('vizContainer').offsetWidth + 50;
    // console.log(graphConfig.svgWidth);
    var svgHeight = document.documentElement.clientHeight - 70;
    // // svg和force涉及的参数设置
    var graphConfig = {svgWidth: svgWidth, svgHeight:svgHeight};

    // //删除前次搜索绘图
    if (d3.select('svg')) {
        d3.select('svg').remove();
    }
    // 创建svg画布
    var svg = d3.select("body")
        .select('#vizContainer') //暂时写死
        .append("svg")
        .attr('id', 'svgGraph')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // 绘制背景白色，为了导出图片
    svg.append('rect')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr('x', 0)
        .attr('y', 0)
        .style('stroke', 'none')
        .style('fill', '#fff');

    // 绘图容器函数是应该在每次搜索中创建，因为每次随着搜索而销毁，不应该防在外面
    var dataSelected = createDataStore('dataSelected');

    //堆栈抛出最新datastore，转为力图未索引数据@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    dataStoreStack.pop();
    var previousDataStorePositon = dataStoreStack.length;
    var forceData = dataStoreStack[previousDataStorePositon - 1];

    // datastore需要用最新的副本覆盖@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    dataStore = dataStoreStack[previousDataStorePositon - 1];
    // 渲染力图
    renderForce(forceData, dataSelected, graphConfig, svg);
}
//end 撤销功能，绘图触发器 =========================

//start 筛选功能，绘图触发器 =========================
function renderGraphByFilter() {
    var svgWidth = document.getElementById('vizContainer').offsetWidth + 50;
    // console.log(graphConfig.svgWidth);
    var svgHeight = document.documentElement.clientHeight - 70;
    // // svg和force涉及的参数设置
    var graphConfig = {svgWidth: svgWidth, svgHeight:svgHeight};

    // //删除前次搜索绘图
    if (d3.select('svg')) {
        d3.select('svg').remove();
    }
    // 创建svg画布
    var svg = d3.select("body")
        .select('#vizContainer') //暂时写死
        .append("svg")
        .attr('id', 'svgGraph')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // 绘制背景白色，为了导出图片
    svg.append('rect')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr('x', 0)
        .attr('y', 0)
        .style('stroke', 'none')
        .style('fill', '#fff');

    // 绘图容器函数是应该在每次搜索中创建，因为每次随着搜索而销毁，不应该防在外面
    var dataSelected = createDataStore('dataSelected');
    // 存储每个节点静止后的位置，用于确定新载入节点的初始位置
    dataSelected.nodesStaticPosition = {};

    //筛选数据，转为力图未索引数据
    var forceData = filterStoreData(dataStore, this.selectedStatus.selectedNodesType, this.selectedStatus.selectedLinksTypeList);
    // 渲染力图
    renderForce(forceData, dataSelected, graphConfig, svg);
}
//end 筛选功能，绘图触发器 =========================

//start 删除节点功能，绘图触发器 ====================
function renderGraphByRemoveNode() {
    var svgWidth = document.getElementById('vizContainer').offsetWidth + 50;
    // console.log(graphConfig.svgWidth);
    var svgHeight = document.documentElement.clientHeight - 70;
    // // svg和force涉及的参数设置
    var graphConfig = {svgWidth: svgWidth, svgHeight:svgHeight};

    // //删除前次搜索绘图
    if (d3.select('svg')) {
        d3.select('svg').remove();
    }
    // 创建svg画布
    var svg = d3.select("body")
        .select('#vizContainer') //暂时写死
        .append("svg")
        .attr('id', 'svgGraph')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // 绘制背景白色，为了导出图片
    svg.append('rect')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr('x', 0)
        .attr('y', 0)
        .style('stroke', 'none')
        .style('fill', '#fff');

    // 绘图容器函数是应该在每次搜索中创建，因为每次随着搜索而销毁，不应该防在外面
    var dataSelected = createDataStore('dataSelected');
    // 存储每个节点静止后的位置，用于确定新载入节点的初始位置
    dataSelected.nodesStaticPosition = {};

    //需要绘制的数据就是删除节点后的数据容器
    var forceData = dataStore;
    // 渲染力图
    renderForce(forceData, dataSelected, graphConfig, svg);
}
//end 删除节点功能，绘图触发器 ====================

// start 鼠标点击获取公司节点信息 ===================
// 挂载模型上的包装函数
function getNodeInfo(d) {
    //个人节点不抽取信息
    if (d.labels[0] == 'Person' || d.labels[0] == 'Unknown') { //新增未知节点类型判断
        return;
    } else {
        loadNodeInfo(vm.$data.nodeInfo, d);
        // 异步载入司法信息
        getNodeLeaglData(vm.$data.nodeInfo, d.properties["公司名称"]);
    }

}
// 点击载入节点信息到模型挂载点
function loadNodeInfo(nodeInfoOnModel, node) {
    // 初始化，避免空节点被前一个节点填补
    nodeInfoOnModel.basicInfo["公司名称"] = '';
    nodeInfoOnModel.basicInfo["成立时间"] = '';
    nodeInfoOnModel.basicInfo["登记状态"] = '';
    nodeInfoOnModel.basicInfo["注册资本"] = '';
    nodeInfoOnModel.basicInfo["注册号"] = '';
    nodeInfoOnModel.basicInfo["风险指数"] = '';
    nodeInfoOnModel.basicInfo["风险评级"] = '';

    if (node.properties["公司名称"]) {
        nodeInfoOnModel.basicInfo["公司名称"] = node.properties["公司名称"];
    }

    if (node.properties["成立时间"]) {
        nodeInfoOnModel.basicInfo["成立时间"] = node.properties["成立时间"];
    }

    if (node.properties["登记状态"]) {
        nodeInfoOnModel.basicInfo["登记状态"] = node.properties["登记状态"];
    }

    if (node.properties["注册资本"]) {
        nodeInfoOnModel.basicInfo["注册资本"] = node.properties["注册资本"];
    }

    if (node.properties["注册号"]) {
        nodeInfoOnModel.basicInfo["注册号"] = node.properties["注册号"];
    }

    if (node.properties["风险指数"]) {
        nodeInfoOnModel.basicInfo["风险指数"] = node.properties["风险指数"];
    }

    if (node.properties["风险评级"]) {
        nodeInfoOnModel.basicInfo["风险评级"] = node.properties["风险评级"];
    }

    // console.log(nodeInfoOnModel);
}
// end 鼠标点击获取公司节点信息 ===================

//start 点击获取公司司法信息 =====================
function getNodeLeaglData(nodeInfoOnModel, queryCompanyName) {
    // var queryCompany = "BC教育咨询（北京）有限公司";
    var queryCompany = queryCompanyName;
    // 返回数据类型必须设定为json，默认是string字符串
    var dataType = "json";
     $.post("getCompanyInfo",
        {
            // compNameAjax是接口设定的参数名称
            compName: queryCompany
        },
        function(data,status){
            var leaglInfo = data['案件信息'];
            // var leaglCaseArray = [];
            //
            // for(var key in leaglInfo) {
            //     // console.log('案件' + key + ' : ' + leaglInfo[key]);
            //     var suit = {};
            //     // suit['编号'] = key;
            //     // suit['案件'] = leaglInfo[key];
            //     suit.suitNumber = key;
            //     suit.suitTitle = leaglInfo[key];
            //     leaglCaseArray.push(suit);
            // }
            // // 将节点司法信息挂载到模型上
            // nodeInfoOnModel.leaglInfo = leaglCaseArray;
            // var suitResultArray = leaglInfo['判决结果'].split('<br>');
            // console.log(suitResultArray);
            // console.log(leaglInfo);
            // console.log(leaglInfo['判决结果']);

            // 将节点司法信息挂载到模型上
            nodeInfoOnModel.leaglInfo = leaglInfo;
            // console.log(nodeInfoOnModel);
        },
        // 返回数据类型必须设定为json
        dataType
    );
}
//end 点击获取公司司法信息 =====================

//start 导出svg图片 ==========================
function shotScreen() {
    // 检测是否存在svg，否则返回；避免程序出错
    if(!$('#vizContainer').find('svg')[0]) {
        alert('图形不存在，请先进行绘图');
        return;
    }

    // 生成png图片@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // console.log(saveSvgAsPng);
    // saveSvgAsPng.saveSvgAsPng(document.getElementById("svgGraph"), "graph.png");

    // svg头信息，否则会中文乱码
    var svgHeadInfo = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN"\n"http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">';
    var svg = $('#vizContainer').find('svg')[0];
    // console.log(svg);
    // 确保path上的文字引用
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

    var svgSource = d3.select("svg")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    if (d3.select("body").select('#svgContainer').select('img')) {
        d3.select("body").select('#svgContainer').select('img').remove();
    }

    d3.select("body").select('#svgContainer')
        .append("img")
        .attr('width', 500)
        .attr('height', 400)
        .attr("src", "data:image/svg+xml;base64,"+ btoa(unescape(encodeURIComponent(svgHeadInfo + svgSource))));


}
//end 导出svg图片 ==========================

//start 导出png图片 ==========================
function exportPngGraph() {
    if(!d3.select('svg')) {
        alert('图形不存在，请先进行绘图');
        return;
    }

    var svgSource = document.getElementById("svgGraph");
    saveSvgAsPng.saveSvgAsPng(svgSource, "PNG-Graph.png");
}
//end 导出png图片 ==========================

//start 导出svg图片 ==========================
function exportSvgGraph() {
    if(!d3.select('svg')) {
        alert('图形不存在，请先进行绘图');
        return;
    }

    var config = {
        filename: 'SVG-Graph',
    }

    d3_save_svg.save(d3.select('svg').node(), config);
}
//end 导出svg图片 ==========================

//start 获取详细法律信息 ====================
function fetchLegalDetail(clickedSuitTitle) {
    // clickedSuitTitle是由子组件传递的参数
    // console.log(clickedSuitTitle);
    $.post("getJudgmentInfo",
        {
            judgmentId: clickedSuitTitle
            // judgmentId: "160108134632348300000007"
            // compName: '中央汇金投资有限责任公司'
        },
        function(data,status){
            // console.log(data);
            // console.log(data['判决结果']);
            var splitedSuitResultArray = data['判决结果'].split('<br>');
            var suitResultArray = [];
            splitedSuitResultArray.forEach(function(d) {
                if(d) {
                    suitResultArray.push(d);
                }
            });
            console.log(suitResultArray);
            // 司法详情挂载到模型
            vm.$data.nodeInfo.suitDetail = data;
            vm.$data.nodeInfo.suitDetail.suitResultArray = suitResultArray;
            // console.log(vm.$data.nodeInfo);
        },
        "json"
    );
}
//end 获取详细法律信息 ====================

//start 显示或隐藏公司节点的全名称字符串========
function toggleDisplayCompanyName() {
    // console.log(this.optionsConfig.optionsHandler);
    if(!d3.selectAll('.labelFull')) {
        alert('绘图不存在，请先绘制图像');
        return;
    }

    if (this.optionsConfig.optionsHandler.length == 0) {
        console.log('will hide company name');
        // 操纵节点标签全部显示的全局变量，影响新成生的节点样式
        showFullNodesLables = 0;
        var allCompanyLabels = d3.selectAll('.labelFull');
        console.log(allCompanyLabels);
        allCompanyLabels.attr('opacity', 0);
    } else if (this.optionsConfig.optionsHandler.length == 1) {
        console.log('show company name');
        // 操纵节点标签全部显示的全局变量
        showFullNodesLables = 1;
        d3.selectAll('.labelFull')
            .attr('opacity', 1);
    }
    // var optionsSet = d3.set();
    // for (var option in this.optionsConfig.optionsHandler) {
    //     optionsSet.add(this.optionsConfig.optionsHandler[option])
    // }
    // if(this.displayCompanyName == true) {
    //     console.log('hide full name');
    // } else if(this.displayCompanyName == false) {
    //     console.log('display the full name of company');
    // }

    // printPara(this.displayComanyName);
}

function printPara(para) {
    console.log(para);
}
//end 显示或隐藏公司节点的全名称字符串========

//start 鼠标右击节点菜单===================
function createRightClickMenu() {
    if(d3.select('.rightClickMenu')) {
        d3.select('.rightClickMenu').remove();
    }

    var rightClickMenu = vv.ini.createMouseTooltip('rightClickMenu');
    d3.select('body').on('click', function() {
        rightClickMenu.style("opacity", 0)
            .style("left", "-100px")
            .style("top", "-100px");
    });

    return rightClickMenu;
}
//end 鼠标右击节点菜单=====================

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 交互逻辑
//***************************************************************************

//***************************************************************************
//start 图形渲染函数
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//start 渲染力图 ================================
function renderForce(data, dataSelected, graphConfig, svg) {
    // var svgWidth = document.getElementById('vizContainer').offsetWidth + 150;
    // // console.log(graphConfig.svgWidth);
    // var svgHeight = document.documentElement.clientHeight - 70;
    // // // svg和force涉及的参数设置
    // var graphConfig = {svgWidth: svgWidth, svgHeight:svgHeight};
    // 生成鼠标提示框
    var mouseTooltip = vv.ini.createMouseTooltip('mouseTooltip');
    // 鼠标右击菜单
    var rightClickMenu = createRightClickMenu();
    // 绘制图例
    generateLegency(svg);

    // d3.select('svg').on('dblclick', function() {
    //     // 阻止默认双击放大事件@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //     console.log('double click!!!');
    //     d3.event.preventDefault();
    // });

    // 将初始数据装入绘图数据容器-----------
    data.nodes.forEach(function(node) {
        // console.log(node);
        // 将初始数据装入绘图数据容器
        dataSelected.nodesIdSet.add(node.id);
        dataSelected.nodes.push(node);
        // 测试是否存在风险属性
        // if (node.properties.hasOwnProperty('风险指数')) {
        //     console.log(node);
        // }
    });
    data.links.forEach(function(link) {
        // console.log(node);
        // 将初始数据装入绘图数据容器
        dataSelected.linksIdSet.add(link.id);
        dataSelected.links.push(link);
    });

    // 添加力图索引
    var dataSelectedIndexed = addIndex(dataSelected);
    // console.log('dataSelectedIndexed from renderForce()');
    // console.log(dataSelectedIndexed);
    //----------------------------------

    // 节点颜色选择
    var colorScale = d3.scale.ordinal()
            .domain(['Company', 'Person', 'Unknown']) //新增未知类型
            .range(['#68BDF6', '#6DCE9E', '#ccc']);

    // 关系颜色选择
    var linkColorScale = d3.scale.ordinal()
            .domain(["投资", "法定代表人", "任职", "直系亲属"])
            .range(['#ccc', '#ff7567', '#2fafc6', '#fdeb6b']);

    // 动画计数器
    var tickCounter = 0;

    //缩放比例尺-------------------------
    var currentOffset = {x: 0, y: 0};
    var currentZoom = 1.0;

    var xScale = d3.scale.linear()
            .domain([0, graphConfig.svgWidth])
            .range([0, graphConfig.svgWidth]);

    var yScale = d3.scale.linear()
            .domain([0, graphConfig.svgHeight])
            .range([0, graphConfig.svgHeight]);

    var zoomScale = d3.scale.linear()
            .domain([0.3, 2])
            .range([0.3, 2])
            .clamp(true);
    //----------------------------------

    var force = d3.layout.force()
        .size([graphConfig.svgWidth, graphConfig.svgHeight])
        .nodes(dataSelectedIndexed.nodes)
        .links(dataSelectedIndexed.links)
        .linkDistance(100)
        .charge(-600)  //相互之间的作用力
        .gravity(0.05)
        .on("tick", function() {
            repositionGraph(undefined, undefined, 'tick');
        });

    // 画箭头----------------------------
    var arrowConfig = {
        id: 'arrow',
        path: "M0,0 L4,2 L0,4 L0,0",
        markerUnits: 'strokeWidth',
        markerWidth: 4,
        markerHeight: 4,
        viewBox: "0 0 4 4",
        refX: 16,
        refY: 2,
        orient: 'auto'
    }
    var arrow = drawArror(svg, "#aaa", arrowConfig);
    //----------------------------------

    // 设置拖动方式-----------------------
    var drag = force.drag()
        .on("dragstart",function(d,i){
            d.fixed = true; //拖拽并固定节点
            // 阻止节点拖动动作冒泡为整个svg拖动
            d3.event.sourceEvent.stopPropagation();
        })
        .on("dragend",function(d,i){

        })
        .on("drag",function(d,i){

        });
    //----------------------------------

    // svg缩放与拖动----------------------
    // 移动整个svg
    svg.call( d3.behavior.drag()
        .on("drag",dragmove)
    );

    // 缩放整个svg
    svg.call(d3.behavior
        .zoom()
        .x(xScale)
        .y(yScale)
        .scaleExtent([0.3, 2])
        .on('zoom', doZoom)
    );
    //----------------------------------

    // 阻止默认双击放大事件@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // svg.call(d3.behavior.zoom()).on('dblclick.zoom', null);
    svg.on('dblclick.zoom', null);

    // 力图渲染--------------------------
    //总的力图装载点
    var networkGraph = svg.append('g').attr('class', 'grpParent');

    // 节点与边的力图数据
    var nodesData = force.nodes();
    var linksData = force.links();

    // 画边
    var linksG = networkGraph.append('g').attr('id', 'linksG');
    var linksArray = linksG.selectAll(".link")
            .data(dataSelectedIndexed.links)
            .enter()
            // .append("line")
            .append("path")
            .attr("id", function(d) {
                return d.id;
            })
            .classed('link', true)
            .style({'fill':'none', 'stroke-width':'2px'})
            .style('stroke', function(d) {
                return linkColorScale(d.type);
            })
            .attr("marker-end", 'url(#arrow)');
            // .attr("class", "link");

    //绘制关系文字
    var linksLabelsG = networkGraph.append('g').attr('id', 'linksLabelsG');
    var linksLabelsArray = linksLabelsG.selectAll(".linksLabels")
            .data(dataSelectedIndexed.links)
            .enter()
            .append("text")
            .attr("class", "linksLabels")
            .attr("dx", "70px")
            .attr("dy", "-2px")
            .attr('text-anchor', 'middle')
            .style({"font-size":'12px', 'fill': '#666'})
            .append("textPath")
            .attr("xlink:href",function(d) {
                return '#' + d.id;
            })
            .text(function(d) {
                if (d.type == '任职') {
                    if (d.properties['职务']) {
                        return d.properties['职务'];
                    }else {
                        return '任职';
                    }
                } else if (d.type == '投资') {
                    if (d.properties['认缴出资']) {
                        return '投资' + d.properties['认缴出资'];
                    }else {
                        return '投资';
                    }
                } else {
                    return d.type;
                }
            });
    // 画节点
    var nodesG = networkGraph.append('g').attr('id', 'nodesG');
    var nodesArray = nodesG.selectAll(".nodeCircle")
            .data(dataSelectedIndexed.nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .classed('nodeCircle', true)
            .classed('searchTargetNode', function(d) { //为目标搜索节点添加类名
                if(d.labels[0] == 'Company') {
                    // if(d.properties['公司名称'] == dataStore.searchTargetNode) {
                    //     return true;
                    // }
                    if(dataStore.searchTargetNode.has(d.properties['公司名称'])) {
                        return true;
                    }
                }
            })
            .attr("r", 25)
            .style('fill', function(d) {
                return colorScale(d.labels[0]);
            })
            // .style('stroke', '#ccc')
            // .style('stroke-width', '2px')
            .style('stroke-width', function(d) {
                if (d.properties.hasOwnProperty('风险评级')) {
                    // console.log('got risk record');
                    // console.log(d.properties['风险评级']);
                    // console.log(d.properties['风险指数']);
                    if (d.properties['风险评级'] == '无风险') {
                        return '4px';
                    } else if (d.properties['风险评级'] == '低风险') {
                        return '6px';
                    } else if (d.properties['风险评级'] == '中风险') {
                        return '6px';
                    } else if (d.properties['风险评级'] == '高风险') {
                        return '6px';
                    } else {
                        return '2px';
                    }
                } else {
                    return '2px';
                }
            })
            .style('stroke', function(d) {
                if (d.properties.hasOwnProperty('风险评级')) {
                    // console.log('got risk record');
                    // console.log(d.properties['风险评级']);
                    // console.log(d.properties['风险指数']);
                    if (d.properties['风险评级'] == '无风险') {
                        return 'green';
                    } else if (d.properties['风险评级'] == '低风险') {
                        return '#d6dd3a';
                    } else if (d.properties['风险评级'] == '中风险') {
                        return 'orange';
                    } else if (d.properties['风险评级'] == '高风险') {
                        return 'red';
                    } else {
                        return '#ccc';
                    }
                } else {
                    return '#ccc';
                }
            })
            .on('mouseover', function(d) {
                // displayExplorableMark(d);
                // 生成鼠标提示框
                showMouseTooltip(d);
                // mouseoverNodeHight(d);
            })
            .on('mouseout', function(d) {
                // hideExplorableMark();
                hideMouseTooltip();
                // mouseoutNodeUnhight(d);
            })
            .on('click', function(d) {
                getNodeInfo(d);
            })
            .on('dblclick', function(d) {
                // 阻止默认双击放大事件@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                // d3.event.preventDefault();
                // 隐藏下探提示标记
                // hideExplorableMark();
                // 双击固定位置
                d.fixed = true;
                // 如果当前节点是公司，载入当前节点下探数据
                if (d.labels[0] == 'Company') {
                    loadData(d);
                }
            })
            .on('contextmenu', function(d, i) { //右击删除节点菜单
                popRightClickMenu(rightClickMenu, d);
            })
            .call(force.drag);

    // 高亮搜索的公司名称，方便识别 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // d3.select('circle.searchTargetNode').style('fill', 'orange');
    d3.selectAll('circle.searchTargetNode').style('fill', 'orange');
    // console.log(nodesArray);
    // nodesArray.style('fill', function(d) {
    //     if(d.labels[0] == 'Company') {
    //         if(d.properties['公司名称'] == dataStore.searchTargetNode) {
    //             return 'darkred';
    //         }
    //     }
    // });

    // 绘制节点文字
    var labelsG = networkGraph.append('g').attr('id', 'labelsG');
    var labelsArray = labelsG.selectAll(".label")
            .data(dataSelectedIndexed.nodes)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr('dx', function(d) {
                if (d.labels[0] == 'Company') {
                    // 公司名称长移动多
                    return -23;
                } else if (d.labels[0] == 'Person') {
                    // 人名短移动少
                    return -20;
                } else if (d.labels[0] == 'Unknown') {
                    // 未知类型移动多，通常是公司
                    return -23;
                }
            })
            .attr('dy', 5)
            .style({"font-size":'11px', 'fill': '#fff'})
            .style('pointer-events', 'none')
            .text(function(d) {
                if (d.labels[0] == 'Company') {
                    // return d.properties['公司名称'];
                    return d.properties['公司名称'].substr(0, 4);
                } else if (d.labels[0] == 'Person') {
                    // 外国人名字也截断
                    return d.properties['姓名'].substr(0, 4);
                } else if (d.labels[0] == 'Unknown') {
                    // 未知类型
                    return d.properties['名称'].substr(0, 4);
                }
            });

    // 绘制全部长度的节点文字，供截图使用@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    var labelsFullG = networkGraph.append('g').attr('id', 'labelsFullG');
    var labelsArrayFull = labelsFullG.selectAll(".labelFull")
            .data(dataSelectedIndexed.nodes)
            .enter()
            .append("text")
            .attr("class", "labelFull")
            .attr('dy', -30)
            .attr('text-anchor', 'middle')
            .attr('opacity', showFullNodesLables) //全局变量控制，便于控制新载入节点
            .style({"font-size":'12px', 'fill': '#999'})
            .style('pointer-events', 'none')
            .text(function(d) {
                if (d.labels[0] == 'Company') {
                    // return d.properties['公司名称'];
                    return d.properties['公司名称'];
                } else if (d.labels[0] == 'Person') {
                    // 人名不显示全部字符串，因为节点已经显示
                    return '';
                } else if (d.labels[0] == 'Unknown') {
                    // 未知类型通常是公司，也要显示
                    return d.properties['名称'];
                }
            });


    // 开始力图
    force.start();

    force.on('end', function() {
        // 记录每个节点的静态位置，建立以名字为索引的对象
        // addParentStaticPosition(dataSelected.nodesStaticPosition, nodesArray);
    });

    //通过记录的偏移量恢复上次偏移@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    var targetTransformOffset = {
        x: dataStore.scaleTransformRecord.offsetX,
        y: dataStore.scaleTransformRecord.offsetY
    }

    repositionGraph(targetTransformOffset, undefined, 'drag');

    //通过记录的偏移量恢复上次缩放@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // var targetZoomScale = dataStore.scaleTransformRecord.zoomScale;
    // var targetZoomScaleRatio = dataStore.scaleTransformRecord.zoomScaleRatio;
    // var targetZoomOffset = {
    //     x: dataStore.scaleTransformRecord.x * dataStore.scaleTransformRecord.zoomScaleRatio + graphConfig.svgWidth / 2 * (1 - dataStore.scaleTransformRecord.zoomScaleRatio),
    //     y: dataStore.scaleTransformRecord.y * dataStore.scaleTransformRecord.zoomScaleRatio + graphConfig.svgHeight / 2 * (1 - dataStore.scaleTransformRecord.zoomScaleRatio)
    // };

    // repositionGraph(targetZoomOffset, targetZoomScale, 'zoom');
    console.log('load search data: ');
    console.log(dataStoreStack);

    //start 弹出右键删除节点菜单#########
    function popRightClickMenu(rightClickMenu, d) {
        d3.event.preventDefault();
        // console.log(d);
        rightClickMenu.style("opacity", 1)
            .style('z-index', 15);

        var removeNodeButtonClip = "<div class='removeNodeButtonWrapper'><button id='removeNodeButton'>删除该节点</button></div><div class='removeNodeButtonWrapper'><button id='removeNodeTreeButton'>修剪该节点</button></div>";

        rightClickMenu.html(removeNodeButtonClip)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");

        // 点击删除单个节点按钮
        d3.select('#removeNodeButton')
            .on('click', function(p, i) {
                // console.log('remove single node button hitted!');
                // console.log(d);
                rightClickMenu.style("opacity", 0)
                    .style("left", "-100px")
                    .style("top", "-100px");

                // 先要检测是不是能删除，联通2个以上节点就不能删除@@@@@@@@@@@@@@@@@@@@@@
                if (isNodeDeletable(d)) {
                    // 这里需要执行dataStore删除数据，通过右击菜单选项 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                    dataStore.removeData([d.id]);
                    // 全局dataStore删除数据之后要本地数据对象dataSelected删除节点，渲染图像还是要用本地数据对象，这样能够保证筛选出来的效果不改变 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                    // console.log('当前绘图数据对象: ');
                    // console.log(dataSelected);
                    // console.log('移除节点之后的绘图数据对象: ');
                    dataSelected.removeData([d.id]);
                    // console.log(dataSelected);
                    // 这里需要记录删除数据之后的dataStore，添加进dataStoreStack @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                    // dataStoreStack.push(dataStore);
                    setDataStoreStack(dataStoreStack, dataStore);
                    console.log('detete data via remove single node: ');
                    console.log(dataStoreStack);
                    // 添加新数据力图索引
                    dataSelectedIndexed = addIndex(dataSelected);
                    // 更新绘制力图
                    refreshGraph(dataSelectedIndexed);
                    // refreshGraphDataDeleted(dataSelectedIndexed);
                    // 渲染剩下的节点图（有了筛选函数这个就不需要了，否则是渲染2次了）
                    // renderGraphByRemoveNode();
                    // 执行现有的过滤条件，副作用是孤立的点无法渲染，表现为摘除效果
                    // vm.$emit('updateGraphWithFiltedData');
                    // 变通：重置过滤条件
                    // vm.$data.selectedStatus.selectedLinksTypeList = ["投资", "法定代表人", "任职"];
                    // vm.$data.selectedStatus.selectedNodesType = 'All';
                } else {
                    alert('提示：当前节点连通多个其他节点，无法删除。');
                    return;
                }
            });
        // 点击删除子节点按钮
        d3.select('#removeNodeTreeButton')
            .on('click', function(p, i) {
                getDeleteNodeTreeInfo(d);
                rightClickMenu.style("opacity", 0)
                    .style("left", "-100px")
                    .style("top", "-100px");
            });
    }
    //end 弹出右键删除节点菜单#########

    //start 判断单点可删除性#########
    function isNodeDeletable(d) {
        if (d.weight <=1) {
            console.log('one links');
            return true;
        } else if (d.weight > 1) {
            var connectedLinks = dataSelected.links.filter(function(l) {
                return l.startNode == d.id || l.endNode == d.id;
            });

            var connectedNodesIdSet = d3.set();
            connectedLinks.forEach(function(l) {
                if (!connectedNodesIdSet.has(l.startNode)) {
                    connectedNodesIdSet.add(l.startNode);
                }

                if (!connectedNodesIdSet.has(l.endNode)) {
                    connectedNodesIdSet.add(l.endNode);
                }
            });

            if (connectedNodesIdSet.size() <= 2) {
                console.log('many links between nodes');
                return true;
            } else {
                console.log('oops cant delete this node');
                return false;
            }
        }
    }
    //end 判断单点可删除性#########

    // start 收集删除节点所需信息，当前及所有节点、边######
    function getDeleteNodeTreeInfo(node) {
        console.log(node);
        console.log('current node id: ' + node.id);
        // var allNodesId = dataSelectedIndexed.nodesIdSet.values();
        // console.log(allNodesId);
        // var allLinksId = dataSelectedIndexed.linksIdSet.values();
        // console.log(allLinksId);
        // console.log(dataSelectedIndexed);
        // 当前节点id
        var nodeId = node.id;
        var links = dataSelectedIndexed.links;
        var allRelations = '';
        var allRelationsTemArray = [];

        links.forEach(function(l) {
            var linkId = l.id;
            var sourceId = l.source.id;
            var targetId = l.target.id;
            var relation = sourceId + '-' + linkId + '-' + targetId;

            allRelationsTemArray.push(relation);
        });
        // 视图内所有关系和节点字符串拼接
        allRelations = allRelationsTemArray.join();
        console.log(allRelations);

        $.post("function7ForAjax",
           {
               //接口设定的参数名称
               nodeId: nodeId,
               relationships: allRelations
           },
           function(data,status){
            //    console.log(data);
            //    console.log(status);
            //    console.log(data.split(','));
               if(!data) {
                   console.log('该节点无法修剪');
                   alert('提示：不存在可以修剪的节点。');
                   return;
               } else {
                   var removeIdArray = data.split(',');
                   // 这里需要执行dataStore删除数据，通过右击菜单选项 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                   dataStore.removeData(removeIdArray);
                   // 这里需要记录删除数据之后的dataStore，添加进dataStoreStack @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                    //dataStoreStack.push(dataStore);
                    setDataStoreStack(dataStoreStack, dataStore);
                   console.log('detete data via remove round nodes: ');
                   console.log(dataStoreStack);
                   // 全局dataStore删除数据之后要本地数据对象dataSelected删除节点，渲染图像还是要用本地数据对象，这样能够保证筛选出来的效果不改变 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                   dataSelected.removeData(removeIdArray);
                   // 添加新数据力图索引
                   dataSelectedIndexed = addIndex(dataSelected);
                   // 更新绘制力图
                   refreshGraph(dataSelectedIndexed);
                   // 渲染剩下的节点图（不需要了）
                   //renderGraphByRemoveNode();
                   // 执行现有的过滤条件，副作用是孤立的点无法渲染，表现为摘除效果
                //    vm.$emit('updateGraphWithFiltedData');
               }
           } ,
           // 返回数据类型必需指定为text
           'text'
        );
    }
    // end 收集删除节点所需信息，当前及所有节点、边######

    // start 节点静态位置，新节点原始位置######
    function addParentStaticPosition(nodesStaticPositionContainer, nodesArray) {
        nodesArray.style('',function(d) {
            // console.log(d);
            if (d.labels[0] == 'Company') {
                // console.log(d.properties['公司名称']);
                dataSelected.nodesStaticPosition[d.properties['公司名称']] = {};
                dataSelected.nodesStaticPosition[d.properties['公司名称']].fx = d.x;
                dataSelected.nodesStaticPosition[d.properties['公司名称']].fy = d.y;
                // console.log(dataSelected.nodesStaticPosition[d.properties['公司名称']]);
            } else if (d.labels[0] == 'Person') {
                // console.log(d.properties['姓名']);
                dataSelected.nodesStaticPosition[d.properties['姓名']] = {};
                dataSelected.nodesStaticPosition[d.properties['姓名']].fx = d.x;
                dataSelected.nodesStaticPosition[d.properties['姓名']].fy = d.y;
            }
        });
        // console.log(dataSelected.nodesStaticPosition);
    }
    // end 节点静态位置，新节点原始位置######

    // start 将新节点初始化为父节点位置 #####
    function moveNewNodesToParents(tickCounter, nodesArray, labelsArray, linksArray, linksLabelsArray) {
        var stayParentTime = 25;
        if(stayParentTime < 25) {
            //节点坐标
            nodesArray.attr("cx", function(d) {
                    // console.log(d.fx);
                    var positonX = d.fx ? d.fx:d.x;
                    return positonX;
                })
                .attr("cy", function(d) {
                    var positonY = d.fy ? d.fy:d.y;
                    return positonY;
                });

            // 节点标签
            labelsArray.attr("x", function(d) {
                    var positonX = d.fx ? d.fx:d.x;
                    return positonX;
                })
                .attr("y", function(d) {
                    var positonY = d.fy ? d.fy:d.y;
                    return positonY;
                });

            linksArray.style('opacity', 0);

            // 连线标签
            linksLabelsArray.style('opacity', 0);
        } else {
            nodesArray.attr("cx", function(d) {
                    // 尝试用svg边距控制节点最大震荡幅度
                    if (d.x > 2500) {
                        return 1200;
                    } else if (d.x < -200) {
                        return -200;
                    } else {
                        return d.x;
                    }
                })
                .attr("cy", function(d) {
                    if (d.y > 2500) {
                        return 1200;
                    } else if (d.y < -200) {
                        return -200;
                    } else {
                        return d.y;
                    }
                });

            // 节点标签
            labelsArray.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });

            linksArray.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; })
                .style('opacity', 1);

            // 连线标签
            linksLabelsArray.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; })
                .attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; })
                .attr('transform', function(d) {
                    return rotateLinkLable(d);
                })
                .style('opacity', 1);
        }
    }
    // end 将新节点初始化为父节点位置 #####

    //start 双击节点载入新数据########
    function loadData(d) {
        // !!!!!!是否要重新声明？@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // var dataSelectedIndexed;
        // !!!!!!是否要重新声明？@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // 传入公司名称，ajax载入数据
        var queryCompanyExplore = d.properties['公司名称'];
        console.log(queryCompanyExplore);
        var dataTypeExplore = "json";
        // $.post("http://localhost:8080/hh/index/function4ForAjax",
        $.post("function4ForAjax",
            {
                compNameAjax: queryCompanyExplore,
                companyStr: 'All'  //更改后增加的参数
            },
            function(data,status){
                // 下探原始数据入口
                var rawExploreData = data.results[0].data;
                // console.log(rawExploreData);
                // 将原始数据转换为力图未索引数据
                var forceExploreData = iniForceData(rawExploreData);
                // console.log(forceExploreData.links);
                // 这里需要执行为dataStore添加新数据 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                addExploreDataToStore(forceExploreData, dataStore);
                // 这里需要记录增加数据之后的dataStore，添加进dataStoreStack @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                // dataStoreStack.push(dataStore);
                setDataStoreStack(dataStoreStack, dataStore);
                console.log('add data via explore node: ');
                console.log(dataStoreStack);

                // 将新下探数据压入绘图数据容器
                forceExploreData.links.forEach(function(l) {
                    // 压入links到新数据对象
                    if (!dataSelected.linksIdSet.has(l.id)) {
                        // 如果出现没有收录的关系，激活更新图表标记
                        // enableIsUpdateForce();
                        // 压入新关系数据到绘图数据容器
                        dataSelected.linksIdSet.add(l.id);
                        dataSelected.links.push(l);
                    }
                    // 压入links两端的nodes到新数据对象
                    if (!dataSelected.nodesIdSet.has(l.startNode)) {
                        dataSelected.nodesIdSet.add(l.startNode);

                        var sourceNodeFiltedArray = forceExploreData.nodes.filter(function(n) {
                            return n.id == l.startNode;
                        });

                        // 为节点添加父节点静止位置@@@@@@@@@@@@@@@@@@@@@@@@@
                        // if (d.labels[0] == 'Company') {
                        //     sourceNodeFiltedArray[0].fx = dataSelected.nodesStaticPosition[d.properties['公司名称']].fx;
                        //     sourceNodeFiltedArray[0].fy = dataSelected.nodesStaticPosition[d.properties['公司名称']].fy;
                        // } else if (d.labels[0] == 'Person') {
                        //     sourceNodeFiltedArray[0].fx = dataSelected.nodesStaticPosition[d.properties['姓名']].fx;
                        //     sourceNodeFiltedArray[0].fy = dataSelected.nodesStaticPosition[d.properties['姓名']].fy;
                        // }
                        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                        // console.log(sourceNodeFiltedArray[0]);
                        dataSelected.nodes.push(sourceNodeFiltedArray[0]);
                    }
                    // 压入links两端的nodes到新数据对象
                    if (!dataSelected.nodesIdSet.has(l.endNode)) {
                        dataSelected.nodesIdSet.add(l.endNode)

                        var targetNodeFiltedArray = forceExploreData.nodes.filter(function(n) {
                            return n.id == l.endNode;
                        });

                        // 为节点添加父节点静止位置@@@@@@@@@@@@@@@@@@@@@@@@@
                        // if (d.labels[0] == 'Company') {
                        //     targetNodeFiltedArray[0].fx = dataSelected.nodesStaticPosition[d.properties['公司名称']].fx;
                        //     targetNodeFiltedArray[0].fy = dataSelected.nodesStaticPosition[d.properties['公司名称']].fy;
                        // } else if (d.labels[0] == 'Person') {
                        //     targetNodeFiltedArray[0].fx = dataSelected.nodesStaticPosition[d.properties['姓名']].fx;
                        //     targetNodeFiltedArray[0].fy = dataSelected.nodesStaticPosition[d.properties['姓名']].fy;
                        // }
                        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

                        // console.log(targetNodeFiltedArray[0]);
                        dataSelected.nodes.push(targetNodeFiltedArray[0]);
                    }
                });
                // 添加新数据力图索引
                dataSelectedIndexed = addIndex(dataSelected);
                // console.log('dataSelectedIndexed from loadData()');
                // console.log(dataSelectedIndexed);
                // 更新绘制力图
                refreshGraph(dataSelectedIndexed);
            },
            // 设置ajax返回数据类型为json
            dataTypeExplore
        );
    }
    //end 双击节点载入新数据########

    //start 删除数据刷新图形 #########
    function refreshGraphDataDeleted(dataSelectedIndexed) {
        var linksData = dataSelectedIndexed.links;
        var nodesData = dataSelectedIndexed.nodes;

        // 绑定新增数据
        force.nodes(nodesData).links(linksData);

        //绘制关系
        linksArray = linksArray.data(linksData);
        linksArray.exit().remove();

        //绘制关系文字
        linksLabelsArray = linksLabelsArray.data(linksData);
        linksLabelsArray.exit().remove();

        nodesArray = nodesArray.data(nodesData);
        nodesArray.exit().remove();

        // 绘制节点文字
        labelsArray = labelsArray.data(nodesData);
        labelsArray.exit().remove();

        // 绘制全部长度的节点文字，供截图使用@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        labelsArrayFull = labelsArrayFull.data(nodesData);
        labelsArrayFull.exit().remove();
    }
    //end 删除数据刷新图形 #########

    //start 数据绑定标记函数 #########
    var key = function(d) {
        return d.key;
    };
    //end 数据绑定标记函数 #########

    //start 载入新数据刷新图形 #########
    function refreshGraph(dataSelectedIndexed) {
        var linksData = dataSelectedIndexed.links;
        var nodesData = dataSelectedIndexed.nodes;

        // 绑定新增数据
        force.nodes(nodesData).links(linksData);

        //测试销毁删除数据之后的dom@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        //绘制关系
        linksArray = linksArray.data(linksData, key);
        linksArray.exit().remove();

        //绘制关系文字
        linksLabelsArray = linksLabelsArray.data(linksData, key);
        linksLabelsArray.exit().remove();

        nodesArray = nodesArray.data(nodesData, key);
        nodesArray.exit().remove();
        // nodesArray.exit().transition().duration(1000).remove();

        // 绘制节点文字
        labelsArray = labelsArray.data(nodesData, key);
        labelsArray.exit().remove();

        // 绘制全部长度的节点文字
        labelsArrayFull = labelsArrayFull.data(nodesData, key);
        labelsArrayFull.exit().remove();
        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        linksArray = linksArray.data(linksData);
        linksArray.enter()
            // .append("line")
            .append("path")
            .attr("id", function(d) {
                return d.id;
            })
            .attr("class", "link")
            .style({'fill':'none', 'stroke-width':'2px'})
            .style('stroke', function(d) {
                return linkColorScale(d.type);
            })
            .attr("marker-end", 'url(#arrow)');
        // // 删除节点dom销毁
        // linksArray.exit();

        //绘制关系文字
        linksLabelsArray = linksLabelsArray.data(linksData);
        linksLabelsArray.enter()
            .append("text")
            .attr("class", "linksLabels")
            .attr("dx", "70px")
            .attr("dy", "-2px")
            .attr('text-anchor', 'middle')
            .style({"font-size":'12px', 'fill': '#666'})
            .append("textPath")
            .attr("xlink:href",function(d) {
                return '#' + d.id;
            })
            .text(function(d) {
                if (d.type == '任职') {
                    if (d.properties['职务']) {
                        return d.properties['职务'];
                    }else {
                        return '任职';
                    }
                } else if (d.type == '投资') {
                    if (d.properties['认缴出资']) {
                        return '投资' + d.properties['认缴出资'];
                    }else {
                        return '投资';
                    }
                } else {
                    return d.type;
                }
            });
        // // 删除节点dom销毁
        // linksLabelsArray.exit();

        nodesArray = nodesArray.data(nodesData);
        nodesArray.enter()
            .append("circle")
            .attr("class", "node")
            .classed('nodeCircle', true)
            .attr("r", 25)
            .style('fill', function(d) {
                return colorScale(d.labels[0]);
            })
            // .style('stroke', '#ccc')
            // .style('stroke-width', '2px')
            .style('stroke-width', function(d) {
                if (d.properties.hasOwnProperty('风险评级')) {
                    // console.log('got risk record');
                    // console.log(d.properties['风险评级']);
                    // console.log(d.properties['风险指数']);
                    if (d.properties['风险评级'] == '无风险') {
                        return '4px';
                    } else if (d.properties['风险评级'] == '低风险') {
                        return '6px';
                    } else if (d.properties['风险评级'] == '中风险') {
                        return '6px';
                    } else if (d.properties['风险评级'] == '高风险') {
                        return '6px';
                    } else {
                        return '2px';
                    }
                } else {
                    return '2px';
                }
            })
            .style('stroke', function(d) {
                if (d.properties.hasOwnProperty('风险评级')) {
                    // console.log('got risk record');
                    // console.log(d.properties['风险评级']);
                    // console.log(d.properties['风险指数']);
                    if (d.properties['风险评级'] == '无风险') {
                        return 'green';
                    } else if (d.properties['风险评级'] == '低风险') {
                        return '#d6dd3a';
                    } else if (d.properties['风险评级'] == '中风险') {
                        return 'orange';
                    } else if (d.properties['风险评级'] == '高风险') {
                        return 'red';
                    } else {
                        return '#ccc'
                    }
                } else {
                    return '#ccc'
                }
            })
            .on('mouseover', function(d) {
                // displayExplorableMark(d);
                // 生成鼠标提示框
                showMouseTooltip(d);
                // mouseoverNodeHight(d);
            })
            .on('mouseout', function(d) {
                // hideExplorableMark();
                hideMouseTooltip();
                // mouseoutNodeUnhight(d);
            })
            .on('click', function(d) {
                getNodeInfo(d);
            })
            .on('dblclick', function(d) {
                // 阻止默认双击放大事件@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                // d3.event.preventDefault();
                // 隐藏下探提示标记
                // hideExplorableMark();
                // 双击固定位置
                d.fixed = true;
                // 如果当前节点是公司，载入当前节点下探数据
                if (d.labels[0] == 'Company') {
                    loadData(d);
                }
            })
            .on('contextmenu', function(d, i) { //右击删除节点菜单
                popRightClickMenu(rightClickMenu, d);
            })
            .call(force.drag);
        // // 删除节点dom销毁
        // nodesArray.exit();

        // 绘制节点文字
        labelsArray = labelsArray.data(nodesData);
        labelsArray.enter()
            .append("text")
            .attr("class", "label")
            .attr('dx', function(d) {
                if (d.labels[0] == 'Company') {
                    // 公司名称长移动多
                    return -23;
                } else if (d.labels[0] == 'Person') {
                    // 人名短移动少
                    return -20;
                } else if (d.labels[0] == 'Unknown') {
                    // 未知类型移动多，通常是公司
                    return -23;
                }
            })
            .attr('dy', 5)
            .style({"font-size":'11px', 'fill': '#fff'})
            .text(function(d) {
                if (d.labels[0] == 'Company') {
                    // return d.properties['公司名称'];
                    return d.properties['公司名称'].substr(0, 4);
                } else if (d.labels[0] == 'Person') {
                    return d.properties['姓名'].substr(0, 4);
                } else if (d.labels[0] == 'Unknown') {
                    // 未知类型
                    return d.properties['名称'].substr(0, 4);
                }
            });
        // // 删除节点dom销毁
        // labelsArray.exit();

        // 绘制全部长度的节点文字，供截图使用@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        labelsArrayFull = labelsArrayFull.data(nodesData);
        labelsArrayFull.enter()
            .append("text")
            .attr("class", "labelFull")
            .attr('dy', -30)
            .attr('text-anchor', 'middle')
            .attr('opacity', showFullNodesLables)
            .style({"font-size":'12px', 'fill': '#999'})
            .style('pointer-events', 'none')
            .text(function(d) {
                if (d.labels[0] == 'Company') {
                    // return d.properties['公司名称'];
                    return d.properties['公司名称'];
                } else if (d.labels[0] == 'Person') {
                    // 人名不显示全部字符串，因为节点已经显示
                    return '';
                } else if (d.labels[0] == 'Unknown') {
                    // 未知类型通常是公司，也要显示
                    return d.properties['名称'];
                }
            });
        // // 删除节点dom销毁
        // labelsArrayFull.exit();



        // 重置计数器
        resetTickCounter();

        force.start();

        // 一倍放大，解决载入数据后自动放大的问题@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // doZoom(); //not works

    }
    //end 载入新数据刷新图形 #########

    //start 减少力图动画时间 #########
    function checkForceAniman() {
        tickCounter++;
        if (tickCounter > 150) {
            force.stop();
        }
    }
    //end 减少力图动画时间 #########

    //start 动画控制：拖动、缩放 #######
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
            // console.log(currentOffset.x);
            // console.log(currentOffset.y);
            // 记录画图偏移量@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            dataStore.setTransformOffset(currentOffset.x, currentOffset.y);
            // console.log(dataStore.scaleTransformRecord);
            // console.log('d3.event.scale: ');
            // console.log(d3.event.scale);
            // console.log('currentZoom: ');
            // console.log(currentZoom);

            // 记录相对缩放比率
            if (d3.event.scale && currentZoom) {
                var scaleTransformRatio = d3.event.scale / currentZoom;
                dataStore.setScaleRatio(scaleTransformRatio);
            }

            // console.log('scaleTransformRatio: ');
            // console.log(scaleTransformRatio);
            // 记录缩放比例
            if (d3.event.scale) {
                dataStore.setZoomScale(d3.event.scale);
            }

        }

        // zoom: new value of zoom
        if (zValue === undefined) {
            if (mode != 'tick') {
                return;
            }

            zValue = currentZoom;
            // console.log('zValue is undefined and is: ' + zValue);
        } else {
            currentZoom = zValue;
            // console.log('zValue is defined and currentZoom is: ' + currentZoom);
        }

        // move links
        var allLinks = doTr ? linksArray.transition().duration(500) : linksArray;
        // allLinks.attr('x1', function(d) { return zValue*(d.source.x); })
        //     .attr('y1', function(d) { return zValue*(d.source.y); })
        //     .attr('x2', function(d) { return zValue*(d.target.x); })
        //     .attr('y2', function(d) { return zValue*(d.target.y); });
        // 更新连线坐标：弧线
        // allLinks.attr("d", linkArc);
        allLinks.attr("d", function(d) {
            return linkArc(d, zValue);
        });

        // move nodes
        var allNodes = doTr ? nodesArray.transition().duration(500) : nodesArray;
        allNodes.attr('transform', function(d) {
            return 'translate(' + zValue*d.x + ',' + zValue*d.y + ')';
        });
        // 改变节点大小
        allNodes.attr('r', function() {
            if(zValue >= 1) {
                return 25;
            } else {
                return 25 * zValue;
            }
        });

        //move node text
        // 更新node文字坐标
        var allNodesLabels = doTr ? labelsArray.transition().duration(500) : labelsArray;
        allNodesLabels.attr('transform', function(d) {
            return 'translate(' + zValue*d.x + ',' + zValue*d.y + ')';
        });
        // 改变文字大小
        // allNodesLabels.style('font-size', function() {
        //     return 12 * zValue + 'px';
        // });
        // 改变文字可见性，缩小到0.5以下文字透明不可见
        allNodesLabels.style('opacity', function() {
            if (zValue < 0.7) {
                return 0;
            } else {
                return 1;
            }
        });

        // 更新供截图使用的node完整长度文字坐标
        var allNodesFullLabels = doTr ? labelsArrayFull.transition().duration(500) : labelsArrayFull;
        allNodesFullLabels.attr('transform', function(d) {
            return 'translate(' + zValue*d.x + ',' + zValue*d.y + ')';
        });

        // 改变文字大小
        // allNodesFullLabels.style('font-size', function() {
        //     return 12 * zValue + 'px';
        // });

        // nodesText.attr("x", function(d){ return d.x; })
        //     .attr("y", function(d){ return d.y; });

        //move edge text
        // 连线文字采用textpath之后，不用手动控制位置
        //更新连接线上文字的位置
        // var allLinksLabels = doTr ? linksLabelsArray.transition().duration(500) : linksLabelsArray;
        // allLinksLabels.attr('transform', function(d) {
        //     return 'translate(' + zValue*((d.source.x + d.target.x)/2) + ',' + zValue*((d.source.y + d.target.y)/2) + ')';
        // });
        // edgesText.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; })
        //     .attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });
    }
    //end 动画控制：拖动、缩放 #######

    // start 拖动图像 ###############
    function dragmove(d) {
        var offset = {
            x: currentOffset.x + d3.event.dx,
            y: currentOffset.y + d3.event.dy
        };
        repositionGraph(offset, undefined, 'drag');
    }
    // end 拖动图像 ###############

    // start 缩放图像 ###############
    function doZoom(increment) {
        var newZoom = increment === undefined ? d3.event.scale : zoomScale(currentZoom+increment);
        // console.log('d3.event.scale: ' + d3.event.scale);
        // console.log('zoomScale(currentZoom+increment): ' + zoomScale(currentZoom+increment));

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
            x: currentOffset.x*zoomRatio + graphConfig.svgWidth/2*(1-zoomRatio),
            y: currentOffset.y*zoomRatio + graphConfig.svgHeight/2*(1-zoomRatio)
        };

        // console.log('newZoom: ' + newZoom);
        //repositionGraph
        repositionGraph(newOffset, newZoom, 'zoom');
    }
    // end 缩放图像 ###############

    // start 重置力图动画计数器#####
    function resetTickCounter() {
        tickCounter = 0;
    }
    // end 重置力图动画计数器#####

    // start 弧线连线#############################
    function linkArc(d, zValue) {
        // console.log('dataSelectedIndexed from linkArc()');
        // console.log(dataSelectedIndexed);
        // 节点之间重叠关系数量
        var relationshipsDimension = dataSelectedIndexed.linksArcTable[d.linkUniqId].length;
        // 如果没有重叠关系，绘制直线
        if (relationshipsDimension == 1) {
            var beziers = getBezierWithOneLinks(d, zValue);
            return beziers.pathMiddle;
        } // 如果有2份重叠关系，绘制一对弧线
        else if (relationshipsDimension == 2) {
            var beziers = getBezierWithTwoLinks(d, zValue);
            // 绘制第一条弧线
            if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 0) {
                return beziers.pathForward;
            } // 绘制第二条弧线
            else if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 1){
                return beziers.pathBackward;
            }
        }// 如果有3份重叠关系
        else if (relationshipsDimension == 3) {
            var beziers = getBezierWithThreeLinks(d, zValue);
            // 绘制第一条弧线
            if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 0) {
                return beziers.pathForward;
            }
            // 绘制第二条弧线
            else if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 1){
                return beziers.pathMiddle;
            }
            // 绘制第三条弧线
            else if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 2){
                return beziers.pathBackward;
            }
        }// 如果有4份重叠关系
        else if (relationshipsDimension == 4) {
            var beziers = getBezierWithFourLinks(d, zValue);
            // 绘制第一条弧线
            if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 0) {
                return beziers.pathForward;
            }
            // 绘制第二条弧线
            else if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 1){
                return beziers.pathForwardInner;
            }
            // 绘制第三条弧线
            else if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 2){
                return beziers.pathBackwardInner;
            }
            // 绘制第四条弧线
            else if (dataSelectedIndexed.linksArcTable[d.linkUniqId].indexOf(d.id) == 3){
                return beziers.pathBackward;
            }
        }
    }
    // end  弧线连线#############################

    // start mouse tooltip ##############
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

        if (d.labels[0] == 'Company') {
            htmlContent += "<div>" + d.properties['公司名称'] + "</div>";

            // if (d.properties['注册资本']) {
            //     htmlContent += "<div>注册资本：" + d.properties['注册资本'] + "</div>";
            // }

            if (d.properties.hasOwnProperty('风险指数')) {
                // htmlContent += "<div>风险指数：" + d.properties['风险指数'] + "</div>";
                htmlContent += "<div>风险评级：" + d.properties['风险评级'] + "</div>";
            }
        }
        else if (d.labels[0] == 'Person') {
            htmlContent += "<div>" + d.properties['姓名'] + "</div>";
        }
        else if (d.labels[0] == 'Unknown') {
            htmlContent += "<div>" + d.properties['名称'] + "</div>";
        }

        return htmlContent;
    }
    //end 生成提示框内容
    // end mouse tooltip ##############

    // start 鼠标经过高亮节点################
    function mouseoverNodeHight(d) {
        // console.log(d);
        // console.log(this);
        // var circle = d3.select(this);
        // circle.transition(500)
        //     .style({"stroke-width":'4px', 'stroke': 'orange', 'stroke-opacity': '0.5'});
        // console.log(circle);

        //高亮周边一度节点标签
        linksArray.filter(function(link) {
            if ( link.source === d || link.target === d) {
                if (link.source === d) {

                } else if (link.target === d) {

                }
            }
        });
    }
    // end 鼠标经过高亮节点################

    // start 取消鼠标经过高亮节点 ##########
    function mouseoutNodeUnhight(d) {
        var circle = d3.select(this);
        circle.transition(500)
            .style({"stroke-width":'2px', 'stroke': '#ccc', 'stroke-opacity': '1'});

        //高亮周边一度节点标签
        linksArray.filter(function(link) {
            if ( link.source === d || link.target === d) {
                if (link.source === d) {

                } else if (link.target === d) {

                }
            }
        });
    }
    // end 取消鼠标经过高亮节点 ##########

    // // start 鼠标点击获取公司节点信息 #####
    // function getNodeInfo(d) {
    //     console.log('nodeInfo');
    //     console.log(this.nodeInfo);
    // }
    // // end 鼠标点击获取公司节点信息 #####
}
//end 渲染力图 =================================

// start 绘制箭头 ==============================
function drawArror(svg, color, arrowConfig) {
    var arrow_path = arrow_path || "M0,0 L4,2 L0,4 L0,0";

    var svg = svg || d3.select('svg');

    var defsG = svg.append('g');
    var defs = defsG.append("defs");
    var arrowMarker = defs.append("marker")
        .attr(arrowConfig);

    arrowMarker.append("path")
        .attr("d",arrow_path)
        .attr("fill",color);
}
// end 绘制箭头 ==============================

// start 旋转关系连线文本 =====================
function rotateLinkLable(d) {
    var rotateCenterX = (d.source.x + d.target.x) / 2;
    var rotateCenterY = (d.source.y + d.target.y) / 2;
    var legX = Math.abs(d.source.x - d.target.x);
    var legY = Math.abs(d.source.y - d.target.y);
    var rotateAngle = Math.atan(legY/legX) * 180 / Math.PI;
    // console.log(rotateAngle);
    if (d.target.x >= d.source.x) {
        if (d.target.y >= d.source.y) { //when target x > source x
            return 'rotate(' + (rotateAngle) + " " + rotateCenterX + ',' + rotateCenterY + ')';
        } else {
            return 'rotate(' + -rotateAngle + " " + rotateCenterX + ',' + rotateCenterY + ')';
        }
    } else { //when target x < source x
        if (d.target.y >= d.source.y) { //when target x > source x
            return 'rotate(' + -rotateAngle + " " + rotateCenterX + ',' + rotateCenterY + ')';
        } else {
            return 'rotate(' + (rotateAngle) + " " + rotateCenterX + ',' + rotateCenterY + ')';
        }
    }
}
// end 旋转关系连线文本 ======================

//start 有4重叠关系，绘制4条贝塞尔曲线===========
function getBezierWithFourLinks(d, zValue) {
    var angleStep = 40; //out curve angle
    var angleStepInner = 25; //inner cureve angle

    var x1 = zValue*d.source.x, y1 = zValue*d.source.y;
    var x2 = zValue*d.target.x, y2 = zValue*d.target.y;

    var xDistance = x2 - x1;
    var yDistance = y2 - y1;

    var linkDistance = Math.sqrt(Math.pow(xDistance,2)+Math.pow(yDistance, 2));
    // var squareLinkDistance = linkDistance*Math.sin(45/180*Math.PI);
    var squareLinkDistance = linkDistance/2/Math.cos(angleStep/180*Math.PI);
    var squareLinkDistanceInner = linkDistance/2/Math.cos(angleStepInner/180*Math.PI);

    var angle = Math.atan(yDistance/xDistance)/Math.PI*180;
    // console.log('angle:' + angle);
    // 位于第三或第四象限，则加180度
    if ((x1>x2 && y1<y2) || (x1>x2 && y1>y2)) {
        angle += 180;
    }
    //forward
    var angleForward = angle + angleStep;
    var xMoveForward = squareLinkDistance * Math.cos(angleForward/180*Math.PI);
    var yMoveForward = squareLinkDistance * Math.sin(angleForward/180*Math.PI);
    var xForwardPosition = x1 + xMoveForward;
    var yForwardPosition = y1 + yMoveForward;
    //backward
    var angleBackward = angle - angleStep;
    var xMoveBackward = squareLinkDistance * Math.cos(angleBackward/180*Math.PI);
    var yMoveBackward = squareLinkDistance * Math.sin(angleBackward/180*Math.PI);
    var xBackwardPosition = x1 + xMoveBackward;
    var yBackwardPosition = y1 + yMoveBackward;

    // console.log('forward: '+ xForwardPosition + ',' + yForwardPosition);
    // console.log('backward: '+ xBackwardPosition + ',' + yBackwardPosition);

    //inner forward
    var angleForwardInner = angle + angleStepInner;
    var xMoveForwardInner = squareLinkDistanceInner * Math.cos(angleForwardInner/180*Math.PI);
    var yMoveForwardInner = squareLinkDistanceInner * Math.sin(angleForwardInner/180*Math.PI);
    var xForwardPositionInner = x1 + xMoveForwardInner;
    var yForwardPositionInner = y1 + yMoveForwardInner;
    //inner backward
    var angleBackwardInner = angle - angleStepInner;
    var xMoveBackwardInner = squareLinkDistanceInner * Math.cos(angleBackwardInner/180*Math.PI);
    var yMoveBackwardInner = squareLinkDistanceInner * Math.sin(angleBackwardInner/180*Math.PI);
    var xBackwardPositionInner = x1 + xMoveBackwardInner;
    var yBackwardPositionInner = y1 + yMoveBackwardInner;

    //out curve
    var pathForward = "M" + x1 + "," + y1 + " Q" + xForwardPosition + "," + yForwardPosition + " " + x2 + "," + y2;
    var pathBackward = "M" + x1 + "," + y1 + " Q" + xBackwardPosition + "," + yBackwardPosition + " " + x2 + "," + y2;

    //inner curve
    var pathForwardInner = "M" + x1 + "," + y1 + " Q" + xForwardPositionInner + "," + yForwardPositionInner + " " + x2 + "," + y2;
    var pathBackwardInner = "M" + x1 + "," + y1 + " Q" + xBackwardPositionInner + "," + yBackwardPositionInner + " " + x2 + "," + y2;

    var beziers = {};
    beziers.pathForward = pathForward;
    beziers.pathBackward = pathBackward;
    beziers.pathForwardInner = pathForwardInner;
    beziers.pathBackwardInner = pathBackwardInner;

    return beziers;
}
//end 有4重叠关系，绘制4条贝塞尔曲线===========

//start 有3重叠关系，绘制2条贝塞尔曲线和一条直线===========
function getBezierWithThreeLinks(d, zValue) {
    var angleStep = 30;
    // var angleStep = 15;

    var x1 = zValue*d.source.x, y1 = zValue*d.source.y;
    var x2 = zValue*d.target.x, y2 = zValue*d.target.y;

    var xDistance = x2 - x1;
    var yDistance = y2 - y1;

    var linkDistance = Math.sqrt(Math.pow(xDistance,2)+Math.pow(yDistance, 2));
    // var squareLinkDistance = linkDistance*Math.sin(45/180*Math.PI);
    var squareLinkDistance = linkDistance/2/Math.cos(angleStep/180*Math.PI);

    var angle = Math.atan(yDistance/xDistance)/Math.PI*180;
    // console.log('angle:' + angle);
    // 位于第三或第四象限，则加180度
    if ((x1>x2 && y1<y2) || (x1>x2 && y1>y2)) {
        angle += 180;
    }
    //forward
    var angleForward = angle + angleStep;
    var xMoveForward = squareLinkDistance * Math.cos(angleForward/180*Math.PI);
    var yMoveForward = squareLinkDistance * Math.sin(angleForward/180*Math.PI);
    var xForwardPosition = x1 + xMoveForward;
    var yForwardPosition = y1 + yMoveForward;
    //backward
    var angleBackward = angle - angleStep;
    var xMoveBackward = squareLinkDistance * Math.cos(angleBackward/180*Math.PI);
    var yMoveBackward = squareLinkDistance * Math.sin(angleBackward/180*Math.PI);
    var xBackwardPosition = x1 + xMoveBackward;
    var yBackwardPosition = y1 + yMoveBackward;

    // console.log('forward: '+ xForwardPosition + ',' + yForwardPosition);
    // console.log('backward: '+ xBackwardPosition + ',' + yBackwardPosition);

    var pathForward = "M" + x1 + "," + y1 + " Q" + xForwardPosition + "," + yForwardPosition + " " + x2 + "," + y2;
    var pathBackward = "M" + x1 + "," + y1 + " Q" + xBackwardPosition + "," + yBackwardPosition + " " + x2 + "," + y2;
    var pathMiddle = "M" + x1 + "," + y1 + " T" + x2 + "," + y2;

    var beziers = {};
    beziers.pathForward = pathForward;
    beziers.pathBackward = pathBackward;
    beziers.pathMiddle = pathMiddle;
    return beziers;
}
//end 有3重叠关系，绘制2条贝塞尔曲线和一条直线===========

//start 有2重叠关系，绘制2条贝塞尔曲线===========
function getBezierWithTwoLinks(d, zValue) {
    var angleStep = 30;

    var x1 = zValue*d.source.x, y1 = zValue*d.source.y;
    var x2 = zValue*d.target.x, y2 = zValue*d.target.y;

    var xDistance = x2 - x1;
    var yDistance = y2 - y1;

    var linkDistance = Math.sqrt(Math.pow(xDistance,2)+Math.pow(yDistance, 2));
    // var squareLinkDistance = linkDistance*Math.sin(45/180*Math.PI);
    var squareLinkDistance = linkDistance/2/Math.cos(angleStep/180*Math.PI);

    var angle = Math.atan(yDistance/xDistance)/Math.PI*180;
    // console.log('angle:' + angle);
    // 位于第三或第四象限，则加180度
    if ((x1>x2 && y1<y2) || (x1>x2 && y1>y2)) {
        angle += 180;
    }
    //forward
    var angleForward = angle + angleStep;
    var xMoveForward = squareLinkDistance * Math.cos(angleForward/180*Math.PI);
    var yMoveForward = squareLinkDistance * Math.sin(angleForward/180*Math.PI);
    var xForwardPosition = x1 + xMoveForward;
    var yForwardPosition = y1 + yMoveForward;
    //backward
    var angleBackward = angle - angleStep;
    var xMoveBackward = squareLinkDistance * Math.cos(angleBackward/180*Math.PI);
    var yMoveBackward = squareLinkDistance * Math.sin(angleBackward/180*Math.PI);
    var xBackwardPosition = x1 + xMoveBackward;
    var yBackwardPosition = y1 + yMoveBackward;

    // console.log('forward: '+ xForwardPosition + ',' + yForwardPosition);
    // console.log('backward: '+ xBackwardPosition + ',' + yBackwardPosition);

    var pathForward = "M" + x1 + "," + y1 + " Q" + xForwardPosition + "," + yForwardPosition + " " + x2 + "," + y2;
    var pathBackward = "M" + x1 + "," + y1 + " Q" + xBackwardPosition + "," + yBackwardPosition + " " + x2 + "," + y2;
    // var pathMiddle = "M" + x1 + "," + y1 + " T" + x2 + "," + y2;

    var beziers = {};
    beziers.pathForward = pathForward;
    beziers.pathBackward = pathBackward;
    // beziers.pathMiddle = pathMiddle;
    return beziers;
}
//end 有2重叠关系，绘制2条贝塞尔曲线===========

//start 没有重叠关系，绘制一条直线===========
function getBezierWithOneLinks(d, zValue) {
    var x1 = zValue*d.source.x, y1 = zValue*d.source.y;
    var x2 = zValue*d.target.x, y2 = zValue*d.target.y;
    var pathMiddle = "M" + x1 + "," + y1 + " T" + x2 + "," + y2;

    var beziers = {};
    beziers.pathMiddle = pathMiddle;

    return beziers;
}
//end 没有重叠关系，绘制一条直线===========

//start 画图例 =======================
function generateLegency(svg) {
    var legencyG = svg.append('g')
        .attr('id', 'legencyG')
        .attr('transform', 'translate(10, 20)');

    var circleCompanyLegendConfig = { r: 6, cx: 0, cy: 0, styleClass: {'stroke': 'none', 'fill': '#68BDF6'}};
    drawCircle(legencyG, circleCompanyLegendConfig);
    var textCompanyLegendConfig = {x: 10, y: 3, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '公司'};
    drawText(legencyG, textCompanyLegendConfig);

    var circlePersonLegendConfig = { r: 6, cx: 0, cy: 20, styleClass:  {'stroke': 'none', 'fill': '#6DCE9E'}};
    drawCircle(legencyG, circlePersonLegendConfig);
    var textPersonLegendConfig = {x: 10, y: 23, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '自然人'};
    drawText(legencyG, textPersonLegendConfig);

    var circleUnknownLegendConfig = { r: 6, cx: 0, cy: 40, styleClass:  {'stroke': 'none', 'fill': '#ccc'}};
    drawCircle(legencyG, circleUnknownLegendConfig);
    var textUnknownLegendConfig = {x: 10, y: 43, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '其他类型'};
    drawText(legencyG, textUnknownLegendConfig);

    var circleHighRiskLegendConfig = { r: 5, cx: 0, cy: 60, styleClass: {'stroke': 'red', 'stroke-width': '2px', 'fill': 'none'}};
    drawCircle(legencyG, circleHighRiskLegendConfig);
    var textHighRiskLegendConfig = {x: 10, y: 63, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '风险评级：高'};
    drawText(legencyG, textHighRiskLegendConfig);

    var circleNormalRiskLegendConfig = { r: 5, cx: 0, cy: 80, styleClass: {'stroke': 'orange', 'stroke-width': '2px', 'fill': 'none'}};
    drawCircle(legencyG, circleNormalRiskLegendConfig);
    var textNormalRiskLegendConfig = {x: 10, y: 83, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '风险评级：中'};
    drawText(legencyG, textNormalRiskLegendConfig);

    var circleLowRiskLegendConfig = { r: 5, cx: 0, cy: 100, styleClass: {'stroke': '#d6dd3a', 'stroke-width': '2px', 'fill': 'none'}};
    drawCircle(legencyG, circleLowRiskLegendConfig);
    var textLowRiskLegendConfig = {x: 10, y: 103, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '风险评级：低'};
    drawText(legencyG, textLowRiskLegendConfig);

    var circleSafeLegendConfig = { r: 5, cx: 0, cy: 120, styleClass: {'stroke': 'green', 'stroke-width': '2px', 'fill': 'none'}};
    drawCircle(legencyG, circleSafeLegendConfig);
    var textSafeLegendConfig = {x: 10, y: 123, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '风险评级：安全'};
    drawText(legencyG, textSafeLegendConfig);

    var lineInvestLegendConfig = {x1: -4, y1: 140, x2: 30, y2: 140, styleClass: {'stroke': '#ccc', 'stroke-width': '2px', 'fill': 'none'}};
    drawLine(legencyG, lineInvestLegendConfig);
    var textInvestLegendConfig = {x: 40, y: 143, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '投资关系'};
    drawText(legencyG, textInvestLegendConfig);

    var lineOwnerLegendConfig = {x1: -4, y1: 160, x2: 30, y2: 160, styleClass: {'stroke': '#ff7567', 'stroke-width': '2px', 'fill': 'none'}};
    drawLine(legencyG, lineOwnerLegendConfig);
    var textOwnerLegendConfig = {x: 40, y: 163, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '法人关系'};
    drawText(legencyG, textOwnerLegendConfig);

    var lineJobLegendConfig = {x1: -4, y1: 180, x2: 30, y2: 180, styleClass: {'stroke': '#2fafc6', 'stroke-width': '2px', 'fill': 'none'}};
    drawLine(legencyG, lineJobLegendConfig);
    var textJobLegendConfig = {x: 40, y: 183, styleClass: {'font-size': '10px', 'font-family': 'Microsoft Yahei', 'fill': '#666'}, content: '任职关系'};
    drawText(legencyG, textJobLegendConfig);

    return legencyG;
}
//end 画图例 =======================

//start 画圆 =======================
function drawCircle(container, circleConfig) {
    var g = container.append('g');

    var circleConfig = circleConfig || { r: 100, cx: 0, cy: 0, styleClass: ''};

    var circle = g.append('circle')
        .attr('r', circleConfig.r)
        .attr('cx', circleConfig.cx)
        .attr('cy', circleConfig.cy);

    if (circleConfig.styleClass) {
        circle.style(circleConfig.styleClass);
    }

    return circle;
}
//end 画圆 =======================

//start 画文字 =======================
function drawText(container, textConfig) {
    var g = container.append('g');

    var textConfig = textConfig || {x: 0, y: 0, styleClass: '', content: 'text place holder'};

    var text = g.append('text')
        .attr('x', textConfig.x)
        .attr('y', textConfig.y)
        .text(textConfig.content);

    if (textConfig.styleClass) {
        text.style(textConfig.styleClass);
    }

    return text;
}
//end 画文字 =======================

//start 画线 =======================
function drawLine(container, lineConfig) {
    var g = container.append('g');

    var lineConfig = lineConfig || {x1: 0, y1: 0, x2: 100, y2: 0, styleClass: ''};

    var line = g.append('line')
        .attr('x1', lineConfig.x1)
        .attr('y1', lineConfig.y1)
        .attr('x2', lineConfig.x2)
        .attr('y2', lineConfig.y2);

    if (lineConfig.styleClass) {
        line.style(lineConfig.styleClass);
    }

    return line;
}
//end 画线 =======================
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//end 图形渲染函数
//***************************************************************************























// //start load graph by different search mode ##############
// //single company search
// function loadSingleCompanyGraph(firstSearchBox) {
//     console.log(firstSearchBox);
// }
//
// //associate company search
// function loadAssociateCompanyGraph(firstSearchBox, secondSearchBox, searchDimension) {
//     console.log(firstSearchBox);
//     console.log(secondSearchBox);
//     console.log(searchDimension);
// }
//
// //batch company search
// //associate company search
// function loadBatchCompanyGraph(firstSearchBox, searchDimension) {
//     console.log(firstSearchBox);
//     console.log(searchDimension);
// }
//
// //end load graph by different search mode ##############

//根据不同类型力图调整引力、斥力大小
function updateForceConfig(charge, gravity) {
    this.graphConfig.charge = charge;
    this.graphConfig.gravity = gravity;
}

// function prepareSeedNode(forceData, dataSelected) {
//     var seedNodeArray = forceData.nodes.filter(function(node) {
//         return node.properties['公司名称'] == '上海美特斯邦威服饰股份有限公司';
//     });
//     // console.log(seedNodeArray[0]);
//     dataSelected.nodes.push(seedNodeArray[0]);
// }

// 测试下探展开功能简单版
// function simpleExplor() {
//     var svg = iniSvg(this.graphConfig, 'vizContainer');
//     simpleExplorableForce.render(forceData, dataSelected, svg, this.graphConfig);
// }

//初始化绘制图表调用函数=================================
function loadGraph() {
    var filtedData = filterByRelationType(this.forceData, this.forceData.linksTypeSet.values());
    // var filtedDataIndexed = addIndexForceData(filtedData);
    var filtedDataIndexed = vv.data.addIndexOfForceData(filtedData);

    var svg = iniSvg(this.graphConfig, 'vizContainer');

    var mouseTooltip = vv.ini.createMouseTooltip('mouseTooltip');

    generateLegency(svg);

    // drawForce(filtedDataIndexed, svg, this.graphConfig, mouseTooltip);
    // forceRender.renderForceGraph(forceData, filtedDataIndexed, svg, this.graphConfig, mouseTooltip); //加载使用外部绘图组件
}
//==============================================



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
        // 双击载入后d3.event.scale自动增加1，有问题，双击是2倍放大事件？
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

// // start 初始化力图布局数据
// function iniForceData(rawData) {
//     var forceData = {};
//     forceData.links = [];
//     forceData.nodes = [];
//     //节点链接的边列表
//     forceData.nodesConnectLinksDict = {};
//     // 节点id与节点本身的对应词典，根据id查询nodes本身
//     forceData.idNodesDict = {};
//
//     var nodesIdSet = d3.set();
//     // ["投资", "法定代表人", "任职", "直系亲属"]
//     forceData.linksTypeSet = d3.set();
//
//     forceData.riskInfo = {}; //风险企业信息
//     forceData.riskInfo.highRisk = [];
//     forceData.riskInfo.normalRisk = [];
//     forceData.riskInfo.lowRisk = [];
//
//     rawData.forEach(function(d) {
//         // iniLinks(d, forceData.linksTypeSet, forceData.links);
//         iniNodes(d, nodesIdSet, forceData.nodes, forceData.nodesConnectLinksDict, forceData.idNodesDict);
//         iniLinks(d, forceData.linksTypeSet, forceData.links, forceData.nodesConnectLinksDict);
//     });
//
//     //筛选风险企业信息
//     forceData.nodes.forEach(function(d) {
//         // console.log(d);
//         if (d.label=="Company") {
//             if (d.properties.hasOwnProperty('风险评级')) {
//                 // console.log(d);
//                 if (d.properties['风险评级']=='高') {
//                     forceData.riskInfo.highRisk.push(d);
//                 } else if (d.properties['风险评级']=='中') {
//                     forceData.riskInfo.normalRisk.push(d);
//                 } else if (d.properties['风险评级']=='低') {
//                     forceData.riskInfo.lowRisk.push(d);
//                 }
//             }
//         }
//     });
//
//     // console.log(forceData.riskInfo);
//
//     return forceData;
// }
// // end 初始化力图布局数据
//
// // start 初始化节点数据
// function iniNodes(d, nodesIdSet, nodesHolder, nodesConnectLinksDict, idNodesDict) {
//     // console.log(d);forceData.nodesConnectLinksDict
//     var nodesArrayData = d.graph.nodes;
//     var linksId = d.graph.relationships.id;
//
//     for(var i = 0; i<2; i++) {
//         var nodeId = nodesArrayData[i].id;
//         if (!nodesIdSet.has(nodeId)) {
//             nodesIdSet.add(nodeId);
//             // console.log(nodesArrayData[i]);
//             var singleNode = {};
//
//             //初始化记录节点连接的线条
//             nodesConnectLinksDict[nodeId] = d3.set();
//             // singleNode.linksNumber.push(linksId);
//
//             singleNode.id = nodesArrayData[i].id;
//             singleNode.label = nodesArrayData[i].labels[0];
//             singleNode.properties = nodesArrayData[i].properties;
//             // if (singleNode.properties.hasOwnProperty('风险指数')) {
//             //     console.log('got risk record');
//             // }
//             nodesHolder.push(singleNode);
//
//             // 创建以id为索引的节点字典
//             idNodesDict[singleNode.id] = singleNode;
//             // console.log(idNodesDict);
//
//
//         }
//
//     }
// }
// // end 初始化节点数据
//
// // start 初始化边数据
// function iniLinks(d, linksTypeSet,linksHolder, nodesConnectLinksDict) {
//     // console.log(d);
//     // var nodesArrayData = d.graph.nodes;
//     var linksData = d.graph.relationships[0];
//     // console.log(linksData);
//     var singleLink = {};
//     singleLink.source = linksData.startNode;
//     singleLink.target = linksData.endNode;
//     singleLink.id = linksData.id;
//     singleLink.type = linksData.type;
//     singleLink.properties = linksData.properties;
//
//     nodesConnectLinksDict[singleLink.source].add(singleLink.id);
//     nodesConnectLinksDict[singleLink.target].add(singleLink.id);
//
//     if (!linksTypeSet.has(singleLink.type)) {
//         linksTypeSet.add(singleLink.type);
//     }
//
//     linksHolder.push(singleLink);
// }
// // end 初始化边数据 ===============================



// });
