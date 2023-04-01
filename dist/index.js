function assert(condition, err) {
    if (!condition) {
        throw new Error(err);
    }
}
function lli4(p1, p2, p3, p4) {
    const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1], x3 = p3[0], y3 = p3[1], x4 = p4[0], y4 = p4[1];
    return lli8(x1, y1, x2, y2, x3, y3, x4, y4);
}
function lli8(x1, y1, x2, y2, x3, y3, x4, y4) {
    const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d == 0) {
        return false;
    }
    return { x: nx / d, y: ny / d };
}

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
    const steps = 1000, result = [];
    for (let i = 0; i < steps; i++) {
        result.push([formulaX(i / steps), formulaY(i / steps)]);
    }
    result.push([formulaX(1), formulaY(1)]);
    return result;
}
/**
 * 计算由points组成的n-1条线段的中间控制点p1、p2
 * @param points number[] 轨迹点坐标集合
 * @returns { p1: number[], p2: number[] } 控制点p1、p2的集合
 */
function computeControlPoints(points) {
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
function offsetAt(segment, t, distance) {
    const { p0, p1, p2, p3 } = segment;
    const formulaX = bezierFormula(p0[0], p1[0], p2[0], p3[0]);
    const formulaY = bezierFormula(p0[1], p1[1], p2[1], p3[1]);
    const [x, y] = [formulaX(t), formulaY(t)];
    const n = normal(segment, t);
    const ret = {
        c: [x, y],
        n: [n.x, n.y],
        x: x + n.x * distance,
        y: y + n.y * distance,
    };
    return ret;
}
function offset(segments, distance) {
    return segments.map((s) => {
        return scale(s, distance);
    });
}
function scale(segment, distance) {
    const r1 = distance;
    const r2 = distance;
    const order = 3;
    const points = [segment.p0, segment.p1, segment.p2, segment.p3];
    // v为起、终两个位置的法线距离为10的两个点
    const v = [offsetAt(segment, 0, 10), offsetAt(segment, 1, 10)];
    // np为计算结果
    const np = [];
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
        const p2 = [p[0] + d.x, p[1] + d.y]; // { x: p[0] + d.x, y: p[1] + d.y };
        // p为端点、p2为切线上的点、points[t + 1]为相邻的下一个端点
        const desto = lli4(p, p2, [o.x, o.y], points[t + 1]);
        np[t + 1] = [desto.x, desto.y];
    });
    return { p0: np[0], p1: np[1], p2: np[2], p3: np[3] };
}
function normal(segment, t) {
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
    }
    else {
        // Otherwise, normalize the vector and return it
        return { x: normal.x / length, y: normal.y / length };
    }
}
function derivative(segment, t) {
    // derivative of cubic bezier curve
    const formula = (p0, p1, p2, p3, t) => {
        return -3 * Math.pow(1 - t, 2) * p0 + 3 * (1 - 4 * t + 3 * Math.pow(t, 2)) * p1 + 3 * (2 * t - 3 * Math.pow(t, 2)) * p2 + 3 * Math.pow(t, 2) * p3;
    };
    const { p0, p1, p2, p3 } = segment;
    return {
        x: formula(p0[0], p1[0], p2[0], p3[0], t),
        y: formula(p0[1], p1[1], p2[1], p3[1], t),
    };
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

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */
// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
var float32ArraySupported = typeof Float32Array === 'function';
function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C(aA1) { return 3.0 * aA1; }
// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
// at为t，aA1表示x1或者x2,aA2表示y1或者y2
// 其形式和p0 * Math.pow(1 - t, 3) + p1 * 3 * t * Math.pow(1 - t, 2) + p2 * 3 * Math.pow(t, 2) * (1 - t) + p3 * Math.pow(t, 3)一致
function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }
// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
// 求曲线方程的一阶导函数
function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }
// 二分球根法：
// 求得的根t，位于aA和aB之间, mX1、mX2分别对应p1、p2的X坐标
// https://zhuanlan.zhihu.com/p/112845185
function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
        currentT = aA + (aB - aA) / 2.0;
        // 假设f(t) = 0，求解方程的根。其f(t)=calcBezier(t) - ax
        // f(t)为递增函数
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
            aB = currentT;
        }
        else {
            aA = currentT;
        }
        // 如果currentX小于等于最小精度(SUBDIVISION_PRECISION)或者超过迭代次数SUBDIVISION_MAX_ITERATIONS，则终止
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
}
function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    // NEWTON_ITERATIONS为4， 只进行了4次迭代， 根据精度和性能之间做了平衡。
    for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
        // 计算t值对应位置的斜率
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) {
            return aGuessT;
        }
        // 假设f(t) = 0，求解方程的根。其f(t)=calcBezier(t) - ax
        // 牛顿-拉佛森方法: Xn-1 = Xn - f(t) / f'(t)，应用到求贝塞尔曲线的根：Tn = Tn+1 - (calcBezier(t) - ax) / getSlope(t)
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
    }
    // 这里只迭代了4次，求得近似值
    return aGuessT;
}
function LinearEasing(x) {
    return x;
}
function bezier(mX1, mY1, mX2, mY2) {
    // 判断x轴的值是否在[0,1]范围
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
        throw new Error('bezier x values must be in [0, 1] range');
    }
    // 如果两个点在一条线上，则使用线性动画
    if (mX1 === mY1 && mX2 === mY2) {
        return LinearEasing;
    }
    // kSplineTableSize为11，kSampleStepSize为1.0 / (11 - 1.0) = 0.1;
    // Precompute samples table
    // sampleValues存储样本值的目的是提升性能，不用每次都计算。
    var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
    // i从0到10，sampleValues长度为11
    for (var i = 0; i < kSplineTableSize; ++i) {
        // i * kSampleStepSize的范围0到1(10 * 0.1);
        // sampleValues[0] = calcBezier(0, mX1, mX2);
        // sampleValues[1] = calcBezier(0.1, mX1, mX2);
        // ...
        // sampleValues[9] = calcBezier(0.9, mX1, mX2);
        // sampleValues[10] = calcBezier(1, mX1, mX2);
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
    // 已知X值，根据X值求解T值
    function getTForX(aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        // lastSample为10
        var lastSample = kSplineTableSize - 1;
        // sampleValues[i]表示i从0以0.1为step，每一步对应的曲线的X坐标值，直到X坐标值小于等于aX
        // 假如aX=0.4，则sampleValues[currentSample]<=aX为止
        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            // intervalStart为到aX经过的step步骤
            intervalStart += kSampleStepSize; // kSampleStepSize为0.1
        }
        //TODO:currentSample为什么要减1？sampleValues[currentSample]大于了ax，所以要--，使得sampleValues[currentSample]<=ax
        --currentSample;
        // Interpolate to provide an initial guess for t
        // ax-sampleValues[currentSample]为两者之间的差值，而(sampleValues[currentSample + 1] - sampleValues[currentSample])一个步骤之间的总差值。
        var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        // guessForT为预计的初始T值，很粗糙的一个值，接下来会基于该值求根(t值)。
        var guessForT = intervalStart + dist * kSampleStepSize;
        // 预测的T值对应位置的斜率
        var initialSlope = getSlope(guessForT, mX1, mX2);
        // 当斜率大于0.05729°时，使用newtonRaphsonIterate算法预测T值。0.05729是一个很小的斜率
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        }
        else if (initialSlope === 0.0) { // 当斜率为0，则直接返回
            return guessForT;
        }
        else { // 当斜率小于0.05729并且不等于0时，使用binarySubdivide
            // 求得的根t，位于intervalStart和intervalStart + kSampleStepSize之间, mX1、mX2分别对应p1、p2的X坐标
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
    }
    return function BezierEasing(x) {
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (x === 0 || x === 1) {
            return x;
        }
        return calcBezier(getTForX(x), mY1, mY2);
    };
}

