const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Define Mongoose schemas and models for Customer and Manager
const customerSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    username: String,
    password: String,
    city: String,
    credit: { type: Number, default: 0 },
});

const Customer = mongoose.model('Customer', customerSchema);

const managerSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    username: String,
    password: String,
    city: String,
});

const Manager = mongoose.model('Manager', managerSchema);

// Function to create a new Customer
async function sendCustomer(id, username, password, city) {
    const newUser = Customer.createCustomer(id, username, password, city);
    await newUser.save();
    return newUser;
}

// Function to create a new Manager
async function sendManager(id, username, password, city) {
    const newUser = new Manager({ id, username, password, city });
    await newUser.save();
    return newUser;
}

// Function to find a Manager by ID
async function findManagerById(managerId) {
    try {
        const manager = await Manager.findOne({ id: managerId });
        return manager;
    } catch (err) {
        console.error('Error searching for manager:', err);
        throw err;
    }
}

// Function to find a Customer by ID
async function findCustomerById(customerId) {
    try {
        const customer = await Customer.findOne({ id: customerId });
        return customer;
    } catch (err) {
        console.error('Error searching for customer:', err);
        throw err;
    }
}

// Route to serve the Sign In page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_In.html'));
});

// Route to serve the Sign Up page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_Up.html'));
});

// Route to serve the Log In page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Log_In.html'));
});

// Route to serve the Customer Store page
app.get('/Cus_Store.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'store', 'Cus_Store.html'));
});

// Route to serve the Manager Store page
app.get('/Man_Store.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'store', 'Man_Store.html'));
});

// Route to handle login form submission
app.post('/send2', async (req, res) => {
    const { id, selection } = req.body;

    try {
        if (selection === 'customer') {
            const customer = await findCustomerById(id);
            if (customer) {
                res.send(`
                    <html>
                        <body onload="window.location.href='Cus_Store.html'">
                            
                        </body>
                    </html>
                `);
            } else {
                throw new Error('Customer not found');
            }
        } else { // is manager
            const manager = await findManagerById(id);
            if (manager) {
                res.send(`
                    <html>
                        <body onload="window.location.href='Man_Store.html'">
                            
                        </body>
                    </html>
                `);
            } else {
                throw new Error('Manager not found');
            }
        }
    } catch (err) {
        console.error('Error processing login:', err);
        res.status(400).send(`
            <html>
                <body>
                    <script>
                        alert('Incorrect');
                        window.location.href = '/';
                    </script>
                </body>
            </html>
        `);
    }
});

// Route to handle sign up form submission
app.post('/send', async (req, res) => {
    const { id, username, password, selection, city } = req.body;

    try {
        if (selection === 'customer') {
            await sendCustomer(id, username, password, city);
        } else { // is manager
            await sendManager(id, username, password, city);
        }
        res.send(`
            <html>
                <body onload="window.location.href='Sign_In.html'">
                    
                </body>
            </html>
        `);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
