import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  try {
    const email = `test_${Date.now()}@test.com`;
    await axios.post('http://localhost:5000/api/auth/register', { name: 'Test', email, password: 'password123' });
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password: 'password123' });
    const cookie = loginRes.headers['set-cookie'];

    const wsRes = await axios.post('http://localhost:5000/api/workspaces', { name: 'Test Workspace', description: 'desc' }, { headers: { Cookie: cookie } });
    const workspaceId = wsRes.data._id;

    fs.writeFileSync('test.txt', 'hello world');
    const form = new FormData();
    form.append('workspaceId', workspaceId);
    form.append('files', fs.createReadStream('test.txt'));
    
    // Create an axios instance mimicking api.ts
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log("Testing with explicit multipart/form-data...");
    try {
      await api.post('/files', form, {
        headers: { ...form.getHeaders(), 'Content-Type': 'multipart/form-data', Cookie: cookie }
      });
      console.log("SUCCESS with explicit multipart/form-data");
    } catch (e) {
      console.log("FAILED with explicit multipart/form-data:", e.response?.status, e.response?.data);
    }

    console.log("Testing with Content-Type: undefined...");
    try {
      const headers = form.getHeaders();
      delete headers['content-type'];
      await api.post('/files', form, {
        headers: { ...headers, 'Content-Type': undefined, Cookie: cookie }
      });
      console.log("SUCCESS with Content-Type: undefined");
    } catch (e) {
      console.log("FAILED with Content-Type: undefined:", e.response?.status, e.response?.data);
    }

  } catch (error) {
    console.error(error);
  }
}
test();
