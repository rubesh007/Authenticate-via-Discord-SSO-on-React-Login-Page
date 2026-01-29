import axios from 'axios';

// Discord OAuth2 Config
// Note: In a real app, you might want to validate these env vars exist
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

export const discordAuth = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    });

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, token_type } = tokenResponse.data;

    // Optional: Fetch user info immediately using the token
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${token_type} ${access_token}`,
      },
    });

    res.json({
      access_token,
      token_type,
      user: userResponse.data,
    });

  } catch (error) {
    console.error('Discord Auth Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
