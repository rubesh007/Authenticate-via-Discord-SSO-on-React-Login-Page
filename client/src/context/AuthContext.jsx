import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ( { children } ) => {
    const [ user, setUser ] = useState( null );
    const [ loading, setLoading ] = useState( true );

    useEffect( () => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem( 'discord_user' );
        if ( storedUser ) {
            setUser( JSON.parse( storedUser ) );
        }
        setLoading( false );
    }, [] );

    const login = () => {
        // Generate random state for CSRF protection
        const state = Math.random().toString( 36 ).substring( 7 );
        localStorage.setItem( 'oauth_state', state );

        // Redirect to Discord OAuth URL
        // NOTE: You need to replace NEXT_PUBLIC_DISCORD_CLIENT_ID and REDIRECT_URI with actual values or env vars
        const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
        const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'authenticate-via-discord-sso-on-rea-ten.vercel.app/auth/discord/callback';

        // Scopes: identify email
        const targetUrl = `https://discord.com/api/oauth2/authorize?client_id=${ CLIENT_ID }&redirect_uri=${ encodeURIComponent( REDIRECT_URI ) }&response_type=code&scope=identify%20email&state=${ state }`;

        window.location.href = targetUrl;
    };

    const logout = () => {
        localStorage.removeItem( 'discord_user' );
        localStorage.removeItem( 'oauth_state' );
        setUser( null );
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={ { user, loading, login, logout, setUser } }>
            { children }
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext( AuthContext );
