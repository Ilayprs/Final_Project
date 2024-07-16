document.addEventListener('DOMContentLoaded', function() {
    const id = localStorage.getItem('id');
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').innerText = 'Name: ' + userName;
    document.getElementById('userId').innerText = 'ID: ' + id;
    document.getElementById('userType').innerText = 'Type: customer';

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let addedMoney = 0; // Variable to store the added money amount

    async function fetchCategories() {
        const response = await fetch('/categories');
        const categories = await response.json();
        return categories;
    }

    async function fetchItemsByCategory(categoryName) {
        const response = await fetch(`/items?category=${encodeURIComponent(categoryName)}`);
        const items = await response.json();
        return items;
    }

    async function renderCategoriesAndItems() {
        const categories = await fetchCategories();
        const productList = document.querySelector('.product-list');
        productList.innerHTML = '';

        for (const category of categories) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            categoryElement.innerHTML = `<h3>${category.name}</h3>`;

            const items = await fetchItemsByCategory(category.name);

            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'product';
                itemElement.innerHTML = `
                    <h4>${item.name}</h4>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <button onclick="addToCart('${item._id}')">Add to Shopping Cart</button>
                `;
                categoryElement.appendChild(itemElement);
            });

            productList.appendChild(categoryElement);
        }
    }

    function updateProductStock() {
        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
            }
        });
    }

    window.addToCart = async function(productId) {
        console.log('Adding product to cart:', productId); // Debug log
        try {
            const response = await fetch(`/items/${productId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const product = await response.json();
            console.log('Fetched product:', product); // Debug log
            if (product && product.stock > 0) {
                const cartItem = cart.find(item => item._id === productId);
                if (cartItem) {
                    cartItem.quantity += 1;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                product.stock -= 1; // Decrease the stock
                localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to localStorage
                alert(`${product.name} has been added to your shopping cart.`);
                renderCategoriesAndItems(); // Re-render products to update stock display
            } else {
                alert(`${product.name} is out of stock.`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }
    

    renderCategoriesAndItems();
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
                    <button onclick="decrementCartItem('${item._id}')">-</button>
                    ${item.quantity}
                    <button onclick="incrementCartItem('${item._id}')">+</button>
                </p>
                <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
            `;
            cartList.appendChild(cartItemElement);
        });
    }

    window.incrementCartItem = async function(productId) {
        try {
            const response = await fetch(`/items/${productId}`);
            const product = await response.json();
            if (product && product.stock > 0) {
                const cartItem = cart.find(item => item._id === productId);
                if (cartItem) {
                    cartItem.quantity += 1;
                    product.stock -= 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                    renderCategoriesAndItems(); // Update product list to reflect stock changes
                } else {
                    alert(`${product.name} is not found in the cart.`);
                }
            } else {
                alert(`${product.name} is out of stock.`);
            }
        } catch (error) {
            console.error('Error incrementing cart item:', error);
        }
    }

    window.decrementCartItem = function(productId) {
        const cartItem = cart.find(item => item._id === productId);
        if (cartItem) {
            cartItem.quantity -= 1;
            if (cartItem.quantity === 0) {
                cart = cart.filter(item => item._id !== productId);
            }
            const product = products.find(p => p._id === productId);
            if (product) {
                product.stock += 1;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            renderCategoriesAndItems(); // Update product list to reflect stock changes
        }
    }

    function calculateTotalAmount() {
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
        });
        return total.toFixed(2);
    }

    function renderTotalAmount() {
        const totalAmountElement = document.getElementById('totalAmount');
        totalAmountElement.textContent = `$${calculateTotalAmount()}`;
    }

    window.openCheckoutModal = function() {
        renderTotalAmount();
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'block';
    }

    window.closeCheckoutModal = function() {
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'none';
    }

    window.addMoney = async function() {
        const addMoneyInput = document.getElementById('addMoney');
        const amount = parseFloat(addMoneyInput.value);
        if (!isNaN(amount) && amount > 0) {
            try {
                // Get customer ID from localStorage
                const customerId = localStorage.getItem('id');
    
                // Send request to update credit on server
                const response = await fetch('/update-credit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ customerId, amount })
                });
    
                if (!response.ok) {
                    throw new Error('Failed to update credit');
                }
    
                addedMoney += amount;
                alert(`Added $${amount.toFixed(2)} to your account.`);
                addMoneyInput.value = ''; // Clear input field
            } catch (error) {
                console.error('Error adding money:', error);
                alert('Error adding money. Please try again.');
            }
        } else {
            alert('Please enter a valid amount to add.');
        }
    }

    window.confirmCheckout = async function() {
        const totalAmount = parseFloat(calculateTotalAmount());
        if (addedMoney >= totalAmount) {
            try {
                // Send cart items to server to update stock
                const response = await fetch('/update-stock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items: cart })
                });
    
                if (!response.ok) {
                    throw new Error('Failed to update stock');
                }
    
                alert('Your order has been confirmed!');
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                renderCategoriesAndItems(); // Update product list to reflect changes
                closeCheckoutModal();
                updateProductStock();
            } catch (error) {
                console.error('Error confirming checkout:', error);
                alert('Error confirming checkout. Please try again.');
            }
        } else {
            alert('Please add enough money to your account before proceeding.');
        }
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.addEventListener('click', function() {
        openCheckoutModal();
    });
});
