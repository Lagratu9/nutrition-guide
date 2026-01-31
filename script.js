document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('content-area');
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
            if (allData.categories) {
                allData.categories.forEach(cat => {
                    if(cat.foods) {
                        cat.foods.forEach(food => {
                            // On sécurise l'icône ici aussi
                            const safeIcon = cat.icon || '🍽️';
                            allFoodsFlat.push({ ...food, parentCategory: cat.name, parentIcon: safeIcon });
                        });
                    }
                });
                renderHome();
            } else {
                throw new Error("Structure JSON invalide");
            }

        } catch (error) {
            console.error(error);
            if(app) app.innerHTML = `<div style="text-align:center; padding:2rem; color:red;">Erreur de chargement ou JSON invalide.</div>`;
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
        // CORRECTION ICI : Si item.icon n'existe pas, on met une assiette par défaut
        const iconDisplay = item.icon ? item.icon : '🍽️';
        
        return `
            <div class="cat-card" data-id="${item.id}" data-type="${item.type || 'category'}">
                <span class="cat-icon">${iconDisplay}</span>
                <div class="cat-name">${item.name}</div>
            </div>
        `;
    }

    // --- 3. NAVIGATION ---
    function handleCategoryClick(id) {
        const category = allData.categories.find(c => c.id === id);
        if(category) {
            renderList(category.name, category.foods, category.icon);
        }
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

    // --- 5. RENDU LISTE ---
    function renderList(title, foods, icon, isMealMode = false, isSearchMode = false) {
        if(heroSection && !isSearchMode) heroSection.classList.add('hidden');
        
        // Sécurisation de l'icône du titre
        const safeIcon = icon || '🍽️';

        const localSearchHtml = isSearchMode ? '' : `
            <div class="local-search-container">
                <input type="text" id="local-search" class="local-search-input" placeholder="Filtrer dans ${title}...">
            </div>
        `;

        let html = `
            <div class="nav-header">
                <button id="back-btn" class="back-btn">← Retour</button>
                <div class="page-context-title">${safeIcon} ${title}</div>
                ${localSearchHtml}
            </div>
            <div class="food-list-container" id="food-list">
        `;

        if (!foods || foods.length === 0) {
            html += `<div style="text-align:center; padding:2rem;">Aucun aliment trouvé.</div>`;
        } else {
            foods.forEach(food => {
                html += createFoodItem(food);
            });
        }
        html += `</div>`;
        app.innerHTML = html;

        document.getElementById('back-btn').addEventListener('click', renderHome);

        if (!isSearchMode) {
            const localInput = document.getElementById('local-search');
            if(localInput) {
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
    }

    // --- 6. CRÉATION CARTE ALIMENT (CORRECTION UNITÉS) ---
    function createFoodItem(food) {
        const v = food.values || {}; 
        
        // Gestion des valeurs manquantes et ajout des unités
        const kcal = v.kcal ? `${v.kcal} kcal` : 'xx';
        const ig = v.ig ? v.ig : 'xx'; // L'IG n'a pas d'unité
        const prot = v.prot ? `${v.prot}g` : 'xx';
        const gluc = v.gluc ? `${v.gluc}g` : 'xx';
        const lip = v.lip ? `${v.lip}g` : 'xx';
        const na = v.na ? `${v.na}mg` : 'xx';
        const k = v.k ? `${v.k}mg` : 'xx'; // Le Potassium est généralement en milligrammes (mg)

        return `
            <div class="food-item">
                <div class="food-top-row">
                    <div>
                        <div class="food-name">${food.name}</div>
                        <div class="food-notes">${food.notes || ''}</div>
                    </div>
                </div>

                <div class="nutri-grid">
                    <span class="nutri-bubble bubble-yellow">Kcal (100g) : ${kcal}</span>
                    <span class="nutri-bubble bubble-orange">IG : ${ig}</span>
                    <span class="nutri-bubble bubble-blue">Protéines : ${prot}</span>
                    <span class="nutri-bubble bubble-red">Glucides : ${gluc}</span>
                    <span class="nutri-bubble bubble-green">Lipides : ${lip}</span>
                    <span class="nutri-bubble bubble-mauve">Sodium : ${na}</span>
                    <span class="nutri-bubble bubble-violet">Potassium : ${k}</span>
                </div>
            </div>
        `;
    }

    loadData();
});
