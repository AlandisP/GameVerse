import React, { useState, useEffect } from 'react'

function ErrorMessage({Message}) {

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {

        if(!Message) {
            setIsVisible(false);
            return;
        }
        setIsVisible(true);
        const timer = setTimeout(() =>{
                setIsVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    },[Message]);
     if (!isVisible) return null;



    return(
        <div className="overlay">
            <div className='hidden'>
                <p className='errormsg'>{Message}</p>
            </div>
        </div>
    );

}

export default ErrorMessage;