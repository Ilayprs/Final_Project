document.addEventListener('DOMContentLoaded', function() {
    const id = localStorage.getItem('id');
    const userName = localStorage.getItem('userName');

    document.getElementById('userName').innerText = 'Name: ' + userName;
    document.getElementById('userId').innerText = 'ID: ' + id;
    document.getElementById('userType').innerText = 'Type: customer';

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

    // Function to add money to the addedMoney variable
    window.addMoney = function() {
        const addMoneyInput = document.getElementById('addMoney');
        const amount = parseFloat(addMoneyInput.value);
        if (!isNaN(amount) && amount > 0) {
            addedMoney += amount;
            alert(`Added $${amount.toFixed(2)} to your account.`);
            addMoneyInput.value = ''; // Clear input field
        } else {
            alert('Please enter a valid amount to add.');
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

    // Event listener for the Proceed to Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.addEventListener('click', function() {
        openCheckoutModal();
    });

});
