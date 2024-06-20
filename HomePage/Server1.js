const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000; // Changed port to a more common value

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

function send(username, password, selection) {
    return `name: ${username} pass: ${password} type: ${selection}`;
}

app.post('/send', (req, res) => {
    const { username, password, selection } = req.body;
    const result = send(username, password, selection);

    res.send(`
        <html>
            <body>
                <h2>${result}</h2>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
