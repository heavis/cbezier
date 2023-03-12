export function bezierFormula(p0: number, p1: number, p2: number, p3: number) {
    return function bezier(t: number) {
        return p0 * Math.pow(1 - t, 3) + p1 * 3 * t * Math.pow(1 - t, 2) + p2 * 3 * Math.pow(t, 2) * (1 - t) + p3 * Math.pow(t, 3);
    }
}

/**
 * 计算三次贝塞尔曲线
 * @param p0 端点1
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 端点2
 */
export function bezierCurve(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number][] {
    const formulaX = bezierFormula(p0[0], p1[0], p2[0], p3[0]);
    const formulaY = bezierFormula(p0[1], p1[1], p2[1], p3[1]);

    const steps = 100, result: [number, number][] = [];
    for (let i = 0; i < steps; i++) {
        result.push([formulaX(i / steps), formulaY(i / steps) ])
    }
    result.push([formulaX(1), formulaY(1)]);

    return result;
}