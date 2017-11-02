<template>
    <!-- <div id="search"> -->
        <form class="navbar-form navbar-right" role="search">
            <div class="form-group">
                <select class="form-control" v-model="">
                    <option selected  value="single">单个主体</option>
                    <option  value="multi">关联主体</option>
                </select>
            </div>
            <div class="form-group">
                <select class="form-control" v-model="">
                    <option selected  value="1">一维</option>
                    <option  value="2">二维</option>
                    <option  value="3">三维</option>
                    <option  value="4">四维</option>
                    <option  value="5">五维</option>
                    <option  value="6">六维</option>
                    <option  value="7">七维</option>
                </select>
            </div>
            <div class="form-group">
                <input type="text" class="form-control" placeholder="Search">
            </div>
            <button type="submit" class="btn btn-default">Submit</button>
        </form>
    <!-- </div> -->
</template>

<script>
export default {
  data () {
    return {
        searchMode: {
            single: '单个主体',
            multi: '关联主体',
            batch: '批量主体'
        },
        searchDimension: {
            1: '一维',
            2: '二维',
            3: '三维',
            4: '四维',
            5: '五维',
            6: '六维',
            7: '七维'
        }
    }
  }
}
</script>

<style>
.searchOption {
    display: inline-block;
}
</style>
