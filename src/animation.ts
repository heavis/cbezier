import { bezier } from './bezier-easing';
import { assert } from './utils';

export type StyleProperties = {
    [x: string]: string | number;
}

export type AnimationProps = {
    duration: number;
    styles: StyleProperties;
    easing: string;
}

const easeMap = new Map<string, string>([
    ['linear', 'cbezier(0.0, 0.0, 1.0, 1.0)'],
    ['ease-in', 'cbezier(0.42, 0.0, 1.0, 1.0)'],
    ['ease-out', 'cbezier(0.0, 0.0, 0.58, 1.0)'],
    ['ease-in-out', 'cbezier(0.42, 0.0, 0.58, 1.0)'],
])

/**
 * 动画效果函数，返回基于t(范围[0, 1])的函数，其执行结果范围为[0, 1]
 * @param easing 
 * @returns 动画函数
 */
function resolveEasing(easing: string): (t: number) => number {
    if (easeMap.has(easing)) {
        easing = <string>easeMap.get(easing);
    }
    let bezierMatch = /cbezier\((\d+.?\d+),\s?(\d+.?\d+),\s?(\d+.?\d+),\s?(\d+.?\d+)\)/g.exec(easing);
    if (bezierMatch?.length) {
        const x1 = Number(bezierMatch[1]), 
        y1 = Number(bezierMatch[2]), 
        x2 = Number(bezierMatch[3]), 
        y2 = Number(bezierMatch[4]);

        return bezier(x1, y1, x2, y2);
    }

    return (t: number) => t;
}

function getUnit(val: string) {
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    if (split) return split[1];
  }

/**
 * 将像素值转换为目标单位值
 * @param {*} el 
 * @param {*} value 
 * @param {*} unit 
 * @returns 
 */
 function convertPxToUnit(el: Element, value: string, unit: string) {
    const baseline = 100;
    // 创建一个和el类型一样的要素
    const tempEl = document.createElement(el.tagName);
    // 获取要素的parent
    const parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
    parentEl.appendChild(tempEl);
    tempEl.style.position = 'absolute';
    // 设置基线为100个目标单位
    tempEl.style.width = baseline + unit;
    // 宽度因子，目标长度/一个像素
    const factor = baseline / tempEl.offsetWidth;
    parentEl.removeChild(tempEl);
    // parseFloat会将最后的单位忽略得到数值
    const convertedUnit = factor * parseFloat(value);

    return convertedUnit;
}

function resolveStyles(el: Element, styles: StyleProperties) {
    const keys = Object.keys(styles);
    const styleFuncs: { [x: string]: (t: number) => number | string } = {};

    for (const key of keys) {
        // 测试先支持百分比格式
        const value = styles[key] + '';
        const unit = <string>getUnit(value);

        const destValue = parseFloat(value);
        const styleValue = getComputedStyle(el).getPropertyValue(key.toLowerCase());
        const startValue = unit ? convertPxToUnit(el, styleValue, unit) : parseFloat(styleValue);

        const total = destValue - startValue;

        styleFuncs[key] = (percent: number) => {
            const curVal = startValue + total * percent;

            return unit ? curVal + unit : curVal;
        }
    }

    return styleFuncs;
}

/**
 * 元素动画
 * @param el DOM元素
 * @param props 动画属性
 */
export function animate(el: HTMLElement, props: AnimationProps): { pause: () => void } {
    const duration = props.duration;
    const easingFunc = resolveEasing(props.easing);
    const styleFuncs = resolveStyles(el, props.styles);

    const cAniInstance = {
        paused: false,
    }

    const start = Date.now();
    const animationHandle = () => {
        if (cAniInstance.paused) {
            return;
        }
        const timeRatio = (Date.now() - start) / duration;
        if (timeRatio <= 1) {
            const percent = easingFunc(timeRatio);
            for (const key in styleFuncs) {
                const elementStyle = el.style as any;
                elementStyle[key] = styleFuncs[key](percent);
            }
            requestAnimationFrame(animationHandle);
        }
    }
    requestAnimationFrame(animationHandle);

    return {
        pause: () => {
            cAniInstance.paused = true;
        }
    }
}