        // Function to open a specific modal
        function openModal(modalId) {
            closeModal(); // Close any open modal first
            document.getElementById(modalId).style.display = "block";
        }

        // Function to close all modals
        function closeModal() {
            document.getElementById("addProductModal").style.display = "none";
            document.getElementById("newCategoryModal").style.display = "none";
        }

        // Function to create a new category
        function createCategory() {
            var newCategoryName = document.getElementById("newCategoryName").value;
            
            if (newCategoryName) {
                // Create a new category div
                var newCategoryDiv = document.createElement("div");
                newCategoryDiv.className = "category";
                
                // Add the new category to the HTML structure
                var categoriesDiv = document.querySelector("section#inventory");
                newCategoryDiv.innerHTML = `
                    <h3 class="category-title">${newCategoryName}</h3>
                    <div class="product-list"></div>
                `;
                categoriesDiv.appendChild(newCategoryDiv);

                // Add new category to the select dropdown
                var select = document.getElementById("existingCategory");
                var option = document.createElement("option");
                option.text = newCategoryName;
                option.value = newCategoryName;
                select.add(option);

                // Optionally, sort options alphabetically
                sortSelectOptions(select);

                // Reset the new category form field
                document.getElementById("newCategoryName").value = '';

                // Close the modal
                closeModal();
            } else {
                alert('Please fill out the category name.');
            }
        }

        // Helper function to sort select options alphabetically
        function sortSelectOptions(select) {
            var options = select.options;
            var sortedOptions = Array.from(options).sort((a, b) => a.text.localeCompare(b.text));
            select.options.length = 0; // Clear existing options
            sortedOptions.forEach(option => select.add(option));
        }

        // Function to add product to a category
        function addProductToCategory() {
            var productName = document.getElementById("productName").value;
            var productStock = document.getElementById("productStock").value;
            var productPrice = document.getElementById("productPrice").value;
            var selectedCategory = document.getElementById("existingCategory").value;

            if (productName && productStock && productPrice && selectedCategory) {
                // Find the category div
                var categoryDiv = Array.from(document.getElementsByClassName("category")).find(div => div.querySelector("h3").innerText.includes(selectedCategory));

                // Create the new product element
                var newProductDiv = document.createElement("div");
                newProductDiv.className = "product";
                newProductDiv.innerHTML = `
                    <h3>${productName}</h3>
                    <p>Stock: ${productStock}</p>
                    <p>Price: $${productPrice}</p>
                    <button onclick="editProduct('${productName}')">Edit</button>
                    <button onclick="deleteProduct('${productName}')">Delete</button>
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
                alert('Please fill out all fields.');
            }
        }

        function editProduct(productName) {
            alert('Edit product: ' + productName);
        }

        function deleteProduct(productName) {
            alert('Delete product: ' + productName);
        }

        function editProfile() {
            alert('Edit profile');
        }