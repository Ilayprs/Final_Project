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
    id: {type: Number, unique: true},
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
    id: {type: Number, unique: true},

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

const findManagerById = async (managerId) => {
    try {
        // Connect to the database

        // Search for the manager by ID
        const manager = await Manager.findOne({ id: managerId });

        // Check if the manager was found
        if (manager) {
            console.log('Manager found:');
        } else {
            console.log('Manager not found');
        }
    }catch (err) {
        console.error('Error searching for manager:', err);
    }
}

const findCustomerById = async (managerId) => {
    try {
        // Connect to the database

        // Search for the manager by ID
        const manager = await Customer.findOne({ id: managerId });

        // Check if the manager was found
        if (manager) {
            console.log('Customer found:');
            
        } else {
            console.log('Customer not found');
            
        }
    }catch (err) {
        console.error('Error searching for customer:', err);
    }
}

// Route to serve the Sign In page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_In.html'));
});

// Route to serve the Sign Up page
+app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_Up.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Log_In.html'));
});

app.get('/Cus_Store.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'store', 'Cus_Store.html'));
});

app.get('/Man_Store.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'store', 'Man_Store.html'));
});




app.post('/send2', async (req, res) => {
    const {id, selection} = req.body;

    if(selection === 'customer'){
       findCustomerById(id);
       res.send(`
        <html>
            <body onload="window.location.href='Cus_Store.html'">
                
            </body>
        </html>
    `);

    } else { //is manager
        findManagerById(id);
        res.send(`
            <html>
                <body onload="window.location.href='Man_Store.html'">
                    
                </body>
            </html>
        `);
    }

});

// Route to handle form submission
app.post('/send', async (req, res) => {
    const { id, username, password, selection, city } = req.body;
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
 +           res.send(`
+                <html>
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
