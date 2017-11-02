<template>
<div id='risktable'>
    <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
        <div id="riskBoardTitle">风险预警</div>
        <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingOne">
                <h5 class="panel-title">
                    <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                    高风险企业
                    </a>
                </h5>
            </div>
            <div id="collapseOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
                <div class="panel-body">
                    <table class="riskinfo table table-condensed">
                        <tr>
                            <td>公司名称</td>
                            <td>风险评级</td>
                            <td>风险指数</td>
                        </tr>
                        <tr v-for='company in riskInfo.highRisk'>
                            <td>{{company.properties['公司名称']}}</td>
                            <td>{{company.properties['风险评级']}}</td>
                            <td><span class="badge highRisk">{{company.properties['风险指数']}}</span></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingTwo">
                <h5 class="panel-title">
                    <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                    中等风险企业
                    </a>
                </h5>
            </div>
            <div id="collapseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                <div class="panel-body">
                    <table class="riskinfo table table-condensed">
                        <tr>
                            <td>公司名称</td>
                            <td>风险评级</td>
                            <td>风险指数</td>
                        </tr>
                        <tr v-for='company in riskInfo.normalRisk'>
                            <td>{{company.properties['公司名称']}}</td>
                            <td>{{company.properties['风险评级']}}</td>
                            <td><span class="badge nomarlRisk">{{company.properties['风险指数']}}</span></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingThree">
                <h5 class="panel-title">
                    <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    低风险企业
                    </a>
                </h5>
            </div>
            <div id="collapseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
                <div class="panel-body">
                    <table class="riskinfo table table-condensed">
                        <tr>
                            <td>公司名称</td>
                            <td>风险评级</td>
                            <td>风险指数</td>
                        </tr>
                        <tr v-for='company in riskInfo.lowRisk'>
                            <td>{{company.properties['公司名称']}}</td>
                            <td>{{company.properties['风险评级']}}</td>
                            <td><span class="badge lowRisk">{{company.properties['风险指数']}}</span></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: ['riskInfo'],
    data () {
        return {

        }
    }
}
</script>

<style>
/*body {
  font-family: Helvetica, sans-serif;
}*/
</style>
