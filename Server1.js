const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'HomePage')));

// Middleware to parse URL-encoded bodies and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Function to process login data
function send(username, password, selection) {
    return `name: ${username} pass: ${password} type: ${selection}`;
}
//hello world
// Route to serve the Sign In page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_In.html'));
});

// Route to serve the Sign Up page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_Up.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Log_In.html'));
});

// Route to handle form submission
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
