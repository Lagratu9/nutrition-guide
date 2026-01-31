document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('content-area');
    const heroSection = document.getElementById('hero-section');
    const globalSearchInput = document.getElementById('global-search');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    
    // Éléments de la Modale
    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.getElementById('close-modal');

    let allData = null;
    let allFoodsFlat = []; 
    let breakfastData = null; // Variable pour stocker tes 14 jours

    // --- 1. CONFIGURATION ---
    const iconMapping = {
        'legumes': '🥦', 'fruits': '🍓', 'proteines-animales': '🥩', 'proteines-vegetales': '🫘',
        'cereales-feculents': '🌾', 'produits-laitiers': '🥛', 'huiles-graisses': '🫒',
        'noix-graines': '🥜', 'herbes-epices': '🌿', 'default': '🍽️'
    };

    const mealCategories = [
        { id: 'petit-dejeuner', name: 'Petit Déjeuner', icon: '☕', type: 'meal' },
        { id: 'dejeuner', name: 'Déjeuner', icon: '🥗', type: 'meal' },
        { id: 'diner', name: 'Dîner', icon: '🌙', type: 'meal' },
        { id: 'en-cas', name: 'En-cas', icon: '🍎', type: 'meal' }
    ];

    // --- 2. LOGIQUE SCROLL TO TOP ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    if(scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 3. LOGIQUE MODALE ---
    if(closeModal) {
        closeModal.addEventListener('click', () => modal.classList.add('hidden'));
        window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    }

    function openRecipeModal(recipe, metadata) {
        // Sécurisation des données si certaines manquent
        const t = recipe.totaux || {};
        const meta = metadata || {};
        
        // Construction de la liste des ingrédients (Séquence)
        let ingredientsHtml = '';
        if (recipe.sequence && Array.isArray(recipe.sequence)) {
            ingredientsHtml = recipe.sequence.map((step, index) => 
                `<li><span class="ingredient-qty">${index + 1}.</span> <span>${step}</span></li>`
            ).join('');
        }

        let html = `
            <span class="recipe-tag tag-mixte">Jour ${recipe.jour}</span>
            <h2 class="modal-h2">${recipe.nom}</h2>
            
            <div class="nutri-grid" style="margin-bottom: 1.5rem;">
                 <span class="nutri-bubble bubble-yellow">Kcal : ${t.kcal || 'xx'}</span>
                 <span class="nutri-bubble bubble-violet">Potassium : ${t.potassium || 'xx'} mg</span>
                 <span class="nutri-bubble bubble-orange">IG : ${t.ig || 'xx'}</span>
            </div>

            <div class="modal-section-title">Séquence du repas</div>
            <ul class="ingredient-list">
                ${ingredientsHtml}
            </ul>

            <div class="justification-box">
                <strong>Protocole Matinal :</strong><br>
                ${meta.protocoleMatinal || "Respecter l'ordre : Protéines > Légumes > Glucides"}
            </div>
        `;
        
        modalBody.innerHTML = html;
        modal.classList.remove('hidden');
    }

    // --- 4. CHARGEMENT DES DONNÉES ---
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error("Erreur chargement JSON");
            allData = await response.json();
            
            // Gestion des aliments classiques
            if (allData.categories) {
                allData.categories.forEach(cat => {
                    const icon = iconMapping[cat.id] || cat.icon || iconMapping['default'];
                    if(cat.foods) {
                        cat.foods.forEach(food => {
                            allFoodsFlat.push({ ...food, parentCategory: cat.name, parentIcon: icon });
                        });
                    }
                });
            }

            // Gestion des petits déjeuners (Lecture de la section JSON que tu as ajoutée)
            if (allData.petitsDejeuners) {
                breakfastData = allData.petitsDejeuners;
                console.log("Petits déjeuners chargés :", breakfastData.jours.length);
            }

            renderHome();
        } catch (error) { 
            console.error(error); 
            if(app) app.innerHTML = `<div style="text-align:center; padding:2rem;">Erreur de chargement. Vérifiez que data.json est valide.</div>`;
        }
    }

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
                ${allData.categories.map(cat => {
                    const icon = iconMapping[cat.id] || cat.icon || iconMapping['default'];
                    return createCard({ ...cat, icon: icon });
                }).join('')}
            </div>
        `;
        app.innerHTML = html;
        attachCardEvents();
    }

    function createCard(item) {
        return `
            <div class="cat-card" data-id="${item.id}" data-type="${item.type || 'category'}">
                <span class="cat-icon">${item.icon}</span>
                <div class="cat-name">${item.name}</div>
            </div>
        `;
    }

    function attachCardEvents() {
        document.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const type = card.dataset.type;
                if (type === 'meal') handleMealClick(id);
                else handleCategoryClick(id);
            });
        });
    }

    // --- 5. LOGIQUE NAVIGATION ---
    function handleCategoryClick(id) {
        const category = allData.categories.find(c => c.id === id);
        if(category) {
            const icon = iconMapping[category.id] || category.icon || iconMapping['default'];
            renderList(category.name, category.foods, icon);
        }
    }

    function handleMealClick(mealId) {
        const mealInfo = mealCategories.find(m => m.id === mealId);
        
        // Filtrage des aliments "uniques" compatibles
        const filteredFoods = allFoodsFlat.filter(food => 
            food.suitableFor && food.suitableFor.includes(mealId)
        );

        // Récupération des MENUS si c'est le petit-déjeuner
        // C'est ici que la magie opère pour tes 14 jours
        let recipes = [];
        if (mealId === 'petit-dejeuner' && breakfastData && breakfastData.jours) {
            recipes = breakfastData.jours;
        }
        
        renderList(mealInfo.name, filteredFoods, mealInfo.icon, true, false, recipes);
    }

    // --- 6. RENDU LISTE (Mixte Aliments + Recettes JSON) ---
    function renderList(title, foods, icon, isMealMode = false, isSearchMode = false, recipes = []) {
        if(heroSection && !isSearchMode) heroSection.classList.add('hidden');
        
        // Bloc HTML pour les recettes (Petits déjeuners)
        let recipesHtml = '';
        if (recipes.length > 0) {
            recipesHtml = `
                <div class="section-label" style="margin-top:0;">Planning sur 14 Jours</div>
                <div class="recipe-grid">
                    ${recipes.map(r => `
                        <div class="recipe-card" data-day-id="${r.jour}">
                            <span class="recipe-tag tag-mixte">Jour ${r.jour}</span>
                            <div class="recipe-title">${r.nom}</div>
                            <div class="recipe-summary">${r.sequence.join(', ')}</div>
                            <div class="nutri-grid" style="border:none; margin:0; padding:0;">
                                <span class="nutri-bubble bubble-yellow">${r.totaux.kcal} kcal</span>
                                <span class="nutri-bubble bubble-violet">K+: ${r.totaux.potassium}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="section-label">Ingrédients individuels suggérés</div>
            `;
        }

        const localSearchHtml = isSearchMode ? '' : `
            <div class="local-search-container">
                <input type="text" id="local-search" class="local-search-input" placeholder="Filtrer dans ${title}...">
            </div>
        `;

        let html = `
            <div class="nav-header">
                <button id="back-btn" class="back-btn">← Retour</button>
                <div class="page-context-title">${icon} ${title}</div>
                ${localSearchHtml}
            </div>
            ${recipesHtml}
            <div class="food-list-container" id="food-list">
        `;

        if (foods.length === 0 && recipes.length === 0) {
            html += `<div style="text-align:center; padding:2rem;">Aucune donnée disponible.</div>`;
        } else {
            foods.forEach(food => {
                html += createFoodItem(food);
            });
        }
        html += `</div>`;
        app.innerHTML = html;

        document.getElementById('back-btn').addEventListener('click', renderHome);

        // Clic sur les RECETTES (Version JSON)
        document.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const dayId = parseInt(card.dataset.dayId);
                // On cherche le bon jour dans les données chargées
                const recipe = recipes.find(r => r.jour === dayId);
                if(recipe) openRecipeModal(recipe, breakfastData.metadata);
            });
        });

        // Recherche locale sur les aliments
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
            }
        }
    }

    // --- RECHERCHE GLOBALE ---
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

    // --- CRÉATION ITEM ALIMENT STANDARD ---
    function createFoodItem(food) {
        const v = food.values || {}; 
        const kcal = v.kcal ? `${v.kcal} kcal` : 'xx';
        const ig = v.ig ? v.ig : 'xx'; 
        const prot = v.prot ? `${v.prot}g` : 'xx';
        const gluc = v.gluc ? `${v.gluc}g` : 'xx';
        const lip = v.lip ? `${v.lip}g` : 'xx';
        const na = v.na ? `${v.na}mg` : 'xx';
        const k = v.k ? `${v.k}mg` : 'xx';

        return `
            <div class="food-item">
                <div class="food-top-row">
                    <div>
                        <div class="food-name">${food.name}</div>
                        <div class="food-notes">${food.notes || ''}</div>
                    </div>
                </div>
                <div class="nutri-grid">
                    <span class="nutri-bubble bubble-yellow">Kcal : ${kcal}</span>
                    <span class="nutri-bubble bubble-orange">IG : ${ig}</span>
                    <span class="nutri-bubble bubble-blue">Prot : ${prot}</span>
                    <span class="nutri-bubble bubble-red">Gluc : ${gluc}</span>
                    <span class="nutri-bubble bubble-green">Lip : ${lip}</span>
                    <span class="nutri-bubble bubble-mauve">Na+ : ${na}</span>
                    <span class="nutri-bubble bubble-violet">K+ : ${k}</span>
                </div>
            </div>
        `;
    }

    loadData();
});
