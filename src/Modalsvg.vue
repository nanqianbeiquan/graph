<template>
    <div id="modelSvgComponent">
        <div class="modal fade" id="modelSvg" tabindex="-1" role="dialog" aria-labelledby="legalInfoWindowLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h5 class="modal-title" id="legalInfoWindowLabel">提示：如需svg格式，请在下方图片点击鼠标右键，选择“图片另存为”。</h5>
                    </div>
                    <div class="modal-body leaglDocument">
                        <div id="svgContainer"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" @click='clickExportPngButton'>导出PNG格式图片</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">返回</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    // props: ['svgSource'],
    data () {
        return {

        }
    },
    methods: {
        clickExportPngButton: function() {
            this.$dispatch('exportPngCalled');
        }
    }
}
</script>

<style>
#legalInfoWindowLabel {
    font-size: 12px;
    font-family: 'Microsoft Yahei';
    font-weight: bold;
    color: #999;
    text-align: center;
}

.leaglDocument {
    font-size: 14px;
    line-height: 2em;
}

#svgContainer {
    text-align: center;
}
</style>
