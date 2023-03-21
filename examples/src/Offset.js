import { useEffect, useRef } from "react";
import { bezierCurve, offset, computeControlPoints } from 'cbezier';

function Offset() {
    const canvasRef = useRef(null);

    function smoothAndDraw(ctx, segments, color) {
        let smoothed = [];
        for (let i = 0; i < segments.length; i++) {
            const { p0, p1, p2, p3 } = segments[i];
            const line = bezierCurve(p0, p1, p2, p3);
            if (i < segments.length - 1)
                line.splice(-1, 1);
            smoothed.push(...line);
        }
        
        ctx.strokeStyle = color;
        for (let i = 1; i < smoothed.length; i++) {
            ctx.beginPath();
            ctx.moveTo(smoothed[i - 1][0], smoothed[i - 1][1]);
            ctx.lineTo(smoothed[i][0], smoothed[i][1]);
            ctx.stroke();
        }
    }

    function drawOffset(ctx, points, offsets) {
        const { p1: xp1, p2: xp2 } = computeControlPoints(points.map(p => p[0]));
        const { p1: yp1, p2: yp2 } = computeControlPoints(points.map(p => p[1]));
        const segments = new Array(points.length - 1).fill(0).map((val, index) => ({ p0: points[index], p1: [xp1[index], yp1[index]], p2: [xp2[index], yp2[index]], p3: points[index + 1] }));
        ctx.lineWidth = 2;
        smoothAndDraw(ctx, segments, '#F00');

        for (let i = 0; i < offsets.length; i++) {
            const destSegments = offset(segments, offsets[i]);
            smoothAndDraw(ctx, destSegments, '#00F');
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        canvas.width = 500;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        // ctx.lineWidth = 2;

        // let points = [[10, 100], [80, 30], [150, 120], [220, 40], [300, 140]];
        // drawOffset(ctx, points, [-10, -20, -30]);

        let points = [[20, 80], [120, 140], [220, 80]];
        drawOffset(ctx, points, [-10, 10, 20, -20]);

        points = [[300, 140], [400, 80], [500, 140]];
        drawOffset(ctx, points, [-10, 10, 20, -20]);

        points = [[20, 200], [180, 280], [340, 210], [500, 280]];
        drawOffset(ctx, points, [-10, 10, 20, -20]);

    }, [canvasRef]);

    return <div style={ {height: '300px', width: '100%'} }>
        <canvas ref={canvasRef}></canvas>
    </div>
}

export default Offset;