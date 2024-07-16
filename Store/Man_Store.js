const id = localStorage.getItem('id');
const userName = localStorage.getItem('userName');
document.getElementById('userName').innerText = 'Name: ' + userName;
document.getElementById('userId').innerText = 'ID: ' + id;
document.getElementById('userType').innerText = 'Type: manager';
// Function to open a specific modal
function openModal(modalId) {
    closeModal(); // Close any open modal first
    document.getElementById(modalId).style.display = "block";

}

// Function to close all modals
// Function to close all modals and reset form fields
function closeModal() {
    document.getElementById("addProductModal").style.display = "none";
    document.getElementById("newCategoryModal").style.display = "none";
    document.getElementById("editProductModal").style.display = "none";

    // Reset inner form fields if applicable (adjust IDs as per your modal structure)
    document.getElementById("editProductStock").value = '';
    document.getElementById("editProductPrice").value = '';

}

// Function to handle creation of a new category
async function createCategory() {
    var newCategoryName = document.getElementById("newCategoryName").value;
    if (newCategoryName) {
        try {
            const response = await fetch('/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryName: newCategoryName }),
            });
            if (!response.ok) {
                throw new Error('Failed to create category');
            }

            // If successful, fetch categories again to update the dropdown and add new category to the page
             
            const newCategory = { name: newCategoryName };
            newCategory = await response.json();

            // Add new category to the page
            addCategoryToPage(newCategory);

            // Close the modal
            closeModal();
        } catch (error) {
            console.error('Error creating category:', error);
            // Handle error creating category (e.g., display an error message)
        }
    } else {
        alert('Please fill out the category name.');
    }
}
// Function to dynamically add a new category to the page
function addCategoryToPage(category) {
    var categoriesDiv = document.querySelector("section#inventory");
    // Create the new category div
    var newCategoryDiv = document.createElement("div");
    newCategoryDiv.className = "category";
    newCategoryDiv.innerHTML = `
        <h3 class="category-title">${category.name}</h3>
        <div class="product-list"></div>
    `;
    // Add the new category to the HTML structure
    categoriesDiv.appendChild(newCategoryDiv);
    // Add new category to the select dropdown
    var select = document.getElementById("existingCategory");
    var option = document.createElement("option");
    option.text = category.name;
    option.value = category.name;
    select.add(option);
    // Optionally, sort options alphabetically
    sortSelectOptions(select);
}
// Helper function to sort select options alphabetically
function sortSelectOptions(select) {
    var options = select.options;
    var sortedOptions = Array.from(options).sort((a, b) => a.text.localeCompare(b.text));
    select.options.length = 0; // Clear existing options
    sortedOptions.forEach(option => select.add(option));
}
// Function to add product to a category
async function addProductToCategory() {
    var productName = document.getElementById("productName").value;
    var productStock = document.getElementById("productStock").value;
    var productPrice = document.getElementById("productPrice").value;
    var selectedCategory = document.getElementById("existingCategory").value;
    if (productName && productStock && productPrice && selectedCategory) {
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
                    category: selectedCategory
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
            const product = await response.json();
            // Find the category div
            var categoryDiv = Array.from(document.getElementsByClassName("category"))
                .find(div => div.querySelector("h3").innerText === selectedCategory);
            if (categoryDiv) {
                // Create the new product element
                var newProductDiv = document.createElement("div");
                newProductDiv.className = "product";
                newProductDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Stock: ${product.stock}</p>
                    <p>Price: $${product.price}</p>
                    <button onclick="editProduct('${product.name}')">Edit</button>
                    <p class="product-stock">Stock: ${product.stock}</p>
                    <p class="product-price">Price: $${product.price}</p>
                    <button onclick="editProduct('${product._id}', '${product.stock}', '${product.price}')">Edit</button>
                    <button onclick="deleteProduct('${product.name}', this)">Delete</button>
                `;

                // Add the new product to the category
                categoryDiv.querySelector(".product-list").appendChild(newProductDiv);
                // Reset the add product form
                document.getElementById("productName").value = '';
                document.getElementById("productStock").value = '';
                document.getElementById("productPrice").value = '';
                // Close the modal
                closeModal();
            } else {
                console.error('Selected category not found:', selectedCategory);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            // Handle error creating product (e.g., display an error message)
        }
    } else {
        alert('Please fill out all fields.');
    }
    window.location.reload();
}

// Function to delete a product
async function deleteProduct(productName, button) {
    if (confirm(`Are you sure you want to delete the product: ${productName}?`)) {
        try {
            const response = await fetch(`/products/${productName}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            // Remove the product from the page
            const productDiv = button.parentElement;
            productDiv.remove();
        } catch (error) {
            console.error('Error deleting product:', error);
            // Handle error deleting product (e.g., display an error message)
        }
    }
}

