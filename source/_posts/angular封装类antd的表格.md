---
title: angular封装类antd的表格
date: 2017-11-23 10:15:23
tags: angular react vue antd
---

## table功能
    可排序，可自定义样式，可固定头部，内置类vue钩子函数

### 使用方法

html
``` html
<my-table 
    datasource="pageList.res.data.data" 
    column="column"
    tr-click="loadDetail"
    scroll-y="tableScrollY"
></my-table>
```

js
``` js
$scope.column = [
    {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: '35%',
        align: 'center',
        sort: true
    }, {
        title: '时间',
        dataIndex: 'beginTime',
        width: '35%',
        align: 'center',
        sort: true,
        render(text, record, index) {
            return text && new Date(text).Format('yyyy-MM-dd')                       
        }
    }, {
        title: '损失比例',
        dataIndex: 'eqreduce',
        width: '30%',
        align: 'right',
        sort: true,
        render (text, record) {
            return text + '%'
        }
    }
]
```

### 实现方法

html
``` html
<div class="my-table" ng-class="{'scroll-y': scrollY}">
    <div class="my-table-head">
        <table>
            <thead>
                <th 
                    ng-repeat="item in column"
                    style="width:{{ item.width }};text-align: {{ item.align || 'left' }};cursor: {{item.sort ? 'pointer': ''}};"
                    ng-click="sort(item.sort, item.dataIndex)"
                    ng-bind-html="item.title | to_trusted"
                    >
                    <span ng-if="item.dataIndex == orderByDataIndex">
                        <i ng-if="!orderBy" class="fa fa-angle-up"></i>
                        <i ng-if="orderBy" class="fa fa-angle-down"></i>
                    </span>
                </th>
            </thead>
        </table>
    </div>
    <table ng-if="!datasource[0]">
        <tbody>
            <tr>
                <td style="text-align: center;">暂无数据</td>
            </tr>
        </tbody>
    </table>
    <div class="my-table-body" style="max-height: {{scrollY + 'px'}}">
        <table>
            <tbody>
                <tr 
                    ng-repeat="outerItem in datasource track by $index" 
                    ng-init="outerIndex=$index"
                    ng-click="trClick(outerItem, outerIndex)">
                    <td 
                        ng-repeat="item in column"
                        ng-bind-html="(item.render ? item.render(outerItem[item.dataIndex], outerItem, outerIndex) : outerItem[item.dataIndex]) | to_trusted" 
                        style="width:{{ item.width }};text-align: {{ item.align }};"
                        >
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

css
``` less
.my-table {
    table {
        width: 100%;
        table-layout: fixed;
    }
    .my-table-head {
        th {
            position: relative;

            span {
                position: relative;
                right: 0;
                top: 0;
                width: 30px;
                height: 100%;

                i {
                    position: absolute;
                    width: 100%;
                    height: 10px;
                    right: 0;
                    font-size: 16px;
                    top: 50%;
                    margin-top: -8px;
                }
            }
        }
    }
    &.scroll-y {
        .my-table-head {
            padding-right: 17px;
        }
        .my-table-body {
            overflow-y: auto;
            background-color: #fff;
        }
    }
}
```

js

``` js

app.filter('to_trusted', ['$sce', $sce => v => $sce.trustAsHtml(v)])

/**
 * [表格]
 * column: '=',   列
    datasource: '=',   行
    trClick: '=',    tr-click='点击行要执行的函数'  可不传
    scrollY: '=',   滚动部分的高度  不传不滚动
    trackBy: '@',   默认根据哪个字段排序   不传不排序
   beforeCreate: '=',       类vue生命周期
    created: '=',           类vue生命周期
    beforeMount: '=',       类vue生命周期
    mounted: '=',           类vue生命周期
    beforeUpdate: '=',      类vue生命周期
    updated: '=',           类vue生命周期
    beforeDestroy: '=',     类vue生命周期
    destroyed: '=',         类vue生命周期
 */
app.directive('myTable', ['$timeout', 'myAjaxData', ($timeout, myAjaxData) => ({
    restrict: 'E',
    transclude: !0,
    replace: !0,
    scope: {
        column: '=',
        datasource: '=',
        trClick: '=',
        scrollY: '=',
        trackBy: '@',
        beforeCreate: '=',
        created: '=',
        beforeMount: '=',
        mounted: '=',
        beforeUpdate: '=',
        updated: '=',
        beforeDestroy: '=',
        destroyed: '=',
    },
    templateUrl: baseUrl + '/tpl/publicComponent/myTable.jsp',
    link ($scope, $element) {
        $scope.beforeMount && $scope.beforeMount($scope, $element)
        $timeout(() => {
            $scope.mounted && $scope.mounted($scope, $element)
            $scope.isMounted = !0
        }, 0)
    },
    controller ($scope, $element) {
        $scope.beforeCreate && $scope.beforeCreate($scope, $element)

        $scope.orderBy = !0
        $scope.sort = (sort, dataIndex) => {
            if (void 0 === $scope.datasource[0]) return
            if (!sort) return
            if (dataIndex !== $scope.orderByDataIndex) {
                $scope.orderByDataIndex = dataIndex
                $scope.orderBy = !0
            }
            if (typeof $scope.datasource[0][dataIndex] === 'number') {
                $scope.datasource.sort( (a, b) => {
                    return $scope.orderBy ? a[dataIndex] - b[dataIndex] : b[dataIndex] - a[dataIndex]
                })
            } else {
                $scope.orderBy && $scope.datasource.sort((a, b) => {
                    return do {
                        if (null === a[dataIndex] || null === b[dataIndex]) -1
                        else if (a[dataIndex].length == b[dataIndex].length) b[dataIndex].localeCompare(a[dataIndex])
                        else b[dataIndex].length - a[dataIndex].length
                    }
                })
                $scope.datasource.reverse()
            }
            $scope.gen.next($scope.orderByDataIndex)
            $scope.orderBy = !$scope.orderBy
        }
        
        $scope.$watch('datasource', (newValue, oldValue) => {
            $scope.gen = (function * () {
                $scope.orderByDataIndex = void 0
                $scope.orderByDataIndex = yield
            })()
            $scope.gen.next()
            $timeout(() => {
                if ($scope.orderByDataIndex) return
                $scope.gen.next(void 0)
                if ($scope.trackBy) $scope.sort(!0, $scope.trackBy)
                if ($scope.scrollY) {
                    const _$element = $($element)
                    if (_$element.find('.my-table-body').height() > _$element.find('.my-table-body table').height()) {
                        _$element.find('.my-table-head').css('padding-right', '0px')
                    } else {
                        _$element.find('.my-table-head').css('padding-right', '17px')
                    }
                }
            }, 0)
        })

        $scope.$watchGroup(['datasource', 'column'], async (newValue, oldValue, $scope) => {
            if (!$scope.isMounted) return
            $scope.beforeUpdate && $scope.beforeUpdate($scope, $element)
            await myAjaxData.timeout(0)
            $scope.updated && $scope.updated($scope, $element)
        })

        $element.on('$destroy', async () => {
            $scope.beforeDestroy && $scope.beforeDestroy($scope, $element)
            await myAjaxData.timeout(0)
            $scope.destroyed && $scope.destroyed($scope, $element)
        })

        $scope.created && $scope.created($scope, $element)
    }
})])

```
