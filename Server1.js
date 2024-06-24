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
mongoose.connect('mongodb://127.0.0.1:27017/yourdbname', {
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
const customerSchema = new mongoose.Schema({
    username: String,
    password: String,
    city: String,
    credit: { type: Number, default: 0 },
});

customerSchema.statics.createCustomer = function(username, password, city) {
    return new this({ username, password, city, credit: 0 });
};

customerSchema.methods.setCredit = function(credit) {
    this.credit = credit;
};

const Customer = mongoose.model('Customer', customerSchema);

const managerSchema = new mongoose.Schema({
    username: String,
    password: String,
    city: String,
});

const Manager = mongoose.model('Manager', managerSchema);

// Function to process login data (using Mongoose) in js bbbb
async function sendCustomer(username, password, city) {
    const newUser = Customer.createCustomer(username, password, city);
    await newUser.save();
    return newUser;
}

async function sendManager(username, password, city) {
    const newUser = new Manager({ username, password, city });
    await newUser.save();
    return newUser;
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
    try {
        if (selection === 'customer') {
            await sendCustomer(username, password, city);
            res.send(`
                <html>
                    <body>
                        <h2>Data saved successfully! customer</h2>
                        <h2>${result}</h2>
                    </body>
                </html>
            `);
        } else { //is manager 
            await sendManager(username, password, city);
            res.send(`
                <html>
                    <body>
                        <h2>Data saved successfully! manager</h2>
                        <h2>${result}</h2>
                    </body>
                </html>
            `);
        }
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
