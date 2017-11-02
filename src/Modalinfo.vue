<template>
    <div id="modelinfo">
        <div class="modal fade" id="legalInfoWindow" tabindex="-1" role="dialog" aria-labelledby="legalInfoWindowLabel">
            <div class="modal-dialog  modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="legalInfoWindowLabel">{{nodeInfo.suitDetail['案件名称']}}</h4>
                        <h5 class="modal-title">
                            <span class='suitSubTitle'>判决时间: {{nodeInfo.suitDetail['判决时间']}}</span>
                            <span class='suitSubTitle'>案由: {{nodeInfo.suitDetail['案由']}}</span>
                            <span class='suitSubTitle'>最大金额: {{nodeInfo.suitDetail['最大金额']}} 元</span>
                        </h5>
                        <!-- createParagraphSymbol是换行过滤器 -->
                        <!-- <h5 class="modal-title suitResult">{{nodeInfo.suitDetail['判决结果'] | createParagraphSymbol}}</h5> -->
                        <!-- <h5 class="modal-title suitResult">{{nodeInfo.suitDetail['判决结果']}}</h5> -->
                        <h5 class="modal-title suitResult" v-for='papragraph in nodeInfo.suitDetail.suitResultArray'>
                            <p class="suitParagraph">{{papragraph.content}}</p>
                        </h5>
                    </div>
                    <div class="modal-body leaglDocument">
                        <!-- {{nodeInfo.testPara}} -->
                        {{nodeInfo.suitDetail['内容']}}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">返回</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['nodeInfo'],
    data () {
        return {

        }
    }
}
</script>

<style>
#legalInfoWindowLabel {
    font-size: 18px;
    text-align: center;
    padding-bottom: 30px;
}

.modal-title {
    color: #333;
    font-family: 'Microsoft Yahei';
}

.leaglDocument {
    font-family: 'Microsoft Yahei';
    font-size: 14px;
    line-height: 2em;
    color: #666;
}

.suitSubTitle {
    margin-right: 20px;
}

.suitResult {
    font-weight: bold;
    padding-top: 20px;
}

.suitParagraph {
    margin-top: 0px;
    margin-bottom: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
}
</style>
