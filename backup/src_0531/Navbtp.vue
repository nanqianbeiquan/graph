<template>
      <nav class="navbar navbar-inverse navbar-fixed-top">
         <div class="container-fluid">
             <!-- Brand and toggle get grouped for better mobile display -->
             <div class="navbar-header">
                 <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                     <span class="sr-only">Toggle navigation</span>
                     <span class="icon-bar"></span>
                     <span class="icon-bar"></span>
                     <span class="icon-bar"></span>
                 </button>
                 <a class="navbar-brand" href="#">棱镜征信</a>
             </div>
            <form id='searchFrom' class="navbar-form navbar-right" role="search" v-on:submit.prevent>
                <div class="form-group">
                    <select id='searchMode' class="form-control"  v-model="searchForm.searchMode">
                        <!-- <option selected='selected' class="selectPlaceHolder" value="">选择搜索模式</option> -->
                        <option selected='selected' value="single">单个公司搜索</option>
                        <option value="multi">关联公司搜索</option>
                        <option value="batch">批量公司搜索</option>
                    </select>
                </div>
                <div class="form-group">
                    <select v-if='isSingleSearchMode' id='searchDimension' class="form-control" v-model="searchForm.searchDimension">
                        <!-- <option selected='selected' class="selectPlaceHolder" value="">选择数据维度</option> -->
                        <option value="1">一度数据</option>
                        <option  value="2">二度数据</option>
                        <option  value="3">三度数据</option>
                        <option  value="4">四度数据</option>
                        <option  value="5">五度数据</option>
                        <option  value="6">六度数据</option>
                        <option selected='selected' value="7">七度数据</option>
                    </select>
                </div>
                <!-- <span>{{selectedStatus.selectedLinksTypeList}}</span> -->
                <!--
                <div class="form-group">
                    <input id='searchInputOne' type="text" class="form-control" v-bind:placeholder="searchBoxPlaceholder" v-model="searchForm.firstSearchBox" @keyup.enter='clickSearchButton'>
                    <input v-if='isMultiSearchMode' id='searchInputTwo' type="text" class="form-control" placeholder="请输入关联公司全名" v-model="searchForm.secondSearchBox" @keyup.enter='clickSearchButton'>
                </div>
                -->
                <!-- 搜索与搜索提示框============================= -->
                <div class="form-group keyword-search">
                    <input id='searchInputOne' type="text" class="form-control" v-bind:placeholder="searchBoxPlaceholder" v-model="searchForm.firstSearchBox" @keyup.enter='clickSearchButton' autocomplete="off" value=''>
                    <input v-show='isMultiSearchMode' id='searchInputTwo' type="text" class="form-control" placeholder="请输入关键字" v-model="searchForm.secondSearchBox" @keyup.enter='clickSearchButton' autocomplete="off">
                    <div class="keywordSearchSuggest keywordSearchSuggestOne" id="keywordSearchSuggestOne">
                        <ul class="list-unstyled">
                            <!--
                            <li>上海飞马旅股权投资中心（有限合伙）</li>
                            <li>上海斯睿德信息技术有限公司</li>
                            <li>上海飞马旅股权投资中心（有限合伙）</li>
                            <li>上海斯睿德信息技术有限公司</li>
                            <li>上海飞马旅股权投资中心（有限合伙）</li>
                            <li>上海斯睿德信息技术有限公司</li>
                            -->
                        </ul>
                    </div>
                    <div class="keywordSearchSuggest keywordSearchSuggestTwo" id="keywordSearchSuggestTwo">
                        <ul class="list-unstyled">
                            <!--
                            <li>上海飞马旅股权投资中心（有限合伙）</li>
                            <li>上海斯睿德信息技术有限公司</li>
                            -->
                        </ul>
                    </div>
                </div>

                <!-- 搜索按钮============================= -->
                <button id='searchSubmit' type="button" class="btn btn-default" @click='clickSearchButton'> <span class="glyphicon glyphicon-search" aria-hidden="true"></span> 搜索</button>

                <!-- 撤销、清空按钮组============================= -->
                <div class="btn-group" role="group" aria-label="...">
                    <button id='cancelAction' type="button" class="btn btn-default" @click='clickRedoButton'><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span> 撤销</button>
                    <button id='deleteGraph' type="button" class="btn btn-default" @click='clickClearButton'><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> 清空</button>
                </div>

                <!-- 临时安放清空按钮组，撤销稳定后放回去============================= -->
                <!-- <button id='deleteGraphTemp' type="button" class="btn btn-default" @click='clickClearButton'><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> 清空</button> -->

                <!-- 棱镜按钮============================= -->
                <button id='smartAnalyse' type="button" class="btn btn-default" @click='clickSmartAnalyseButton'><span class="glyphicon glyphicon-flash" aria-hidden="true"></span> 棱镜</button>

                <!-- 截图按钮============================= -->
                <div class="dropdown" id='exportGraphButtonContainer'>
                    <button id='exportGraphButton' class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        <span class="glyphicon glyphicon-camera" aria-hidden="true"></span> 截图
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="exportGraphButton">
                        <li class="exportGraphLiContainer">
                            <button type="button" class="exportButtons" @click='exportPngClicked'>导出PNG位图</button>
                        </li>
                        <li class="exportGraphLiContainer">
                            <button type="button" class="exportButtons" @click='exportSvgClicked'>导出SVG矢量图</button>
                        </li>
                    </ul>
                </div>

                <!-- 选项设置按钮============================= -->
                <div class="dropdown" id='systemOptionsContainer'>
                    <button id='systemOptionsButton' class="btn btn-default dropdown-toggle" type="button" id="systemOptions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        <span class="glyphicon glyphicon-cog" aria-hidden="true"></span> 设置
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="systemOptions">
                        <li class="systemOptionsLiContainer">
                            <input type="checkbox" id="checkboxFullName" value='displayCompanyName' v-model='optionsConfig.optionsHandler' v-on:change='watchDisplayCompanyName'>
                            <label class='labelText' for="checkboxFullName"> 显示公司全名</label>
                        </li>
                        <li class="systemOptionsLiContainer">
                            <input type="checkbox" id="checkboxInvestPercent" value='displayInvestPercent' v-model='optionsConfig.investPercentHandler' v-on:change='watchDisplayInvestPercent'>
                            <label class='labelText' for="checkboxInvestPercent"> 显示股权比例</label>
                        </li>
                    </ul>
                </div>
            </form>
         </div><!-- /.container-fluid -->
     </nav>

