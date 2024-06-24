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
mongoose.connect('mongodb+srv://IlayPrs:aYUsj9u46pprNGSU@project.kvttl0m.mongodb.net/', {
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
    id: Number,
    username: String,
    password: String,
    city: String,
    credit: { type: Number, default: 0 },
});

customerSchema.statics.createCustomer = function(id, username, password, city) {
    return new this({ id, username, password, city, credit: 0 });
};

customerSchema.methods.setCredit = function(credit) {
    this.credit = credit;
};

const Customer = mongoose.model('Customer', customerSchema);

const managerSchema = new mongoose.Schema({
    id: Number,
    username: String,
    password: String,
    city: String,
});

const Manager = mongoose.model('Manager', managerSchema);

// Function to process login data (using Mongoose) in js bbbb
async function sendCustomer(id, username, password, city) {
    const newUser = Customer.createCustomer(id, username, password, city);
    await newUser.save();
    return newUser;
}

async function sendManager(id, username, password, city) {
    const newUser = new Manager({ id, username, password, city });
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
    const { id, username, password, selection, city } = req.body;
    const result = `id: ${id} name: ${username} pass: ${password} type: ${selection} city: ${city}`;
    try {
        if (selection === 'customer') {
            await sendCustomer(id, username, password, city);
            res.send(`
                <html>
                    <body onload="window.location.href='Sign_In.html'">

                    </body>
                </html>
            `);
        } else { //is manager 
            await sendManager(id, username, password, city);
            res.send(`
                <html>
                    <body onload="window.location.href='Sign_In.html'">
                        
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
