const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const bcrypt = require('bcrypt');
const mysql = require('mysql');

app = express();

app.use(bodyParser.json());
app.use(cors());

var con = mysql.createConnection({
    host: "localhost",
    user: "mysql",
    password: "password",
    database: "flute"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to flute database!");
}); 

function generateAccessToken(username) {
    return jwt.sign(username, 'TOKEN_SECRET');
}

app.post('/register', async (req, res) => {
    try{
        console.log(req.body);
        //const foundUser = users.find((data) => req.body.username === data.username);
        con.query(`SELECT COUNT(1) FROM Users WHERE username = '${req.body.username}';`, async function (err, result) {
            if (err) throw err;
            const foundUser = result[0]['COUNT(1)'];
            console.log('foundUser: ', foundUser);
            if (!(foundUser)) {
                if (req.body.password !== '') {
                    hashedPassword = await bcrypt.hash(req.body.password, 10);
                    //users.push({username: req.body.username, password: hashedPassword});
                    //console.log('Users: ', users);
                    con.query(`INSERT INTO Users(username, password) VALUES('${req.body.username}', '${hashedPassword}');`, function (err, result) {
                        if (err) throw err;
                        res.sendStatus(200);
                    });
                }
                else {
                    res.send('Invalid password!');
                }
            }
            else {
                res.send('Username exist!');
            }
        });
    } catch (e){
        res.sendStatus(500);
        console.log(e);
    }
});

app.post('/login', async (req, res) => {
    try{
        console.log(req.body);
        con.query(`SELECT COUNT(1) FROM Users WHERE username = '${req.body.username}';`, async function (err, result) {
            if (err) throw err;
            const foundUser = result[0]['COUNT(1)'];
            console.log('foundUser: ', foundUser);
            if (foundUser) {
                con.query(`SELECT password FROM Users WHERE username = '${req.body.username}';`, async function (err, result) {
                    let submittedPass = req.body.password;
                    let storedPass = result[0]['password'].toString();
                    const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
                    if (passwordMatch) {
                        let username = req.body.username;
                        const token = generateAccessToken({ username: username });
                        console.log(token);
                        res.send(token);
                    }
                    else {
                        res.send('Invalid password');
                    }
                });
            }
            else {
                res.send('Invalid username');
            }
        });
    } catch (e){
        res.sendStatus(500);
        console.log(e);
    }
});

function authenticateToken(req, res, next) {
    console.log('Request headers: ', req.headers);
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null || token == 'Invalid') return res.sendStatus(401)

    try {
        jwt.verify(token, 'TOKEN_SECRET', (err, user) => {
            console.log(err);
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
    catch (e) {
        console.log(e);
    }
  }

app.get('/message', authenticateToken, (req, res) => {
    con.query('SELECT * FROM Messages;', function (err, result) {
        if (err) {
            res.sendStatus(500);
            throw err;
        }
        //console.log("Messages from database: " + JSON.stringify(result));
        res.write(JSON.stringify(result));
        res.end();
    });
});

app.post('/message', authenticateToken, (req, res) => {
    console.log('Request headers: ', req.headers);
    console.log('Request body: ', req.body);
    obj = req.body;
    console.log('req.user.username: ', req.user.username);
    if (!(obj && Object.keys(obj).length === 0 // null and undefined check
        && Object.getPrototypeOf(obj) === Object.prototype)) { 
            con.query(`INSERT INTO Messages(username, message) VALUES('${req.user.username}','${req.body.message}');`, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                    throw err;
                }
                res.sendStatus(200);
            });
        }
    else {
        res.sendStatus(400);
    }
});

app.listen('8080', () => {
    console.log('Server is listening on port 8080');
});