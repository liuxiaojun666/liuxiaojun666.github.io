---
title: angular封装bootstrap日历插件
date: 2017-11-23 10:30:10
tags: angular bootstarp 日历
---

## 日历封装

### 功能介绍

    极大简化写法，只关注结果，添加选择周，内置类vue钩子函数

### 使用方法

html
``` html
<calendar
    calendar-type="{{'yyyy-MM-dd'}}"
    date-time="dateTime1"
    end-date="dateTime2"
></calendar>
```

js
``` js
$scope.dateTime1 = new Date((new Date).setDate((new Date).getDate() - 7))
$scope.dateTime2 = new Date
```

### 实现方法

``` js

/**
 * [日历时间]    input样式手动设置
 * dateTime: '=',       初始显示时间
    endDate: '=',       结束时间
    startDate: '=',     开始时间
    calendarType: '@'   日历类型   (yyyy-MM-dd   yyyy-MM  yyyy等)
    showArrow           是否显示左右箭头
    week                周  需设  calendar-type 为  yyyy-MM-dd
    callback            dateTime改变之后的回调函数(oldValue, newValue)
 */
app.directive('calendar', ['$ocLazyLoad', '$timeout', 'myAjaxData', ($ocLazyLoad, $timeout, myAjaxData) => ({
    restrict: 'E',
    transclude: !0,
    replace: !0,
    scope: {
        dateTime: '=',
        endDate: '=',
        startDate: '=',
        calendarType: '@',
        showArrow: '=',
        week: '@',
        beforeCreate: '=',
        created: '=',
        beforeMount: '=',
        mounted: '=',
        beforeUpdate: '=',
        updated: '=',
        beforeDestroy: '=',
        destroyed: '=',
    },
    template: `
    <div class="calendar" style="position:relative;">
        <span ng-if="showArrow" ng-click="changeDateTime(-1)"><i class="fa fa-angle-left"></i></span>
        <input type="text" value="{{showDate}}" ng-model="showDate">
        <span ng-if="showArrow" ng-click="changeDateTime(1)"><i class="fa fa-angle-right"></i></span>
        <p ng-if="week" style="position:absolute;left: 20px;right: 20px;top: 0;bottom: 0;margin: 0;text-align: center;background-color: #fff;pointer-events: none;">
            {{weekStart + '至' + weekEnd}}
        </p>
    </div>`,
    link($scope, $element) {
        $scope.beforeMount && $scope.beforeMount($scope, $element)
        const calendarMap = {
            'yyyy-MM-dd hh:mm:ss': {}, 
            'yyyy-MM-dd hh:mm': {},
            'yyyy-MM-dd hh': {
                minView: 1,
            },
            'yyyy-MM-dd': {
                minView: 2,
            },
            'yyyy-MM': {
                minView: 3,
                startView: 3,
            },
            'yyyy': {
                minView: 4,
                startView: 4,
            }
        }
        $scope.randomId = (Math.random() + '').substr(2, 10)
        const $input = $($element).find('input').attr('id', $scope.randomId)
        $input.on('focus', () => $input.blur())
        $ocLazyLoad.load([
                baseUrl + '/vendor/bootstrap/css/bootstrap-datetimepicker.min.css',
                baseUrl + '/vendor/bootstrap/js/bootstrap-datetimepicker.js'
            ]).then( () => $ocLazyLoad.load([
                baseUrl + '/vendor/bootstrap/js/bootstrap-datetimepicker.zh-CN.js',
                baseUrl + '/vendor/libs/moment.min.js'
        ])).then(() => {
            $scope.dateTime = new Date($scope.dateTime)
            $('#' + $scope.randomId).datetimepicker({
                format: 'yyyy-mm-dd hh:ii:ss'.substr(0, $scope.calendarType.length),
                language: 'zh-CN',
                todayHighlight: !0,
                todayBtn: !0,
                autoclose: !0,
                endDate: $scope.endDate || new Date,
                startDate: $scope.startDate || new Date('1970', '01', '01'),
                ...calendarMap[$scope.calendarType],
                initialDate: $scope.dateTime,
                pickerPosition: "bottom-left"
            }).on('hide', ev => {
                $scope.dateTime = ev.date
                $scope.showArrow && $scope.disabled()
                $scope.$apply()
            })
            $scope.showArrow && $scope.disabled()
        })
        $timeout(() => $scope.mounted && $scope.mounted($scope, $element), 0)
    },
    controller($scope, $element) {
        $scope.beforeCreate && $scope.beforeCreate($scope, $element)
        if ($scope.week) $scope.calendarType = 'yyyy-MM-dd'
        if ($scope.calendarType.length > 10) $scope.showArrow = false
        $scope.disabled = (noChange) => {
            const startDate = $scope.startDate || new Date('1970', '01', '01'),
                endDate = $scope.endDate || new Date,
                startDisabled = $scope.week ? (+moment($scope.dateTime).add(-$scope.dateTime.getDay() + 1, 'd')._d <= +startDate) : (+moment([$scope.dateTime.getFullYear(), $scope.dateTime.getMonth(), $scope.dateTime.getDate()].slice(0, $scope.calendarType.split('-').length))._d <= +moment([startDate.getFullYear(), startDate.getMonth(), startDate.getDate()].slice(0, $scope.calendarType.split('-').length))._d),
                nextDisabled = $scope.week ? (+moment($scope.dateTime).add(7 - $scope.dateTime.getDay(), 'd')._d >= +endDate) : (+$scope.dateTime >= +moment([endDate.getFullYear(), endDate.getMonth(), endDate.getDate()].slice(0, $scope.calendarType.split('-').length))._d)
            let num
            if (startDisabled) {
                if (noChange) num = -1
                else $element.find('.fa-angle-left').parent().addClass('disabled')
            } else if (!noChange) $element.find('.fa-angle-left').parent().removeClass('disabled')
            if (nextDisabled) {
                if (noChange) num = Object.is(num, -1) ? 0 : 1
                else $element.find('.fa-angle-right').parent().addClass('disabled')
            } else if (!noChange) $element.find('.fa-angle-right').parent().removeClass('disabled')
            return num
        }
        let changeCount = 0
        $scope.$watch('dateTime', (newValue, oldValue) => {
            if (Object.is(+oldValue, +newValue) && !Object.is(1, ++changeCount)) return
            $scope.beforeUpdate && $scope.beforeUpdate($scope, $element)
            if ($scope.week && window.moment) {
                if (+newValue > +($scope.endDate || new Date)) $scope.dateTime = oldValue
                $scope.showArrow && $scope.showDate && $scope.disabled()
                const weekNum = moment($scope.dateTime).day() || 7
                $scope.weekStart = moment($scope.dateTime).add(-weekNum + 1, 'd').format('YYYY-MM-DD')
                const weekEndDate = moment($scope.dateTime).add(6 - weekNum + 1, 'd')._d
                $scope.weekEnd = (+weekEndDate > +($scope.endDate || new Date) ? ($scope.endDate || new Date) : weekEndDate).Format('yyyy-MM-dd')
            }
            $scope.showDate = $scope.dateTime.Format($scope.calendarType)
            $scope.updated && $scope.updated($scope, $element)
        })
        $scope.$watch('startDate', (newValue, oldValue) => {
            if (!Object.is(+newValue, +oldValue)) $('#' + $scope.randomId).datetimepicker('setStartDate', newValue.Format($scope.calendarType))
        })
        $scope.$watch('endDate', (newValue, oldValue) => {
            if (!Object.is(+newValue, +oldValue)) $('#' + $scope.randomId).datetimepicker('setEndDate', newValue.Format($scope.calendarType))
        })
        $scope.changeDateTime = async num => {
            if ([num, 0].includes($scope.disabled(!0))) return
            if ($scope.week) num *= Object.is($scope.dateTime.getDay(), 0) ? 1 : 8 - $scope.dateTime.getDay()
            $scope.dateTime = moment($scope.dateTime).add(num, $scope.calendarType.substr(-1, 1))._d
            await myAjaxData.timeout(0)
            $scope.disabled()
        }
        $element.on('$destroy', async () => {
            $scope.beforeDestroy && $scope.beforeDestroy($scope, $element)
            await myAjaxData.timeout(0)
            $scope.destroyed && $scope.destroyed($scope, $element)
        })
        $scope.created && $scope.created($scope, $element)
    }
})])

```
