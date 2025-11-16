import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
function HomePage({username}) {
    const history = useNavigate();
    return(
        <div>
            <h3>Welcome {username}, you are logged in!</h3>
        </div>
    );
}

export default HomePage;
