// =========================================================
// OPTIONS SPREADS PAGE FUNCTIONALITY
// Add this to your main app.js or create separate options_spreads.js
// =========================================================

// State for options spreads
let optionsSpreadsState = {
    currentStrategy: null,  // 'bullish' or 'bearish'
    currentExpiry: 'weekly',  // 'weekly', 'next_weekly', 'monthly'
    selectedInstruments: null,
    orderBasket: []
};

/**
 * Setup event listeners for options spreads page
 * Call this from your main setupEventListeners() function
 */
function setupOptionsStreadsListeners() {
    // Expiry type buttons
    document.getElementById('weeklyExpiryBtn')?.addEventListener('click', () => setExpiryType('weekly'));
    document.getElementById('nextWeeklyExpiryBtn')?.addEventListener('click', () => setExpiryType('next_weekly'));
    document.getElementById('monthlyExpiryBtn')?.addEventListener('click', () => setExpiryType('monthly'));
    
    // Strategy execution buttons
    document.getElementById('findBullishSpreadBtn')?.addEventListener('click', () => findOptionsSpread('bullish'));
    document.getElementById('findBearishSpreadBtn')?.addEventListener('click', () => findOptionsSpread('bearish'));
    
    // Order basket actions
    document.getElementById('addToBasketBtn')?.addEventListener('click', addSpreadToBasket);
    document.getElementById('clearSpreadBasketBtn')?.addEventListener('click', clearSpreadBasket);
    document.getElementById('checkSpreadMarginBtn')?.addEventListener('click', checkSpreadMargin);
    document.getElementById('deploySpreadBtn')?.addEventListener('click', deploySpreadStrategy);
}

/**
 * Set expiry type and update UI
 */
function setExpiryType(expiryType) {
    optionsSpreadsState.currentExpiry = expiryType;
    
    // Update button states
    const buttons = ['weeklyExpiryBtn', 'nextWeeklyExpiryBtn', 'monthlyExpiryBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.remove('bg-[#FE4A03]', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700');
        }
    });
    
    // Highlight selected button
    const selectedBtn = document.getElementById(`${expiryType}ExpiryBtn`);
    if (selectedBtn) {
        selectedBtn.classList.remove('bg-white', 'text-gray-700');
        selectedBtn.classList.add('bg-[#FE4A03]', 'text-white');
    }
    
    // Clear previous results
    document.getElementById('spreadResults').classList.add('hidden');
    
    // Log selection
    console.log(`Expiry type set to: ${expiryType}`);
}

/**
 * Find options spread instruments
 */
