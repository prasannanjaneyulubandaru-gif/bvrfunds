// =========================================================
// STRATEGIES PAGE FUNCTIONALITY
// Add this code to your app.js file
// =========================================================

/**
 * Setup event listeners for strategies page
 * Call this from your main setup function
 */
function setupStrategiesListeners() {
    document.getElementById('executeBullishBtn')?.addEventListener('click', executeBullishStrategy);
    document.getElementById('executeBearishBtn')?.addEventListener('click', executeBearishStrategy);
}

/**
 * Execute Bullish Future Spread Strategy
 */
async function executeBullishStrategy() {
    const button = document.getElementById('executeBullishBtn');
    const loading = document.getElementById('bullishLoading');
    const results = document.getElementById('bullishResults');
    
    const lowerPremium = parseFloat(document.getElementById('lowerPremium').value);
    const upperPremium = parseFloat(document.getElementById('upperPremium').value);
    
    // Validation
    if (lowerPremium >= upperPremium) {
        alert('Lower premium must be less than upper premium');
        return;
    }
    
    // Show loading
    button.classList.add('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/bullish-future-spread`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({
                lower_premium: lowerPremium,
                upper_premium: upperPremium
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayBullishResults(data);
            
            // Log to console for debugging
            console.log('=== BULLISH FUTURE SPREAD ===');
            console.log('Future:', data.future);
            console.log('Hedge:', data.hedge);
            console.log('============================');
        } else {
            throw new Error(data.error || 'Failed to execute strategy');
        }
        
    } catch (error) {
        console.error('Strategy error:', error);
        alert('Error executing strategy: ' + error.message);
    } finally {
        button.classList.remove('hidden');
        loading.classList.add('hidden');
    }
}

/**
 * Execute Bearish Future Spread Strategy
 */
async function executeBearishStrategy() {
    const button = document.getElementById('executeBearishBtn');
    const loading = document.getElementById('bearishLoading');
    const results = document.getElementById('bearishResults');
    
    const lowerPremium = parseFloat(document.getElementById('lowerPremium').value);
    const upperPremium = parseFloat(document.getElementById('upperPremium').value);
    
    // Validation
    if (lowerPremium >= upperPremium) {
        alert('Lower premium must be less than upper premium');
        return;
    }
    
    // Show loading
    button.classList.add('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/bearish-future-spread`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({
                lower_premium: lowerPremium,
                upper_premium: upperPremium
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayBearishResults(data);
            
            // Log to console for debugging
            console.log('=== BEARISH FUTURE SPREAD ===');
            console.log('Future:', data.future);
            console.log('Hedge:', data.hedge);
            console.log('=============================');
        } else {
            throw new Error(data.error || 'Failed to execute strategy');
        }
        
    } catch (error) {
        console.error('Strategy error:', error);
        alert('Error executing strategy: ' + error.message);
    } finally {
        button.classList.remove('hidden');
        loading.classList.add('hidden');
    }
}

/**
 * Display Bullish Strategy Results
 */
function displayBullishResults(data) {
    const results = document.getElementById('bullishResults');
    
    // Update Future details
    if (data.future) {
        document.getElementById('bullishFutureSymbol').textContent = data.future.symbol;
        document.getElementById('bullishFutureToken').textContent = data.future.token;
        document.getElementById('bullishFuturePrice').textContent = data.future.last_price ? 
            data.future.last_price.toFixed(2) : '-';
    }
    
    // Update Hedge details
    if (data.hedge) {
        document.getElementById('bullishHedgeSymbol').textContent = data.hedge.symbol;
        document.getElementById('bullishHedgeToken').textContent = data.hedge.token;
        document.getElementById('bullishHedgePrice').textContent = data.hedge.last_price ? 
            data.hedge.last_price.toFixed(2) : '-';
    }
    
    // Show results
    results.classList.remove('hidden');
    
    // Add animation
    results.style.animation = 'fadeIn 0.5s ease-out';
}

/**
 * Display Bearish Strategy Results
 */
function displayBearishResults(data) {
    const results = document.getElementById('bearishResults');
    
    // Update Future details
    if (data.future) {
        document.getElementById('bearishFutureSymbol').textContent = data.future.symbol;
        document.getElementById('bearishFutureToken').textContent = data.future.token;
        document.getElementById('bearishFuturePrice').textContent = data.future.last_price ? 
            data.future.last_price.toFixed(2) : '-';
    }
    
    // Update Hedge details
    if (data.hedge) {
        document.getElementById('bearishHedgeSymbol').textContent = data.hedge.symbol;
        document.getElementById('bearishHedgeToken').textContent = data.hedge.token;
        document.getElementById('bearishHedgePrice').textContent = data.hedge.last_price ? 
            data.hedge.last_price.toFixed(2) : '-';
    }
    
    // Show results
    results.classList.remove('hidden');
    
    // Add animation
    results.style.animation = 'fadeIn 0.5s ease-out';
}

// =========================================================
// IMPORTANT: Call this in your setupEventListeners() function
// Add this line:
// setupStrategiesListeners();
// =========================================================
