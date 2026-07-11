import mongoose from "mongoose";
import { Workspace } from "./src/models/Workspace";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/collabsphere")
  .then(async () => {
    const workspaces = await Workspace.find({});
    for (const ws of workspaces) {
      const seen = new Set();
      const uniqueMembers = [];
      for (const m of ws.members) {
        if (!seen.has(m.user.toString())) {
          seen.add(m.user.toString());
          uniqueMembers.push(m);
        } else {
          console.log(`Removed duplicate member ${m.user.toString()} from workspace ${ws._id}`);
        }
      }
      ws.members = uniqueMembers as any;
      await ws.save();
    }
    console.log("Duplicates removed");
    process.exit(0);
  });
