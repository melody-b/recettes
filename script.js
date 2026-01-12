// Configuration: Variable pour afficher ou masquer le bouton de conversion
const SHOW_CONVERT_BUTTON = true;

document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll("#recipeTabs a");
    const recipes = document.querySelectorAll(".recipe");
    const convertButtons = document.querySelectorAll(".convert-button");

    // Afficher ou masquer les boutons de conversion selon la variable
    if (!SHOW_CONVERT_BUTTON) {
        convertButtons.forEach(button => {
            button.classList.add("hidden");
        });
    }

    // Gestion des onglets de navigation
    tabs.forEach(tab => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();
            const targetRecipeId = this.getAttribute("data-tab");
            
            if (!targetRecipeId) {
                return;
            }

            const targetRecipe = document.getElementById(targetRecipeId);
            if (!targetRecipe) {
                return;
            }

            // Retirer la classe active de tous les onglets et recettes
            tabs.forEach(t => t.classList.remove("active"));
            recipes.forEach(recipe => {
                recipe.classList.remove("active");
                recipe.style.display = "none";
            });

            // Activer l'onglet et la recette sélectionnés
            this.classList.add("active");
            targetRecipe.classList.add("active");
            targetRecipe.style.display = "block";
            
            // Réinitialiser les onglets Ingredients/Directions à la première recette
            const firstTabButton = targetRecipe.querySelector(".tab-button");
            const firstTabPane = targetRecipe.querySelector(".tab-pane");
            if (firstTabButton && firstTabPane) {
                targetRecipe.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
                targetRecipe.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
                firstTabButton.classList.add("active");
                firstTabPane.classList.add("active");
            }
        });
    });

    // Afficher la première recette par défaut
    const defaultRecipe = document.querySelector(".recipe.active");
    if (defaultRecipe) {
        defaultRecipe.style.display = "block";
    }

    // Rendre les ingrédients cliquables pour les cocher/décocher
    function initializeIngredientCheckboxes() {
        const allIngredients = document.querySelectorAll(".ingredient");
        allIngredients.forEach((ingredient) => {
            // Supprimer les anciens event listeners en clonant l'élément
            const newIngredient = ingredient.cloneNode(true);
            ingredient.parentNode.replaceChild(newIngredient, ingredient);
            
            // Ajouter l'event listener pour le clic
            newIngredient.addEventListener("click", function(e) {
                e.stopPropagation(); // Empêcher la propagation de l'événement aux parents
                // Basculer l'état checked
                const isChecked = newIngredient.classList.contains("checked");
                updateIngredientState(newIngredient, !isChecked);
            });
        });
    }
    
    function updateIngredientState(ingredient, isChecked) {
        if (isChecked) {
            ingredient.classList.add("checked");
        } else {
            ingredient.classList.remove("checked");
        }
    }
    
    // Initialiser les ingrédients cliquables au chargement
    initializeIngredientCheckboxes();
    
    // Réinitialiser quand on change de recette
    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            setTimeout(initializeIngredientCheckboxes, 100);
        });
    });

    // Gestion des onglets Ingredients/Directions
    const tabButtons = document.querySelectorAll(".tab-button");

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {
            const targetTab = this.getAttribute("data-tab");
            const recipeSection = this.closest(".recipe");
            
            if (!recipeSection) {
                return;
            }
            
            const tabButtons = recipeSection.querySelectorAll(".tab-button");
            const tabPanes = recipeSection.querySelectorAll(".tab-pane");
            const currentIndex = Array.from(tabButtons).findIndex(btn => btn.classList.contains("active"));
            const targetIndex = Array.from(tabButtons).indexOf(this);
            
            if (currentIndex === targetIndex) return;
            
            const direction = targetIndex > currentIndex ? 'next' : 'prev';
            switchTab(recipeSection, direction);
        });
    });

    // Fonction pour changer d'onglet avec animation
    function switchTab(recipeSection, direction) {
        const tabButtons = recipeSection.querySelectorAll(".tab-button");
        const tabPanes = recipeSection.querySelectorAll(".tab-pane");
        
        if (tabButtons.length !== 2) return;
        
        const currentIndex = Array.from(tabButtons).findIndex(btn => btn.classList.contains("active"));
        const newIndex = direction === 'next' ? 1 : 0;
        
        if (currentIndex === newIndex) return;
        
        const currentPane = tabPanes[currentIndex];
        const newPane = tabPanes[newIndex];
        
        // Nettoyer les classes d'animation précédentes
        tabPanes.forEach(pane => {
            pane.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
        });
        
        // Animation de sortie
        if (direction === 'next') {
            currentPane.classList.add('slide-out-left');
        } else {
            currentPane.classList.add('slide-out-right');
        }
        
        // Retirer active de l'ancien onglet
        setTimeout(() => {
            currentPane.classList.remove("active");
            tabButtons[currentIndex].classList.remove("active");
            
            // Préparer le nouvel onglet
            newPane.classList.add("active");
            if (direction === 'next') {
                newPane.classList.add('slide-in-right');
            } else {
                newPane.classList.add('slide-in-left');
            }
            
            // Activer le bouton
            tabButtons[newIndex].classList.add("active");
        }, 50);
        
        // Nettoyer les classes d'animation après l'animation
        setTimeout(() => {
            tabPanes.forEach(pane => {
                pane.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
            });
        }, 450);
    }

    // Ajouter le support de swipe pour les onglets
    const tabContents = document.querySelectorAll(".tab-content");
    
    tabContents.forEach(tabContent => {
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        let currentX = 0;
        
        // Touch events
        tabContent.addEventListener("touchstart", function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        });
        
        tabContent.addEventListener("touchmove", function(e) {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diffY = Math.abs(e.touches[0].clientY - startY);
            const diffX = Math.abs(currentX - startX);
            
            // Empêcher le scroll vertical si on swipe horizontalement
            if (diffX > diffY && diffX > 10) {
                e.preventDefault();
            }
        });
        
        tabContent.addEventListener("touchend", function(e) {
            if (!isDragging) return;
            isDragging = false;
            
            const diffX = currentX - startX;
            const diffY = Math.abs(e.changedTouches[0].clientY - startY);
            
            // Swipe horizontal détecté (au moins 50px et plus horizontal que vertical)
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
                const recipeSection = tabContent.closest(".recipe");
                if (recipeSection) {
                    if (diffX > 0) {
                        // Swipe vers la droite -> aller à l'onglet précédent (Ingredients)
                        switchTab(recipeSection, 'prev');
                    } else {
                        // Swipe vers la gauche -> aller à l'onglet suivant (Instructions)
                        switchTab(recipeSection, 'next');
                    }
                }
            }
        });
        
        // Mouse events pour le desktop
        let mouseStartX = 0;
        let mouseStartY = 0;
        let mouseIsDragging = false;
        let mouseCurrentX = 0;
        
        tabContent.addEventListener("mousedown", function(e) {
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
            mouseIsDragging = true;
            tabContent.style.cursor = "grabbing";
        });
        
        tabContent.addEventListener("mousemove", function(e) {
            if (!mouseIsDragging) return;
            mouseCurrentX = e.clientX;
        });
        
        tabContent.addEventListener("mouseup", function(e) {
            if (!mouseIsDragging) return;
            mouseIsDragging = false;
            tabContent.style.cursor = "default";
            
            const diffX = mouseCurrentX - mouseStartX;
            const diffY = Math.abs(e.clientY - mouseStartY);
            
            // Drag horizontal détecté
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
                const recipeSection = tabContent.closest(".recipe");
                if (recipeSection) {
                    if (diffX > 0) {
                        switchTab(recipeSection, 'prev');
                    } else {
                        switchTab(recipeSection, 'next');
                    }
                }
            }
        });
        
        tabContent.addEventListener("mouseleave", function() {
            mouseIsDragging = false;
            tabContent.style.cursor = "default";
        });
    });

    // Gestion de la conversion des unités
    convertButtons.forEach(convertButton => {
        convertButton.addEventListener("click", function () {
            const activeRecipe = document.querySelector(".recipe.active");
            if (!activeRecipe) {
                return;
            }

            const ingredientsLists = activeRecipe.querySelectorAll(".ingredients-list");
            ingredientsLists.forEach(ingredientsList => {
                const ingredients = ingredientsList.querySelectorAll("li.ingredient");
                ingredients.forEach(ingredient => {
                    const unit = ingredient.dataset.unit;

                    if (!unit) {
                        return;
                    }

                    const ingredientTextElement = ingredient.querySelector(".ingredient-text");
                    const originalText = ingredientTextElement ? ingredientTextElement.textContent.trim() : ingredient.textContent.trim();
                    const quantity = extractQuantity(originalText);

                    if (quantity === null) {
                        return;
                    }

                    let convertedQuantity;
                    let textQuantity;

                    if (originalText.includes(" ml ")) {
                        // Reconvertir en unités d'origine
                        convertedQuantity = convertQuantity(quantity, 'ml');
                        const textUnit = convertUnitToText(unit, convertedQuantity[unit]);
                        
                        if (convertedQuantity[unit] < 1) {
                            const fraction = math.fraction(convertedQuantity[unit]);
                            textQuantity = `${fraction.n}/${fraction.d} ${textUnit}`;
                        } else {
                            textQuantity = `${convertedQuantity[unit]} ${textUnit}`;
                        }
                    } else {
                        // Convertir en millilitres
                        convertedQuantity = convertQuantity(quantity, unit);
                        textQuantity = `${convertedQuantity.ml} ml`;
                    }

                    // Extraire la partie après l'unité spécifique
                    const ingredientPart = extractIngredientPart(originalText);

                    // Mettre à jour le texte avec la nouvelle quantité et l'unité
                    const ingredientText = ingredient.querySelector(".ingredient-text");
                    if (ingredientText) {
                        ingredientText.textContent = `${textQuantity} ${ingredientPart}`;
                    } else {
                        ingredient.textContent = `${textQuantity} ${ingredientPart}`;
                    }
                });
            });
        });
    });

    /**
     * Convertit l'unité en texte lisible
     * @param {string} unit - L'unité à convertir
     * @param {number} quantity - La quantité pour déterminer le pluriel
     * @returns {string} Le texte de l'unité
     */
    function convertUnitToText(unit, quantity) {
        if (unit === "the") {
            return quantity < 2 ? "cuillère à thé" : "cuillères à thé";
        } else if (unit === "soupe") {
            return quantity < 2 ? "cuillère à soupe" : "cuillères à soupe";
        } else if (unit === "tasse") {
            return quantity < 1 ? "de tasse" : "tasse";
        }
        return unit;
    }

    /**
     * Extrait la quantité numérique d'un texte
     * @param {string} text - Le texte contenant la quantité
     * @returns {number|null} La quantité extraite ou null si non trouvée
     */
    function extractQuantity(text) {
        const match = text.match(/^((\d+\.\d+)|(\d+\/\d+)|(\d+))\s*(\S+(\s+\S+)*)/);
        
        if (!match) {
            return null;
        }

        let quantity;
        // Si c'est une fraction
        if (match[3]) {
            const [numerator, denominator] = match[3].split('/').map(Number);
            if (denominator === 0) {
                return null;
            }
            quantity = numerator / denominator;
        } else {
            quantity = parseFloat(match[1]);
            if (isNaN(quantity)) {
                return null;
            }
        }

        return quantity;
    }

    /**
     * Extrait la partie de l'ingrédient après l'unité
     * @param {string} text - Le texte complet de l'ingrédient
     * @returns {string} La partie de l'ingrédient après l'unité
     */
    function extractIngredientPart(text) {
        const match = text.match(/^((\d+\.\d+)|(\d+\/\d+)|(\d+))\s*(\S+(\s+\S+)*)/);
        
        if (!match || !match[5]) {
            return text;
        }

        let unit = match[5];
        const unitIndex = text.indexOf(unit);

        if (unit.includes("à soupe") || unit.includes("à thé")) {
            unit = unit.split(' ').slice(0, 3).join(' ');
        } else if (unit.includes("de tasse")) {
            unit = unit.split(' ').slice(0, 2).join(' ');
        } else if (unit.includes("tasse") || unit.includes("ml")) {
            unit = unit.split(' ')[0];
        }

        return unitIndex !== -1 ? text.slice(unitIndex + unit.length).trim() : text;
    }

    /**
     * Convertit une quantité d'une unité vers d'autres unités
     * @param {number} quantity - La quantité à convertir
     * @param {string} unit - L'unité source
     * @returns {Object} Un objet contenant les quantités converties
     */
    function convertQuantity(quantity, unit) {
        // Coefficients de conversion (1 tasse = 250 ml, 1 cuillère à soupe = 15 ml, 1 cuillère à thé = 5 ml)
        const conversionFactors = {
            ml: 1,
            tasse: 250,
            soupe: 15,
            the: 5
        };

        if (!conversionFactors.hasOwnProperty(unit)) {
            return { ml: quantity, tasse: 0, soupe: 0, the: 0 };
        }

        // Convertir la quantité en ml
        const quantityInML = quantity * conversionFactors[unit];

        // Convertir la quantité de ml vers d'autres unités
        const convertedQuantity = {
            ml: quantityInML,
            tasse: quantityInML / conversionFactors.tasse,
            soupe: quantityInML / conversionFactors.soupe,
            the: quantityInML / conversionFactors.the
        };

        return convertedQuantity;
    }
});
