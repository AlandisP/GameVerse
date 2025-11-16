import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { useLocation } from 'react-router-dom';
function HomePage() {
    const history = useNavigate();
    const location = useLocation();
    const username = location.state?.username;
    return(
        <div>
            <h3>Welcome {username}, you are logged in!</h3>
        </div>
    );
}

export default HomePage;
