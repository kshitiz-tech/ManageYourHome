import React, {useState, useEffect} from 'react';
import api from '../api/api';
import { Navigate} from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN, USERNAME } from '../constant';
import { jwtDecode } from 'jwt-decode';

interface Props {
    children: React.ReactNode;
}

//protected route component
function Protected({children}:Props){

    //check if authorized
    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    //state to check if authorized
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    
    //function to refresh token
    const refreshToken = async () => {
        const refresh = localStorage.getItem(REFRESH_TOKEN);
        //if no refresh token, not authorized
        if (!refresh) {
            setIsAuthorized(false);
            return;
        }
        //request new access token
        try {
            const response = await api.post('/api/token/refresh/', {
                refresh: refresh,
            });

            //if successful, set new access token and authorize
            if (response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch(error){
            setIsAuthorized(false);
            console.log(error);

        }
    }

    //interface for decoded token
    interface DecodedToken {
    exp: number;
    name: string;
  }
    //function to check authorization
  const auth = async () => {
    //get the token
    const token = localStorage.getItem(ACCESS_TOKEN);

   //if no token, not authorized
    if (!token) {
      setIsAuthorized(false);
      return;
    }
    //if there is token decode the token using jwtDecode
    const decoded = jwtDecode<DecodedToken>(token);
    console.log(decoded);

    //check the expiration date
    const tokenExpiration = decoded.exp;
    const user = decoded.name;
    localStorage.setItem(USERNAME, user);
    //check todays date
    const now = Date.now() / 1000; // to get it in seconds

    //check if expired or not
    if (tokenExpiration < now) {
      //if expired get new refreshtoken
      await refreshToken();
    }

    //if not expired, authorized
    else {
      setIsAuthorized(true);
      
    }

    //check if it is expired or not
    //if expireed (refreshToken)
    //if not expired setIsAuthorirzed(True)
  };

  //just for request for accessing refreshtoken

  //handling the process
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  //if authorized, return children else navigate to login
  return isAuthorized ? children : <Navigate to="/login/" />;


}

export default Protected;
