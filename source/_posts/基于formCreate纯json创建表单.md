---
title: 基于formCreate纯json创建表单
date: 2019-11-13 10:15:07
tags: [vue, js, 前端, formCreate, json]
---

### 动态表单

因数据库字段不固定，不想数据库修改、页面修改、还有批量Excel模板操作等。
想做成一处修改即可使用的动态表单。

表单配置页面（可视化配置表单）略。

这里只说组装json渲染表单。

### 动态表单json渲染使用方法

option、rule 参数与formcreate完全一致，只需把函数写为 函数字符串即可
expand为扩展参数，在函数字符串中可使用
$f 为当前formCreate实例，与formCreate一致。函数内可使用

``` html
<form-json-create :option="option" :rule="rule" :expand="all_expand"></form-json-create>
```

``` js
{
    type: 'select',
    field: 'cityid',
    title: '市',
    value: '',
    props: {
        filterable: true
    },
    options: [],
    validate: [
        { required: true, message: '请输入电站编号', trigger: 'blur' }
    ],
    on: {
        // 写函数的地方  改为字符串即可  函数内可使用expand传入的扩展参数
        change: `function (val) {
            $f.setValue({ countyid: '' })
            $f.updateRule('countyid', { options: [] })
            $solwayApi.get($baseApi + '/BaseRegion/selectByTreeLevel.htm', {treeLevel: 3, parentId: val}).then(function (res) {
                $f.updateRule('countyid', {
                    options: res.map(function (v) {
                        return {
                            label: v.regionName,
                            value: v.id
                        }
                    })
                })
            })
        }`
    }
}
```

#### 示例
示例地址：[查看示例](/form-json-create/index.html "查看示例")

{% iframe /form-json-create/index.html 1100 400 %}

### 动态表单纯json实现思路

``` html
<form-create
    v-if="option && rule"
    v-model="fApi"
    @mounted="formMounted"
    :option="processedOption"
    :rule="rule">
</form-create>
```

``` js
// props
props: {
    option: {
        type: Object,
        required: true
    },
    rule: {
        type: Array,
        required: true
    },
    edit: {
        type: Boolean,
        default: false
    },
    expand: {
        type: Object,
        default () {
            return {}
        }
    }
}
```

``` js
// 处理option
processOption (option = this.option) {
    const processedOption = {...option}
    // 删除mounted事件，mounted时执行 以下formMounted函数
    delete processedOption.mounted
    delete processedOption.onSubmit
    return processedOption
}
```

``` js
// 表单创建后 执行
formMounted ($f) {
    // 执行自定义mounted函数  并注入扩展参数
    this.evil(this.option.mounted, {...this.expand})($f)
    
    // 更新定义 表单提交事件处理函数    并注入扩展参数
    $f.updateOptions({onSubmit: this.evil(this.option.onSubmit, {$f, ...this.expand})})

    // 更新么个表单组件的事件函数  并注入扩展参数
    $f.fields().forEach(v => {
        const rule = $f.getRule(v)
        $f.updateRule(v, {
            on: Object.keys(rule.on).reduce((a, b) => {
                a[b] = this.evil(rule.on[b], {$f, ...this.expand})
                return a
            }, {})
        })
    })
}
```

``` js
// innerScript 来自远程的js 代码字符串。 必须为一个js函数
// argOption 扩展参数 key为形参，value为实参。  扩展参数可以在  innerScript  中直接使用
// outerScript 自定义处理，这里没有用到
evil (innerScript, argOption = {}, outerScript = 'return ') {
    const formalParameter = Object.keys(argOption)
    let Fn = Function
    return new Fn(...formalParameter, outerScript + innerScript)(...formalParameter.map(k => argOption[k]))
}
```

### 动态表单纯json实现完整代码

``` html
<template>
    <form-create
        v-if="option && rule"
        v-model="fApi"
        @mounted="formMounted"
        :option="processedOption"
        :rule="rule">
    </form-create>
</template>
```

``` js
import formCreate from '@form-create/element-ui'

export default {
    props: {
        option: {
            type: Object,
            required: true
        },
        rule: {
            type: Array,
            required: true
        },
        edit: {
            type: Boolean,
            default: false
        },
        expand: {
            type: Object,
            default () {
                return {}
            }
        }
    },
    components: {
        formCreate: formCreate.$form()
    },
    data () {
        return {
            fApi: {},
            processedOption: this.processOption()
        }
    },
    methods: {
        formMounted ($f) {
            this.evil(this.option.mounted, {...this.expand})($f)
            if (this.edit && this.option.writeBack) {
                this.evil(this.option.writeBack, {...this.expand, $f})()
            }
            $f.updateOptions({onSubmit: this.evil(this.option.onSubmit, {$f, ...this.expand})})
            $f.fields().forEach(v => {
                const rule = $f.getRule(v)
                $f.updateRule(v, {
                    on: Object.keys(rule.on).reduce((a, b) => {
                        a[b] = this.evil(rule.on[b], {$f, ...this.expand})
                        return a
                    }, {})
                })
            })
        },
        processOption (option = this.option) {
            const processedOption = {...option}
            delete processedOption.mounted
            delete processedOption.onSubmit
            return processedOption
        },
        evil (innerScript, argOption = {}, outerScript = 'return ') {
            const formalParameter = Object.keys(argOption)
            let Fn = Function
            return new Fn(...formalParameter, outerScript + innerScript)(...formalParameter.map(k => argOption[k]))
        }
    }
}
```

github: https://github.com/liuxiaojun666/form-json-create
