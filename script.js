document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('content-area');
    const heroSection = document.getElementById('hero-section');
    const globalSearchInput = document.getElementById('global-search');
    let allData = null;
    let allFoodsFlat = []; // Liste plate de tous les aliments pour la recherche

    // Définition manuelle des catégories de repas (virtuelles)
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
            
            // Aplatir les données pour faciliter la recherche globale
            allData.categories.forEach(cat => {
                cat.foods.forEach(food => {
                    // On ajoute l'info de la catégorie parente à l'aliment
                    allFoodsFlat.push({ ...food, parentCategory: cat.name, parentIcon: cat.icon });
                });
            });

            renderHome();
        } catch (error) {
            app.innerHTML = `<div style="text-align:center; padding:2rem; color:red;">Erreur de chargement des données.</div>`;
        }
    }

    // --- 2. ACCUEIL ---
    function renderHome() {
        heroSection.classList.remove('hidden'); // Afficher la recherche globale
        globalSearchInput.value = ''; // Reset recherche

        let html = `
            <div class="section-label">Par Repas</div>
            <div class="grid">
                ${mealCategories.map(cat => createCard(cat)).join('')}
            </div>

            <div class="section-label">Par Catégorie d'aliments</div>
            <div class="grid">
                ${allData.categories.map(cat => createCard(cat)).join('')}
            </div>
        `;
        app.innerHTML = html;

        // Attacher les événements click
        document.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const type = card.dataset.type;
                if (type === 'meal') {
                    handleMealClick(id);
                } else {
                    handleCategoryClick(id);
                }
            });
        });
    }

    function createCard(item) {
        // Note: On n'affiche PLUS la description ici comme demandé
        return `
            <div class="cat-card" data-id="${item.id}" data-type="${item.type || 'category'}">
                <span class="cat-icon">${item.icon}</span>
                <div class="cat-name">${item.name}</div>
            </div>
        `;
    }

    // --- 3. LOGIQUE CATÉGORIE CLASSIQUE ---
    function handleCategoryClick(id) {
        const category = allData.categories.find(c => c.id === id);
        renderList(category.name, category.foods, category.icon);
    }

    // --- 4. LOGIQUE REPAS (Virtuelle) ---
    function handleMealClick(mealId) {
        const mealInfo = mealCategories.find(m => m.id === mealId);
        
        // Filtrer TOUS les aliments qui ont ce mealId dans 'suitableFor'
        const filteredFoods = allFoodsFlat.filter(food => 
            food.suitableFor && food.suitableFor.includes(mealId)
        );

        renderList(mealInfo.name, filteredFoods, mealInfo.icon, true);
    }

    // --- 5. RECHERCHE GLOBALE ---
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

        renderList(`Résultats pour "${e.target.value}"`, results, '🔍', false, true);
    });

    // --- 6. AFFICHAGE LISTE (Générique) ---
    function renderList(title, foods, icon, isMealMode = false, isSearchMode = false) {
        if (!isSearchMode) heroSection.classList.add('hidden'); // Cacher le gros header si on navigue

        let html = `
            <div class="nav-header">
                <button id="back-btn" class="back-btn">← Retour à l'accueil</button>
                <div class="page-context-title">${icon || ''} ${title}</div>
                <div style="color:var(--text-secondary)">${foods.length} aliments trouvés</div>
            </div>
            
            <div class="food-list-container">
        `;

        if (foods.length === 0) {
            html += `<div style="text-align:center; padding:2rem;">Aucun aliment trouvé.</div>`;
        } else {
            foods.forEach(food => {
                html += createFoodItem(food, isMealMode || isSearchMode);
            });
        }

        html += `</div>`;
        app.innerHTML = html;

        document.getElementById('back-btn').addEventListener('click', renderHome);
    }

    function createFoodItem(food, showCategoryTag) {
        let tagsHtml = '';
        
        // Tag Catégorie (utile si on est en mode Repas ou Recherche)
        if (showCategoryTag && food.parentCategory) {
            tagsHtml += `<span class="tag" style="background:#eef2ff; color:#4f46e5">${food.parentCategory}</span>`;
        }

        if (food.tags) {
            food.tags.forEach(tag => {
                let className = 'tag';
                if (tag === 'choix-optimal') className += ' optimal';
                tagsHtml += `<span class="${className}">${tag.replace(/-/g, ' ')}</span>`;
            });
        }

        let warning = food.warnings ? `<div class="warning-box">⚠️ ${food.warnings}</div>` : '';
        let notes = food.notes ? `<div style="margin-top:0.25rem;">${food.notes}</div>` : '';

        return `
            <div class="food-item">
                <div class="food-details">
                    <div class="food-name">${food.name}</div>
                    <div class="food-meta">
                        ${notes}
                        ${warning}
                    </div>
                </div>
                <div class="food-tags-column">
                    <div class="tags">${tagsHtml}</div>
                </div>
            </div>
        `;
    }

    loadData();
});
