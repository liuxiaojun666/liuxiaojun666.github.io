/**
 * 严重依赖 JQuery
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.$solway = global.$solway || {})));
}(window, ((exports) => {
    let scale = 1,
        minScale = 0.5,
        maxScale = 14,
        translateX = 0,
        translateY = 0,
        originX = '0%',
        originY = '0%';

    function scaleFunc(obj, val) {
        scale += val;
        if (scale > 5 && val < 0) scale += val * 9;
        scale = scale <= minScale ? minScale : scale;
        scale = scale >= maxScale ? maxScale : scale;
        if (scale <= minScale || scale >= maxScale) return false;
        obj.css({
            'transform': 'matrix(' + scale + ',0,0,' + scale + ',' + translateX + ',' + translateY + ')',
            '-ms-transform': 'matrix(' + scale + ',0,0,' + scale + ',' + translateX + ',' + translateY + ')',
            '-moz-transform': 'matrix(' + scale + ',0,0,' + scale + ',' + translateX + ',' + translateY + ')',
            '-webkit-transform': 'matrix(' + scale + ',0,0,' + scale + ',' + translateX + ',' + translateY + ')',
            '-o-transform': 'matrix(' + scale + ',0,0,' + scale + ',' + translateX + ',' + translateY + ')',
            'transform-origin': `${originX} ${originY}`,
            '-ms-transform-origin': `${originX} ${originY}`,
            '-webkit-transform-origin': `${originX} ${originY}`,
            '-moz-transform-origin': `${originX} ${originY}`,
            '-o-transform-origin': `${originX} ${originY}`
        });
        return false;
    }

    const drag = (options) => {
        scale = options.scale || 1;
        minScale = options.minScale || 0.5;
        maxScale = options.maxScale || 14;
        translateX = options.translateX || 0;
        translateY = options.translateY || 0;
        originX = options.originX || '0%';
        originY = options.originY || '0%';

        let obj = $(options.ele);
        let svgWidth, svgHeight, gapX, gapY, parentOffsetLeft, parentOffsetTop;

        obj.css({
            'transition': 'all 0.1s', '-moz-transition': 'all 0.1s', '-webkit-transition': 'all 0.1s', '-o-transition': 'all 0.1s', position: 'absolute', cursor: 'pointer', left: 0, top: 0
        })
            .on("mousewheel DOMMouseScroll", mouseWheelHandel).on("mousedown", start);

        function mouseWheelHandel(e) {
            originX = (e.clientX - obj.offset().left) / (obj.width() * scale) * 100 + '%';
            originY = (e.clientY - obj.offset().top) / (obj.height() * scale) * 100 + '%';
            const delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));
            if (delta > 0) return scaleFunc(obj, scale < 0.5 ? 0.2 : 0.05);
            else if (delta < 0) return scaleFunc(obj, scale < 0.5 ? -0.01 : -0.08);
        }

        function start(event) {
            originX = '50%';
            originY = '50%';
            svgWidth = obj.width();
            svgHeight = obj.height();
            parentOffsetLeft = obj.parent().offset().left;
            parentOffsetTop = obj.parent().offset().top;
            if (event.button == 0) {
                gapX = event.clientX - obj.offset().left;
                gapY = event.clientY - obj.offset().top;
                $(document).on("mousemove", move);
                $(document).on("mouseup", stop);
            }
            return false;
        }

        function move(event) {
            translateX = event.clientX - gapX - parentOffsetLeft + (svgWidth * scale - svgWidth) / 2;
            translateY = event.clientY - gapY - parentOffsetTop + (svgHeight * scale - svgHeight) / 2;
            return scaleFunc(obj, 0);
        }

        function stop() {
            $(document).off("mousemove", move);
            $(document).off("mouseup", stop);
        }

        scaleFunc(obj, 0);

        return {
            scale(n) {
                originX = '0%';
                originY = '0%';
                scaleFunc(obj, n - scale);
            },
            destroy() {
                obj.off("mousedown", start);
                obj.off("mousewheel DOMMouseScroll", mouseWheelHandel);
                obj = null;
            }
        };
    };

    exports.drag = drag;
})));