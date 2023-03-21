import { useEffect, useRef } from "react";
import './animation.css';
import { animate } from "cbezier";

export function Animation() {
    const aniRef = useRef(null);
    const bezieRef = useRef(null);

    useEffect(() => {
        let ended = false;
        setInterval(() => {
            const item1 = aniRef.current.querySelector('.item1');
            const item2 = aniRef.current.querySelector('.item2');
            item1.style.left = !ended ? 'calc(100%)' : '0';
            item2.style.left = !ended ? 'calc(100%)' : '0';

            ended = !ended;
        }, 2010);
    }, [aniRef, bezieRef])

    useEffect(() => {
        let ended = false;
        setInterval(() => {
            animate(bezieRef.current, {
                duration: 2000,
                easing: 'cbezier(0.4,0.08,0.54,0.85)',
                styles: [{ left: !ended ? '0%' : '100%' }, { left: !ended ? '100%' : '0%' } ]
            })

            ended = !ended;
        }, 2010);
    }, [bezieRef])

    return <div ref={aniRef} className='animation'>
        <div className="item item1 fade-in-linear"></div>
        <div className="item item2 fade-in-cbezier"></div>
        <div ref={bezieRef} className="item item3"></div>
        {/* <button onClick={() => { animate() }}>动画</button> */}
    </div>;
}

export default Animation;