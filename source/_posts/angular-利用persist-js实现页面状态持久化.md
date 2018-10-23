---
title: angular 利用persist.js实现页面状态持久化
date: 2018-10-23 16:03:45
tags:
---

### 功能介绍

一个管理系统，单个页面状态较多(如下图，红线指示部分全部记录)，每个页面状态分别管理并实现持久化。下次回到这个页面，或切回到之前的tab页，恢复记录中的状态。
![图片](/images/2018-10-23/status.png)
马鞍山蒙牛忘了框起来了，这个状态是要跟后台同步的。


### 使用方法

```js
ajaxData({
    // 给默认选中电站
    getuserAuthHandleSetSTClass: {
        name: 'GETUserAuthHandleSetSTClass',
        data: {},
        later: true
    },
    // 切换电站
    changeStation: {
        name: 'GETUserAuthHandleChangeDataType',
        data: {},
        later: true
    },
    // 基本电站信息
    getUserAuthHandleGetCurrentInfo: {
        name: 'GETUserAuthHandleGetCurrentInfo',
        data: {},
        later: true
    },
    // 电站基本信息 新
    getCurrentInfoNew: {
        name: 'GETgetCurrentInfoNew',
        data: {},
        later: true
    }
}, {})('monitoringSummaryCtrl', ['$scope', 'myAjaxData', 'actionRecord', '$state'], ($scope, myAjaxData, historicalRecord, $state) => {
    historicalRecord.init();
    $scope.beforeLoading = true; // 页面loading
    $scope.moduleName = '电站监视';//当前页面名称；
    historyInitCallback();
    
    // 当前页面行为记录初始化回调 获取行为记录
    async function historyInitCallback  () {
        const historiData = historicalRecord.get();
        const { detailFullPage,
            dateType = 0,
            dateTime = new Date(),
            theme = 'EquipmentOperation',
            stationData 
        } = historiData;
        if (!dateTime.showDate) dateTime.showDate = dateTime.Format('yyyy-MM-dd');
        $scope.dateTime = dateTime;
        $scope.dateType = dateType;
        $scope._dateTime = dateTime;
        $scope._dateType = dateType;
        $scope.theme = theme;
        $scope.detailFullPage = detailFullPage;
        if (!stationData) historicalRecord.set({ dateType, dateTime, theme });
        await diffStationInfo(stationData);
        $scope.beforeLoading = false;
        computeClass();
        $scope.changeTheme(theme);
        $scope.mainPageInitComplete && $scope.mainPageInitComplete($scope.currentClass);
        $scope.$apply();
    };

    // 电站 信息  对比
    async function diffStationInfo(stationData) {
        while (!$scope._getStationInfo) await myAjaxData.timeout(100);
        const currentStationData = await $scope._getStationInfo;
        if (currentStationData.isMan === 1) return;
        if (!currentStationData.currentSTID && currentStationData.currentSTID !== 0) { // 没有选择过电站
            const res = await $scope.getuserAuthHandleSetSTClass.getData({});
            if (res.result === false) {
                alert('没有选择任何 公司 或 电站，请联系管理员');
                return window.location.href = '/index.jsp';
            }
            return window.location.reload();
        }
        if (!stationData) { // 没有记录电站信息  
            const { currentSTID: id, currentSTType: isGroup, currentType: dataType, currentSTClass: stClass } = await $scope.getUserAuthHandleGetCurrentInfo.getData({});
            $scope.switchPowerCallback({ id, isGroup, dataType, stClass });
        } else if (Object.is(currentStationData.currentSTID, stationData.id)) { // 电站信息 没有变化
            await myAjaxData.timeout(500);
            $scope.switchPowerCallback(stationData);
        } else { // 电站信息  发生变化   切换到记录中的电站
            await $scope.changeStation.getData(stationData);
            const { currentDataName } = await $scope.getCurrentInfoNew.getData({ currentView: '00', isGroup: 1 });
            $scope.switchPowerScope.currentDataName = currentDataName;
            $scope.switchPowerCallback(stationData);
        }
    };

});



```
 以上是全局状态
 下半部分 分别都是不同的子页面，状态分别管理。
```js
// 主页面初始化完成 回调
$scope.mainPageInitComplete = async () => {
    let { showShape, select1, select2, tabIndex = 0 } = historicalRecord.get().themeElectricityStationMonth || {};
    $scope.changeShowShape(showShape || 'list');
    const { dateType, dateTime } = historicalRecord.get();
    $scope.dateType = dateType;
    $scope.dateTime = dateTime;
    await $scope.dateUpdated();
    $scope.select1 = select1 || 2;
    $scope.select2 = select2 || 2;
    if (select1) await $scope.selectChange('select1');
    if (select2) await $scope.selectChange('select2');
    $scope.changeTab(tabIndex);
    $('.ng-clock').removeClass('ng-clock');
    $scope.initComplete = true;
    await myAjaxData.timeout(0);
    await $scope.diffGetData();
    $scope.$apply();
};
```

### 实现
angular 服务 actionRecord 的实现
```js
app.factory('actionRecord', function ($state) {
    let record = {};
    let currentKey = $state.current.name;
    function init() {
        currentKey = $state.current.name;
        if (!$solway.getStore().actionRecord[currentKey]) {
            record[currentKey] = { data: {} };
            $solway.setStore('actionRecord', {
                ...$solway.getStore().actionRecord,
                ...record,
            });
        }
        record = $solway.getStore().actionRecord;
    }
    // 篡改记录 伪造记录
    function falsify(key, arg = {}, redirect) {
        if (!$solway.getStore().actionRecord[key]) record[key] = { data: {} };
        const data = typeof(arg) === 'function' ? arg(record[key], record[currentKey], record) : arg;
        record[key].data = {
            ...record[key].data,
            ...data
        };
        $solway.setStore('actionRecord', record);
        redirect && $state.go(key);
    }
    // 记录 当前页的 行为
    function set(obj) {
        record[currentKey].data = {
            ...record[currentKey].data,
            ...obj
        };
        $solway.setStore('actionRecord', record);
    }
    // 获取当前页 所有行为记录
    function get() {
        const currentDataPageData = record[currentKey].data;
        if (currentDataPageData.dateTime) {
            const date = new Date(currentDataPageData.dateTime);
            currentDataPageData.dateTime = date;
            currentDataPageData.dateTime.showDate = date.Format('yyyy-MM-dd');
        }
        return currentDataPageData;
    }


    return {
        init,
        falsify,
        set,
        get
    };

});
```