import { smooth } from './smooth';
import { assert } from './utils';

export type CChartOptions = {
    title: { text: string },
    yAxis: { 
        title: { text: string }
     },
     xAxis: {
        type: 'category';
        data: [number ,number];
     },
     series: { data: number[]; type: 'line' | 'smooth' }[]
}

const configs = {
    padding: { x: 100, y: 50 }, // padding to border
    lineWidth: 1,
    segLength: { x: 10, y: 5 }, // data segment
    lineColors: ["#87b4e7", "#80e286", "#8087e2"]
}

function getDestPoints(xAxis: CChartOptions["xAxis"], series: CChartOptions["series"], index: number) {
    const originalPoints = <[number, number][]>xAxis.data.map((d, i) => ([d, series[index].data[i]]));
    let destPoints = originalPoints;

    if (series[index].type === 'smooth') {
        destPoints = smooth(destPoints);
    }

    return [originalPoints, destPoints];
}

function init(canvas: HTMLCanvasElement, options: CChartOptions) {
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    assert(ctx, 'Browser don\'t support CanvasRenderingContext2D.');
    const origin = [ configs.padding.x, canvas.height - configs.padding.y ];
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
        ctx.moveTo(origin[0] +  xUnit * i, origin[1]);
        ctx.lineTo(origin[0] +  xUnit * i, origin[1] + 5);
    }
    // draw value on y axios with yAxis's data
    const yUnit = (canvas.height - 2 * configs.padding.y) / configs.segLength.y;
    ctx.strokeStyle = 'rgba(230, 230, 230, 1)';
    for (let i = 0; i <= configs.segLength.y; i++) {
        ctx.moveTo(origin[0], origin[1] - yUnit * i);
        ctx.lineTo(canvas.width - configs.padding.x, origin[1] - yUnit * i)
    }
    ctx.stroke();

    // draw title
    ctx.font = "20px Georgia";
    ctx.fillText(options.title.text, canvas.width / 2 -  options.title.text.length * 5, configs.padding.y - 30);

}

function render(canvas: HTMLCanvasElement, options: CChartOptions) {
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    assert(ctx, 'Browser don\'t support CanvasRenderingContext2D.');
    const origin = [ configs.padding.x, canvas.height - configs.padding.y ];

    // draw value on y axios with yAxis's data
    let min = Infinity, max = -Infinity;
    options.series[0].data.forEach((val , i) => {
        min = Math.min(val, min);
        max = Math.max(val, max);
    });
    const yUnit = (canvas.height - configs.padding.y * 2) / configs.segLength.y;
    const yResolution = max / (canvas.height - 2 * configs.padding.y);
    const xUnit = (canvas.width - configs.padding.x * 2) / configs.segLength.x;
    const xResolution = (options.xAxis.data.at(-1)! - options.xAxis.data[0]) / (canvas.width - 2 * configs.padding.x);
    ctx.font = "12px Georgia";
    ctx.beginPath();
    const rangeX = options.xAxis.data.at(-1)! - options.xAxis.data[0];
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
            ctx.moveTo(origin[0] + (destPoints[i - 1][0] - options.xAxis.data[0]) / xResolution, origin[1] -  destPoints[i - 1][1] / yResolution);
            ctx.lineTo(origin[0] + (destPoints[i][0]  - options.xAxis.data[0]) / xResolution, origin[1] - destPoints[i][1] / yResolution);
        }

        // draw data point
        ctx.fillStyle = configs.lineColors[index % configs.lineColors.length];
        for (let i = 0; i < originalPoints.length; i++) {
            const psotion = [origin[0] + (originalPoints[i][0] - options.xAxis.data[0]) / xResolution, origin[1] -  originalPoints[i][1] / yResolution]
            ctx.moveTo(psotion[0], psotion[1]);
            ctx.arc(psotion[0], psotion[1], 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.stroke();        
    }
}

export function cchart(ele: HTMLElement, options: CChartOptions) {
    const canvas = document.createElement('canvas');
    canvas.width = ele.clientWidth;
    canvas.height = ele.clientHeight;
    ele.appendChild(canvas);

    init(canvas, options);
    render(canvas, options);
}