const debugNetwork = async () => {
    try {
        console.log('Fetching network data...');
        // We need a valid token. Since we don't have one handy without logging in, 
        // we might fail on auth if we just hit the endpoint. 
        // But wait, I can use the token I just got from debugLogin.js if it's still valid, 
        // or just login again in this script.

        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'faishalback@gmail.com', password: '00' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) throw new Error('Login failed, cannot test network');

        const res = await fetch('http://localhost:5000/api/admin/network', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Network Data Fetch Successful');
            console.log('Users count:', data.users ? data.users.length : 'N/A');
            console.log('Relationships count:', data.relationships ? data.relationships.length : 'N/A');
            // Check sample data
            if (data.users && data.users.length > 0) {
                console.log('Sample User:', JSON.stringify(data.users[0], null, 2));
            }
        } else {
            console.error('Network Fetch Failed:', res.status, res.statusText);
            const errText = await res.text();
            console.error('Error Body:', errText);
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
};

debugNetwork();
