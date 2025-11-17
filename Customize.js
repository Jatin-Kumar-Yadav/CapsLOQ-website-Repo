// Updated Customize.js
// Customize.js
document.addEventListener('DOMContentLoaded', function() {
  let configData = null;
  let selectedOptions = {}; // Track selected option ID per category
  let totalPrice = 0; // Will be updated from base

  const categoryRadios = document.querySelectorAll('input[name="category"]');
  const optionsContainer = document.getElementById('options-container');
  const totalPriceEl = document.getElementById('total-price');

  if (!optionsContainer) {
    console.error('Options container not found! Add id="options-container" to .Customspecs.');
    return;
  }
  if (!totalPriceEl) {
    console.error('Total price element not found! Check id="total-price".');
    return;
  }

  // Bonus: On page load, restore saved config if exists
  const savedConfig = JSON.parse(localStorage.getItem("currentConfig")) || {};
  if (Object.keys(savedConfig).length > 0) {
    // Apply saved selections (will be used after JSON load)
    Object.assign(selectedOptions, savedConfig);
  }

  // Fetch JSON
  fetch('Customize.json')
    .then(response => {
      if (!response.ok) throw new Error('JSON fetch failed');
      return response.json();
    })
    .then(data => {
      configData = data;
      totalPrice = data.basePrice;
      
      // Pre-select first option for ALL categories to set initial specs/price
      Object.keys(configData.categories).forEach(category => {
        const firstOptionId = configData.categories[category].options[0].id;
        selectedOptions[category] = firstOptionId;
        const firstOption = configData.categories[category].options[0];
        totalPrice += firstOption.price;
        // Update initial specs
        Object.keys(firstOption.updates).forEach(key => {
          const specEl = document.getElementById(key);
          if (specEl) specEl.textContent = firstOption.updates[key];
        });
      });
      
      // Restore saved config if exists (override initials)
      if (Object.keys(savedConfig).length > 0) {
        Object.keys(savedConfig).forEach(category => {
          if (savedConfig[category]) {
            selectedOptions[category] = savedConfig[category];
            // Trigger handleOptionSelect to update price/specs
            handleOptionSelect(category, savedConfig[category]);
          }
        });
      }
      
      updateTotalPrice();
      loadCategory('CPU'); // Load UI for default tab
      console.log('Initial load complete. Total price:', totalPrice.toFixed(2)); // Debug

      // Function to get the current full configuration
      function getCurrentConfig() {
        let config = {
          name: "Custom CapsLOQ Phone",  // Can be enhanced later, e.g., "Custom - Snapdragon 8 Gen 3"
          img: "/Caps_Data/Phone1.png",  // Default phone image
          price: totalPrice,
          quantity: 1  // Default; cart.js handles || 1
        };

        // Merge updates from all selected options (later categories override earlier ones, e.g., Memory overrides RAM from CPU)
        Object.keys(selectedOptions).forEach(category => {
          const optionId = selectedOptions[category];
          const option = configData.categories[category].options.find(opt => opt.id === optionId);
          if (option) {
            Object.assign(config, option.updates);
          }
        });

        return config;
      }

      // Event listener for Add to Cart
      const addToCartBtn = document.querySelector('.Addtocart');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          const item = getCurrentConfig();
          let cart = JSON.parse(localStorage.getItem("cart")) || [];
          cart.push(item);
          localStorage.setItem("cart", JSON.stringify(cart));

          // Simple toast notification
          showToast('Added to Cart! ✅');

          // Update badge if header is present
          updateCartBadge();
        });
      }

      // Event listener for Save Configuration
      const saveConfigBtn = document.querySelector('.Saveconfig');
      if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', () => {
          const item = getCurrentConfig();  // Reuse the same config getter
          let savedForLater = JSON.parse(localStorage.getItem("savedForLater")) || [];
          savedForLater.push(item);
          localStorage.setItem("savedForLater", JSON.stringify(savedForLater));

          // Persist current selections for page reload
          localStorage.setItem("currentConfig", JSON.stringify(selectedOptions));

          showToast('Configuration Saved! ✅');

          // No badge update needed for saved items
        });
      }
    })
    .catch(error => {
      console.error('Error loading Customize.json:', error);
      optionsContainer.innerHTML = '<p>Error loading options. Please check Customize.json file.</p>';
    });

  // Tab switching
  categoryRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        const category = this.id;
        loadCategory(category);
      }
    });
  });

  function loadCategory(category) {
    if (!configData || !configData.categories[category]) {
      console.error(`Category ${category} not found in JSON`);
      return;
    }

    const catData = configData.categories[category];
    optionsContainer.innerHTML = `<h2>${catData.title}</h2>`;

    catData.options.forEach(option => {
      const radioId = `${category}_${option.id}`; // FIXED: Use '_' separator to avoid hyphen conflicts
      const isSelected = selectedOptions[category] === option.id;
      optionsContainer.innerHTML += `
        <input type="radio" id="${radioId}" name="specs" ${isSelected ? 'checked' : ''}>
        <label class="option" for="${radioId}">
          <span class="circle"></span>${option.name}
        </label><br>
      `;
    });

    // Add event listeners to new radios
    const newRadios = optionsContainer.querySelectorAll('input[name="specs"]');
    newRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          const optionId = this.id.split('_')[1]; // FIXED: Split on '_', take [1] as full option ID
          handleOptionSelect(category, optionId);
        }
      });
    });

    console.log(`Loaded category: ${category}`); // Debug
  }

  function handleOptionSelect(category, optionId) {
    const catData = configData.categories[category];
    const option = catData.options.find(opt => opt.id === optionId);
    if (!option) {
      console.error(`Option ${optionId} not found in ${category}`);
      return;
    }

    // Update selected
    const prevOptionId = selectedOptions[category];
    selectedOptions[category] = optionId;

    // Adjust price: subtract prev, add new
    if (prevOptionId) {
      const prevOption = catData.options.find(opt => opt.id === prevOptionId);
      totalPrice -= prevOption ? prevOption.price : 0;
    }
    totalPrice += option.price;
    updateTotalPrice();

    // Update specs
    Object.keys(option.updates).forEach(key => {
      const specEl = document.getElementById(key);
      if (specEl) {
        specEl.textContent = option.updates[key];
        // Optional: Handle overlaps (e.g., Memory overrides RAM from CPU)
        if (category === 'Memory' && (key === 'ram' || key === 'storage')) {
          console.log(`Memory overriding ${key} from previous category`); // Debug
        }
      } else {
        console.warn(`Spec element ${key} not found! Add id="${key}" to HTML.`);
      }
    });

    console.log(`Selected ${option.name} in ${category}; New total: ₹${totalPrice.toFixed(2)}`); // Debug
  }

  function updateTotalPrice() {
    totalPriceEl.textContent = totalPrice.toFixed(2);
  }

  // Helper: Toast notification
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; background: #4caf50; color: white;
      padding: 10px 20px; border-radius: 6px; z-index: 9999; font-size: 14px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // Helper: Update Cart Badge
  function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    if (badge) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      let totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      badge.textContent = totalQty;
    }
  }
});