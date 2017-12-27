var express = require("express");
var cluster = require("cluster");
var favicon = require("serve-favicon");
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var {userSchema} = require("./modal/user");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var router = require("./routes/routes");
var helmet = require("helmet")
var rateLimit = require("express-rate-limit")
const numCPUs = require("os").cpus().length;

var app = express();

var limiter = new rateLimit({
    max: 5,
    message: 'Too many requests, please try again later after 15 Minutes.',
    windowMs: 15 * 60 * 1000,
    statusCode: 429,
    delayAfter: 4,
    delayMs: 10000
})

/* LIMITER IS USED TO PREVENT FROM BRUITE-FORCE ATTACK */

mongoose.connect("mongodb://localhost:27017/assignment", {
    useMongoClient: true
});

/*    THIRD-PARTY MIDDLEWARE TO BE USED   */
app.use(helmet())
app.use(limiter)
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(favicon(path.join(__dirname, "public/images", "favicon.ico")));
app.use(express.static("./public/images"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/*
 ROUTE TO ACCESS THE TEAMS MEMEBERS AFTER YOU HAVE GET THE TOKEN
 */

app.use("/user", (req, res, next) => {
        let token = req.cookies.token;
        jwt.verify(token, "jwt", (err, decode) => {
            if (decode) next();
            // ABOVE LINE MEANS AFTER SUCCESSFULL AUTHENTICATION ACCESS THE TEAM MEMEBERS
            else res.render("error", {message: "Failed To Authenticate. Token Not Found Or Not Verified"});
        });
    },
    router
);

app.get("/get-token", (req, res) => {
    let name = req.query.username;
    if (name) {
        let token = jwt.sign(name, "jwt");
        res.cookie("token", token, {
            httpOnly: true /* TO PREVENT XSS ATTACK */
        });
        res.send(token);
    }
    else res.render("error", {message: "Username Not Found"});

});

process._debugProcess(process.pid); // ENABLE DEBUG MODE

////// FORKING CHILD PROCESS TO UTILIZE ALL THE PROCESSORS AND INCREASING PRODUCTION /////

var createChildProcess = () => {
    console.log(`Master Process Id is ${process.pid}`);
    for (let i = 0; i < numCPUs; i++) {
        let worker = cluster.fork();
        console.log(`Worker Process created and listening at ${worker.process.pid}`);
    }
}


if (cluster.isMaster) {
    createChildProcess();
} else {
    app.listen(process.env.PORT || 8000);
}

