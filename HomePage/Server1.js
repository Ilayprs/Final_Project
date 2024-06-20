const express = require('express');
const app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

function send(username, password, selection){
    return ("name: " + username + " pass: " + password + " type: " + selection);
}
app.post('/send', function (req, res) {
    let name = req.body.username;
    let pass = req.body.password;
    let type = req.body.selection;

    let result = send(name, pass, type);

    res.end(`<html>
                <body>
                    <h2>${result}</h2>
                </body>
            </html>`);
});

app.get('/data', function(req, res) {
    res.send(output);
});

app.listen(81);