</template>

<script>
export default {
    props: ['searchForm', 'isSingleSearchMode', 'isMultiSearchMode', 'searchBoxPlaceholder','disableExportSvg', 'optionsConfig'],
    data () {
        return {
            msg: 'Hello Vue!'
        }
    },
    methods: {
        clickSearchButton: function() {
            this.$dispatch('renderGraphBySearchData');
        },
        clickRedoButton: function() {
            this.$dispatch('renderGraphByRedoCalled');
        },
        clickClearButton: function() {
            this.$dispatch('clearGraphStateCalled');
        },
        clickScreenshotButton: function() {
            this.$dispatch('shotScreenCalled');
        },
        clickSmartAnalyseButton: function() {
            // console.log('clickSmartAnalyseButton');
            this.$dispatch('smartAnalyseCalled');
        },
        watchDisplayCompanyName: function() {
            this.$dispatch('changeDisplayCompanyName');
        },
        watchDisplayInvestPercent: function() {
            this.$dispatch('changeDisplayInvestPercent');
        },
        exportPngClicked: function() {
            // this.$dispatch('exportPngNeeded');
            this.$dispatch('exportPngCalled');
        },
        exportSvgClicked: function() {
            this.$dispatch('exportSvgGraphCalled');
        }
    }
}
</script>