// Dummy function for editing a product (replace with actual functionality)
function editProduct(productName) {
    alert('Edit product: ' + productName);
// Function to handle editing a product
}
function editProduct(productId, currentStock, currentPrice) {
    // Populate the modal fields with current values
    document.getElementById('editProductId').value = productId;
    document.getElementById('editProductStock').value = currentStock;
    document.getElementById('editProductPrice').value = currentPrice;

    // Open the edit product modal
    openModal('editProductModal');
}

// Function to update a product
async function updateProduct() {
    const productId = document.getElementById('editProductId').value;
    const updatedStock = document.getElementById('editProductStock').value;
    const updatedPrice = document.getElementById('editProductPrice').value;

    try {
        const response = await fetch(`/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stock: updatedStock,
                price: updatedPrice,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update product');
        }

        const updatedProduct = await response.json();

        // Update the product details on the page
        updateProductOnPage(updatedProduct);

        // Close the modal
        closeModal();

    } catch (error) {
        console.error('Error updating product:', error);
        // Handle error updating product
    }
}

// Dummy function for editing profile (replace with actual functionality)
function editProfile() {
    alert('Edit profile');
}
// Function to update product details on the page after editing
function updateProductOnPage(product) {
    const productDiv = document.getElementById(`product-${product._id}`);
    if (productDiv) {
        productDiv.querySelector('.product-stock').textContent = `Stock: ${product.stock}`;
        productDiv.querySelector('.product-price').textContent = `Price: $${product.price}`;
    } else {
        console.error('Product element not found on the page:', product._id);
    }
}

// Function to fetch categories and populate the dropdown and page on initial load
async function fetchCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();
        var select = document.getElementById("existingCategory");
        categories.forEach(async (category) => {
            var option = document.createElement("option");
            option.text = category.name;
            option.value = category.name;
            select.add(option);
            // Add category to the page
            addCategoryToPage(category);
            // Fetch items for this category
            const responseItems = await fetch(`/items?category=${category.name}`);
            const items = await responseItems.json();
            // Display items for this category
            displayItems(category.name, items);
        });
        sortSelectOptions(select);
    } catch (error) {
        console.error('Error fetching categories and items:', error);
        // Handle error fetching categories (e.g., display an error message)
    }
}

// Function to display items under a category
function displayItems(categoryName, items) {
    var categoryDiv = Array.from(document.getElementsByClassName("category"))
        .find(div => div.querySelector("h3").innerText === categoryName);
    if (categoryDiv) {
        var productListDiv = categoryDiv.querySelector(".product-list");
        productListDiv.innerHTML = ''; // Clear existing items

        items.forEach(item => {
            var newProductDiv = document.createElement("div");
            newProductDiv.id = `product-${item._id}`;
            newProductDiv.className = "product";
            newProductDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>Stock: ${item.stock}</p>
                <p>Price: $${item.price}</p>
                <button onclick="editProduct('${item.name}')">Edit</button>
                <p class="product-stock">Stock: ${item.stock}</p>
                <p class="product-price">Price: $${item.price}</p>
                <button onclick="editProduct('${item._id}', '${item.stock}', '${item.price}')">Edit</button>
                <button onclick="deleteProduct('${item.name}', this)">Delete</button>
            `;
            productListDiv.appendChild(newProductDiv);
        });
    } else {
        console.error('Selected category not found:', categoryName);
    }
}
// Call fetchCategories() when the page loads to populate categories
window.onload = fetchCategories();