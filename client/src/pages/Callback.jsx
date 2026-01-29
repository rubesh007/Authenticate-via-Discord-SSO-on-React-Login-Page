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
        const backendUrl = 'https://authenticate-via-discord-sso-on-rea-five.vercel.app/api/auth/discord'; // Adjust if backend port differs
        // Ensure this matches exactly what was used in AuthContext.jsx
        // We can either grab it from env or construct it, but to be safe effectively:
        const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'https://authenticate-via-discord-sso-on-rea.vercel.app/auth/discord/callback';

        const response = await axios.post( backendUrl, {
          code,
          redirect_uri: REDIRECT_URI
        } );

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