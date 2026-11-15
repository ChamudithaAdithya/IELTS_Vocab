const http = require('http');

http.get('http://localhost:3000/', (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', () => {});
  res.on('end', () => {
    console.log('Response complete!');
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('HTTP Error:', err.message);
  process.exit(1);
});