const easeMap = new Map([
    ['linear', 'cbezier(0.0, 0.0, 1.0, 1.0)'],
    ['ease-in', 'cbezier(0.42, 0.0, 1.0, 1.0)'],
    ['ease-out', 'cbezier(0.0, 0.0, 0.58, 1.0)'],
    ['ease-in-out', 'cbezier(0.42, 0.0, 0.58, 1.0)'],
]);
/**
 * 动画效果函数，返回基于t(范围[0, 1])的函数，其执行结果范围为[0, 1]
 * @param easing
 * @returns 动画函数
 */
function resolveEasing(easing) {
    if (easeMap.has(easing)) {
        easing = easeMap.get(easing);
    }
    let bezierMatch = /cbezier\((\d+.?\d+),\s?(\d+.?\d+),\s?(\d+.?\d+),\s?(\d+.?\d+)\)/g.exec(easing);
    if (bezierMatch === null || bezierMatch === void 0 ? void 0 : bezierMatch.length) {
        const x1 = Number(bezierMatch[1]), y1 = Number(bezierMatch[2]), x2 = Number(bezierMatch[3]), y2 = Number(bezierMatch[4]);
        return bezier(x1, y1, x2, y2);
    }
    return (t) => t;
}
function getUnit(val) {
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    if (split)
        return split[1];
}
/**
 * 将像素值转换为目标单位值
 * @param {*} el
 * @param {*} value
 * @param {*} unit
 * @returns
 */
