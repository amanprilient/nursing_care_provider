const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const router = require("./router")
const PORT = process.env.PORT || 8181

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// for routes
app.use("/", router);

// for service down
app.use((err, req, res, next)=> {
    res.status(500).json({
        "status": "500",
        "message": "Something went wrong",
        "path": req.path,
        "error": err.code
    });
})

// for uploads
app.use('/upload', express.static(__dirname + '/upload'));

// for database
mongoose.connect(process.env.MONGODB_URL).then(res=> {
    console.log("db connected");
}).catch(err=> {
    console.log("error in db connected:>",err);
});



app.listen(PORT, ()=> {
    console.log('server is running on port:',PORT);
});