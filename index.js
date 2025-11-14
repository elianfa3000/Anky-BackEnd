import "dotenv/config"; //.env..
import connectDB from "./src/mongoDB.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 3000; //.anv
await connectDB();

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
