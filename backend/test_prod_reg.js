async function testRegistrationProd() {
    try {
        const res = await fetch('https://mlm-2nd.onrender.com/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Phone Prod',
                contact: '9998887776',
                password: 'password123',
                referral_code: 'JOINSM'
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testRegistrationProd();
