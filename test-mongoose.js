const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String },
  type: { type: String, enum: ["text", "file", "system"], default: "text" },
  fileDetails: {
    url: String,
    name: String,
    size: Number,
    mimeType: String,
  }
});

const Message = mongoose.model('MessageTest', MessageSchema);

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/collabsphere');
  
  const msg = await Message.create({
    channelId: new mongoose.Types.ObjectId(),
    sender: new mongoose.Types.ObjectId(),
    content: "hy",
    type: "file",
    fileDetails: {
      url: "/uploads/test.png",
      name: "test.png",
      size: 1000,
      mimeType: "image/png"
    }
  });

  console.log("Saved msg:", JSON.stringify(msg, null, 2));
  
  const found = await Message.findById(msg._id);
  console.log("Found msg:", JSON.stringify(found, null, 2));

  mongoose.disconnect();
}

test().catch(console.error);
