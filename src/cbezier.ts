import { lli4 } from "./utils";

type Segment = {
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
};

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

    const steps = 1000, result: [number, number][] = [];
    for (let i = 0; i < steps; i++) {
        result.push([formulaX(i / steps), formulaY(i / steps) ])
    }
    result.push([formulaX(1), formulaY(1)]);

    return result;
}

/**
 * 计算由points组成的n-1条线段的中间控制点p1、p2
 * @param points number[] 轨迹点坐标集合
 * @returns { p1: number[], p2: number[] } 控制点p1、p2的集合
 */
export function computeControlPoints(points: number[]): { p1: number[], p2: number[] } {
    const n = points.length - 1;
    const p1 = new Array(n), p2 = new Array(n);

    const a = new Array(n), b = new Array(n), c = new Array(n), r = new Array(n);
    // first segment
    a[0] = 0;
    b[0] = 2;
    c[0] = 1;
    r[0] = points[0] + 2 * points[1];

    // middle segment
    for (let i = 1; i < n - 1; i++) {
        a[i] = 1;
        b[i] = 4;
        c[i] = 1;
        r[i] = 4 * points[i] + 2 * points[i + 1];
    }

    // last segment
    a[n - 1] = 2;
    b[n - 1] = 7;
    c[n - 1] = 0;
    r[n - 1] = 8 * points[n - 1] + points[n];

    // Thomas algorithm (from Wikipedia):https://www.cnblogs.com/xpvincent/archive/2013/01/25/2877411.html
    for (let i = 1; i <= n - 1; i++) {
        b[i] = b[i] - a[i] * c[i - 1] / b[i - 1];
        r[i] = r[i] - a[i] * r[i - 1] / b[i - 1];
    }
    p1[n - 1] = r[n - 1] / b[n - 1];
    // from n-2 to 0，compute values of p1;
    for (let i = n - 2; i >= 0; i--) {
        // b[i] * p1[i] + c[i] * p1[i + 1] = r[i],
        p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];
    } 
    // compute p2 by equation p2[i] = 2 * points[i] - p1[i]
    for (let i = 0; i < n - 1; i++) {
        p2[i] = 2 * points[i + 1] - p1[i + 1];
    }
    // by equation p1[n - 1] - 2 * p2[n - 1] + points[n] = 0
    p2[n - 1] = (p1[n - 1] + points[n]) / 2;

    return { p1, p2 };
}

export function offsetAt(segment: Segment, t: number, distance: number): { c: [number, number]; n: [number, number]; x: number, y: number } {
    const {p0, p1, p2, p3} = segment;
    const formulaX = bezierFormula(p0[0], p1[0], p2[0], p3[0]);
    const formulaY = bezierFormula(p0[1], p1[1], p2[1], p3[1]);
    const [x, y] = [formulaX(t), formulaY(t)];
    const n = normal(segment, t);

    const ret = {
        c: <[number, number]>[x, y],
        n: <[number, number]>[n.x, n.y],
        x: x + n.x * distance,
        y: y + n.y * distance,
      };
    
    return ret;
}

export function offset(segments: Segment[], distance: number): Segment[] {
    return segments.map((s) => {
        return scale(s, distance);
    })
}

export function scale(segment: Segment, distance: number): Segment {
     const r1 = distance;
     const r2 = distance;
     const order = 3;
     const points = [segment.p0, segment.p1, segment.p2, segment.p3];

    // v为起、终两个位置的法线距离为10的两个点
    const v = [offsetAt(segment, 0, 10), offsetAt(segment, 1, 10)];
     // np为计算结果
    const np: [number, number][] = [];
    // 0为两条线的交点
    const o = lli4([v[0].x, v[0].y], v[0].c, [v[1].x, v[1].y], v[1].c);
    if (!o) {
        throw new Error("cannot scale this curve. Try reducing it first.");
    }
    [0, 1].forEach(function (t) {
        // order代表几次曲线，2次、3次曲线。
        const p = (np[t * order] = [...points[t * order]]);
        // 计算p点的位置
        p[0] += (t ? r2 : r1) * v[t].n[0];
        p[1] += (t ? r2 : r1) * v[t].n[1];
    });

    [0, 1].forEach((t) => {
        // p为端点位置
        const p = np[t * order];
        // t位置一阶导值，斜率，端点位置的斜率
        const d = derivative(segment, t);
        // 感觉p2为一个在切线上的点
        const p2: [number, number] = [ p[0] + d.x, p[1] + d.y] // { x: p[0] + d.x, y: p[1] + d.y };
        // p为端点、p2为切线上的点、points[t + 1]为相邻的下一个端点
        const desto =  <{x: number, y: number}>lli4(p, p2, [o.x, o.y], points[t + 1]);
        np[t + 1] = [desto.x, desto.y];
    });

    return { p0: np[0], p1: np[1], p2: np[2], p3: np[3] };
}

function normal(segment: Segment, t: number) {
    const { p0, p1, p2, p3 } = segment;
    // Calculate the tangent vector
    var tx = 3 * (1 - t) ** 2 * (p1[0] - p0[0]) + 6 * (1 - t) * t * (p2[0] - p1[0]) + 3 * t ** 2 * (p3[0] - p2[0]);
    var ty = 3 * (1 - t) ** 2 * (p1[1] - p0[1]) + 6 * (1 - t) * t * (p2[1] - p1[1]) + 3 * t ** 2 * (p3[1] - p2[1]);
    var tangent = { x: tx, y: ty };

    // Calculate the normal vector by rotating the tangent vector 90 degrees clockwise
    var normal = { x: tangent.y, y: -tangent.x };

    // Normalize the normal vector
    var length = Math.sqrt(normal.x ** 2 + normal.y ** 2);
    if (length === 0) {
        // If the length is zero, return a zero vector
        return { x: 0, y: 0 };
    } else {
        // Otherwise, normalize the vector and return it
        return { x: normal.x / length, y: normal.y / length };
    }
}

function derivative(segment: Segment, t: number) {
    // derivative of cubic bezier curve
    const formula = (p0: number, p1: number, p2: number, p3: number, t: number) => {
        return -3 * Math.pow(1 - t, 2) * p0 + 3 * (1 - 4 * t + 3 * Math.pow(t, 2)) * p1 + 3 * (2 * t - 3 * Math.pow(t, 2)) * p2 + 3 * Math.pow(t, 2) * p3;
    }
    const { p0, p1, p2, p3 } = segment;

    return {
        x: formula(p0[0], p1[0], p2[0], p3[0], t),
        y: formula(p0[1], p1[1], p2[1], p3[1], t),
    }
}
