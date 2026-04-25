require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/food", require("./routes/foodRoutes"));

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.listen(5000, () => console.log("Server on 5000"));