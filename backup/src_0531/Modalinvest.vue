<template>
    <div id="modalinvest">
        <div class="modal fade" id="mymodal">
            <div class="modal-dialog" id="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" id="closeCluster" @click='clickCloseButton'><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <!--
                        <h4 class="modal-title">模态弹出窗标题</h4>
                        -->
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
                    </div>
                    <div class="modal-body">
                        <!-- 投资关系圆形树图容器-->
                        <div id="clusterContainer"></div>
                    </div>
                    <!--
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary">保存</button>
                    </div>
                    -->
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
        clickCloseButton: function() {
            this.$dispatch('closeButtonClicked');
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
    .modal-body{
        font-size: 12px;
        color: #000000;
    }
    .modal-dialog{
        margin: 20px auto !important;
    }
</style>