async function findOptionsSpread(strategyType) {
    optionsSpreadsState.currentStrategy = strategyType;
    
    const loadingId = strategyType === 'bullish' ? 'bullishSpreadLoading' : 'bearishSpreadLoading';
    const buttonId = strategyType === 'bullish' ? 'findBullishSpreadBtn' : 'findBearishSpreadBtn';
    
    const loading = document.getElementById(loadingId);
    const button = document.getElementById(buttonId);
    const results = document.getElementById('spreadResults');
    
    // Get hedge premium percentage
    const hedgePremiumPercent = parseFloat(document.getElementById('hedgePremiumPercent').value);
    
    // Validation
    if (hedgePremiumPercent < 20 || hedgePremiumPercent > 40) {
        alert('Hedge premium percentage should be between 20% and 40%');
        return;
    }
    
    // Show loading
    if (button) button.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    results.classList.add('hidden');
    
    try {
        const endpoint = strategyType === 'bullish' 
            ? '/api/strategy/bullish-options-spread'
            : '/api/strategy/bearish-options-spread';
        
        const response = await fetch(`${CONFIG.backendUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({
                expiry_type: optionsSpreadsState.currentExpiry,
                hedge_premium_percent: hedgePremiumPercent
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            optionsSpreadsState.selectedInstruments = data;
            displaySpreadResults(data, strategyType);
            
            // Log to console
            console.log(`=== ${data.strategy.toUpperCase()} ===`);
            console.log('Sell Leg:', data.sell_leg);
            console.log('Buy Leg:', data.buy_leg);
            console.log('Expiry Type:', data.expiry_type);
            console.log('================================');
        } else {
            throw new Error(data.error || 'Failed to find spread');
        }
        
    } catch (error) {
        console.error('Strategy error:', error);
        alert('Error finding spread: ' + error.message);
    } finally {
        if (button) button.classList.remove('hidden');
        if (loading) loading.classList.add('hidden');
    }
}

/**
 * Display spread results in UI
 */
function displaySpreadResults(data, strategyType) {
    const results = document.getElementById('spreadResults');
    const sellLeg = data.sell_leg;
    const buyLeg = data.buy_leg;
    
    // Update strategy type display
    document.getElementById('selectedStrategyType').textContent = data.strategy;
    document.getElementById('selectedExpiryType').textContent = formatExpiryType(data.expiry_type);
    
    // Calculate spread details
    const netCredit = sellLeg && buyLeg 
        ? (sellLeg.last_price - buyLeg.last_price).toFixed(2)
        : '0.00';
    
    const maxProfit = netCredit;
    const maxLoss = sellLeg && buyLeg 
        ? (Math.abs(sellLeg.strike - buyLeg.strike) - parseFloat(netCredit)).toFixed(2)
        : '0.00';
    
    // Update Sell Leg details
    if (sellLeg) {
        document.getElementById('sellSymbol').textContent = sellLeg.symbol;
        document.getElementById('sellStrike').textContent = sellLeg.strike.toFixed(0);
        document.getElementById('sellExpiry').textContent = sellLeg.expiry;
        document.getElementById('sellPremium').textContent = sellLeg.last_price 
            ? `₹${sellLeg.last_price.toFixed(2)}`
            : '-';
        document.getElementById('sellAction').textContent = sellLeg.action;
        document.getElementById('sellOptionType').textContent = sellLeg.option_type;
    }
    
    // Update Buy Leg details
    if (buyLeg) {
        document.getElementById('buySymbol').textContent = buyLeg.symbol;
        document.getElementById('buyStrike').textContent = buyLeg.strike.toFixed(0);
        document.getElementById('buyExpiry').textContent = buyLeg.expiry;
        document.getElementById('buyPremium').textContent = buyLeg.last_price 
            ? `₹${buyLeg.last_price.toFixed(2)}`
            : '-';
        document.getElementById('buyAction').textContent = buyLeg.action;
        document.getElementById('buyOptionType').textContent = buyLeg.option_type;
    }
    
    // Update spread analysis
    document.getElementById('netCredit').textContent = `₹${netCredit}`;
    document.getElementById('maxProfit').textContent = `₹${maxProfit}`;
    document.getElementById('maxLoss').textContent = `₹${maxLoss}`;
    
    // Calculate risk-reward ratio
    const riskRewardRatio = parseFloat(maxLoss) > 0 
        ? (parseFloat(maxProfit) / parseFloat(maxLoss)).toFixed(2)
        : '0.00';
    document.getElementById('riskRewardRatio').textContent = `1:${riskRewardRatio}`;
    
    // Show results
    results.classList.remove('hidden');
    results.style.animation = 'fadeIn 0.5s ease-out';
}

/**
 * Format expiry type for display
 */
function formatExpiryType(expiryType) {
    const map = {
        'weekly': 'Current Week',
        'next_weekly': 'Next Week',
        'monthly': 'Monthly Expiry'
    };
    return map[expiryType] || expiryType;
}

/**
 * Add spread to order basket
 */
async function addSpreadToBasket() {
    if (!optionsSpreadsState.selectedInstruments) {
        alert('Please find instruments first');
        return;
    }
    
    const lots = parseInt(document.getElementById('spreadLots').value);
    
    if (!lots || lots < 1) {
        alert('Please enter valid number of lots');
        return;
    }
    
    const sellLeg = optionsSpreadsState.selectedInstruments.sell_leg;
    const buyLeg = optionsSpreadsState.selectedInstruments.buy_leg;
    
    // Get lot sizes for both instruments
    try {
        // Fetch lot size for sell leg
        const sellLotResponse = await fetch(`${CONFIG.backendUrl}/api/get-lot-size`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({
                exchange: 'NFO',
                tradingsymbol: sellLeg.symbol
            })
        });
        
        const sellLotData = await sellLotResponse.json();
        const sellLotSize = sellLotData.success ? sellLotData.lot_size : 50; // Default to 50 for NIFTY
        
        // Fetch lot size for buy leg
        const buyLotResponse = await fetch(`${CONFIG.backendUrl}/api/get-lot-size`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({
                exchange: 'NFO',
                tradingsymbol: buyLeg.symbol
            })
        });
        
        const buyLotData = await buyLotResponse.json();
        const buyLotSize = buyLotData.success ? buyLotData.lot_size : 50;
        
        // Create sell order
        const sellOrder = {
            tradingsymbol: sellLeg.symbol,
            exchange: 'NFO',
            transaction_type: 'SELL',
            lots: lots,
            lot_size: sellLotSize,
            quantity: lots * sellLotSize,
            product: 'NRML',
            order_type: 'MARKET',
            variety: 'regular',
            strike: sellLeg.strike,
            option_type: sellLeg.option_type,
            price: sellLeg.last_price
        };
        
        // Create buy order
        const buyOrder = {
            tradingsymbol: buyLeg.symbol,
            exchange: 'NFO',
            transaction_type: 'BUY',
            lots: lots,
            lot_size: buyLotSize,
            quantity: lots * buyLotSize,
            product: 'NRML',
            order_type: 'MARKET',
            variety: 'regular',
            strike: buyLeg.strike,
            option_type: buyLeg.option_type,
            price: buyLeg.last_price
        };
        
        // Add both orders to basket
        optionsSpreadsState.orderBasket.push(sellOrder);
        optionsSpreadsState.orderBasket.push(buyOrder);
        
        // Display basket
        displaySpreadBasket();
        
        // Show success message
        const statusDiv = document.getElementById('spreadDeployStatus');
        statusDiv.innerHTML = `
            <div class="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="font-bold text-green-800 mb-2">✅ Spread Added to Basket</div>
                <div class="text-sm text-green-700">
                    ${lots} lot(s) of ${sellLeg.symbol} (SELL) and ${buyLeg.symbol} (BUY) added
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error adding to basket:', error);
        alert('Error adding to basket: ' + error.message);
    }
}

/**
 * Display order basket
 */
function displaySpreadBasket() {
    const basketDiv = document.getElementById('spreadOrderBasket');
    
    if (optionsSpreadsState.orderBasket.length === 0) {
        basketDiv.innerHTML = '<div class="text-center text-gray-500 py-8">No orders in basket</div>';
        return;
    }
    
    basketDiv.innerHTML = '';
    
    // Group orders by spread (every 2 orders form a spread)
    for (let i = 0; i < optionsSpreadsState.orderBasket.length; i += 2) {
        const sellOrder = optionsSpreadsState.orderBasket[i];
        const buyOrder = optionsSpreadsState.orderBasket[i + 1];
        
        if (!buyOrder) break; // Incomplete spread
        
        const spreadDiv = document.createElement('div');
        spreadDiv.className = 'border-2 border-gray-200 rounded-lg p-4 mb-3 bg-white';
        
        const netCredit = ((sellOrder.price || 0) - (buyOrder.price || 0)) * sellOrder.quantity;
        
        spreadDiv.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="font-bold text-gray-900">
                    ${sellOrder.option_type === 'PE' ? 'Bullish' : 'Bearish'} Spread - ${sellOrder.lots} Lot(s)
                </div>
                <button onclick="removeSpreadFromBasket(${i})" class="text-red-600 hover:text-red-700 font-semibold text-sm">
                    Remove
                </button>
            </div>
            
            <!-- Sell Leg -->
            <div class="mb-2 p-3 bg-red-50 rounded-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="badge badge-sell">SELL</span>
                        <span class="font-semibold mono text-sm">${sellOrder.tradingsymbol}</span>
                        <span class="badge badge-info">${sellOrder.strike}</span>
                        <span class="badge badge-info">${sellOrder.option_type}</span>
                    </div>
                    <div class="text-sm">
                        <span class="text-gray-600">${sellOrder.quantity} qty @</span>
                        <span class="font-semibold">₹${(sellOrder.price || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Buy Leg -->
            <div class="p-3 bg-green-50 rounded-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="badge badge-buy">BUY</span>
                        <span class="font-semibold mono text-sm">${buyOrder.tradingsymbol}</span>
                        <span class="badge badge-info">${buyOrder.strike}</span>
                        <span class="badge badge-info">${buyOrder.option_type}</span>
                    </div>
                    <div class="text-sm">
                        <span class="text-gray-600">${buyOrder.quantity} qty @</span>
                        <span class="font-semibold">₹${(buyOrder.price || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Net Credit -->
            <div class="mt-3 pt-3 border-t-2 border-gray-200">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-gray-700">Net Credit:</span>
                    <span class="text-lg font-bold ${netCredit >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${netCredit >= 0 ? '+' : ''}₹${netCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        `;
        
        basketDiv.appendChild(spreadDiv);
    }
}

/**
 * Remove spread from basket
 */
function removeSpreadFromBasket(index) {
    // Remove both orders (sell and buy)
    optionsSpreadsState.orderBasket.splice(index, 2);
    displaySpreadBasket();
    
    // Clear status if basket is empty
    if (optionsSpreadsState.orderBasket.length === 0) {
        document.getElementById('spreadDeployStatus').innerHTML = '';
    }
}

/**
 * Clear entire basket
 */
function clearSpreadBasket() {
    if (optionsSpreadsState.orderBasket.length === 0) return;
    
    if (confirm('Clear all orders from basket?')) {
        optionsSpreadsState.orderBasket = [];
        displaySpreadBasket();
        document.getElementById('spreadDeployStatus').innerHTML = '';
        document.getElementById('spreadMarginInfo').innerHTML = '';
    }
}

/**
 * Check margin requirement for basket
 */
async function checkSpreadMargin() {
    if (optionsSpreadsState.orderBasket.length === 0) {
        alert('No orders in basket');
        return;
    }
    
    const statusDiv = document.getElementById('spreadDeployStatus');
    statusDiv.innerHTML = '<div class="p-4 bg-blue-50 rounded-lg">📊 Checking margin requirements...</div>';
    
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/check-basket-margin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({
                orders: optionsSpreadsState.orderBasket
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const marginInfoDiv = document.getElementById('spreadMarginInfo');
            
            marginInfoDiv.innerHTML = `
                <div class="p-4 ${data.sufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg">
                    <h3 class="font-bold text-gray-900 mb-3">💰 Margin Analysis</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-700">Available Balance:</span>
                            <span class="font-bold">₹${data.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-700">Required Margin:</span>
                            <span class="font-bold">₹${data.total_required.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div class="flex justify-between pt-2 border-t-2 ${data.sufficient ? 'border-green-300' : 'border-red-300'}">
                            <span class="font-bold text-gray-900">Status:</span>
                            <span class="font-bold text-lg ${data.sufficient ? 'text-green-600' : 'text-red-600'}">
                                ${data.sufficient ? '✅ Sufficient Funds' : '⚠️ Insufficient Funds'}
                            </span>
                        </div>
                        ${!data.sufficient ? `
                            <div class="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
                                ⚠️ You need ₹${(data.total_required - data.available_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} more to execute this strategy
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            statusDiv.innerHTML = '';
        } else {
            throw new Error(data.error || 'Failed to check margin');
        }
    } catch (error) {
        console.error('Margin check error:', error);
        statusDiv.innerHTML = `
            <div class="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div class="font-bold text-red-800">❌ Error checking margin</div>
                <div class="text-sm text-red-700 mt-1">${error.message}</div>
            </div>
        `;
    }
}

/**
 * Deploy spread strategy
 */
async function deploySpreadStrategy() {
    if (optionsSpreadsState.orderBasket.length === 0) {
        alert('No orders in basket');
        return;
    }
    
    if (!confirm('Deploy this spread strategy? This will place real orders.')) {
        return;
    }
    
    const statusDiv = document.getElementById('spreadDeployStatus');
    statusDiv.innerHTML = '<div class="p-4 bg-blue-50 rounded-lg">🚀 Deploying spread strategy...</div>';
    
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/deploy-basket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({
                orders: optionsSpreadsState.orderBasket
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayDeploymentResults(data.results);
            
            // Clear basket after successful deployment
            optionsSpreadsState.orderBasket = [];
            displaySpreadBasket();
            
            // Wait and refresh status
            setTimeout(refreshSpreadOrderStatus, 2000);
        } else {
            throw new Error(data.error || 'Failed to deploy strategy');
        }
    } catch (error) {
        console.error('Deployment error:', error);
        statusDiv.innerHTML = `
            <div class="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div class="font-bold text-red-800">❌ Deployment Failed</div>
                <div class="text-sm text-red-700 mt-1">${error.message}</div>
            </div>
        `;
    }
}

/**
 * Display deployment results
 */
function displayDeploymentResults(results) {
    const statusDiv = document.getElementById('spreadDeployStatus');
    
    let html = '<div class="space-y-2"><h3 class="font-bold text-gray-900 mb-3">📋 Deployment Results</h3>';
    
    results.forEach(result => {
        if (result.success) {
            html += `
                <div class="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="text-green-600 text-xl">✅</span>
                        <div class="flex-1">
                            <div class="font-semibold">${result.symbol}</div>
                            <div class="text-xs text-gray-600">
                                Order ID: ${result.order_id} | 
                                ${result.lots} lot(s) (${result.quantity} qty)
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="text-red-600 text-xl">❌</span>
                        <div class="flex-1">
                            <div class="font-semibold">${result.symbol}</div>
                            <div class="text-xs text-red-700">${result.error}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    statusDiv.innerHTML = html;
}

/**
 * Refresh order status
 */
async function refreshSpreadOrderStatus() {
    // This would call the same refresh logic as the main order page
    // You can reuse the refreshOrderStatus function or create a specific one
    console.log('Refreshing spread order status...');
}

// Make functions available globally
window.removeSpreadFromBasket = removeSpreadFromBasket;
window.setExpiryType = setExpiryType;
window.findOptionsSpread = findOptionsSpread;

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupOptionsStreadsListeners,
        findOptionsSpread,
        setExpiryType
    };
}
