function bezierFormula(p0, p1, p2, p3) {
    return function bezier(t) {
        return p0 * Math.pow(1 - t, 3) + p1 * 3 * t * Math.pow(1 - t, 2) + p2 * 3 * Math.pow(t, 2) * (1 - t) + p3 * Math.pow(t, 3);
    };
}
/**
 * 计算三次贝塞尔曲线
 * @param p0 端点1
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 端点2
 */
function bezierCurve(p0, p1, p2, p3) {
    const formulaX = bezierFormula(p0[0], p1[0], p2[0], p3[0]);
    const formulaY = bezierFormula(p0[1], p1[1], p2[1], p3[1]);
    const steps = 100, result = [];
    for (let i = 0; i < steps; i++) {
        result.push([formulaX(i / steps), formulaY(i / steps)]);
    }
    result.push([formulaX(1), formulaY(1)]);
    return result;
}

const kappa = 4 * (Math.sqrt(2) - 1) / 3;
/**
 * 椭圆贝塞尔曲线计算
 * @param x 绘制x起始坐标
 * @param y 绘制y起始坐标
 * @param w 宽度
 * @param h 高度
 */
function ellipse(x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    // 绘制顺序：左上、右上、右下、左下
    const arcs1 = bezierCurve([x, cy], [x, cy - kappa * h / 2], [cx - kappa * w / 2, y], [cx, y]);
    const arcs2 = bezierCurve([cx, y], [cx + kappa * w / 2, y], [cx + w / 2, cy - kappa * h / 2], [cx + w / 2, cy]);
    const arcs3 = bezierCurve([cx + w / 2, cy], [cx + w / 2, cy + kappa * h / 2], [cx + kappa * w / 2, cy + h / 2], [cx, cy + h / 2]);
    const arcs4 = bezierCurve([cx, cy + h / 2], [cx - kappa * w / 2, cy + h / 2], [x, cy + kappa * h / 2], [x, cy]);
    // 每一段删除和下一段起始重叠的点
    arcs1.splice(-1, 1);
    arcs2.splice(-1, 1);
    arcs3.splice(-1, 1);
    arcs4.splice(-1, 1);
    return [...arcs1, ...arcs2, ...arcs3, ...arcs4];
}

/**
 * 绘制椭圆
 * @param x 绘制x起始坐标
 * @param y 绘制y起始坐标
 * @param w 宽度
 * @param h 高度
 */
function drawEllipse(ctx, x, y, w, h) {
    const points = ellipse(x, y, w, h);
    const randomRGB = () => {
        const r = Number(255 * Math.random());
        const g = Number(255 * Math.random());
        const b = Number(255 * Math.random());
        return `rgb(${r},${g},${b})`;
    };
    ctx.lineWidth = 5;
    for (let i = 1; i < points.length; i++) {
        ctx.beginPath();
        const prevPoint = points[i - 1];
        ctx.moveTo(prevPoint[0], prevPoint[1]);
        ctx.strokeStyle = randomRGB();
        const curPoint = points[i];
        ctx.lineTo(curPoint[0], curPoint[1]);
        ctx.stroke();
    }
}

export { bezierCurve, bezierFormula, drawEllipse, ellipse };
