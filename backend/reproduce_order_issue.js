const API_URL = 'http://localhost:5000/api';

async function reproduce() {
    try {
        const randomEmail = `testuser_${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Registering user ${randomEmail}...`);
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: randomEmail,
                password: password,
                phone: '1234567890',
                referral_code: 'JOINSM'
            })
        });

        if (!registerRes.ok) {
            const error = await registerRes.text();
            throw new Error(`Registration failed: ${registerRes.status}\n${error}`); // Line 22
        }
        console.log('Registered successfully.');

        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: randomEmail,
                password: password
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Logged in, token received.');

        console.log('Fetching products...');
        const productsRes = await fetch(`${API_URL}/products`);
        if (!productsRes.ok) throw new Error(`Fetch products failed: ${productsRes.status}`);
        const products = await productsRes.json();

        if (products.length === 0) {
            console.error('No products found to order.');
            return;
        }
        const product = products[0];
        console.log(`Ordering product: ${product.name} (ID: ${product.id})`);

        console.log('Creating order...');
        const orderRes = await fetch(`${API_URL}/shop/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: [{ productId: product.id, quantity: 1 }]
            })
        });

        if (!orderRes.ok) {
            const errorData = await orderRes.text();
            throw new Error(`Order creation failed: ${orderRes.status}\n${errorData}`);
        }

        const orderData = await orderRes.json();
        console.log('Order created successfully:', orderData);

    } catch (error) {
        console.error('Error reproducing issue:', error.message);
    }
}

reproduce();
