// API Configuration
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or respect OS preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', function() {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

// Existing functionality
const basket = document.getElementById('basket');
const quickAdd = document.getElementById('quickAdd');
const searchInput = document.getElementById('search');

// Function to call OpenRouter API for recipe suggestions with detailed process
async function getRecipeSuggestions(ingredients) {
    showNotification("Finding recipes...");

    const prompt = `As a professional chef, suggest 2-3 recipes using these ingredients: ${ingredients}. 
    For each recipe, provide this EXACT structure:

    RECIPE 1: [Recipe Name]
    🕒 Preparation Time: [time]
    🥄 Difficulty: [level]
    
    📋 INGREDIENTS:
    • [Ingredient 1]
    • [Ingredient 2]
    • [Ingredient 3]
    
    👩‍🍳 PREPARATION METHOD:
    Step 1: [Detailed step 1]
    Step 2: [Detailed step 2]
    Step 3: [Detailed step 3]
    Step 4: [Detailed step 4]
    Step 5: [Detailed step 5]
    
    💡 Chef's Tip: [Helpful tip]
    
    ---
    
    Make sure each recipe has clear, numbered steps for the preparation method. Keep the instructions practical and easy to follow.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Cook Book Recipe Finder'
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        throw error;
    }
}

// Function to search recipes with detailed process
async function searchRecipes(query) {
    if (!query.trim()) return;

    showNotification(`Searching for "${query}" recipes...`);

    const prompt = `Provide 2 detailed recipes for: ${query}. 
    For each recipe, use this EXACT format:

    🍽️ RECIPE: [Recipe Name]
    🕒 Time: [time] | 🥄 Level: [difficulty] | 👥 Serves: [number]
    
    📋 INGREDIENTS:
    • [Ingredient 1 with quantity]
    • [Ingredient 2 with quantity]
    • [Ingredient 3 with quantity]
    
    👩‍🍳 COOKING INSTRUCTIONS:
    1. [Detailed first step]
    2. [Detailed second step] 
    3. [Detailed third step]
    4. [Detailed fourth step]
    5. [Detailed fifth step]
    6. [Detailed sixth step if needed]
    
    💡 Pro Tip: [Useful cooking tip]
    
    ---
    
    Make the instructions clear, sequential, and practical for home cooking. Include specific measurements and cooking times.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Cook Book Recipe Finder'
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        displayRecipeResults(data.choices[0].message.content, query);
    } catch (error) {
        console.error('Error searching recipes:', error);
        showNotification("Search failed. Please try again.");
    }
}

