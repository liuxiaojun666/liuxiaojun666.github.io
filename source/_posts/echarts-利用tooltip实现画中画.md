---
title: "echarts 利用tooltip实现画中画"
date: 2018-10-23 17:03:58
tags:
---

### 功能介绍

如图
![图片](/images/2018-10-23/chart.png)

### 实现
大图正常绘制  tooltip 改为如下
```js
tooltipFormatter = (a, b, c) => {
    // 如果 请求参数没有变化   并且已经有缓存数据  并且 接口不是正在请求中   直接返回已有数据 减少不必要的请求
    if (a[0].name === lastParams.date && $scope.eqid === lastParams.eqid && $scope.stationStrShadeOneDeviceStrShadeStatus.res && !$scope.stationStrShadeOneDeviceStrShadeStatus.isLoding) {
        setTimeout(() => {
            c(b, `<div><div style="text-align:center;">${a[0].name}</div><div id="chartChild" style="width: 520px;height: 300px;text-align: center;line-height:300px;">没有加载到数据</div></div>`);
            renderChildChart(document.getElementById('chartChild'), $scope.stationStrShadeOneDeviceStrShadeStatus.res);
        }, 0);
        return `<div style="font-size: 30px;width: 520px;height: 300px;text-align: center;line-height:300px;">加载ing...</div>`;
    }

    
    lastParams.date = a[0].name;
    lastParams.eqid = $scope.eqid;
    $scope.stationStrShadeOneDeviceStrShadeStatus.getData({
        queryType: 3,
        date: a[0].name,
        dateType: 3,
        eqid: $scope.eqid
    }).then(res => {
        c(b, `<div><div style="text-align:center;">${a[0].name}</div><div id="chartChild" style="width: 520px;height: 300px;text-align: center;line-height:300px;">没有加载到数据</div></div>`);
        renderChildChart(document.getElementById('chartChild'), res);
    });
    return `<div style="font-size: 30px;width: 520px;height: 300px;text-align: center;line-height:300px;">加载ing...</div>`;
};


let myChart;
function renderChildChart(ele, data) {
    if (!ele) return;
    if (!data.body.strids[0]) return;
    if (myChart) echarts.dispose(myChart);
    myChart = echarts.init(ele);
    const option = {
        backgroundColor: '#2a3440',
        tooltip: {
            show: false
        },
        legend: {
            icon: 'rect',
            itemWidth: 20,
            itemHeight: 4,
            itemGap: 20, //图例每项之间的间隔。横向布局时为水平间隔，纵向布局时为纵向间隔。[ default: 10 ] 
            data: ['普通阴影', '异常阴影', '持续偏小', '损失比例(%)'],
            right: 60,
            top: 0,
            textStyle: {
                fontSize: 12,
                color: '#fffeff'
            }
        },
        grid: {
            top: '50',
            left: '20',
            right: '20',
            bottom: '0',
            containLabel: true //grid 区域是否包含坐标轴的刻度标签[ default: false ] 
        },
        xAxis: [{
            type: 'category',
            boundaryGap: true, //坐标轴两边留白策略，类目轴和非类目轴的设置和表现不一样
            axisLine: {
                lineStyle: {
                    color: '#366090' //坐标轴线线的颜色。
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#fffeff',
                    fontSize: 10
                }
            },
            axisTick: {
                inside: true
            },
            data: data.body.strids.map(v => '组串' + v)
        }],
        yAxis: [{
            type: 'value',
            name: '         时刻(0:00 -- 24:00)',
            nameTextStyle: {
                color: '#fffeff'
            },
            splitNumber: 12,
            // interval,
            max: 24,
            axisTick: {
                show: false //是否显示坐标轴刻度
            },
            axisLine: {
                lineStyle: {
                    color: '#366090' //坐标轴线线的颜色
                }
            },
            axisLabel: {
                margin: 5, //刻度标签与轴线之间的距离
                // inside: true,
                textStyle: {
                    color: '#fffeff',
                    fontSize: 12 //文字的字体大小
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#366090', //分隔线颜色设置
                    type: 'dashed'
                }
            }
        }, {
            type: 'value',
            name: '%',
            nameTextStyle: {
                color: '#fffeff'
            },
            // splitNumber,
            // interval,
            // max: 100,
            axisTick: {
                show: false //是否显示坐标轴刻度
            },
            axisLine: {
                lineStyle: {
                    color: '#366090' //坐标轴线线的颜色
                }
            },
            axisLabel: {
                margin: 5, //刻度标签与轴线之间的距离
                // inside: true,
                textStyle: {
                    color: '#fffeff',
                    fontSize: 12 //文字的字体大小
                }
            },
            splitLine: {
                show: false,
                lineStyle: {
                    color: '#366090', //分隔线颜色设置
                    type: 'dashed'
                }
            }
        }],
        series: new Array(Math.max(...data.body.strtimes.map(v => v.length)) / 2).fill('').map((v, i) => [
            Array.from(data.body.strids).fill('').map((v, xi) => ((data.body.strtimes[xi][i * 2] - (data.body.strtimes[xi][i * 2 - 1] || 0)) || 0)),
            ...[0, 1, 2].map(n => Array.from(data.body.properties).map((v, xi) => (v === n ? ((data.body.strtimes[xi][i * 2 + 1] - data.body.strtimes[xi][i * 2]) || '-') : '-'))),
        ]).map(v => (v.map((data, xi) => ({
            name: ['', '普通阴影', '异常阴影', '持续偏小'][xi],
            type: 'bar',
            data,
            barWidth: '6',
            stack: '阴影',
            yAxisIndex: 0,
            smooth: true,
            itemStyle: {
                normal: {
                    color: ['transparent', '#7e4bb4', '#dddd59', '#dd5859'][xi]
                }
            },
        })))).reduce((a, b) => a.concat(b), []).concat({
            name: '损失比例(%)',
            type: 'line',
            data: data.body.reduces,
            yAxisIndex: 1,
            smooth: true,
            itemStyle: {
                normal: {
                    lineStyle: {
                        width: 1
                    },
                    color: '#57bc6c'
                }
            },
        })
    };
    myChart.setOption(option);
}
```