<style>
    #searchFrom {
        margin-top: 12px;

    }

    #searchInputOne {
        -webkit-border-radius: 13px;
        border-radius: 13px;
        height: 26px;
        margin-left: 10px;
        margin-right: 10px;
        font-size: 12px;
    }

    #searchInputTwo {
        -webkit-border-radius: 13px;
        border-radius: 13px;
        height: 26px;
        /*margin-left: 10px;*/
        margin-right: 10px;
        font-size: 12px;
    }

    #searchDimension {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        width: 120px;
        background-color: #333;
        color: #fff;
        border: 0;
    }

    #searchMode {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        width: 120px;
        background-color: #333;
        color: #fff;
        border: 0;
    }

    #searchSubmit {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        background-color: steelblue;
        /*background-color: gray;*/
        border: 0;
        color: white;
    }

    #searchSubmit:hover {
        background-color: #189362;
    }

    #screenshotSubmit {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 10px;
        background-color: #189362;
        border: 0;
        color: white;
    }

    /*隐藏select展开时候的占位提示文字*/
    .selectPlaceHolder {
        display:none;
    }

    #exportGraphButtonContainer {
        display: inline-block;
    }

    #exportGraphButton {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 10px;
        background-color: #666;
        border: 0;
        color: white;
    }

    #exportGraphButton:hover {
        background-color: #189362;
    }

    .exportGraphLiContainer {
        margin-left: 20px;
        font-size: 12px;
        font-weight: normal;
        color: #fff;
        background-color: #444;
    }

    .exportButtons {
        background-color: #444;
        border: none;
        height: 24px;
        font-size: 10px;
        color: #fff;
    }

    #systemOptionsContainer {
        display: inline-block;
    }

    ul.dropdown-menu {
        background-color: #444;
    }

    #cancelAction {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 10px;
        background-color: #666;
        border: 0;
        color: white;
    }

    #cancelAction:hover {
        background-color: orange;
    }

    #deleteGraph {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 1px;
        /*margin-left: 10px;*/
        background-color: #666;
        border: 0;
        color: white;
    }

    #deleteGraph:hover {
        background-color: orange;
    }

    #deleteGraphTemp {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        /*margin-left: 1px;*/
        margin-left: 10px;
        background-color: #666;
        border: 0;
        color: white;
    }

    #deleteGraphTemp:hover {
        background-color: orange;
    }

    #smartAnalyse {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 10px;
        background-color: #666;
        border: 0;
        color: white;
    }

    #smartAnalyse:hover {
        background-color: #189362;
    }

    #systemOptionsButton {
        height: 26px;
        font-size: 12px;
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 10px;
        background-color: #666;
        border: 0;
        color: white;
    }

    #systemOptionsButton:hover {
        background-color: #189362;
    }

    .systemOptionsLiContainer {
        margin-left: 20px;
        font-size: 12px;
        font-weight: normal;
        color: #fff;
        background-color: #444;
        vertical-align: middle;
    }

    .labelText {
        font-size: 10px;
        font-weight: normal;
        color: #fff;
    }
    /* start 搜索提示框样式================================================*/
    .keyword-search{
        position: relative;
    }
    .keywordSearchSuggest{
        font-size: 12px;
        color:#666666;
        background:#FFFFFF;
        border: 1px solid #999999;
        position: absolute;
        z-index: 99;
        display: none;
    }
    @media screen and (min-width: 768px){
        .keywordSearchSuggestOne{
            left: 10px;
            width: 230px;
            top: 100%;
        }
        .keywordSearchSuggestTwo{
            left: 173.5px;
            width: 230px;
            top: 100%;
        }
    }
    @media screen and (max-width: 767px){
        .keywordSearchSuggestOne{
            left: 10px;
            width: 100%;
            top: 26px;
        }
        .keywordSearchSuggestTwo{
            left: 10px;
            width: 100%;
            top: 100%;
        }
    }
    .keywordSearchSuggest li{
        height:24px;
        overflow:hidden;
        padding-left:3px;
        line-height:24px;
        background:#FFFFFF;
        cursor:default;
    }
    .keywordSearchSuggest li.hover{
        /*color: red; */
        background: #DDDDDD;
    }
    /* end 搜索提示框样式================================================*/

</style>
