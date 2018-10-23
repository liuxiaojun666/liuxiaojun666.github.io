---
title: js实现状态进度条
date: 2017-12-08 14:48:27
tags:
---

### 需求
![](/images/2017-12-08/jindutiao2.png)

### 实现方法

不叫实现方法 思路吧

从上到下 有三行，从左到右有4个，还要姿势因，如果按从左到右，细线很难实现，
从上到下，对齐又不好搞定，

思考半天 终于有解。 
从上到下，三行

外层盒子 包裹 这三行
外层盒子
    width: 100%;
    flex-basis: 150rpx;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;

四个圆  每个间隔是  1/3  
量出 细线的长度 （假如531），（要从两个圆的中心 去量，弄两个一样大小的圆，量出来减去一个圆的直径）
    width: 565rpx;  531 + 圆的直径
    flex-basis: 34rpx;
    display: flex;
    justify-content: space-between;
    position: relative;


第二行第三行 都是 文字类型  所以  要 分为4段，每段  1/4. 重点来了，是谁的1/4呢
是  线的长度 / 3 x 4 的四分之一，
也就是第二行  第三行的width：531 x 4
width: 708rpx;
    display: flex;
    justify-content: space-between;
    position: relative;

文字居中显示  width：25%
flex-basis: 25%;
    flex-grow: 0;
    white-space: nowrap;
    text-align: center;


