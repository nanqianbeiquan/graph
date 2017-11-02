<template>
<div id='nodeinfo'>
    <div class="panel-group" id="accordionInfo" role="tablist" aria-multiselectable="true">
        <div id="riskBoardCompanyName">{{nodeInfo.basicInfo["公司名称"]}}</div>
        <div id="riskBoardTitle">公司详情</div>
        <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingOne">
                <h5 class="panel-title">
                    
                    <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseOneInfo" aria-expanded="false" aria-controls="collapseOneInfo">
                    工商登记信息<span class="caret"></span>
                    </a>
                
                    <!-- <a href="#" class='moreInfo'>更多...</a> -->
                    <!--
                    <ol class="breadcrumb" id="breadcrumbNodeinfo">
                        <li>
                            <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseOneInfo" aria-expanded="false" aria-controls="collapseOneInfo">工商登记信息</a>
                        </li>
                        <li>
                            <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseOneInfo" aria-expanded="false" aria-controls="collapseOneInfo">股东</a>
                        </li>
                        <li>
                            <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseOneInfo" aria-expanded="false" aria-controls="collapseOneInfo">变更</a>
                        </li>
                        <li>
                            <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseOneInfo" aria-expanded="false" aria-controls="collapseOneInfo">主要成员</a>
                        </li>
                    </ol> 
                    -->
                </h5>
            </div>
            <div id="collapseOneInfo" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
                <div class="panel-body">
                    <table class="riskinfo table table-condensed">
                    <!--
                        <tr>
                            <td>公司名称</td>
                            <td>{{nodeInfo.basicInfo["公司名称"]}}</td>
                        </tr>
                    -->
                        <tr>
                            <td>成立时间</td>
                            <td>{{nodeInfo.basicInfo["成立时间"]}}</td>
                        </tr>
                        <tr>
                            <td>登记状态</td>
                            <td>{{nodeInfo.basicInfo["登记状态"]}}</td>
                        </tr>
                        <tr>
                            <td>注册资本</td>
                            <td>{{nodeInfo.basicInfo["注册资本"] | companyCapitalFormat}}</td>
                            <!-- <td>{{nodeInfo.basicInfo["注册资本"]}}</td> -->
                        </tr>
                        <tr>
                            <td>注册号</td>
                            <td>{{nodeInfo.basicInfo["注册号"]}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingTwo">
                <h5 class="panel-title">
                    
                    <a role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseTwoInfo" aria-expanded="true" aria-controls="collapseTwoInfo">
                    司法信息<span class="caret"></span>
                    </a>
                    
                    <!-- <a href="#" class='moreInfo'>更多...</a> -->
                    <!--
                    <ol class="breadcrumb" id="breadcrumbLegal">
                        <li>
                            <a role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseTwoInfo" aria-expanded="true" aria-controls="collapseTwoInfo">司法信息</a>
                        </li>
                        <li>
                            <a role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseTwoInfo" aria-expanded="true" aria-controls="collapseTwoInfo">开庭公告</a></li>
                        <li>
                            <a role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseTwoInfo" aria-expanded="true" aria-controls="collapseTwoInfo">执行</a>
                        </li>
                        <li>
                            <a role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseTwoInfo" aria-expanded="true" aria-controls="collapseTwoInfo">失信被执行</a>
                        </li>
                    </ol> 
                    -->
                </h5>
            </div>
            <div id="collapseTwoInfo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                <div class="panel-body">
                    <table class="riskinfo table table-condensed">
                        <tr>
                            <td class='legalInfoTime'>判决时间</td>
                            <td class='legalInfoCate'>诉讼类型</td>
                            <td class='legalInfoName'>案件名称</td>
                        </tr>
                        <tr v-for='suit in nodeInfo.leaglInfo'>
                            <td>{{suit['判决时间']}}</td>
                            <td>{{suit['诉讼类型']}}</td>
                            <!-- <td>{{suit['案件名称']}}</td> -->
                            <td>
                                <button type="button" class="opacityButton" data-toggle="modal" data-target="#legalInfoWindow" v-on:click="getLegalInfoViaJid(suit.jid)">
                                    <!-- summaryLegalTitle是过滤器，截取前14个字 -->
                                    {{suit['案件名称'] | summaryLegalTitle}}
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <!-- <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingThree">
                <h5 class="panel-title">
                    <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordionInfo" href="#collapseThreeInfo" aria-expanded="false" aria-controls="collapseThreeInfo">
                    其他信息
                    </a>
                </h5>
            </div>
            <div id="collapseThreeInfo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
                <div class="panel-body">
                    <table class="riskinfo table table-condensed">
                        <tr>
                            <td>a</td>
                            <td>a</td>
                            <td>a</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div> -->
    </div>
</div>
</template>

<script>
export default {
    props: ['nodeInfo'],
    data () {
        return {
            clickedSuitTitle: ''
        }
    },
    methods: {
        getLegalInfoViaJid: function(jid) {
            console.log(jid);
            // console.log(this.nodeInfo);
            // $.post("getJudgmentInfo",
            //     {
            //         judgmentId: jid
            //         // judgmentId: "160108134632348300000007"
            //         // compName: '中央汇金投资有限责任公司'
            //     },
            //     function(data,status){
            //         console.log(data);
            //     },
            //     "json"
            // );
            this.clickedSuitTitle = jid; //该参数将传递给父组件
            this.$dispatch('clickedSuitTitle', this.clickedSuitTitle);

        }
    },
    //根据注册资本显示状态，确定万元字样是否显示
    capitalFormat: function() {
        if (this.nodeInfo.basicInfo['注册资本'] != '') {
            return '万元';
            // multiBoxVisible = true;
        } else {
            // multiBoxVisible = false;
            return '';
        }
    }
}
</script>

<style>
.legalInfoTime {
    width: 85px;
}

.legalInfoCate {
    width: 60px;
}

.legalInfoName {
    text-align: center;
}

.opacityButton {
    border: none;
    background: none;
    color: #ccc;
    height: 24px;
    font-size: 10px;
    cursor: pointer;
}

.moreInfo {
    float: right;
}

#accordionInfo .caret{
    float: right;
    margin-top: 4.5px;
}

#breadcrumbNodeinfo{
    margin-top: 0;
    margin-bottom: 0;
    background-color: transparent;
    padding: 0 0;
    border-radius: 0;
}
#breadcrumbLegal{
    margin-top: 0;
    margin-bottom: 0;
    background-color: transparent;
    padding: 0 0;
    border-radius: 0;
}
.breadcrumb>li+li:before{
    color: #f4d9ba !important;
}

</style>
