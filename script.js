document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll("#recipeTabs a");
    const recipes = document.querySelectorAll(".recipe");

    tabs.forEach(tab => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();
            const targetRecipe = this.getAttribute("data-tab");

            recipes.forEach(recipe => {
                recipe.classList.remove("active");
                recipe.style.display = "none";
            });

            document.getElementById(targetRecipe).classList.add("active");
            document.getElementById(targetRecipe).style.display = "flex";
        });
    });

    // Affiche la première recette par défaut
    const defaultRecipe = document.querySelector(".recipe.active");
    if (defaultRecipe) {
        defaultRecipe.style.display = "flex";
    }
    const convertButtons = document.querySelectorAll(".convert-button");

    convertButtons.forEach(convertButton => {
        convertButton.addEventListener("click", function () {
            // Conversion des quantités
            const ingredientsLists = document.querySelectorAll(".active .ingredients-list");
            ingredientsLists.forEach(ingredientsList => {
                const ingredients = ingredientsList.querySelectorAll("li");
                ingredients.forEach(ingredient => {
                    const unit = ingredient.dataset.unit;
    
                    if (unit) {
                        const originalText = ingredient.textContent.trim();
                        const quantity = extractQuantity(originalText);
    
                        // Conversion des quantités
                        let convertedQuantity;
                        let textQuantity;
                        let fraction;
                        if (originalText.includes(" ml ")) {
                            // Reconvertir en unités d'origine
                            convertedQuantity = convertQuantity(quantity, 'ml');
                            textUnit = convertUnitToText(unit, convertedQuantity[unit]);
                            if (convertedQuantity[unit] < 1) {
                                fraction = math.fraction(convertedQuantity[unit]);
                                textQuantity = `${fraction.n}/${fraction.d} ${textUnit}`;
                            } else {
                                textQuantity = `${convertedQuantity[unit]} ${textUnit}`;
                            }
    
                        } else {
                            // Convertir en millilitres
                            convertedQuantity = convertQuantity(quantity, unit);
                            textQuantity = `${convertedQuantity.ml} ml`
                        }
    
                        // Extraire la partie après l'unité spécifique
                        const ingredientPart = extractIngredientPart(originalText);
    
                        // Mettre à jour le texte avec la nouvelle quantité et l'unité
                        ingredient.textContent = `${textQuantity} ${ingredientPart}`;
    
                    }
                });
            })
        })

    });

    function convertUnitToText(unit, quantity) {
        if (unit === "the") {
            return quantity < 2 ? "cuillère à thé" : "cuillères à thé"
        } else if (unit === "soupe") {
            return quantity < 2 ? "cuillère à soupe" : "cuillères à soupe"
        } else if (unit === "tasse") {
            return quantity < 1 ? "de tasse" : unit
        }
        return unit;
    }

    function extractQuantity(text) {
        const match = text.match(/^((\d+\.\d+)|(\d+\/\d+)|(\d+))\s*(\S+(\s+\S+)*)/);
        // Si une correspondance est trouvée, renvoyer un objet avec la quantité et l'unité, sinon renvoyer null.
        if (match) {
            let quantity;
            // Si le groupe de capture (\d+\/\d+) correspond à une fraction, convertir la fraction en nombre décimal.
            if (match[3]) {
                const [numerator, denominator] = match[3].split('/').map(Number);
                quantity = numerator / denominator;
            } else {
                quantity = parseFloat(match[1]);
            }

            return quantity;
        }
        return null;
    }

    // Fonction pour extraire la partie après l'unité spécifique
    function extractIngredientPart(text) {

        unit = text.match(/^((\d+\.\d+)|(\d+\/\d+)|(\d+))\s*(\S+(\s+\S+)*)/)[5]

        // Trouve l'index de l'unité dans la chaîne de texte
        const unitIndex = text.indexOf(unit[0]);

        if (unit.includes("à soupe") || unit.includes("à thé")) {
            unit = unit.split(' ').slice(0, 3).join(' ')
        } else if (unit.includes("de tasse")) {
            unit = unit.split(' ').slice(0, 2).join(' ')
        } else if (unit.includes("tasse") || unit.includes("ml")) {
            unit = unit.split(' ')[0]
        }
        return unitIndex !== -1 ? text.slice(unitIndex + unit.length).trim() : text;
    }


    // Fonction pour convertir les quantités
    function convertQuantity(quantity, unit) {
        // Coefficients de conversion (1 tasse = 240 ml, 1 cuillère à soupe = 15 ml, 1 cuillère à thé = 5 ml)
        const conversionFactors = {
            ml: 1,
            tasse: 250,
            soupe: 15,
            the: 5
        };

        // Convertir la quantité en ml
        const quantityInML = quantity * conversionFactors[unit];

        // Convertir la quantité de ml vers d'autres unités
        const convertedQuantity = {
            ml: quantityInML,
            tasse: quantityInML / conversionFactors.tasse,
            soupe: quantityInML / conversionFactors.soupe,
            the: quantityInML / conversionFactors.the
        };

        // Retourne la quantité convertie pour l'unité spécifiée
        return convertedQuantity;
    }
});
