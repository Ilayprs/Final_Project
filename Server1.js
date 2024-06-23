const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Require Mongoose
const { Int32 } = require('bson');
const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'HomePage')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Define a Mongoose schema and model for your data (example)
const Customer = mongoose.Schema({
    username: String,
    password: String,
    city: String,
    credit: Number,
});

Customer.statics.createCustomer = function(name, password, city) {
    return new this({name, password, city, credit:0});
};

Customer.methods.setCredit = function(credit) {
    this.credit = credit;
};

const Manager = mongoose.Schema({
    username: String,
    password: String,
    city: String,
});

// Function to process login data (using Mongoose)
function sendCustomer(username, password, city) {
    const newUser = Customer.createCustomer(username, password, city);
    return newUser.save();
}

function sendManager(username, password, city) {
    const newUser = new Manager({ username, password, city });
    return newUser.save();
}

// Route to serve the Sign In page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_In.html'));
});

// Route to serve the Sign Up page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_Up.html'));
});

// Route to handle form submission
app.post('/send', async (req, res) => {
    const { username, password, selection, city } = req.body;
    const result = `name: ${username} pass: ${password} type: ${selection} city: ${city}`;
    if(selection === 'customer'){
        try {
            await sendCustomer(username, password, city);
            res.send(`
                <html>
                    <body>
                        <h2>Data saved successfully! customer</h2>
                        <h2>${result}</h2>
                    </body>
                </html>
            `);
        } catch (err) {
            console.error('Error saving data:', err);
            res.status(500).send('Error saving data');
        }
    } else { //is manager 
        try {
            await sendManager(username, password, city);
            res.send(`
                <html>
                    <body>
                        <h2>Data saved successfully! manager</h2>
                        <h2>${result}</h2>
                    </body>
                </html>
            `);
        } catch (err) {
            console.error('Error saving data:', err);
            res.status(500).send('Error saving data');
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
