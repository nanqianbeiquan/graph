<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8" import="java.util.*" %>
<%@page isELIgnored="false"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>棱镜征信：关系拓扑图</title>
</head>
<body>
    <!-- 模态框 -->
    <Modalinfo :node-Info='nodeInfo'></Modalinfo>
    <!-- 导出图片模态框 -->
    <Modalsvg :disable-Export-Svg='disableExportSvg'></Modalsvg>
    <!-- 导航栏 -->
    <Navbtp :search-Form='searchForm' :is-Single-Search-Mode='isSingleSearchMode' :is-Multi-Search-Mode='isMultiSearchMode' :options-Config='optionsConfig'></Navbtp>
    <div class="container-fluid">
        <div class="row">
            <div class="col-xs-12 col-sm-4 col-md-3 col-lg-3 sidebar">
                <div id="sidepanel">
                    <!-- 功能提示栏 -->
                    <!-- <Hints></Hints> -->
                    <!-- 数据筛选 -->
                    <div id="filterBoard">
                        <Datafilter :selected-Status='selectedStatus' :check-Keys='getLinksTypeCheckboxesKeys' :menu-Key-Name-List='menuKeyNameList'></Datafilter>
                    </div>
                    <!--风险提示 -->
                    <!-- <Risktable :risk-Info='riskInfo'></Risktable> -->
                    <Nodeinfo :node-Info='nodeInfo'></Nodeinfo>
                    <!--风险分析 -->
                    <Riskanalyse :node-Info='nodeInfo' :risk-Info='riskInfo'></Riskanalyse>
                </div>
            </div>
            <div class="col-xs-12 col-sm-8 col-sm-offset-4 col-md-9 col-md-offset-3 col-lg-9 col-lg-offset-3 main">
				<div id="vizContainer"></div>
			</div>
        </div>
    </div>
    <script src="js/build.js"></script>
</body>
</html>
