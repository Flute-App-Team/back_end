const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require("cors");


let users = [{username: 'Rizki', password: '123'}];
let messages = [];
let id = 0;

app = express();

app.use(bodyParser.json());
app.use(cors());

function generateAccessToken(username) {
    return jwt.sign(username, 'TOKEN_SECRET');
}

app.post('/register', (req, res) => {
    try{
        console.log(req.body);
        let foundUser = users.find((data) => req.body.username === data.username);
        if (!(foundUser)) {
            if (req.body.password !== '') {
                res.sendStatus(200);
                users.push({username: req.body.username, password: req.body.password});
                console.log('Users: ', users);
            }
            else {
                res.send('Invalid password');
            }
        }
        else {
            res.send('Username has been used');
        }
    } catch (e){
        res.send("Internal server error");
        console.log(e);
    }
});

app.post('/login', async (req, res) => {
    try{
        console.log(req.body);
        let foundUser = users.find((data) => req.body.username === data.username);
        if (foundUser) {
            
            let submittedPass = req.body.password;
            let storedPass = foundUser.password;
  
            const passwordMatch = submittedPass === storedPass;//await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                let username = foundUser.username;
                const token = generateAccessToken({ username: username });
                console.log(token);
                res.send(token);
            }
            else {
                res.send('Invalid password');
            }
        }
        else {
            res.send('Invalid username');
        }
    } catch (e){
        res.send("Internal server error");
        console.log(e);
    }
});

function authenticateToken(req, res, next) {
    console.log('Request headers: ', req.headers);
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null || token == 'Invalid') return res.sendStatus(401)

    jwt.verify(token, 'TOKEN_SECRET', (err, user) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      req.user = user
  
      next()
    })
  }

app.get('/message', authenticateToken, (req, res) => {
    res.write(JSON.stringify(messages));
    res.end();
});

app.post('/message', authenticateToken, (req, res) => {
    console.log('Request headers: ', req.headers);
    console.log('Request body: ', req.body);
    let obj = req.body;
    if (!(obj // 👈 null and undefined check
        && Object.keys(obj).length === 0
        && Object.getPrototypeOf(obj) === Object.prototype)) {
            req.body.timestamp = new Date();
            req.body.messageId = id;
            messages.push(req.body);
            id++;
        }
    else {
        res.sendStatus(400);
    }
    res.end();
    console.log('Messages data: ', messages);
});

app.listen('8080', () => {
    console.log('Server is listening on port 8080');
});