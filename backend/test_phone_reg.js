async function testRegistration() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Phone User',
                contact: '9876543210',
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

testRegistration();
