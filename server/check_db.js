const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/collabsphere');
  const db = mongoose.connection.db;
  
  const files = await db.collection('files').find().sort({ createdAt: -1 }).limit(5).toArray();
  console.log("LAST 5 FILES IN DB:");
  files.forEach(f => {
    console.log(`- ${f.name} (Workspace: ${f.workspaceId}, Folder: ${f.folderId}, Created: ${f.createdAt})`);
  });
  process.exit(0);
}
test();
