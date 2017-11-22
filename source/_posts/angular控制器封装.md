---
title: angular控制器封装
date: 2017-11-22 15:58:08
tags:
---

## angular封装（接口请求统一管理，自动挂载接口数据，重复请求更简洁，。。）

### 使用方法

``` js
ajaxData({
    pageList: {
        name: 'GETanalysisPage',
        data: {
            pageIndex:0,
            pageSize:10,
            startDate: new Date((new Date).setDate((new Date).getDate() - 7)).Format('yyyy-MM-dd'),
            endDate: (new Date).Format('yyyy-MM-dd')
        }
    },
    detail: {
        name: 'GETselectEqPaintingData',
        later: true
    },
    deviceType: {
        name: 'GETgetDeviceType',
        data: {}
    }
},{
    //设备查询地址
    url: [ "GETgetJunctionBox", "GETgetInverter", "GETgetBoxchange", "GETgetAmmeter", "GETgetAerograph" ]
})('groupStringShadowCtrl', ['$scope', 'myAjaxData'], ($scope, myAjaxData) => {
    
})

```

### ajaxData函数

``` js
window.ajaxData = (b, a) => {
    app.factory("myAjaxData", ["apiService", '$q', '$timeout', (d, q, m) => {
        let i = {}
        let j = {}
        let c = {}
        c.init = (b, a) => {
            i = {} 
            j = {}
            c.isLoding = !0
            for ( let f in b) {
                i[b[f].name] = {}
                c[f] = {}
                c[f].isLoding = !0
                c[f].res = null
            }
            c.config = a
            c.currentStationData = j
        }
        c.setCurrentStationData = o => {
            for(let key in o) j[key] = o[key]
        }
        c.timeout = t => {
            let d = q.defer()
            m(() => d.resolve(), t)
            return d.promise
        }
        c.getData = o => {
            if (!i[o.name]) return d.getData(o)
            for (let key in o.data) i[o.name][key] = o.data[key]
            return d.getData({
                name: o.name, 
                data: i[o.name]
            })
        }
        c.setData = (g, f, h) => {
            c[g].isLoding = f ? !1 : !0
            c[g].res = f || c[g].res
            c.isLoding = h
        }
        return c
    }])
    return (f, c, e) => {
        let d = (N, Z, Y, X, W, V, U, T, S, R, Q, P, O, M, L, K, J, I, H, G, F, D, C, B, A, j) => {
                Z.init(b, a)
                let E = () => {
                        for (let key in b) if (N[key].isLoding) return !0
                        return !1
                    }
                N.isLoding = !0
                N.reload = () => {
                    for(let key in b) {
                        if(b[key].later) continue
                        N[key].getData(b[key].data)
                    }
                }
                N.getData = (g, i) => {
                    return Z.getData({
                        name: g,
                        data: i
                    })
                }
                for (let g in b) {
                    N[g] = {}
                    // if (b[g].delay) {
                    //     N.$watch('isLoding', (n, o) => {
                    //         if (n === !1) N[g].promise = N[g].getData(b[g].data)
                    //     })
                    // }
                    N[g].getData = k => {
                        let i = Z.getData({
                            name: b[g].name, 
                            data: k
                        })
                        N[g].promise = i
                        N[g].isLoding = !0
                        N.isLoding = E()
                        Z.setData(g, null, N.isLoding)
                        i.then( l => {
                            N[g].res = l
                            N[g].isLoding = !1
                            N.isLoding = E()
                            Z.setData(g, l, N.isLoding)
                        }, l => {
                            N[g].isLoding = !1
                            N.isLoding = E()
                        })
                        return i
                    }
                    N[g].isLoding = !0
                    if (b[g].later) continue
                    // if (b[g].data.__stationId__) {
                    //     N.getData('GETgetCurrentInfoNew', {
                    //         currentView: '00',
                    //         isGroup: 0
                    //     }).then(d => {
                    //         Z.setCurrentStationData(d)
                    //         b[g].data[b[g].data.__stationId__] = d.currentSTID
                    //         b[g].data.__stationId__ = void 0
                    //         N[g].promise = N[g].getData(b[g].data)
                    //     })
                    // }
                    N[g].promise = N[g].getData(b[g].data)
                }
                e(N, Z, Y, X, W, V, U, T, S, R, Q, P, O, M, L, K, J, I, H, G, F, D, C, B, A, j)
            }
        app.controller(f, [...c, d])
    }
}
```

### apiService服务

``` js
app.factory("apiService", ["$http", "$q", (d, b) => {
    const c = window.interface
    let a = {}
    a.getData = (e) => {
        let f = b.defer()
        let j = e.name.startsWith('GET') ? 'GET' : 'POST'
        d({
            method: j,
            url: c[e.name],
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest"
            },
            params: j === 'GET' ? e.data : {},
            data: j === 'POST' ? e.data : {},
            transformRequest (g) {
                return $.param(g)
            }
        }).success( h => {
            if (h.status >= 500) {
                promptObj("error", "", "error" + "\n" + c[e.name] + "\n" + "服务器错误，请稍后再试")
                console.error(e.name, c[e.name], h)
                return f.reject(h.status)
            }
            f.resolve(h)
        }).error( (h, g) => {
            if (g == 404) {
                promptObj("error", "", "error" + "\n" + c[e.name] + "\n" + "您请求的资源不存在")
            } else if (g >= 500) {
                promptObj("error", "", "error" + "\n" + c[e.name] + "\n" + "服务器错误，请稍后再试")
            }
            console.error("error", c[e.name], g)
            f.reject(g)
        })
        return f.promise
    }
    return a
}])
```

### interface接口文件（所有的接口地址）

``` js
'use strict';

var i = `这里是beseUrl`
window.interface = {
        //设备分析  故障类型 ?powerType=PV&idType=1&ids=137&timeType=ACCUM&dateStr=2017-01&indicators=FAULTRATE'
        GETdeviceAnalysisRankingFaultType: i + '/deviceAnalysis/ranking/faultType.htm'
};
```