(async () => {
    try {
        const resp = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email: 'test+signup@example.com', password: 'password123' }),
        });
        const text = await resp.text();
        console.log('STATUS', resp.status);
        console.log(text);
    } catch (e) {
        console.error('ERROR', e);
    }
})();
