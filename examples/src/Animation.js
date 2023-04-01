import { useEffect, useRef } from "react";
import './animation.css';
import { animate } from "cbezier";

export function Animation() {
    const aniRef = useRef(null);
    const linearRef = useRef(null);
    const easeinRef = useRef(null);
    const easeoutRef = useRef(null);
    const easeinoutRef = useRef(null);
    const customRef = useRef(null);

    useEffect(() => {
        let ended = false;
        setInterval(() => {
            const item1 = aniRef.current.querySelector('.item1');
            const item2 = aniRef.current.querySelector('.item2');
            item1.style.left = !ended ? 'calc(100%)' : '0';
            item2.style.left = !ended ? 'calc(100%)' : '0';

            ended = !ended;
        }, 2010);
    }, [aniRef])

    const bezierFunction = (ref, easeFunction) => {
        let ended = false;
        setInterval(() => {
            animate(ref.current, {
                duration: 2000,
                easing: easeFunction,
                styles: [{ left: !ended ? '0%' : '100%' }, { left: !ended ? '100%' : '0%' } ]
            })

            ended = !ended; 
        }, 2010);
    }

    useEffect(() => {
        bezierFunction(customRef, 'cbezier(0.25, 0.1, 0.25, 1.0)')
    }, [customRef]);
    // useEffect(() => {
    //     bezierFunction(linearRef, 'linear');
    // }, [linearRef]);
    // useEffect(() => {
    //     bezierFunction(easeinRef, 'ease-in');
    // }, [easeinRef]);
    // useEffect(() => {
    //     bezierFunction(easeoutRef, 'ease-out');
    // }, [easeoutRef]);
    // useEffect(() => {
    //     bezierFunction(easeinoutRef, 'ease-in-out');
    // }, [easeinoutRef]);
    

    return<div className="container"> 
        {/* <div className="animmate-menu">
            <div className="item">CSS linear</div>
            <div className="item">CSS bezier</div>
            <div className="item">Custom bezier</div>
        </div> */}
        <div className="animmate-menu">
            <div className="item">Linear</div>
            <div className="item">Ease-in</div>
            <div className="item">Ease-out</div>
            <div className="item">Ease-in-out</div>
        </div>
        {/* <div className='animation' ref={aniRef}>
            <div ref={linearRef} className="item item1 fade-in-linear"></div>
            <div ref={easeinRef} className="item item2 fade-in-cbezier"></div>
            <div ref={customRef} className="item item3"></div>
        </div> */}
        <div className='animation'>
            <div ref={linearRef} className="item item1"></div>
            <div ref={easeinRef} className="item item2"></div>
            <div ref={easeoutRef} className="item item3"></div>
            <div ref={easeinoutRef} className="item item4"></div>
        </div>
    </div>;
}

export default Animation;