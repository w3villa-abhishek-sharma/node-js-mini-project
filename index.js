require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToMongo = require("./db");

const app = express();
connectToMongo();
const PORT = process.env.PORT || 5000;

// Use Middleware
app.use(cors());
app.use(express.json());


// import all routes file
app.use("/api/v1", require("./"))


app.listen(PORT, () => {
    console.log(`Start Server on ${PORT} PORT`);
})