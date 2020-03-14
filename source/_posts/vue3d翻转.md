---
title: vue3d翻转
date: 2020-01-22 11:13:36
tags: vue html 3d翻转
---
### 效果展示
{% iframe https://codesandbox.io/embed/dazzling-volhard-rue6e?fontsize=14&hidenavigation=1&theme=dark 700 500 %}
### 使用示例
``` vue
<template>
    <rotation3d @mouseenter.native="rotation3dtimeInterval = 0" @mouseleave.native="rotation3dtimeInterval = 5000" :lazy="false" :timeInterval="rotation3dtimeInterval" :panels="['a', 'b', 'c']" to="toTop">
        <template>
            <div class="rotation3d-btn"><i class="iconfont icon-fanzhuan"></i></div>
        </template>
        <template v-slot:a>
            <div class="rotation3d-panel">
                a
            </div>
        </template>
        <template v-slot:b>
            <div class="rotation3d-panel">
                b
            </div>
        </template>
        <template v-slot:c>
            <div class="rotation3d-panel">
                c
            </div>
        </template>
    </rotation3d>
</template>
<script>
import rotation3d from '@comm/components/rotation3d'
export default {
    data () {
        return {
            rotation3dtimeInterval: 5000
        }
    },
    components: {
        rotation3d
    }
}
</script>

<style lang="scss" scoped>
.rotation3d {
    .rotation3d-btn {
        position: absolute;
        left: 0;
        top: 0;
        width:22px;
        height:22px;
        background:rgba(20,71,135,1);
        z-index: 3;
        cursor: pointer;
        text-align: center;
        line-height: 22px;

        i.iconfont {
            font-size: 16px;
            color: rgba(255,255,255,.8);
        }
    }

    .rotation3d-panel {
        width: 100%;
        height: 100%;
        background-color: rgba(#003E9A, .4);
        .chart-main {
            height: 100% !important;
            canvas {
            height: 100% !important;

            }
        }
    }
}
</style>
```

### 源码
rotation3d.vue
``` vue
<template>
  <div class="turn rotation3d" :key="panels.join()">
        <div class="rotate-hadle" @click="somersault">
            <!-- default slot 手动翻转按钮 -->
            <slot></slot>
        </div>

        <div class="panel" v-for="(item, index) in loopTabs" :key="item + 'panel'" :class="{ toLeft: to === 'toLeft', toTop: to === 'toTop', active: panelIndex === index, somersaulting: somersaulting && (panelIndex === index + 1) }">
            <slot v-if="!reRender && isRender[index]" v-show="(panelIndex === index || (panelIndex === (index + 1) && somersaulting))" :name="item"></slot>
            <slot v-if="reRender && (panelIndex === index || (panelIndex === (index + 1) && somersaulting))" :name="item"></slot>
        </div>

        <div class="panel toTop" :class="{ active: panelIndex === panels.length - 1, somersaulting: somersaulting && (panelIndex === 0)}">
            <slot v-if="!reRender && isRender[panels.length - 1]" v-show="(panelIndex === panels.length - 1 || (panelIndex === 0 && somersaulting))" :name="panels[panels.length - 1]"></slot>
            <slot v-if="reRender && (panelIndex === panels.length - 1 || (panelIndex === 0 && somersaulting))" :name="panels[panels.length - 1]"></slot>
        </div>
  </div>
</template>

<script>
export default {
    props: {
        /**
         * 面板名称 按数组顺序翻转
         * slot中name写面板名称
         */
        panels: {
            type: Array,
            required: true
        },
        /**
         * 翻转方向 支持 toLeft向左  toTop向上
         */
        to: {
            type: String,
            default: 'toLeft'
        },
        /**
         * 是否每次翻转重新渲染
         * v-if  与  v-show 的区别
         */
        reRender: {
            type: Boolean,
            default: false
        },
        /**
         * 是否懒加载
         * 懒加载时  不会一次性全部渲染， 翻转到哪 渲染哪， reRender为false时下次翻转不再重新渲染
         * reRender 为true 不生效 （每次翻转都重新渲染）
         */
        lazy: {
            type: Boolean,
            default: false
        },
        /**
         * 轮播时间间隔  毫秒
         * 为0时不轮播
         * 轮播与暂停 可 设置此项来控制
         */
        timeInterval: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            timer: null,
            panelIndex: 0,
            somersaulting: false,
            transformation: false,
            isRender: []
        }
    },
    created () {
        if (!this.lazy) {
            this.isRender = this.panels.map(v => true)
        } else {
            this.isRender[0] = true
        }
    },
    mounted () {
        if (this.timeInterval) {
            this.timer = setInterval(this.somersault, this.timeInterval)
        }
    },
    methods: {
        $timeout(num) {
            return new Promise((resolve, reject) => setTimeout(() => resolve(), num))
        },
        async somersault () {
            if (this.somersaulting || this.transformation) return
            this.somersaulting = true
            this.panelIndex++
            if (this.panelIndex === this.panels.length) this.panelIndex = 0
            this.isRender[this.panelIndex] = true
            await this.$timeout(1000)
            this.somersaulting = false
            this.transformation = true
            await this.$timeout(100)
            this.transformation = false
        }
    },
    watch: {
        timeInterval (newValue, oldValue) {
            if (newValue === oldValue) return
            clearInterval(this.timer)
            if (newValue) {
                this.timer = setInterval(this.somersault, this.timeInterval)
            }
        }
    },
    computed: {
        loopTabs () {
            return this.panels.slice(0, this.panels.length - 1)
        }
    },
    beforeDestroy () {
        clearInterval(this.timer)
    }
}
</script>

<style lang="scss" scoped>
.rotation3d {
    position: relative;

    .panel {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: all .1s ease;

        &.active {
            z-index: 2;
            opacity: 1;
            transition: all 1s cubic-bezier(0.17,0,0.78,1);
        }

        &.somersaulting {
            transition: all 1s cubic-bezier(0,0,0.58,1);
        }

        &.toLeft {
            transform: perspective(100vw) translate3d(50%, 0, -8.5vw) rotateY(90deg);

            &.active {
                transform: perspective(100vw) translate3d(0, 0, 0) rotateY(0);
            }

            &.somersaulting {
                transform: perspective(100vw) translate3d(-50%, 0, -8.5vw) rotateY(-90deg);
            }
        }

        &.toTop {
            transform: perspective(100vh) translate3d(0, 50%, -8.5vh) rotateX(-90deg);

            &.active {
                transform: perspective(100vh) translate3d(0, 0, 0) rotateX(0);
            }

            &.somersaulting {
                transform: perspective(100vh) translate3d(0, -50%, -8.5vh) rotateX(90deg);
            }
        }
    }
}
</style>

```
