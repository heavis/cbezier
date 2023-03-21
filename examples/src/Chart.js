import { useEffect, useRef } from 'react';
import './chart.css';
import { cchart } from 'cbezier';

function Chart() {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        cchart(chartRef.current, { 
            title: { text: 'Employment Growth' },
            yAxis: { 
                title: { text: 'Quantity' }
             },
             xAxis: {
                type: 'category',
                data: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
             },
             series: [
                { 
                    data: [43934, 48656, 65165, 81827, 112143, 142383, 171533, 165174, 155157, 161454],
                    type: 'smooth'
                },
                { 
                    data: [13934, 38656, 15165, 41827, 142143, 32383, 61533, 105174, 145157, 151454],
                    type: 'line'
                },
                { 
                    data: [3934, 28656, 105165, 61827, 92143, 22383, 51533, 145174, 135157, 141454],
                    type: 'smooth'
                }
             ]
        })
    }, [chartRef]);

    return <div ref={chartRef} className='chart'></div>;
}

export default Chart;