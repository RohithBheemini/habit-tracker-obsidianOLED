const routes = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/habits',
  '/stats',
  '/achievements',
  '/settings',
];

async function healthCheck() {
  console.log('--- Habit Tracker Route Health Check ---');
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`, {
        method: 'GET',
        redirect: 'manual',
      });
      console.log(`Route ${route.padEnd(15)}: [${res.status}] ${res.statusText || (res.status === 200 ? 'OK' : 'REDIRECT')}`);
    } catch (e) {
      console.log(`Route ${route.padEnd(15)}: [FAIL] Is the server running?`);
    }
  }
  console.log('----------------------------------------');
}

healthCheck();
