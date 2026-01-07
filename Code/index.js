const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const ingredients = [];

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

setInterval(() => {
  //console.log('Backend heartbeat:', new Date().toISOString());
}, 10000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Endpoint to add ingredients to the list
app.post('/api/ingredients', (req, res) => {
    // Validate and sanitize input, trimming it down removing unwanted spaces
    const name = req.body.name ? String(req.body.name).trim() : '';

    // Parse quantity as an integer from the request body and handle NaN case properly
    let quantity = parseInt(req.body.quantity, 10);

    // If quantity is NaN, set it to 0 instead of sending an error response
    if (Number.isNaN(quantity)) quantity = 0;

    // Handle massurment, defaulting to an "Stk" string if not provided
    const massurment = req.body.massurment || 'stk';

    // Create ingredient object to store in the list of ingredients
    const ingredient = { name, quantity, massurment };

    // Check if ingredient with the same name already exists in the list
    if (ingredients.some(ing => ing.name === ingredient.name)) {
        console.log('same name found', ingredient.name);
        // If it exists, update the quantity of the existing ingredient
        ingredients.forEach((ing) => {
            // Update quantity if names match
            if (ing.name === ingredient.name) {
                ing.quantity += ingredient.quantity;
                // If quantity becomes zero or negative, remove the ingredient from the list
                if (ing.quantity <= 0) {
                    const idx = ingredients.indexOf(ing);
                    if (idx !== -1) {
                        ingredients.splice(idx, 1);
                        console.log('removed ingredient', ing.name, 'because quantity <= 0');
                        return; // exit this forEach callback early
                    }
                }
                console.log('updated quantity for', ing.name, 'to', ing.quantity);
            }
        });
    } else {
        // If it doesn't exist and quantity is positive, add the new ingredient to the list
        if (ingredient.quantity > 0) {
            console.log('new ingredient added', ingredient.name);
            ingredients.push(ingredient);
        } else {
            console.log('not adding', ingredient.name, 'because quantity is <= 0');
        }
    }

    // Respond with the current full ingredients list
    console.log(ingredients)
    res.json({ ok: true, ingredients });
});

// Endpoint to get the full list of ingredients
app.get('/api/ingredients', (req, res) => {
  res.json({ ok: true, ingredients });
});