document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    let allData = null;

    // --- 1. CHARGEMENT DES DONNÉES ---
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error("Erreur chargement JSON");
            allData = await response.json();
            renderHome();
        } catch (error) {
            app.innerHTML = `<div class="error">Impossible de charger les données. Vérifiez le fichier data.json.</div>`;
            console.error(error);
        }
    }

    // --- 2. VUE : ACCUEIL (Liste des catégories) ---
    function renderHome() {
        app.innerHTML = `
            <div class="nav-header">
                <h1 class="page-title">Catégories Alimentaires</h1>
                <p>Sélectionnez une catégorie pour voir les recommandations.</p>
            </div>
            <div class="grid" id="categories-grid"></div>
        `;

        const grid = document.getElementById('categories-grid');
        
        allData.categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'cat-card';
            card.innerHTML = `
                <span class="cat-icon">${cat.icon || '🍽️'}</span>
                <h2 class="cat-name">${cat.name}</h2>
                <p class="category-desc">${cat.description || ''}</p>
                <small>${cat.foods.length} aliments</small>
            `;
            // Clic sur une catégorie
            card.addEventListener('click', () => renderCategory(cat));
            grid.appendChild(card);
        });
    }

    // --- 3. VUE : CATÉGORIE (Détails + Recherche) ---
    function renderCategory(category) {
        // Structure de la page catégorie
        app.innerHTML = `
            <div class="nav-header">
                <div>
                    <button id="back-btn" class="back-btn">← Retour à l'accueil</button>
                    <span> > ${category.name}</span>
                </div>
                <h1 class="page-title">${category.icon || ''} ${category.name}</h1>
                
                <div class="search-container">
                    <input type="text" id="local-search" class="search-input" 
                           placeholder="Rechercher dans ${category.name}..." aria-label="Rechercher">
                </div>
            </div>

            <div class="grid" id="foods-grid">
                </div>
            <div id="no-results" class="hidden" style="text-align:center; margin-top:2rem;">Aucun aliment trouvé.</div>
        `;

        // Bouton retour
        document.getElementById('back-btn').addEventListener('click', renderHome);

        // Rendu initial des aliments
        const foodGrid = document.getElementById('foods-grid');
        const searchInput = document.getElementById('local-search');
        const noResults = document.getElementById('no-results');

        // Fonction pour afficher une liste d'aliments
        function displayFoods(foodsToDisplay) {
            foodGrid.innerHTML = '';
            if (foodsToDisplay.length === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
                foodsToDisplay.forEach(food => {
                    const el = createFoodCard(food, category.id);
                    foodGrid.appendChild(el);
                });
            }
        }

        // Afficher tout au début
        displayFoods(category.foods);

        // Logique de recherche (Debouncing léger)
        let timeout = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const term = e.target.value.toLowerCase();
                const filtered = category.foods.filter(f => 
                    f.name.toLowerCase().includes(term) || 
                    (f.notes && f.notes.toLowerCase().includes(term))
                );
                displayFoods(filtered);
            }, 150); // 150ms de délai pour perf
        });
        
        // Focus automatique sur la recherche
        searchInput.focus();
    }

    // --- 4. COMPOSANT : CARTE ALIMENT ---
    function createFoodCard(food, catId) {
        const div = document.createElement('div');
        div.className = 'food-card';
        
        // Gestion des tags/badges
        let badgesHtml = '';
        if (food.tags) {
            food.tags.forEach(tag => {
                let cleanTag = tag.replace('-', ' ');
                let classType = 'default';
                if(tag === 'choix-optimal' || tag === 'faible-k+') classType = 'optimal';
                badgesHtml += `<span class="badge ${classType}">${cleanTag}</span>`;
            });
        }

        // Gestion des warnings
        let warningHtml = '';
        if (food.warnings) {
            warningHtml = `<div class="alert">⚠️ ${food.warnings}</div>`;
        }

        // Highlights nutritionnels
        let highlights = '';
        if (Array.isArray(food.nutritionHighlights) && food.nutritionHighlights.length > 0) {
            highlights = food.nutritionHighlights.join(', ');
        } else if (typeof food.nutritionHighlights === 'string') {
            highlights = food.nutritionHighlights;
        }

        div.innerHTML = `
            <div class="food-header">
                <span class="food-name">${food.name}</span>
            </div>
            <div class="badges">${badgesHtml}</div>
            <p class="food-notes">${food.notes}</p>
            ${highlights ? `<div class="food-highlight">💡 ${highlights}</div>` : ''}
            ${warningHtml}
        `;
        return div;
    }

    // Lancer l'app
    loadData();
});
