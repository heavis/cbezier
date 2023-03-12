import { useEffect, useRef } from "react";

function drawEllipse(ctx, x, y, w, h) {
    var kappa = 0.5522848, // 作为计算两个控制点的偏移量的常数，由圆曲率公式推导
        ox = (w / 2) * kappa, // 控制点水平方向偏移量
        oy = (h / 2) * kappa, // 控制点垂直方向偏移量
        xe = x + w,           // x方向结束位置
        ye = y + h,           // y方向结束位置
        xm = x + w / 2,       // x方向中点
        ym = y + h / 2;       // y方向中点
  
    ctx.beginPath();
    // 移动到端点P0
    ctx.moveTo(x, ym);
    // bezierCurveTo(P1, P2, P3)，将椭圆分为四段，分别绘制每一段的曲线
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.closePath();
    ctx.stroke();
  }

  function Ellipse() {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            drawEllipse(ctx, 50, 50, 200, 150);
        }
    }, [canvasRef]);

    return <div>
        <canvas ref={canvasRef} id="canvas" width={500} height={500}></canvas>
    </div>
  }

export default Ellipse;