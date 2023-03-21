import { bezierFormula } from "./cbezier";

export type StyleProperties = {
    [x: string]: string | number;
}

export type AnimationProps = {
    duration: number;
    styles: [StyleProperties, StyleProperties];
    easing: string;
}

/**
 * 动画效果函数，返回基于t(范围[0, 1])的函数，其执行结果范围为[0, 1]
 * @param easing 
 * @returns 动画函数
 */
function resolveEasing(easing: string): (t: number) => number {
    const bezierMatch = /cbezier\((\d+.?\d+),\s?(\d+.?\d+),\s?(\d+.?\d+),\s?(\d+.?\d+)\)/g.exec(easing);
    if (bezierMatch?.length) {
        const x1 = Number(bezierMatch[1]), 
            y1 = Number(bezierMatch[2]), 
            x2 = Number(bezierMatch[3]), 
            y2 = Number(bezierMatch[4]);
        
        return bezierFormula(0, y1, y2, 1);
    }

    return (t: number) => t;
}

function resolveStyles(el: Element, styles: [StyleProperties, StyleProperties]) {
    const keys = Object.keys(styles[0]);
    const styleFuncs: { [x: string]: (t: number) => number | string } = {};

    for (const key of keys) {
        // 测试先支持百分比格式
        const unit = '%';
        const sVal = Number(/(\d+)%/g.exec(styles[0][key] + '')?.[1]);
        const eVal = Number(/(\d+)%/g.exec(styles[1][key] + '')?.[1]);
        const total = eVal - sVal;

        styleFuncs[key] = (percent: number) => {
            const curVal = sVal + total * percent;
            // console.log(`percent: ${percent}, style func: ` + curVal + unit);
            return curVal + unit;
        }
    }

    return styleFuncs;
}

/**
 * 元素动画
 * @param el DOM元素
 * @param props 动画属性
 */
export function animate(el: HTMLElement, props: AnimationProps): void {
    const duration = props.duration;
    const easingFunc = resolveEasing(props.easing);
    const styleFuncs = resolveStyles(el, props.styles);

    const start = Date.now();
    const animationHandle = () => {
        const timeRatio = (Date.now() - start) / duration;
        // console.log(`timeRatio: ${timeRatio}`);
        if (timeRatio <= 1) {
            const percent = easingFunc(timeRatio);
            for (const key in styleFuncs) {
                const elementStyle = el.style as any;
                elementStyle[key] = styleFuncs[key](percent);
            }
            requestAnimationFrame(animationHandle);
        }
    }

    animationHandle();
}