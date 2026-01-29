import axios from 'axios';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Callback = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect( () => {
    const processCallback = async () => {
      const searchParams = new URLSearchParams( location.search );
      const code = searchParams.get( 'code' );
      const state = searchParams.get( 'state' );
      const storedState = localStorage.getItem( 'oauth_state' );

      if ( !code || !state ) {
        console.error( 'Missing code or state' );
        navigate( '/login' );
        return;
      }

      if ( state !== storedState ) {
        console.error( 'Invalid state (CSRF detected)' );
        navigate( '/login' );
        return;
      }

      try {
        const backendUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/discord`;
        const response = await axios.post( backendUrl, { code } );

        const { user } = response.data;
        setUser( user );
        localStorage.setItem( 'discord_user', JSON.stringify( user ) );

        // Clear state
        localStorage.removeItem( 'oauth_state' );

        navigate( '/dashboard' );
      } catch ( error ) {
        console.error( 'Login failed:', error );
        navigate( '/login?error=auth_failed' );
      }
    };

    processCallback();
  }, [ location, navigate, setUser ] );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Authenticating with Discord...</p>
      </div>
    </div>
  );
};

export default Callback;
