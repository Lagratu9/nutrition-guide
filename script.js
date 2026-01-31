document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('content-area');
    const heroSection = document.getElementById('hero-section');
    const globalSearchInput = document.getElementById('global-search');
    
    // Éléments de la Modale
    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.getElementById('close-modal');

    let allData = null;
    let allFoodsFlat = []; 

    // --- DONNÉES DES 7 PETITS DÉJEUNERS (Intégrées ici) ---
    const breakfastRecipes = [
        {
            id: 1, type: 'Sucré', title: 'PDJ 1 - Bowl Avoine & Fruits Rouges',
            desc: "Yaourt grec, flocons d'avoine, framboises, chia...",
            ingredients: [
                {name: "Yaourt grec sans lactose", qty: "150 g"},
                {name: "Flocons d'avoine", qty: "35 g"},
                {name: "Framboises fraîches", qty: "80 g"},
                {name: "Graines de chia", qty: "10 g"},
                {name: "Noix de macadamia", qty: "20 g"},
                {name: "Cannelle", qty: "2 g"}
            ],
            values: { kcal: 522, prot: 24.1, gluc: 46.7, lip: 28.7, na: 75, k: 620, p: 511 },
            justification: "Bowl protéiné à IG modéré (chia stabilise la glycémie), riche en oméga-3 et antioxydants. Parfait post-L-Thyroxine (après 1h).",
            warnings: "Respecter le délai d'1h après L-Thyroxine."
        },
        {
            id: 2, type: 'Salé', title: 'PDJ 2 - L\'Assiette Méditerranéenne',
            desc: "Œufs, pain épeautre, avocat, tomates cerises...",
            ingredients: [
                {name: "Œufs entiers (cuits durs/brouillés)", qty: "2 gros (130g)"},
                {name: "Pain au levain d'épeautre", qty: "2 tranches (70g)"},
                {name: "Avocat", qty: "60 g"},
                {name: "Tomates cerises", qty: "8-10 pièces (80g)"},
                {name: "Huile d'olive", qty: "1 c.à.c (6g)"}
            ],
            values: { kcal: 524, prot: 25.3, gluc: 43.2, lip: 29.1, na: 484, k: 749, p: 378 },
            justification: "Petit déjeuner anti-inflammatoire, protéines de haute valeur biologique. Cuisson complète des œufs obligatoire (immunosuppression).",
            warnings: "Cuisson complète des œufs impérative."
        },
        {
            id: 3, type: 'Sucré', title: 'PDJ 3 - Cottage Cheese & Baies',
            desc: "Cottage cheese, myrtilles, fraises, amande...",
            ingredients: [
                {name: "Cottage cheese sans lactose", qty: "180 g"},
                {name: "Myrtilles", qty: "100 g"},
                {name: "Fraises", qty: "80 g"},
                {name: "Beurre d'amande naturel", qty: "20 g"},
                {name: "Coco râpée non sucrée", qty: "20 g"},
                {name: "Graines de lin moulues", qty: "10 g"}
            ],
            values: { kcal: 520, prot: 31.0, gluc: 37.2, lip: 30.1, na: 550, k: 689, p: 503 },
            justification: "Très riche en protéines (31g) pour contrôle de l'appétit. Baies à IG bas, parfait pour la résistance insulinique.",
            warnings: ""
        },
        {
            id: 4, type: 'Mixte', title: 'PDJ 4 - Omelette Comté & Mûres',
            desc: "Omelette au comté, épinards, pain, mûres...",
            ingredients: [
                {name: "Œufs entiers (omelette)", qty: "2 œufs (120g)"},
                {name: "Fromage comté râpé", qty: "30 g"},
                {name: "Pousses d'épinards", qty: "30 g"},
                {name: "Pain épeautre", qty: "55 g"},
                {name: "Mûres", qty: "80 g"},
                {name: "Huile d'olive", qty: "6 g"}
            ],
            values: { kcal: 528, prot: 30.7, gluc: 36.6, lip: 29.5, na: 661, k: 561, p: 505 },
            justification: "Omelette enrichie (fermentation réduit le lactose), épinards en petite quantité pour contrôler le potassium.",
            warnings: "Espacer de 1h de la L-Thyroxine."
        },
        {
            id: 5, type: 'Salé', title: 'PDJ 5 - Le Sportif (Blancs d\'œufs)',
            desc: "Blancs d'œufs, feta, poivrons, tomates...",
            ingredients: [
                {name: "Blancs d'œufs", qty: "5-6 blancs (180g)"},
                {name: "Œuf entier", qty: "1 (60g)"},
                {name: "Feta", qty: "45 g"},
                {name: "Poivron rouge", qty: "70 g"},
                {name: "Tomates cerises", qty: "70 g"},
                {name: "Pain épeautre", qty: "60 g"},
                {name: "Huile d'olive", qty: "10 g"}
            ],
            values: { kcal: 449, prot: 34.5, gluc: 37.6, lip: 17.9, na: 650, k: 773, p: 241 },
            justification: "Hyperprotéiné (34.5g) et allégé en graisses. Faible en phosphore grâce aux blancs d'œufs.",
            warnings: ""
        },
        {
            id: 6, type: 'Mixte', title: 'PDJ 6 - Choco-Orange & Avoine',
            desc: "Yaourt grec, avoine, orange, beurre cacahuète...",
            ingredients: [
                {name: "Yaourt grec sans lactose", qty: "150 g"},
                {name: "Flocons d'avoine", qty: "35 g"},
                {name: "Orange (petite)", qty: "3/4 (100g)"},
                {name: "Beurre de cacahuète", qty: "18 g"},
                {name: "Chocolat noir >70%", qty: "2 carrés (15g)"}
            ],
            values: { kcal: 526, prot: 26.2, gluc: 50.2, lip: 25.7, na: 77, k: 758, p: 484 },
            justification: "Équilibré. Orange sûre (pas d'interaction CYP3A4 contrairement au pamplemousse). Riche en antioxydants.",
            warnings: "Pas de pamplemousse !"
        },
        {
            id: 7, type: 'Mixte', title: 'PDJ 7 - Toast Fromage Frais & Baies',
            desc: "Fromage frais, pain, framboises, noix...",
            ingredients: [
                {name: "Fromage frais (type Philadelphia)", qty: "60 g"},
                {name: "Pain épeautre", qty: "55 g"},
                {name: "Framboises", qty: "90 g"},
                {name: "Myrtilles", qty: "60 g"},
                {name: "Noix de macadamia", qty: "20 g"},
                {name: "Cannelle", qty: "1 g"}
            ],
            values: { kcal: 524, prot: 12.3, gluc: 51.5, lip: 31.8, na: 490, k: 415, p: 175 },
            justification: "Version légère en protéines, très riche en antioxydants. Potassium et Phosphore les plus bas de la semaine.",
            warnings: ""
        }
    ];

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

    // --- LOGIQUE MODALE ---
    if(closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    function openRecipeModal(recipe) {
        const v = recipe.values;
        // Construction du HTML de la modale
        let ingredientsHtml = recipe.ingredients.map(ing => 
            `<li><span>${ing.name}</span><span class="ingredient-qty">${ing.qty}</span></li>`
        ).join('');

        let html = `
            <span class="recipe-tag tag-${recipe.type.toLowerCase()}">${recipe.type}</span>
            <h2 class="modal-h2">${recipe.title}</h2>
            
            <div class="nutri-grid" style="margin-bottom: 1.5rem;">
                 <span class="nutri-bubble bubble-yellow">Kcal : ${v.kcal}</span>
                 <span class="nutri-bubble bubble-blue">Prot : ${v.prot}g</span>
                 <span class="nutri-bubble bubble-red">Gluc : ${v.gluc}g</span>
                 <span class="nutri-bubble bubble-green">Lip : ${v.lip}g</span>
                 <span class="nutri-bubble bubble-violet">K+ : ${v.k}mg</span>
                 <span class="nutri-bubble bubble-mauve">Na+ : ${v.na}mg</span>
            </div>

            <div class="modal-section-title">Ingrédients</div>
            <ul class="ingredient-list">
                ${ingredientsHtml}
            </ul>

            <div class="justification-box">
                <strong>Pourquoi ce choix ?</strong><br>
                ${recipe.justification}
            </div>

            ${recipe.warnings ? `<div class="warning-box-modal">⚠️ ${recipe.warnings}</div>` : ''}
        `;
        
        modalBody.innerHTML = html;
        modal.classList.remove('hidden');
    }

    // --- CHARGEMENT DES DONNÉES ---
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error("Erreur");
            allData = await response.json();
            
            if (allData.categories) {
                allData.categories.forEach(cat => {
                    const icon = iconMapping[cat.id] || cat.icon || iconMapping['default'];
                    if(cat.foods) {
                        cat.foods.forEach(food => {
                            allFoodsFlat.push({ ...food, parentCategory: cat.name, parentIcon: icon });
                        });
                    }
                });
                renderHome();
            }
        } catch (error) { console.error(error); }
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

    // --- LOGIQUE NAVIGATION ---
    function handleCategoryClick(id) {
        const category = allData.categories.find(c => c.id === id);
        if(category) {
            const icon = iconMapping[category.id] || category.icon || iconMapping['default'];
            renderList(category.name, category.foods, icon);
        }
    }

    function handleMealClick(mealId) {
        const mealInfo = mealCategories.find(m => m.id === mealId);
        const filteredFoods = allFoodsFlat.filter(food => 
            food.suitableFor && food.suitableFor.includes(mealId)
        );

        // Si c'est le petit-déjeuner, on injecte les recettes !
        const recipes = (mealId === 'petit-dejeuner') ? breakfastRecipes : [];
        
        renderList(mealInfo.name, filteredFoods, mealInfo.icon, true, false, recipes);
    }

    // --- RENDU LISTE (Modifié pour accepter les Recettes) ---
    function renderList(title, foods, icon, isMealMode = false, isSearchMode = false, recipes = []) {
        if(heroSection && !isSearchMode) heroSection.classList.add('hidden');
        
        // Bloc HTML pour les recettes (si présentes)
        let recipesHtml = '';
        if (recipes.length > 0) {
            recipesHtml = `
                <div class="section-label" style="margin-top:0;">Menus Complets</div>
                <div class="recipe-grid">
                    ${recipes.map(r => `
                        <div class="recipe-card" data-recipe-id="${r.id}">
                            <span class="recipe-tag tag-${r.type.toLowerCase()}">${r.type}</span>
                            <div class="recipe-title">${r.title}</div>
                            <div class="recipe-summary">${r.desc}</div>
                            <div class="nutri-grid" style="border:none; margin:0; padding:0;">
                                <span class="nutri-bubble bubble-yellow">${r.values.kcal} kcal</span>
                                <span class="nutri-bubble bubble-blue">Prot: ${r.values.prot}g</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="section-label">Ingrédients individuels</div>
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

        // Attacher l'événement clic sur les RECETTES
        document.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const rId = parseInt(card.dataset.recipeId);
                const recipe = recipes.find(r => r.id === rId);
                if(recipe) openRecipeModal(recipe);
            });
        });

        // Recherche locale
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
