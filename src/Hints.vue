<template>
    <div id="hints">
        <div id='userHints' class="alert alert-warning alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <strong>小提示：</strong>拖动圆点，可以固定在新位置
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      tips: [
          '拖动圆点，可以固定在新位置',
          '筛选功能，查看不同节点和关系'
      ]
    }
  }
}
</script>

<style>
/*body {
  font-family: Helvetica, sans-serif;
}*/
</style>
