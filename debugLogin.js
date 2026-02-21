const debugLogin = async () => {
    try {
        console.log('Attempting login for faishalback@gmail.com...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'faishalback@gmail.com',
                password: '00'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login Successful!');
            console.log('Token:', data.token);
        } else {
            console.error('Login Failed with Server Response:');
            console.error('Status:', response.status);
            console.error('Data:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Login Request Failed:', error.message);
    }
};

debugLogin();
