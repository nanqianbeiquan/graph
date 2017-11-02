<template>
<div id='riskanalyse'>
    <div class="panel-group" id="accordionRiskAnalyse" role="tablist" aria-multiselectable="true">
        <div id="riskBoardTitle">风险分析</div>
        <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingOne">
                <h5 class="panel-title">
                    <a class="collapsed" role="button" id="radarClick" data-toggle="collapse" data-parent="#accordionRiskAnalyse" href="#" aria-expanded="false" aria-controls="collapseOneRiskAnalyse">
                    企业风险提示<span class="caret"></span>
                    </a>
                </h5>
            </div>
            <div id="collapseOneRiskAnalyse" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
                <div class="panel-body">
                <!--
                    <table class="riskinfo table table-condensed">
                        <tr>
                            <td>公司名称</td>
                            <td>风险评级</td>
                        </tr>
                        <tr>
                            <td>{{nodeInfo.basicInfo["公司名称"]}}</td>
                            <td>{{nodeInfo.basicInfo["风险评级"]}}</td>
                        </tr>
                    </table>
                -->
                    <!-- 风险分值雷达图容器 -->
                   
                    <h6>{{nodeInfo.basicInfo["公司名称"]}}</h6>
                    <div id="radarContainer"></div>
                    
                </div>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingTwo">
                <h5 class="panel-title">
                    <a role="button" id="associateCompClick" data-toggle="collapse" data-parent="#accordionRiskAnalyse" href="#" aria-expanded="true" aria-controls="collapseTwoRiskAnalyse">
                    关联风险提示<span class="caret"></span>
                    </a>
                </h5>
            </div>
            <div id="collapseTwoRiskAnalyse" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                <div class="panel-body">
                    <table class="riskinfo table table-condensed">
                        <!-- <tr>
                            <td>此企业关联组共涉及_家企业，平均注册资本_元，其中注册资本100万及以下的_家，100-500万_家，500-1000万_家，1000万-1亿_家，1亿以上_家。关联组企业的平均成立年限为_年，其中1年及以下_家，1-3年_家，3-5年_家，5-8年_家，8年以上_家。关联组内企业风险等级，高风险_家，中风险_家，低风险_家，安全_家。</td>
                        </tr> -->
                        <tr>
                            <td>关联企业数量</td>
                            <td>{{riskInfo.analyse.associateCompanyNumber}}家</td>
                        </tr>
                        <!-- start 注册资本 ======================== -->
                        <!-- <tr>
                            <td>平均注册资本</td>
                            <td>{{riskInfo.analyse.averageCapital}}万元</td>
                        </tr> -->
                        <tr>
                            <td>注册资本少于100万</td>
                            <td>{{riskInfo.analyse.capitalLessOneMillion}}家</td>
                        </tr>
                        <tr>
                            <td>注册资本100～500万</td>
                            <td>{{riskInfo.analyse.capitalOneToFiveMillion}}家</td>
                        </tr>
                        <tr>
                            <td>注册资本500～1000万</td>
                            <td>{{riskInfo.analyse.capitalFiveToTenMillion}}家</td>
                        </tr>
                        <tr>
                            <td>注册资本1000万～1亿</td>
                            <td>{{riskInfo.analyse.capitalTenToHunderdMillion}}家</td>
                        </tr>
                        <tr>
                            <td>注册资本大于1亿</td>
                            <td>{{riskInfo.analyse.capitalMoreThanHunderdMillion}}家</td>
                        </tr>
                        <!-- end 注册资本 ======================== -->

                        <!-- start 成立年限 ======================== -->
                        <!-- <tr>
                            <td>平均成立年限</td>
                            <td>{{riskInfo.analyse.averageYear}}年</td>
                        </tr> -->
                        <tr>
                            <td>成立1年以内</td>
                            <td>{{riskInfo.analyse.underOneYear}}家</td>
                        </tr>
                        <tr>
                            <td>成立1~3年</td>
                            <td>{{riskInfo.analyse.oneToThreeYear}}家</td>
                        </tr>
                        <tr>
                            <td>成立3~5年</td>
                            <td>{{riskInfo.analyse.threeToFiveYear}}家</td>
                        </tr>
                        <tr>
                            <td>成立5~8年</td>
                            <td>{{riskInfo.analyse.fiveToEightYear}}家</td>
                        </tr>
                        <tr>
                            <td>成立8年以上</td>
                            <td>{{riskInfo.analyse.moreThanEightYear}}家</td>
                        </tr>
                        <!-- end 成立年限 ======================== -->

                        <!-- start 风险等级 ======================== -->
                        <tr>
                            <td>高风险企业</td>
                            <td>{{riskInfo.analyse.highRisk}}家</td>
                        </tr>
                        <tr>
                            <td>中风险企业</td>
                            <td>{{riskInfo.analyse.normalRisk}}家</td>
                        </tr>
                        <tr>
                            <td>低风险企业</td>
                            <td>{{riskInfo.analyse.lowRisk}}家</td>
                        </tr>
                        <tr>
                            <td>安全企业</td>
                            <td>{{riskInfo.analyse.safe}}家</td>
                        </tr>
                        <!-- end 风险等级 ======================== -->

                        <!-- start 风险报告下载 =================== -->
                        <!-- <tr>
                            <td>风险报告下载</td>
                            <td><button type="button" id="reportDownloadButton">下载</button></td>
                        </tr> -->
                        <!-- end 风险报告下载 =================== -->

                        <!-- <tr v-for='company in riskInfo.normalRisk'>
                            <td>{{company.properties['公司名称']}}</td>
                            <td>{{company.properties['风险评级']}}</td>
                            <td><span class="badge nomarlRisk">{{company.properties['风险指数']}}</span></td>
                        </tr> -->
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: ['nodeInfo', 'riskInfo'],
    data () {
        return {

        }
    }
}
</script>

<style>
#reportDownloadButton {
    border: none;
    background-color: #dcdcdc;
    color: #333;
    font-size: 12px;
    -webkit-border-radius: 2px;
    border-radius: 2px;
}
#accordionRiskAnalyse .caret{
    float: right;
    margin-top: 4.5px;
}

</style>