function convertPxToUnit(el, value, unit) {
    const baseline = 100;
    // 创建一个和el类型一样的要素
    const tempEl = document.createElement(el.tagName);
    // 获取要素的parent
    const parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
    parentEl.appendChild(tempEl);
    tempEl.style.position = 'absolute';
    // 设置基线为100个目标单位
    tempEl.style.width = baseline + unit;
    // 宽度因子，目标长度/一个像素
    const factor = baseline / tempEl.offsetWidth;
    parentEl.removeChild(tempEl);
    // parseFloat会将最后的单位忽略得到数值
    const convertedUnit = factor * parseFloat(value);
    return convertedUnit;
}
function resolveStyles(el, styles) {
    const keys = Object.keys(styles);
    const styleFuncs = {};
    for (const key of keys) {
        // 测试先支持百分比格式
        const value = styles[key] + '';
        const unit = getUnit(value);
        const destValue = parseFloat(value);
        const styleValue = getComputedStyle(el).getPropertyValue(key.toLowerCase());
        const startValue = unit ? convertPxToUnit(el, styleValue, unit) : parseFloat(styleValue);
        const total = destValue - startValue;
        styleFuncs[key] = (percent) => {
            const curVal = startValue + total * percent;
            return unit ? curVal + unit : curVal;
        };
    }
    return styleFuncs;
}
/**
 * 元素动画
 * @param el DOM元素
 * @param props 动画属性
 */
function animate(el, props) {
    const duration = props.duration;
    const easingFunc = resolveEasing(props.easing);
    const styleFuncs = resolveStyles(el, props.styles);
    const cAniInstance = {
        paused: false,
    };
    const start = Date.now();
    const animationHandle = () => {
        if (cAniInstance.paused) {
            return;
        }
        const timeRatio = (Date.now() - start) / duration;
        if (timeRatio <= 1) {
            const percent = easingFunc(timeRatio);
            for (const key in styleFuncs) {
                const elementStyle = el.style;
                elementStyle[key] = styleFuncs[key](percent);
            }
            requestAnimationFrame(animationHandle);
        }
    };
    requestAnimationFrame(animationHandle);
    return {
        pause: () => {
            cAniInstance.paused = true;
        }
    };
}

/**
 * 曲线平滑，对轨迹点points做平滑处理
 * @param points
 * @returns
 */
function smooth(points) {
    if (points.length <= 2) {
        return points;
    }
    const { p1: xp1, p2: xp2 } = computeControlPoints(points.map(p => p[0]));
    const { p1: yp1, p2: yp2 } = computeControlPoints(points.map(p => p[1]));
    const smoothed = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i], p1 = [xp1[i], yp1[i]], p2 = [xp2[i], yp2[i]], p3 = points[i + 1];
        const line = bezierCurve(p0, p1, p2, p3);
        line.splice(-1, 1);
        smoothed.push(...line);
    }
    smoothed.push(points[points.length - 1]);
    return smoothed;
}

