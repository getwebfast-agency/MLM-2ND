const testApi = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'faishalback@gmail.com',
                password: '00'
            })
        });

        if (!loginRes.ok) {
            console.error('Login Failed:', loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch Users
        console.log('Fetching users...');
        const usersRes = await fetch('http://localhost:5000/api/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', usersRes.status);
        if (!usersRes.ok) {
            console.error('Fetch Failed:', await usersRes.text());
            return;
        }

        const data = await usersRes.json();
        console.log('Data Type:', typeof data);
        console.log('Data Length:', Array.isArray(data) ? data.length : 'Not an array');

        if (Array.isArray(data) && data.length > 0) {
            console.log('First User:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Full Response Data:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Network/Script Error:', error);
    }
};

testApi();
