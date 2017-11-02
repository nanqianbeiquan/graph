<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-xs-12 col-sm-4 col-md-3 col-lg-2 sidebar">
                <div id="sidepanel">
                    <div id="legend">
                        图例
                    </div>
                    <div id="filter">
                        筛选查看
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-8 col-sm-offset-4 col-md-9 col-md-offset-3 col-lg-10 col-lg-offset-2 main">
				<div id="vizContainer"></div>
			</div>
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
    //   msg: 'Hello Vue!'
    }
  }
}
</script>

<style>
body {
  font-family: "Microsoft Yahei", sans-serif;
}
</style>
