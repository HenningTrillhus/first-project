const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const ingredients = [];
const grocerieList = [];

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Endpoint to add ingredients to the list
app.post('/api/ingredients', (req, res) => {
    // Validate and sanitize input, trimming it down removing unwanted spaces
    const name = req.body.name ? String(req.body.name).trim() : '';

    // Parse quantity as a float from the request body and handle NaN case properly
    let quantity = parseFloat(req.body.quantity);

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

// Endpoint to delete a single ingredient by name (expects JSON { name })
app.delete('/api/ingredients', (req, res) => {
  const name = req.body && req.body.name ? String(req.body.name).trim() : '';
  if (!name) {
    return res.status(400).json({ ok: false, error: 'Name is required' });
  }
  const idx = ingredients.findIndex(ing => ing.name === name);
  if (idx !== -1) {
    ingredients.splice(idx, 1);
    console.log('deleted ingredient', name);
  } else {
    console.log('ingredient not found', name);
  }
  res.json({ ok: true, ingredients });
});

// Endpoint to replace entire ingredients list (expects JSON { ingredients: [...] })
app.put('/api/ingredients', (req, res) => {
  const newIngredients = Array.isArray(req.body.ingredients) ? req.body.ingredients.map(i => ({
    name: String(i.name || '').trim(),
    quantity: parseFloat(i.quantity) || 0,
    massurment: i.massurment || 'stk'
  })).filter(i => i.name && i.quantity > 0) : null;

  if (newIngredients === null) {
    return res.status(400).json({ ok: false, error: 'Invalid ingredients array' });
  }

  // Replace the in-memory list
  ingredients.length = 0;
  ingredients.push(...newIngredients);
  console.log('ingredients replaced with', ingredients);
  res.json({ ok: true, ingredients });
});



//---------------------------------------------------------
// Endpoint to add ingredients to the list
app.post('/api/grocerieList', (req, res) => {
    // Validate and sanitize input, trimming it down removing unwanted spaces
    const name = req.body.name ? String(req.body.name).trim() : '';

    // Parse quantity as a float from the request body and handle NaN case properly
    let quantity = parseFloat(req.body.quantity);

    // If quantity is NaN, set it to 0 instead of sending an error response
    if (Number.isNaN(quantity)) quantity = 0;

    // Handle massurment, defaulting to an "Stk" string if not provided
    const massurment = req.body.massurment || 'stk';

    const completed = !!req.body.completed;
    const category = String(req.body.category || 'Annet').trim();
    const importance = req.body.importance;

    // Create ingredient object to store in the list of ingredients
    const groscerie = { name, quantity, massurment, completed, category, importance };

    // Check if ingredient with the same name already exists in the list
    if (grocerieList.some(ing => ing.name === groscerie.name)) {
        console.log('same name found', groscerie.name);
        // If it exists, update the quantity of the existing ingredient
        grocerieList.forEach((ing) => {
            // Update quantity if names match
            if (ing.name === groscerie.name) {
                ing.quantity += groscerie.quantity;
                // Update category if provided
                if (category) ing.category = category;
                // If quantity becomes zero or negative, remove the ingredient from the list
                if (ing.quantity <= 0) {
                    const idx = grocerieList.indexOf(ing);
                    if (idx !== -1) {
                        grocerieList.splice(idx, 1);
                        console.log('removed ingredient', ing.name, 'because quantity <= 0');
                        return; // exit this forEach callback early
                    }
                }
                console.log('updated quantity for', ing.name, 'to', ing.quantity);
            }
        });
    } else {
        // If it doesn't exist and quantity is positive, add the new ingredient to the list
        if (groscerie.quantity > 0) {
            console.log('new groscerie added', groscerie.name);
            grocerieList.push(groscerie);
        } else {
            console.log('not adding', groscerie.name, 'because quantity is <= 0');
        }
    }

    // Respond with the current full ingredients list
    console.log(grocerieList);
    res.json({ ok: true, grocerieList: grocerieList });
});

// Endpoint to get the full list of grocerieList
app.get('/api/grocerieList', (req, res) => {
  res.json({ ok: true, grocerieList });
});

// Endpoint to delete a single grocerie by name (expects JSON { name })
app.delete('/api/grocerieList', (req, res) => {
  const name = req.body && req.body.name ? String(req.body.name).trim() : '';
  if (!name) {
    return res.status(400).json({ ok: false, error: 'Name is required' });
  }
  const idx = grocerieList.findIndex(g => g.name === name);
  if (idx !== -1) {
    grocerieList.splice(idx, 1);
    console.log('deleted grocerie', name);
  } else {
    console.log('grocerie not found', name);
  }
  res.json({ ok: true, grocerieList });
});

// Endpoint to update properties of a single grocerie (expects JSON { name, completed })
app.patch('/api/grocerieList', (req, res) => {
  const name = req.body && req.body.name ? String(req.body.name).trim() : '';
  if (!name) {
    return res.status(400).json({ ok: false, error: 'Name is required' });
  }
  // ensure boolean
  const completed = !!req.body.completed;

  const grocerie = grocerieList.find(g => g.name === name);
  if (!grocerie) {
    return res.status(404).json({ ok: false, error: 'Grocerie not found' });
  }
  grocerie.completed = completed;
  console.log(`updated completed for ${name} =>`, completed);
  res.json({ ok: true, grocerieList });
});