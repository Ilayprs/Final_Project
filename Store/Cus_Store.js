document.addEventListener('DOMContentLoaded', async function() {
    const id = localStorage.getItem('id');
    const userName = localStorage.getItem('userName');

    document.getElementById('userName').innerText = 'Name: ' + userName;
    document.getElementById('userId').innerText = 'ID: ' + id;
    document.getElementById('userType').innerText = 'Type: customer';

    // Fetch customer credit
    try {
        const response = await fetch(`http://localhost:3000/customer/${id}/credit`);
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('credit', data.credit);
            document.getElementById('credit').innerText = 'Credit: $' + data.credit.toFixed(2);
        } else {
            console.error('Error fetching credit:', data.message);
        }
    } catch (error) {
        console.error('Error fetching credit:', error);
    }

    // Sample products data
    const products = [
        { id: 1, name: 'Blender', stock: 10, price: 59.99 },
        { id: 2, name: 'Toaster', stock: 15, price: 34.99 },
        { id: 3, name: 'Microwave', stock: 7, price: 89.99 },
        // Add more products as needed
    ];

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let addedMoney = 0; // Variable to store the added money amount

    function renderProducts() {
        const productList = document.querySelector('.product-list');
        productList.innerHTML = '';
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <p>Stock: ${product.stock}</p>
                <p>Price: $${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id})">Add to Shopping Cart</button>
            `;
            productList.appendChild(productElement);
        });
    }

    function updateProductStock() {
        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
            }
        });
    }

    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (product && product.stock > 0) {
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            product.stock -= 1; // Decrease the stock
            localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to localStorage
            alert(`${product.name} has been added to your shopping cart.`);
            renderProducts(); // Re-render products to update stock display
        } else {
            alert(`${product.name} is out of stock.`);
        }
    }

    renderProducts();
    updateProductStock();

    window.openCartModal = function() {
        const cartModal = document.getElementById('cartModal');
        renderCart();
        cartModal.style.display = 'block';
    }

    window.closeCartModal = function() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'none';
    }

    function renderCart() {
        const cartList = document.querySelector('.cart-list');
        cartList.innerHTML = '';
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>Quantity: 
                    <button onclick="decrementCartItem(${item.id})">-</button>
                    ${item.quantity}
                    <button onclick="incrementCartItem(${item.id})">+</button>
                </p>
                <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
            `;
            cartList.appendChild(cartItemElement);
        });
    }

    window.incrementCartItem = function(productId) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            const product = products.find(p => p.id === productId);
            if (product && product.stock > 0) {
                cartItem.quantity += 1;
                product.stock -= 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                renderProducts(); // Update product list to reflect stock changes
            } else {
                alert(`${product.name} is out of stock.`);
            }
        }
    }

    window.decrementCartItem = function(productId) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity -= 1;
            if (cartItem.quantity === 0) {
                cart = cart.filter(item => item.id !== productId);
            }
            const product = products.find(p => p.id === productId);
            if (product) {
                product.stock += 1;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            renderProducts(); // Update product list to reflect stock changes
        }
    }

    // Function to calculate total amount in the cart
    function calculateTotalAmount() {
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
        });
        return total.toFixed(2);
    }

    // Function to render total amount in the checkout modal
    function renderTotalAmount() {
        const totalAmountElement = document.getElementById('totalAmount');
        totalAmountElement.textContent = `$${calculateTotalAmount()}`;
    }

    // Function to open the checkout modal
    window.openCheckoutModal = function() {
        renderTotalAmount();
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'block';
    }

    // Function to close the checkout modal
    window.closeCheckoutModal = function() {
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'none';
    }

    window.addMoney = async function() {
        const addMoneyInput = document.getElementById('addMoneyInput');
        const amount = parseFloat(addMoneyInput.value);
        const userId = localStorage.getItem('id');
        if (!isNaN(amount) && amount > 0) {
            try {
                const response = await fetch('http://localhost:3000/addMoney', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: userId, amount: amount })
                });
                const data = await response.json();
                if (response.ok) {
                    addedMoney = amount;
                    const updatedCredit = data.credit; // Get updated credit value
                    localStorage.setItem('credit', updatedCredit); // Save updated credit to localStorage
                    document.getElementById('credit').innerText = 'Credit: $' + updatedCredit.toFixed(2); // Update displayed credit
                    addMoneyInput.value = '';
                    alert('Money added successfully.');
                } 
                else {
                    console.error('Error adding money:', data.message);
                }
            } catch (error) {
                console.error('Error adding money:', error);
            }
        } else {
            alert('Please enter a valid amount.');
        }
    }
    

    // Function to handle checkout process
    window.checkout = async function() {
        const totalAmount = calculateTotalAmount();
        const userId = localStorage.getItem('id');
        const userName = localStorage.getItem('userName');
        const totalAmountElement = document.getElementById('totalAmount');
        totalAmountElement.textContent = `$${totalAmount}`;
    
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'block';
    
        try {
            const response = await fetch('http://localhost:3000/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, userName: userName, items: cart, totalAmount: parseFloat(totalAmount) })
            });
    
            if (response.ok) {
                cart = [];
                localStorage.removeItem('cart'); // Clear cart from localStorage
                updateProductStock(); // Update product stock
                renderProducts(); // Re-render products to reflect stock changes
                renderCart(); // Re-render cart to show it is empty
    
                const customer = await response.json(); // Assuming server responds with updated customer data
                if (customer && customer.credit !== undefined) {
                    localStorage.setItem('credit', customer.credit);
                    document.getElementById('credit').innerText = 'Credit: $' + customer.credit.toFixed(2);
                }
    
                alert('Order placed successfully.');
                closeCheckoutModal(); // Close checkout modal after successful checkout
            } else {
                const errorData = await response.json();
                alert('Checkout failed: ' + errorData.message);
            }
        } 
        catch (error) {
            console.error('Error during checkout:', error);
            alert('Error during checkout.');
        }
    }
    // Function to confirm checkout
    window.confirmCheckout = function() {
        // Check if there is enough money added for the purchase
        const totalAmount = parseFloat(calculateTotalAmount());
        if (addedMoney >= totalAmount) {
            // Perform any necessary actions upon confirmation, e.g., process payment
            alert('Your order has been confirmed!');
            // Clear the cart after checkout
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            renderProducts(); // Update product list to reflect changes
            closeCheckoutModal();
            updateProductStock();
        } else {
            alert('Please add enough money to your account before proceeding.');
        }
    }

    // Event listener for checkout button click
    const checkoutButton = document.querySelector('.checkout-btn');
    checkoutButton.addEventListener('click', checkout);
});
