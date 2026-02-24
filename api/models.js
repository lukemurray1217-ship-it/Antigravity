export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.MY_API_KEY;

        // Verify password if ACCESS_PASSWORD is set
        const accessPassword = process.env.ACCESS_PASSWORD;
        const incomingPassword = req.query.p;

        // Debug logging for environment (without values)
        console.log('Environment Check (Models):', {
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            hasMyKey: !!process.env.MY_API_KEY,
            hasAccessPassword: !!process.env.ACCESS_PASSWORD,
            providedPassword: !!incomingPassword
        });

        if (!apiKey) {
            return res.status(500).json({ error: { message: 'API key not configured on server (GEMINI_API_KEY or MY_API_KEY missing).' } });
        }

        if (accessPassword && incomingPassword !== accessPassword) {
            return res.status(401).json({ error: { message: 'Incorrect Access Password.' } });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upstream API Error');
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Models Error:', error);
        return res.status(500).json({ error: { message: error.message } });
    }
}
