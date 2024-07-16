const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'HomePage')));
app.use(express.static(path.join(__dirname, 'store')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://ilaypreiss10:WO9uG6pLo8I1PIo5@project.zpnipmo.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

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

const itemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    stock: { type: Number, default: 0 },
});
itemSchema.index({ name: 1, category: 1 }, { unique: true });
const Item = mongoose.model('Item', itemSchema);

const orderSchema = new mongoose.Schema({
    orderId: { type: Number, unique: true },
    customerId: Number,
    totalPrice: Number,
    numItems: Number,
    items: [itemSchema],
});
const Order = mongoose.model('Order', orderSchema);

const categorySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
});
const Category = mongoose.model('Category', categorySchema);

app.post('/categories', async (req, res) => {
    const { categoryName } = req.body;

    try {
        const category = new Category({ name: categoryName });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).send('Error creating category');
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});

app.get('/items', async (req, res) => {
    const categoryName = req.query.category;

    try {
        const items = await Item.find({ category: categoryName });
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});

app.post('/products', async (req, res) => {
    const { name, price, category, stock } = req.body;

    try {
        const product = new Item({ name, price, category, stock });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
});

app.delete('/products/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const result = await Item.findOneAndDelete({ name });
        if (result) {
            res.sendStatus(204); // No Content
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Error deleting product');
    }
});

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { stock, price } = req.body;

    try {
        const updatedProduct = await Item.findByIdAndUpdate(id, { stock, price }, { new: true });
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
});

async function sendCustomer(id, username, password, city) {
    const newCustomer = new Customer({ id, username, password, city });
    await newCustomer.save();
    return newCustomer;
}

async function sendManager(id, username, password, city) {
    const newManager = new Manager({ id, username, password, city });
    await newManager.save();
    return newManager;
}

async function findManagerById(managerId) {
    try {
        const manager = await Manager.findOne({ id: managerId });
        return manager;
    } catch (err) {
        console.error('Error searching for manager:', err);
        throw err;
    }
}

async function findCustomerById(customerId) {
    try {
        const customer = await Customer.findOne({ id: customerId });
        return customer;
    } catch (err) {
        console.error('Error searching for customer:', err);
        throw err;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_In.html'));
});

app.get('/signup', (req, res) => {
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
    const { id, selection } = req.body;

    try {
        if (selection === 'customer') {
            const customer = await findCustomerById(id);
            if (customer) {
                const userName = JSON.stringify(customer.username);
                res.send(`
                    <html>
                        <body onload="window.location.href='Cus_Store.html'">
                            <script>
                            localStorage.setItem('userName', ${userName});
                            localStorage.setItem('id', ${id});
                            </script>
                        </body>
                    </html>
                `);
            } else {
                throw new Error('Customer not found');
            }
        } else { // is manager
            const manager = await findManagerById(id);
            if (manager) {
                const userName = JSON.stringify(manager.username);
                res.send(`
                    <html>
                        <body onload="window.location.href='Man_Store.html'">
                            <script>
                            localStorage.setItem('userName', ${userName});
                            localStorage.setItem('id', ${id});
                            </script>
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

app.post('/addMoney', async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const customer = await Customer.findOne({ id: userId });
        if (customer) {
            customer.credit += amount;
            await customer.save();
            res.status(200).json({ message: 'Money added successfully', credit: customer.credit });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (err) {
        console.error('Error adding money:', err);
        res.status(500).json({ message: 'Error adding money' });
    }
});

app.get('/customer/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const customer = await Customer.findOne({ id: id });
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).send('Customer not found');
        }
    } catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).send('Error fetching customer details');
    }
});

app.post('/checkout', async (req, res) => {
    const { userId, userName, items, totalAmount } = req.body;

    try {
        const customer = await Customer.findOne({ id: userId });
        if (customer) {
            if (customer.credit >= totalAmount) {
                customer.credit -= totalAmount;
                await customer.save();

                const order = new Order({
                    orderId: Date.now(),
                    customerId: userId,
                    totalPrice: totalAmount,
                    numItems: items.length,
                    items: items
                });
                await order.save();

                for (const item of items) {
                    const product = await Item.findById(item.id);
                    if (product) {
                        product.stock -= item.quantity;
                        await product.save();
                    }
                }

                res.status(200).send('Order placed successfully.');
            } else {
                res.status(400).send('Insufficient credit.');
            }
        } else {
            res.status(404).send('Customer not found.');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send('Error during checkout.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
