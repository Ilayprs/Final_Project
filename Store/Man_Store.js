document.addEventListener('DOMContentLoaded', () => {
    // JavaScript to handle footer visibility on scroll
    let lastScrollTop = 0;
    const footer = document.querySelector('footer');

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            footer.classList.remove('show');
            footer.classList.add('hide');
        } else {
            // Scrolling up
            footer.classList.remove('hide');
            footer.classList.add('show');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });

    // Fetch user details from localStorage
    const id = localStorage.getItem('id');
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').innerText = 'Name: ' + userName;
    document.getElementById('userId').innerText = 'ID: ' + id;
    document.getElementById('userType').innerText = 'Type: manager';

    // Function to open a specific modal
    window.openModal = function(modalId) {
        closeModal(); // Close any open modal first
        document.getElementById(modalId).style.display = "block";
    }

    // Function to close all modals
    window.closeModal = function() {
        document.getElementById("addProductModal").style.display = "none";
        document.getElementById("newCategoryModal").style.display = "none";
        document.getElementById("editProductModal").style.display = "none";
    }

    // Fetch and populate categories
    async function loadCategories() {
        try {
            const response = await fetch('/categories');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();
            const categoriesDiv = document.getElementById("categories");
            const select = document.getElementById("existingCategory");

            categories.forEach(category => {
                // Add category to the dropdown
                const option = document.createElement("option");
                option.text = category.name;
                option.value = category.name;
                select.add(option);

                // Add category to the categories section
                const categoryDiv = document.createElement("div");
                categoryDiv.className = "category";
                categoryDiv.innerHTML = `
                    <h3 class="category-title">${category.name}</h3>
                    <div class="product-list" id="${category.name.replace(/\s+/g, '')}"></div>
                `;
                categoriesDiv.appendChild(categoryDiv);

                // Load products for this category
                loadProductsForCategory(category.name);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Fetch and populate products for a category
    async function loadProductsForCategory(categoryName) {
        try {
            const response = await fetch(`/products?category=${encodeURIComponent(categoryName)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const products = await response.json();
            const productList = document.getElementById(categoryName.replace(/\s+/g, ''));

            products.forEach(product => {
                const productDiv = document.createElement("div");
                productDiv.className = "product";
                productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Stock: ${product.stock}</p>
                    <p>Price: $${product.price}</p>
                    <p>Company: ${product.companyName}</p>
                    <p>RGB: ${product.hasRGB ? 'Yes' : 'No'}</p>
                    <p>Wireless: ${product.isWireless ? 'Yes' : 'No'}</p>
                    <button class="button" onclick="editProduct('${product._id}', '${product.name}', ${product.stock}, ${product.price}, '${product.companyName}', ${product.hasRGB}, ${product.isWireless})">Edit</button>
                `;
                productList.appendChild(productDiv);
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Fetch and populate products for the inventory section
    async function loadInventory() {
        try {
            const response = await fetch('/items');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const products = await response.json();
            const inventoryList = document.getElementById("inventoryList");

            // Clear existing products
            inventoryList.innerHTML = '';

            products.forEach(product => {
                const productDiv = document.createElement("div");
                productDiv.className = "product";
                productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Stock: ${product.stock}</p>
                    <p>Price: $${product.price}</p>
                    <p>Company: ${product.companyName}</p>
                    <p>RGB: ${product.rgb ? 'Yes' : 'No'}</p>
                    <p>Wireless: ${product.wireless ? 'Yes' : 'No'}</p>
                    <button class="button" onclick="editProduct('${product._id}', '${product.name}', ${product.stock}, ${product.price}, '${product.companyName}', ${product.rgb}, ${product.wireless})">Edit</button>
                `;
                inventoryList.appendChild(productDiv);
            });
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }

    loadCategories(); // Initial call to load categories and products
    loadInventory(); // Initial call to load products in the inventory section

    // Add a new product to a category
    window.addProductToCategory = async function() {
        const productName = document.getElementById("productName").value.trim();
        const productStock = parseInt(document.getElementById("productStock").value.trim(), 10);
        const productPrice = parseFloat(document.getElementById("productPrice").value.trim());
        const companyName = document.getElementById("companyName").value.trim();
        const hasRGB = document.getElementById("hasRGB").checked;
        const isWireless = document.getElementById("isWireless").checked;
        const category = document.getElementById("existingCategory").value;

        if (productName && !isNaN(productStock) && !isNaN(productPrice) && category) {
            try {
                const response = await fetch('/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: productName,
                        stock: productStock,
                        price: productPrice,
                        companyName: companyName,
                        hasRGB: hasRGB,
                        isWireless: isWireless,
                        category: category,
                    }),
                });
                if (!response.ok) {
                    throw new Error('Failed to add product');
                }

                const newProduct = await response.json();

                // Add new product to the UI
                const productList = document.getElementById(category.replace(/\s+/g, ''));
                const productDiv = document.createElement("div");
                productDiv.className = "product";
                productDiv.innerHTML = `
                    <h3>${newProduct.name}</h3>
                    <p>Stock: ${newProduct.stock}</p>
                    <p>Price: $${newProduct.price}</p>
                    <p>Company: ${newProduct.companyName}</p>
                    <p>RGB: ${newProduct.hasRGB ? 'Yes' : 'No'}</p>
                    <p>Wireless: ${newProduct.isWireless ? 'Yes' : 'No'}</p>
                    <button class="button" onclick="editProduct('${newProduct._id}', '${newProduct.name}', ${newProduct.stock}, ${newProduct.price}, '${newProduct.companyName}', ${newProduct.hasRGB}, ${newProduct.isWireless})">Edit</button>
                `;
                productList.appendChild(productDiv);

                // Add new product to the inventory section
                const inventoryList = document.getElementById("inventoryList");
                const inventoryProductDiv = document.createElement("div");
                inventoryProductDiv.className = "product";
                inventoryProductDiv.innerHTML = `
                    <h3>${newProduct.name}</h3>
                    <p>Stock: ${newProduct.stock}</p>
                    <p>Price: $${newProduct.price}</p>
                    <p>Company: ${newProduct.companyName}</p>
                    <p>RGB: ${newProduct.hasRGB ? 'Yes' : 'No'}</p>
                    <p>Wireless: ${newProduct.isWireless ? 'Yes' : 'No'}</p>
                    <button class="button" onclick="editProduct('${newProduct._id}', '${newProduct.name}', ${newProduct.stock}, ${newProduct.price}, '${newProduct.companyName}', ${newProduct.hasRGB}, ${newProduct.isWireless})">Edit</button>
                `;
                inventoryList.appendChild(inventoryProductDiv);

                // Close the modal and clear input fields
                closeModal();
                document.getElementById("productName").value = "";
                document.getElementById("productStock").value = "";
                document.getElementById("productPrice").value = "";
                document.getElementById("companyName").value = "";
                document.getElementById("hasRGB").checked = false;
                document.getElementById("isWireless").checked = false;
            } catch (error) {
                console.error('Error adding product:', error);
            }
        }
    }

    // Edit an existing product
    window.editProduct = function(productId, productName, productStock, productPrice, companyName, hasRGB, isWireless) {
        openModal('editProductModal');
        document.getElementById('editProductId').value = productId;
        document.getElementById('editProductName').value = productName;
        document.getElementById('editProductStock').value = productStock;
        document.getElementById('editProductPrice').value = productPrice;
        document.getElementById('editCompanyName').value = companyName;
        document.getElementById('editHasRGB').checked = hasRGB;
        document.getElementById('editIsWireless').checked = isWireless;
    }

    // Update an existing product
    window.updateProduct = async function() {
        const productId = document.getElementById('editProductId').value;
        const productName = document.getElementById('editProductName').value.trim();
        const productStock = parseInt(document.getElementById('editProductStock').value.trim(), 10);
        const productPrice = parseFloat(document.getElementById('editProductPrice').value.trim());
        const companyName = document.getElementById('editCompanyName').value.trim();
        const hasRGB = document.getElementById('editHasRGB').checked;
        const isWireless = document.getElementById('editIsWireless').checked;

        if (productId && productName && !isNaN(productStock) && !isNaN(productPrice)) {
            try {
                const response = await fetch(`/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: productName,
                        stock: productStock,
                        price: productPrice,
                        companyName: companyName,
                        hasRGB: hasRGB,
                        isWireless: isWireless,
                    }),
                });
                if (!response.ok) {
                    throw new Error('Failed to update product');
                }

                const updatedProduct = await response.json();

                // Update product in the UI
                const inventoryList = document.getElementById("inventoryList");
                const productDivs = inventoryList.getElementsByClassName("product");

                for (let productDiv of productDivs) {
                    if (productDiv.querySelector("button").getAttribute("onclick").includes(productId)) {
                        productDiv.innerHTML = `
                            <h3>${updatedProduct.name}</h3>
                            <p>Stock: ${updatedProduct.stock}</p>
                            <p>Price: $${updatedProduct.price}</p>
                            <p>Company: ${updatedProduct.companyName}</p>
                            <p>RGB: ${updatedProduct.hasRGB ? 'Yes' : 'No'}</p>
                            <p>Wireless: ${updatedProduct.isWireless ? 'Yes' : 'No'}</p>
                            <button class="button" onclick="editProduct('${updatedProduct._id}', '${updatedProduct.name}', ${updatedProduct.stock}, ${updatedProduct.price}, '${updatedProduct.companyName}', ${updatedProduct.hasRGB}, ${updatedProduct.isWireless})">Edit</button>
                        `;
                        break;
                    }
                }

                // Close the modal
                closeModal();
            } catch (error) {
                console.error('Error updating product:', error);
            }
        }
    }

    // Add a new category
    window.addCategory = async function() {
        const categoryName = document.getElementById("newCategoryName").value.trim();
        if (categoryName) {
            try {
                const response = await fetch('/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: categoryName }),
                });
                if (!response.ok) {
                    throw new Error('Failed to add category');
                }

                const newCategory = await response.json();

                // Add new category to the dropdown
                const select = document.getElementById("existingCategory");
                const option = document.createElement("option");
                option.text = newCategory.name;
                option.value = newCategory.name;
                select.add(option);

                // Add new category to the categories section
                const categoriesDiv = document.getElementById("categories");
                const categoryDiv = document.createElement("div");
                categoryDiv.className = "category";
                categoryDiv.innerHTML = `
                    <h3 class="category-title">${newCategory.name}</h3>
                    <div class="product-list" id="${newCategory.name.replace(/\s+/g, '')}"></div>
                `;
                categoriesDiv.appendChild(categoryDiv);

                // Close the modal
                closeModal();
                document.getElementById("newCategoryName").value = "";
            } catch (error) {
                console.error('Error adding category:', error);
            }
        }
    }

    // Function to open the Edit Profile modal and populate it with current user data
window.editProfile = function(name, email) {
    document.getElementById('editProfileName').value = name;
    document.getElementById('editProfileEmail').value = email;
    openModal('editProfileModal');
}

// Function to update the profile
window.updateProfile = async function() {
    const name = document.getElementById('editProfileName').value.trim();
    const email = document.getElementById('editProfileEmail').value.trim();
    const id = localStorage.getItem('id'); // Assuming the user's ID is stored in localStorage

    if (name && email) {
        try {
            const response = await fetch(`/profile/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedProfile = await response.json();

            // Update the UI with the new profile data
            document.getElementById('userName').innerText = 'Name: ' + updatedProfile.name;
            document.getElementById('userEmail').innerText = 'Email: ' + updatedProfile.email;

            closeModal(); // Close the modal after updating

            // Optionally, update localStorage if you store user details there
            localStorage.setItem('userName', updatedProfile.name);
            localStorage.setItem('userEmail', updatedProfile.email);

            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    } else {
        alert('Please fill out all fields');
    }
}

});