// Function to get detailed recipe for a specific dish
async function getDetailedRecipe(recipeName) {
    showNotification(`Getting "${recipeName}" recipe...`);

    const prompt = `Provide a COMPLETE detailed recipe for: ${recipeName}
    
    Please structure it as follows:

    🍽️ ${recipeName.toUpperCase()}
    
    📊 NUTRITION INFO:
    • Calories: [estimate]
    • Protein: [amount]
    • Carbs: [amount]
    • Fat: [amount]
    
    🛒 INGREDIENTS LIST:
    For the main dish:
    • [Ingredient with quantity]
    • [Ingredient with quantity]
    
    For the sauce/dressing (if applicable):
    • [Ingredient with quantity]
    • [Ingredient with quantity]
    
    ⏰ PREP & COOK TIME:
    • Prep: [time]
    • Cook: [time] 
    • Total: [time]
    
    👩‍🍳 STEP-BY-STEP INSTRUCTIONS:
    
    PREPARATION:
    1. [Detailed prep step 1]
    2. [Detailed prep step 2]
    
    COOKING:
    3. [Detailed cooking step 1]
    4. [Detailed cooking step 2]
    5. [Detailed cooking step 3]
    6. [Detailed cooking step 4]
    
    SERVING:
    7. [Final serving instructions]
    
    💡 CHEF'S NOTES:
    • [Tip 1]
    • [Tip 2]
    • [Storage advice]
    
    Make the instructions very detailed and beginner-friendly. Include specific temperatures, cooking times, and techniques.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Cook Book Recipe Finder'
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens: 2500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting detailed recipe:', error);
        throw error;
    }
}

// Enhanced function to display recipe results with better formatting
function displayRecipeResults(recipes, query) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
        backdrop-filter: blur(5px);
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--card);
        color: var(--text-primary);
        padding: 25px;
        border-radius: 20px;
        max-width: 600px;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: var(--shadow-1);
        border: 2px solid var(--accent);
        line-height: 1.6;
    `;

    // Format the recipes with better styling
    const formattedRecipes = recipes.replace(/\n/g, '<br>')
        .replace(/(🍽️|🕒|🥄|👥|📋|👩‍🍳|💡|📊|🛒|⏰)/g, '<strong>$1</strong>')
        .replace(/(RECIPE|INGREDIENTS|PREPARATION METHOD|COOKING INSTRUCTIONS|CHEF'S TIP|NUTRITION INFO|INGREDIENTS LIST|PREP & COOK TIME|STEP-BY-STEP INSTRUCTIONS|CHEF'S NOTES)/g, '<strong>$1</strong>')
        .replace(/(Step \d+:|•)/g, '<strong>$1</strong>');

    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--accent); padding-bottom: 15px;">
            <h2 style="margin: 0; color: var(--accent); font-size: 1.5rem;">🍳 Recipes for "${query}"</h2>
            <button onclick="this.closest('.modal-container').remove()" style="background: var(--accent); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
        <div style="white-space: pre-wrap; line-height: 1.7; color: var(--text-primary); font-size: 14px;">
            ${formattedRecipes}
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button onclick="this.closest('.modal-container').remove()" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Close</button>
            <button onclick="saveRecipes('${query.replace(/'/g, "\\'")}')" style="flex: 1; padding: 12px; background: var(--pill); color: var(--pill-text); border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Save Recipes</button>
        </div>
    `;

    modal.classList.add('modal-container');
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Function to save recipes
function saveRecipes(recipeName) {
    const modal = document.querySelector('.modal-container');
    const recipeContent = modal.querySelector('div').textContent;

    // In a real app, you would save to localStorage or backend
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    savedRecipes.push({
        name: recipeName,
        content: recipeContent,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));

    showNotification(`"${recipeName}" recipes saved successfully!`);

    // Update saved recipes count
    updateSavedCount();
}

// Function to update saved recipes count
function updateSavedCount() {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const recipeCount = document.querySelector('.recipe-count');
    if (recipeCount) {
        recipeCount.textContent = savedRecipes.length;
    }
}

function openIngredientPrompt() {
    const cur = basket.getAttribute('aria-pressed') === 'true';
    basket.setAttribute('aria-pressed', String(!cur));
    const entry = prompt("Tell me what ingredients you have (comma separated):\nExample: chicken, rice, vegetables, spices", "");
    if (entry !== null && entry.trim() !== "") {
        showNotification("Creating recipes with your ingredients...");

        getRecipeSuggestions(entry)
            .then(recipes => {
                displayRecipeResults(recipes, "Your Ingredients");
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification("Failed to get recipes. Please try again.");
            });
    }
}

// Function to show quick recipe for trending items
function showQuickRecipe(recipeName) {
    getDetailedRecipe(recipeName)
        .then(recipe => {
            displayRecipeResults(recipe, recipeName);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification("Failed to load recipe details.");
        });
}

function showNotification(message) {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const el = document.createElement('div');
    el.textContent = message;
    el.className = 'custom-notification';
    el.style.cssText = `
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: 26%;
        background: var(--accent);
        color: #fff;
        padding: 12px 18px;
        border-radius: 12px;
        opacity: 0;
        transition: opacity .3s ease, bottom .3s ease;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(255, 138, 75, 0.3);
        max-width: 80%;
        text-align: center;
    `;

    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.bottom = '28%';
    });

    setTimeout(() => {
        el.style.opacity = '0';
        el.style.bottom = '30%';
    }, 3000);

    setTimeout(() => el.remove(), 3500);
}

// Event Listeners
basket.addEventListener('click', openIngredientPrompt);
basket.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openIngredientPrompt();
});

quickAdd.addEventListener('click', function() {
    const recipeName = prompt("Enter recipe name to get detailed instructions:");
    if (recipeName) {
        showQuickRecipe(recipeName);
    }
});

// Search functionality
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchRecipes(searchInput.value.trim());
    }
});

document.querySelector('.search').addEventListener('click', () => searchInput.focus());

// Carousel logic with click functionality
const carousel = document.getElementById('carousel');
const leftBtn = document.querySelector('.carousel-arrow.left');
const rightBtn = document.querySelector('.carousel-arrow.right');

leftBtn.addEventListener('click', () => {
    carousel.scrollBy({
        left: -130,
        behavior: "smooth"
    });
});

rightBtn.addEventListener('click', () => {
    carousel.scrollBy({
        left: 130,
        behavior: "smooth"
    });
});

// Add click event to carousel cards
document.addEventListener('click', function(e) {
    if (e.target.closest('.card')) {
        const card = e.target.closest('.card');
        const recipeName = card.querySelector('h4').textContent;
        showQuickRecipe(recipeName);
    }
});

// Functionality for the icons
function handleCameraClick() {
    showNotification("📸 Snap a photo of ingredients to get recipes!");
}

function handleVoiceSearch() {
    showNotification("🎤 Say your recipe name or ingredients...");
    // In a real app, integrate with Web Speech API
}

function handleAddClick() {
    const newRecipe = prompt("What recipe would you like to learn?");
    if (newRecipe) {
        showQuickRecipe(newRecipe);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log("Cook Book Recipe Finder initialized with OpenRouter API");
    updateSavedCount();

    // Add loading states
    const generateBtn = document.querySelector('.generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            setTimeout(() => {
                this.innerHTML = 'Generate Now';
                openIngredientPrompt();
            }, 1000);
        });
    }
});