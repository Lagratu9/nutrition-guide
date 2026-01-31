document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('content-area'); // Attention: assure-toi que ton HTML a bien <div id="content-area"></div> dans le <main>
    const heroSection = document.getElementById('hero-section');
    const globalSearchInput = document.getElementById('global-search');
    let allData = null;
    let allFoodsFlat = []; 

    // Définition des Repas
    const mealCategories = [
        { id: 'petit-dejeuner', name: 'Petit Déjeuner', icon: '☕', type: 'meal' },
        { id: 'dejeuner', name: 'Déjeuner', icon: '🥗', type: 'meal' },
        { id: 'diner', name: 'Dîner', icon: '🌙', type: 'meal' },
        { id: 'en-cas', name: 'En-cas', icon: '🍎', type: 'meal' }
    ];

    // --- 1. CHARGEMENT ---
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error("Erreur");
            allData = await response.json();
            
            // Aplatir pour recherche globale
            allData.categories.forEach(cat => {
                cat.foods.forEach(food => {
                    allFoodsFlat.push({ ...food, parentCategory: cat.name, parentIcon: cat.icon });
                });
            });

            renderHome();
        } catch (error) {
            console.error(error);
            // Fallback si l'ID content-area n'existe pas (si tu n'as pas mis à jour le HTML de l'étape précédente)
            if(app) app.innerHTML = `<div style="text-align:center; padding:2rem; color:red;">Erreur de chargement. Vérifiez data.json</div>`;
        }
    }

    // --- 2. ACCUEIL ---
    function renderHome() {
        if(heroSection) heroSection.classList.remove('hidden');
        if(globalSearchInput) globalSearchInput.value = '';

        if(!app) return;

        let html = `
            <div class="section-label">Par Repas</div>
            <div class="grid">
                ${mealCategories.map(cat => createCard(cat)).join('')}
            </div>

            <div class="section-label">Par Catégorie</div>
            <div class="grid">
                ${allData.categories.map(cat => createCard(cat)).join('')}
            </div>
        `;
        app.innerHTML = html;

        // Clics
        document.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const type = card.dataset.type;
                if (type === 'meal') handleMealClick(id);
                else handleCategoryClick(id);
            });
        });
    }

    function createCard(item) {
        return `
            <div class="cat-card" data-id="${item.id}" data-type="${item.type || 'category'}">
                <span class="cat-icon">${item.icon}</span>
                <div class="cat-name">${item.name}</div>
            </div>
        `;
    }

    // --- 3. NAVIGATION ---
    function handleCategoryClick(id) {
        const category = allData.categories.find(c => c.id === id);
        renderList(category.name, category.foods, category.icon);
    }

    function handleMealClick(mealId) {
        const mealInfo = mealCategories.find(m => m.id === mealId);
        const filteredFoods = allFoodsFlat.filter(food => 
            food.suitableFor && food.suitableFor.includes(mealId)
        );
        renderList(mealInfo.name, filteredFoods, mealInfo.icon, true);
    }

    // --- 4. RECHERCHE GLOBALE ---
    if(globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            if (term.length < 2) {
                if (term.length === 0) renderHome();
                return;
            }
            const results = allFoodsFlat.filter(f => 
                f.name.toLowerCase().includes(term) || 
                (f.notes && f.notes.toLowerCase().includes(term))
            );
            renderList(`Recherche : "${e.target.value}"`, results, '🔍', false, true);
        });
    }

    // --- 5. RENDU LISTE AVEC RECHERCHE LOCALE ---
    function renderList(title, foods, icon, isMealMode = false, isSearchMode = false) {
        if(heroSection && !isSearchMode) heroSection.classList.add('hidden');

        // Barre de recherche locale (seulement si pas en mode recherche globale)
        const localSearchHtml = isSearchMode ? '' : `
            <div class="local-search-container">
                <input type="text" id="local-search" class="local-search-input" placeholder="Filtrer dans ${title}...">
            </div>
        `;

        let html = `
            <div class="nav-header">
                <button id="back-btn" class="back-btn">← Retour</button>
                <div class="page-context-title">${icon || ''} ${title}</div>
                ${localSearchHtml}
            </div>
            <div class="food-list-container" id="food-list">
        `;

        if (foods.length === 0) {
            html += `<div style="text-align:center; padding:2rem;">Aucun aliment trouvé.</div>`;
        } else {
            foods.forEach(food => {
                html += createFoodItem(food);
            });
        }
        html += `</div>`;
        app.innerHTML = html;

        document.getElementById('back-btn').addEventListener('click', renderHome);

        // Activer la recherche locale
        if (!isSearchMode) {
            const localInput = document.getElementById('local-search');
            localInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.food-item');
                items.forEach(item => {
                    const text = item.innerText.toLowerCase();
                    if(text.includes(term)) item.classList.remove('hidden');
                    else item.classList.add('hidden');
                });
            });
            localInput.focus();
        }
    }

    // --- 6. CRÉATION CARTE ALIMENT (NOUVEAU DESIGN) ---
    function createFoodItem(food) {
        // Récupération des valeurs ou "xx" par défaut
        // Structure attendue dans JSON : food.values = { kcal: 100, ig: 5, ... }
        const v = food.values || {}; 
        
        const kcal = v.kcal || 'xx';
        const ig = v.ig || 'xx';
        const prot = v.prot || 'xx';
        const gluc = v.gluc || 'xx';
        const lip = v.lip || 'xx';
        const na = v.na || 'xx'; // Sodium
        const k = v.k || 'xx';   // Potassium

        return `
            <div class="food-item">
                <div class="food-top-row">
                    <div>
                        <div class="food-name">${food.name}</div>
                        <div class="food-notes">${food.notes || ''}</div>
                    </div>
                </div>

                <div class="nutri-grid">
                    <span class="nutri-bubble bubble-yellow">Kcal (100g) = ${kcal}</span>
                    <span class="nutri-bubble bubble-orange">IG = ${ig}</span>
                    <span class="nutri-bubble bubble-blue">Protéines = ${prot}</span>
                    <span class="nutri-bubble bubble-red">Glucides = ${gluc}</span>
                    <span class="nutri-bubble bubble-green">Lipides = ${lip}</span>
                    <span class="nutri-bubble bubble-mauve">Sodium = ${na}</span>
                    <span class="nutri-bubble bubble-violet">Potassium = ${k}</span>
                </div>
            </div>
        `;
    }

    loadData();
});
