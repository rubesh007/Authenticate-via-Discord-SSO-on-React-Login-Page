# SSO Login Code Explanation (Tanglish)

Indha document-la namma SSO Login code epdi velai seiyudhu nu line-by-line paakalaam.

## 1. frontend/src/context/AuthContext.jsx (The Starting Point)
**Role:** Inga dhaan "Login" button click panna enna nadakanum nu eludhi irukku. Start inga dhaan.

### Lines 1-17: Setup
```javascript
const AuthContext = createContext(); // Oru global storage create panrom.
// ...
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // User login aana data inga dhaan irukkum.
    // ...
    useEffect(() => {
        // App open aanadhum, already login panni irukkangala nu localStorage check panrom.
        const storedUser = localStorage.getItem('discord_user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);
```
**Tanglish Explanation:** 
"App open aanadhum check pannu, ivan already login pannavana?" nu paathu, irundha `user` variable-la set panrom.

### Lines 18-32: The Login Function
```javascript
const login = () => {
    // 1. Oru random secret code create panrom (Security key madhiri).
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state); // Adha save panni vechippom.

    // 2. Client ID & Redirect URI edukkurom.
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = ...; 

    // 3. Discord URL build panrom.
    // "Dei Discord, indha ID vachu, indha URL ku thirumba anuppu".
    const targetUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}...&state=${state}`;

    // 4. User-a antha link-ukku thalli vidurom (Redirect).
    window.location.href = targetUrl;
};
```
**Tanglish Explanation:** 
Inga dhaan main switch irukku. `login()` call aanadhum, namma friend (Discord) kitta oru letter eludhi (URL), user-a anga anuppurom.

---

## 2. frontend/src/pages/Callback.jsx (The Return Journey)
**Role:** Discord-la permission kuduthadhum, user inga dhaan land aavaanga.

### Lines 11-22: Checking the Parcel
```javascript
useEffect(() => {
    const processCallback = async () => {
        // URL la irundhu 'code' mattrum 'state' edukkurom.
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code'); 
        const state = searchParams.get('state');
        
        // Code ellana "Thambi, nee sariya login pannala, poitu va" nu sollidum.
        if (!code || !state) { navigate('/login'); return; }
```
### Lines 24-28: Security Check
```javascript
        // Namma anuppuna secret code-um, thirumba vandha code-um onna irukka?
        const storedState = localStorage.getItem('oauth_state');
        if (state !== storedState) {
            // Illana yaaro hack panna try panranga!
            console.error('Invalid state'); navigate('/login'); return;
        }
```
**Tanglish Explanation:** 
Security romba mukkiyam! Namma anuppuna aalu dhaan thirumba vandhurukkana nu confirm panrom (`state` check).

### Lines 30-35: Talking to Backend
```javascript
        try {
            // "Indha code-a vechi user yaaru nu kandupidi" nu Backend-ku anuppurom.
            const response = await axios.post('http://localhost:3000/api/auth/discord', { code });

            // Backend user details kuduthuduchu!
            const { user } = response.data;
            setUser(user); // Global state la set pannu.
            localStorage.setItem('discord_user', JSON.stringify(user)); // Save pannikko.
            
            navigate('/dashboard'); // Success! Ulla po.
```
**Tanglish Explanation:** 
Ippo namma kitta irukka `code`-a backend-ku anuppi, original user details-a vaangurom.

---

## 3. backend/controllers/authController.js (The Engine Room)
**Role:** Inga dhaan asalaana verification nadakkum. (`server.js` la irundhu ippo inga mathitom).

### Lines 19-33: Preparation
```javascript
export const discordAuth = async (req, res) => {
  const { code } = req.body; // Frontend anuppuna code.

  // Discord kitta pesuradhuku oru form ready panrom.
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET, // Idhu dhaan namma PASSWORD!
    code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
  });
```

### Lines 35-41: Getting the Access Token
```javascript
    // Discord kitta Code kuduthu Token kekkurom.
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params...);

    // Token kedachuduchu! (Idhu oru temporary key madhiri).
    const { access_token, token_type } = tokenResponse.data;
```
**Tanglish Explanation:** 
Normal `code` vechi onnum panna mudiyadhu. Andha code-a kuduthu, namma Secret key-a kaamichu, oru `access_token` vaangurom.

### Lines 44-54: Getting User Data
```javascript
    // Andha Token vechi "Ippo sollu, ivan yaaru?" nu kekkurom.
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { authorization: `${token_type} ${access_token}` },
    });

    // User details (Name, Email, Photo) eduthu Frontend-ku anuppurom.
    res.json({
      access_token,
      user: userResponse.data,
    });
```
**Tanglish Explanation:** 
Final step! Token-a kaati, user oda original details (profile) eduthu frontend kitta "Indha paaru un aalu" nu thirumba kuduthudurom.
