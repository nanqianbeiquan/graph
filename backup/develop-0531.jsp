<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8" import="java.util.*" %>
<%@page isELIgnored="false"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <title>棱镜征信：关系拓扑图</title>
    <style media="screen">
        .spinner {
            /*margin: 30px auto;*/
            margin-top: 200px;
            margin-right: auto;
            margin-bottom: 30px;
            margin-left: auto;
            width: 50px;
            height: 30px;
            text-align: center;
            font-size: 10px;
        }

        .spinner > div {
            /*background-color: #67CF22;*/
            background-color:teal;
            height: 100%;
            width: 6px;
            display: inline-block;

            -webkit-animation: stretchdelay 1.2s infinite ease-in-out;
            animation: stretchdelay 1.2s infinite ease-in-out;
        }

        .spinner .rect2 {
            -webkit-animation-delay: -1.1s;
            animation-delay: -1.1s;
        }

        .spinner .rect3 {
            -webkit-animation-delay: -1.0s;
            animation-delay: -1.0s;
        }

        .spinner .rect4 {
            -webkit-animation-delay: -0.9s;
            animation-delay: -0.9s;
        }

        .spinner .rect5 {
            -webkit-animation-delay: -0.8s;
            animation-delay: -0.8s;
        }

        @-webkit-keyframes stretchdelay {
            0%, 40%, 100% { -webkit-transform: scaleY(0.4) }
            20% { -webkit-transform: scaleY(1.0) }
        }

        @keyframes stretchdelay {
            0%, 40%, 100% {
            transform: scaleY(0.4);
            -webkit-transform: scaleY(0.4);
            }  20% {
            transform: scaleY(1.0);
            -webkit-transform: scaleY(1.0);
            }
        }

        .loadDesc {
            text-align: center;
            font-size: 12px;
            font-family: 'Microsoft Yahei';
            color: #333;
        }
    </style>
</head>
<body>
    <!-- 载入动画 -->
    <div id="loader">
        <div class="spinner">
            <div class="rect1"></div>
            <div class="rect2"></div>
            <div class="rect3"></div>
            <div class="rect4"></div>
            <div class="rect5"></div>
        </div>
        <div class="loadDesc">
            数据正在载入，请稍候...
        </div>
    </div>

    <!-- 投资关系模态框 -->
    <Modalinvest ></Modalinvest>
    <!-- 模态框 -->
    <Modalinfo :node-Info='nodeInfo'></Modalinfo>
    <!-- 导出图片模态框 -->
    <Modalsvg :disable-Export-Svg='disableExportSvg'></Modalsvg>
    <!-- 导航栏 -->
    <Navbtp :search-Form='searchForm' :is-Single-Search-Mode='isSingleSearchMode' :is-Multi-Search-Mode='isMultiSearchMode' :search-Box-Placeholder='searchBoxPlaceholder' :options-Config='optionsConfig'></Navbtp>
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
    <script src="js/develop.js"></script>
</body>
</html>
