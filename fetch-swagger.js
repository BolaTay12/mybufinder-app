const https = require('https');

https.get('https://bufinderbackend-production.up.railway.app/v3/api-docs', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(data.substring(0, 1000));
    });
});
