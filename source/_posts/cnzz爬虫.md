---
title: cnzz爬虫
date: 2020-01-22 09:24:31
tags: 友盟 cnzz 访问明细 爬虫 js casperjs phantomjs
---

友盟web站点访问明细获取

``` bash
# 1.安装 python 略
# 
# 2.安装 phantomjs
npm install -g phantomjs
# 3.安装casperjs
npm install -g casperjs

$ phantomjs --version
$ python --version
$ casperjs --version
```

创建js文件  start.js
``` js
var casper = require("casper").create();  // Phantom 环境
var fs = require('fs');
// var x = require("casper").selectXPath;  //用来简化XPath操作

casper.userAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36');

var siteId = '111111' // 友盟站点id

var url = 'http://new.cnzz.com/v1/login.php?siteid=' + siteId;

var detail_data = [];
var pre_day = 1;  // 默认前一天  昨天
var date = new Date(Date.now() - 1000 * 60 * 60 * 24 * pre_day);
var datestr = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2);

console.log('数据明细日期：' + datestr);

casper.start(url).then(function () {
    casper.wait(10 * 1000);
}).then(function () {
    var currentPage = 1;

    function func() {
        casper.open('https://web.umeng.com/main.php?c=flow&a=detail&ajax=module%3DdetailPvList_currentPage%3D' + currentPage + '_pageType%3D100&siteid=' + siteId + '&st=' + datestr + '&et=' + datestr + '&hour=24&_=' + Date.now()).then(function () {

            
            var data = {}
            
            try {
                data = JSON.parse(this.fetchText('body'));
            } catch (error) {
                console.log(this.fetchText('body'))
            }

            if (!data.data) return console.log(JSON.stringify(data));
            if (!data.data.detailPvList) return console.log(JSON.stringify(data.data));
            if (!data.data.detailPvList.items) return console.log(JSON.stringify(data.data.detailPvList));
            
            this.echo('明细数据页码：' + currentPage + '完成。');

            try {
                detail_data = detail_data.concat(data.data.detailPvList.items);

                var save_str = detail_data.map(function (v) {
                    return JSON.stringify(v);
                }).join('\n');

                if (data.data.detailPvList.page.hasNext) {
                    currentPage++;
                    func();
                } else {
                    console.log('明细数据爬取完成，正在写入文件。。。');
                    fs.write('detail/' + datestr.substr(0, 7) + '/' + datestr + '.txt', save_str);
                    console.log('明细数据爬取完成，文件写入完成。');
                }
            } catch (error) {
                console.log('明细数据爬取失败:' + error);
            }

        });
    }
    func();
}).run();
```

进入目录执行
``` bash
casperjs start.js
```
