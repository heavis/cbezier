import { ellipse } from "./shape";

/**
 * 绘制椭圆
 * @param x 绘制x起始坐标
 * @param y 绘制y起始坐标
 * @param w 宽度
 * @param h 高度
 */
export function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const points = ellipse(x, y, w, h);
    
    const randomRGB = () => {
       const r = Number(255 * Math.random());
       const g = Number(255 * Math.random());
       const b = Number(255 * Math.random());

       return `rgb(${r},${g},${b})`;
    }
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