const configs = {
    padding: { x: 100, y: 50 },
    lineWidth: 1,
    segLength: { x: 10, y: 5 },
    lineColors: ["#87b4e7", "#80e286", "#8087e2"]
};
function getDestPoints(xAxis, series, index) {
    const originalPoints = xAxis.data.map((d, i) => ([d, series[index].data[i]]));
    let destPoints = originalPoints;
    if (series[index].type === 'smooth') {
        destPoints = smooth(destPoints);
    }
    return [originalPoints, destPoints];
}
function init(canvas, options) {
    const ctx = canvas.getContext('2d');
    assert(ctx, 'Browser don\'t support CanvasRenderingContext2D.');
    const origin = [configs.padding.x, canvas.height - configs.padding.y];
    ctx.lineWidth = configs.lineWidth;
    // draw y axios
    ctx.beginPath();
    // draw x axios
    ctx.strokeStyle = '#ced6e9';
    ctx.moveTo(origin[0], origin[1]);
    ctx.lineTo(canvas.width - configs.padding.x, canvas.height - configs.padding.y);
    // draw value on axios with xAxis's data
    const xUnit = (canvas.width - 2 * configs.padding.x) / configs.segLength.x;
    for (let i = 0; i <= configs.segLength.x; i++) {
        ctx.moveTo(origin[0] + xUnit * i, origin[1]);
        ctx.lineTo(origin[0] + xUnit * i, origin[1] + 5);
    }
    // draw value on y axios with yAxis's data
    const yUnit = (canvas.height - 2 * configs.padding.y) / configs.segLength.y;
    ctx.strokeStyle = 'rgba(230, 230, 230, 1)';
    for (let i = 0; i <= configs.segLength.y; i++) {
        ctx.moveTo(origin[0], origin[1] - yUnit * i);
        ctx.lineTo(canvas.width - configs.padding.x, origin[1] - yUnit * i);
    }
    ctx.stroke();
    // draw title
    ctx.font = "20px Georgia";
    ctx.fillText(options.title.text, canvas.width / 2 - options.title.text.length * 5, configs.padding.y - 30);
}
function render(canvas, options) {
    const ctx = canvas.getContext('2d');
    assert(ctx, 'Browser don\'t support CanvasRenderingContext2D.');
    const origin = [configs.padding.x, canvas.height - configs.padding.y];
    // draw value on y axios with yAxis's data
    let max = -Infinity;
    options.series[0].data.forEach((val, i) => {
        max = Math.max(val, max);
    });
    const yUnit = (canvas.height - configs.padding.y * 2) / configs.segLength.y;
    const yResolution = max / (canvas.height - 2 * configs.padding.y);
    const xUnit = (canvas.width - configs.padding.x * 2) / configs.segLength.x;
    const xResolution = (options.xAxis.data.at(-1) - options.xAxis.data[0]) / (canvas.width - 2 * configs.padding.x);
    ctx.font = "12px Georgia";
    ctx.beginPath();
    const rangeX = options.xAxis.data.at(-1) - options.xAxis.data[0];
    // draw scale value on x-axios.
    for (let i = 0; i < configs.segLength.x; i++) {
        const value = options.xAxis.data[0] + Math.floor(i * rangeX / configs.segLength.x);
        ctx.fillText(value + '', origin[0] + i * xUnit, origin[1] + 20);
    }
    // draw scale value on y-axios
    for (let i = 0; i < configs.segLength.y; i++) {
        const value = Math.floor((i + 1) * max / configs.segLength.y) + '';
        ctx.fillText(value, origin[0] - value.length * 5 - 10, origin[1] - (i + 1) * yUnit);
    }
    for (let index = 0; index < options.series.length; index++) {
        ctx.beginPath();
        const [originalPoints, destPoints] = getDestPoints(options.xAxis, options.series, index);
        // draw data line
        ctx.strokeStyle = configs.lineColors[index % configs.lineColors.length];
        ctx.lineWidth = 2;
        for (let i = 1; i < destPoints.length; i++) {
            ctx.moveTo(origin[0] + (destPoints[i - 1][0] - options.xAxis.data[0]) / xResolution, origin[1] - destPoints[i - 1][1] / yResolution);
            ctx.lineTo(origin[0] + (destPoints[i][0] - options.xAxis.data[0]) / xResolution, origin[1] - destPoints[i][1] / yResolution);
        }
        // draw data point
        ctx.fillStyle = configs.lineColors[index % configs.lineColors.length];
        for (let i = 0; i < originalPoints.length; i++) {
            const psotion = [origin[0] + (originalPoints[i][0] - options.xAxis.data[0]) / xResolution, origin[1] - originalPoints[i][1] / yResolution];
            ctx.moveTo(psotion[0], psotion[1]);
            ctx.arc(psotion[0], psotion[1], 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.stroke();
    }
}
function cchart(ele, options) {
    const canvas = document.createElement('canvas');
    canvas.width = ele.clientWidth;
    canvas.height = ele.clientHeight;
    ele.appendChild(canvas);
    init(canvas, options);
    render(canvas, options);
}

export { animate, bezierCurve, bezierFormula, cchart, computeControlPoints, drawEllipse, ellipse, offset, offsetAt, scale };
