import { drawEllipse, ellipse } from 'cbezier';
import { useEffect, useRef } from "react";

function EllipseWithCBzier() {
    const canvasRef = useRef(null);



    const drawEllipseWithAnimation = (ctx) => {
        const points = ellipse(450, 50, 200, 300);
        let i = 0;
        const animation = () => {
            if (i < points.length) {
                ctx.font = "8px serif";
                (i % 5 === 0) && ctx.fillText('赞', points[i][0], points[i][1]);
                i++;
                requestAnimationFrame(animation);
            }
        }
        requestAnimationFrame(animation);
    };

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            drawEllipse(ctx, 100, 100, 200, 200);
            drawEllipse(ctx, 100, 160, 200, 80);
            drawEllipse(ctx, 160, 100, 80, 200);
            drawEllipseWithAnimation(ctx);
        }
    }, [canvasRef]);
    return <div>
        <canvas ref={canvasRef} id="canvas" width={800} height={500}></canvas>
    </div>
}

export default EllipseWithCBzier;