import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  try {
    // 1. Create a dummy user and login
    const email = `test_${Date.now()}@test.com`;
    await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test', email, password: 'password123'
    });
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email, password: 'password123'
    });
    const cookie = loginRes.headers['set-cookie'];
    console.log("Logged in");

    // 2. Create workspace
    const wsRes = await axios.post('http://localhost:5000/api/workspaces', {
      name: 'Test Workspace', description: 'desc'
    }, { headers: { Cookie: cookie } });
    const workspaceId = wsRes.data._id;
    console.log("Workspace:", workspaceId);

    // 3. Upload file
    fs.writeFileSync('test.txt', 'hello world');
    const form = new FormData();
    form.append('workspaceId', workspaceId);
    form.append('files', fs.createReadStream('test.txt'));
    
    console.log("Uploading...");
    const uploadRes = await axios.post('http://localhost:5000/api/files', form, {
      headers: { ...form.getHeaders(), Cookie: cookie }
    });
    console.log("Upload Success:", uploadRes.status);
    console.log("Data:", uploadRes.data);
  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else {
      console.error(error);
    }
  }
}
test();
