<template>
    <div id="modalnews">
        <div class="modal" id="newsmodal" tabindex="-1">
            <div class="modal-dialog" id="news-modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title modalNewsTitle">公司新闻舆情提炼</h4>
                    </div>
                    <div class="modal-body">
                        <div id="wordCloudContainer"></div>
                        <div id="newsList">
                            <h5 class="newsListTitle">新闻列表</h5>
                            <table class="table table-condensed">
                                <tr>
                                    <td>日期</td>
                                    <td>新闻标题</td>
                                </tr>
                                <tr>
                                    <td>2016-01-01</td>
                                    <td>国务院一号令</td>
                                </tr>
                                <tr>
                                    <td>2016-02-02</td>
                                    <td>高管跑路</td>
                                </tr>
                                <tr>
                                    <td>2016-03-09</td>
                                    <td>民工讨工资</td>
                                </tr>
                                <tr>
                                    <td>2016-05－01</td>
                                    <td>劳动节放假一周</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="clearFloat"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" @click="refreshWordCloudButton">刷新</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">返回</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
    </div>
</template>

<script>
export default {
    props: [],
    data () {
        return {

        }
    },
    methods: {
        // clickCloseButton: function() {
        //     this.$dispatch('closeButtonClicked');
        // }
        refreshWordCloudButton:function(){
            this.$dispatch('refreshWordCloudClicked');
        }
    }
}
</script>

<style>
    #wordCloudContainer{
        float: left;
        border-right:1px #aaaaaa solid;
    }
    #newsList{
        float: left;
    }
    .clearFloat{
        clear:both;
        height: 10px;
    }
    .newsListTitle{
        width: 100%;
        text-align: center;
    }
    .modalNewsTitle{
        text-align: center;
    }
</style>
