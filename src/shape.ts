import { bezierCurve } from './cbezier';
const kappa = 4 * (Math.sqrt(2) - 1) / 3;

/**
 * 椭圆贝塞尔曲线计算
 * @param x 绘制x起始坐标
 * @param y 绘制y起始坐标
 * @param w 宽度
 * @param h 高度
 */
export function ellipse(x: number, y: number, w: number, h: number): [number, number][] {
    const cx = x + w / 2, cy = y + h / 2;

    // 绘制顺序：左上、右上、右下、左下
    const arcs1 = bezierCurve(
        [x, cy], 
        [x, cy - kappa * h / 2],
        [cx - kappa * w / 2, y],
        [cx, y]
    );
    const arcs2 = bezierCurve(
        [cx, y],
        [cx + kappa * w / 2, y],
        [cx + w / 2, cy - kappa * h / 2],
        [cx + w / 2, cy]
    );
    const arcs3 = bezierCurve(
        [cx + w / 2, cy],
        [cx + w / 2, cy + kappa * h / 2],
        [cx + kappa * w / 2, cy + h / 2],
        [cx, cy + h / 2]
    );
    const arcs4 = bezierCurve(
        [cx, cy + h / 2],
        [cx - kappa * w / 2, cy + h / 2],
        [x, cy + kappa * h / 2],
        [x, cy]
    );
    
    // 每一段删除和下一段起始重叠的点
    arcs1.splice(-1, 1);
    arcs2.splice(-1, 1);
    arcs3.splice(-1, 1);
    arcs4.splice(-1, 1);

    return [...arcs1, ...arcs2, ... arcs3, ...arcs4];
}