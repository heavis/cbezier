import { bezierCurve, computeControlPoints } from "./cbezier";

/**
 * 曲线平滑，对轨迹点points做平滑处理 
 * @param points 
 * @returns 
 */
export function smooth(points: [number, number][]): [number, number][] {
    if (points.length <= 2) {
        return points;
    } 
    const { p1: xp1, p2: xp2 } = computeControlPoints(points.map(p => p[0]));
    const { p1: yp1, p2: yp2 } = computeControlPoints(points.map(p => p[1]));

    const smoothed: [number, number][] = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i], 
            p1: [number, number] = [xp1[i], yp1[i]], 
            p2: [number, number] = [xp2[i], yp2[i]], 
            p3 = points[i + 1];
        const line = bezierCurve(p0, p1, p2, p3);
        line.splice(-1, 1);
        smoothed.push(...line);
    }
    smoothed.push(points[points.length - 1]);

    return smoothed;
}