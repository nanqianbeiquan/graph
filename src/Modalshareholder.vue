<template>
    <div id="modalshareholder">
        <div class="modal" id="shareholdermodal" tabindex="-1">
            <div class="modal-dialog" id="shareholder-modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title modalShareholderTitle">公司股东详细列表</h4>
                    </div>
                    <div class="modal-body">
                        <div>
                            <table class="table table-hover">
                                <tr>
                                    <td>股东类型</td>
                                    <td>股东</td>
                                    <td>证照/证件类型</td>
                                    <td>认缴出资额（万元）</td>
                                    <td>实缴出资额（万元）</td>
                                </tr>
                                <tr v-for="shareholder in nodeInfo.shareholder">
                                    <td>{{shareholder['shareholder_type']}}</td>
                                    <td>{{shareholder['shareholder_name']}}</td>
                                    <td>{{shareholder['shareholder_certificationtype']}}</td>
                                    <td>{{shareholder['subscripted_amount']}}</td>
                                    <td>{{shareholder['actualpaid_amount']}}</td>
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
    .modalShareholderTitle{
        text-align: center;
    }
    @media (min-width: 768px){
        #shareholder-modal-dialog{
            width: 80%;
        }
    }

</style>
