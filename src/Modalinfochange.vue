<template>
    <div id="modalinfochange">
        <div class="modal" id="infochangemodal" tabindex="-1">
            <div class="modal-dialog" id="infochange-modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title modalInfoChange">公司变更信息</h4>
                    </div>
                    <div class="modal-body">
                        <div>
                            <table class="table table-hover">
                                <tr>
                                    <td class="infoChangeDate">变更日期</td>
                                    <td class="infoChangeEvents">变更事项</td>
                                    <td>变更前内容</td>
                                    <td>变更后内容</td>
                                </tr>
                                <tr v-for="changed in nodeInfo.changed">
                                    <td>{{changed['changedannouncement_date']}}</td>
                                    <td>{{changed['changedannouncement_events']}}</td>
                                    <td>{{changed['changedannouncement_before']}}</td>
                                    <td>{{changed['changedannouncement_after']}}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">返回</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
    </div>
</template>

<script>
export default {
    props: ['nodeInfo'],
    data () {
        return {

        }
    },
    methods: {
        // clickCloseButton: function() {
        //     this.$dispatch('closeButtonClicked');
        // }
    }
}
</script>

<style>
    .modalInfoChange{
        text-align: center;
    }
    @media (min-width: 768px){
        #infochange-modal-dialog{
            width: 80%;
        }
    }
    .infoChangeDate{
        width: 15%;
    }
    .infoChangeEvents{
        width: 15%;
    }

</style>
