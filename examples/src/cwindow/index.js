import { useEffect, useRef } from "react";
import './index.css';
import { animate } from "cbezier";

function CWindow() {
    const ref1 = useRef(null);
    setTimeout(() => {
        animate(ref1.current, {
            duration: 500,
            // easing: 'ease-out',
            easing: 'cbezier(0.25, 0.1, 0.25, 1.0)',
            styles: {
                opacity: '1',
                width: '300px',
                height: '200px',
                left: '30%',
                top: '30%',
                rotate: '90deg',
            }
        })
    }, 2010);

    return<div className="container demo-container"> 
        <div className="animmate-menu">
            <div className="item">弹窗动画</div>
        </div>
        <div className='animation'>
            <div ref={ref1} className="item item1">一个简单的弹出效果</div>
        </div>
    </div>;
}

export default CWindow;