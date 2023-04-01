import { useEffect, useRef } from "react";
import './index.css';
import { animate } from "cbezier";

var throttle = function(func, delay) {
    var prev = Date.now();
    return function() {
        var context = this;
        var args = arguments;
        var now = Date.now();
        if (now - prev >= delay) {
            func.apply(context, args);
            prev = Date.now();
        }
    }
}

function CWindow() {
    const parentRef = useRef(null);
    const ref1 = useRef(null);
    let aniPlay;
    useEffect(() => {
        const mouseMove = throttle((e) => {
            const x = e.offsetX, y = e.offsetY;
            if (aniPlay) {
                aniPlay.pause();
            }
            // console.log(ref1.current.style.left, ref1.current.style.top);
            aniPlay = animate(ref1.current, {
                duration: 15,
                // easing: 'ease-out',
                easing: 'cbezier(0.25, 0.1, 0.25, 1.0)',
                styles: {
                    left: x + 'px',
                    top: y + 'px',
                }
            })
        }, 15);
        parentRef.current.addEventListener('mousemove', mouseMove);
    }, [ref1]);

    return<div className="container demo-container"> 
        <div className="animmate-menu">
            <div className="item">鼠标跟随</div>
        </div>
        <div ref={parentRef} className='animation'>
            <div ref={ref1} style={{ width: '1px', height: '1px', position: 'absolute', background: '#F00', borderRadius: '50%', boxShadow: '#F00 0px 0px 10px 10px' }}></div>
        </div>
    </div>;
}

export default CWindow;