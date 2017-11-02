<template>
    <div id="datafilter">
        <div id="filterBoardTitle">筛选</div>

        <div id="nodeTypeFilterOption">
            <select class="form-control" v-model="selectedStatus.selectedNodesType">
                <option selected  value="All">全部节点</option>
                <option  value="Company">公司节点</option>
                <!-- <option  value="Person">个人节点</option> -->
            </select>
            <!-- <span>{{selectedStatus.selectedNodesType}}</span> -->
        </div>

        <div id="filter">
            <ul id="checkboxes">
                <li class="relationTypeCheckbox" v-for='type in checkKeys'>
                    <input type="checkbox" v-bind:value="type" v-model="selectedStatus.selectedLinksTypeList">
                    <label>{{menuKeyNameList[type]}}</label>
                </li>
                <!-- 临时屏蔽替代 -->
                <!-- <li class="relationTypeCheckbox">
                    <input type="checkbox" name="name" value="">
                    <label for="">投资</label>
                </li>
                <li class="relationTypeCheckbox">
                    <input type="checkbox" name="name" value="">
                    <label for="">法人</label>
                </li>
                <li class="relationTypeCheckbox">
                    <input type="checkbox" name="name" value="">
                    <label for="">任职</label>
                </li> -->
                <!-- 临时屏蔽替代 -->
            </ul>
        </div>
        <!-- <span>{{selectedStatus.selectedLinksTypeList}}</span> -->

        <div id="updateButtonContainer">
            <button type="button" @click='clickUpdateGraphButton'>筛选数据</button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['selectedStatus', 'checkKeys', 'menuKeyNameList'],
    data () {
        return {
            msg: 'Hello Vue!'
        }
    },
    methods: {
        clickUpdateGraphButton: function() {
            this.$dispatch('updateGraphWithFiltedData');
        }
    }
}
</script>

<style>
/*body {
  font-family: Helvetica, sans-serif;
}*/
</style>
