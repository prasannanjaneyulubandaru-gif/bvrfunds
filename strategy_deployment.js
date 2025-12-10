// =========================================================
// STRATEGY DEPLOYMENT WITH ORDER PANELS
// Add this to strategies_frontend.js or create new file
// =========================================================

// Store selected strategy data
let selectedStrategyData = {
    bullish: null,
    bearish: null
};

/**
 * Update executeBullishStrategy to show Deploy button after finding instruments
 */
async function executeBullishStrategy() {
    const button = document.getElementById('executeBullishBtn');
    const deployBtn = document.getElementById('deployBullishBtn');
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
    if (deployBtn) deployBtn.classList.add('hidden');
    
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
            // Store strategy data
            selectedStrategyData.bullish = data;
            
            displayBullishResults(data);
            
            // Show Deploy button
            if (deployBtn) {
                deployBtn.classList.remove('hidden');
            }
            
            // Log to console
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
 * Update executeBearishStrategy similarly
 */
async function executeBearishStrategy() {
    const button = document.getElementById('executeBearishBtn');
    const deployBtn = document.getElementById('deployBearishBtn');
    const loading = document.getElementById('bearishLoading');
    const results = document.getElementById('bearishResults');
    
    const lowerPremium = parseFloat(document.getElementById('lowerPremium').value);
    const upperPremium = parseFloat(document.getElementById('upperPremium').value);
    
    if (lowerPremium >= upperPremium) {
        alert('Lower premium must be less than upper premium');
        return;
    }
    
    button.classList.add('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    if (deployBtn) deployBtn.classList.add('hidden');
    
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
            selectedStrategyData.bearish = data;
            displayBearishResults(data);
            
            if (deployBtn) {
                deployBtn.classList.remove('hidden');
            }
            
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
 * Open deployment modal for Bullish strategy
 */
function openBullishDeployment() {
    const data = selectedStrategyData.bullish;
    if (!data || !data.future || !data.hedge) {
        alert('Please find instruments first');
        return;
    }
    
    // Create and show deployment modal
    showDeploymentModal('bullish', data);
}

/**
 * Open deployment modal for Bearish strategy
 */
function openBearishDeployment() {
    const data = selectedStrategyData.bearish;
    if (!data || !data.future || !data.hedge) {
        alert('Please find instruments first');
        return;
    }
    
    showDeploymentModal('bearish', data);
}

/**
 * Show deployment modal with order panels
 */
function showDeploymentModal(strategyType, data) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'deploymentModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.style.animation = 'fadeIn 0.3s ease-out';
    
    // Determine transaction types
    const futureTransactionType = strategyType === 'bullish' ? 'BUY' : 'SELL';
    const hedgeTransactionType = 'BUY'; // Always BUY for hedges
    
    const strategyTitle = strategyType === 'bullish' ? 'Bullish Future Spread' : 'Bearish Future Spread';
    const strategyColor = strategyType === 'bullish' ? 'green' : 'red';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="bg-gradient-to-r from-${strategyColor}-50 to-${strategyColor}-100 p-6 border-b-2 border-gray-200 sticky top-0 z-10">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-900">🚀 Deploy ${strategyTitle}</h2>
                    <button onclick="closeDeploymentModal()" class="text-gray-600 hover:text-gray-900 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Order Panels -->
            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- Future Order Panel -->
                    <div class="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                        <h3 class="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                            Future Order
                        </h3>
                        
                        <!-- Symbol -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Symbol</label>
                            <div class="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 font-mono text-sm">
                                ${data.future.symbol}
                            </div>
                        </div>
                        
                        <!-- Transaction Type (Fixed) -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Transaction Type</label>
                            <div class="bg-${futureTransactionType === 'BUY' ? 'green' : 'red'}-100 border-2 border-${futureTransactionType === 'BUY' ? 'green' : 'red'}-300 rounded-lg px-3 py-2 font-bold text-${futureTransactionType === 'BUY' ? 'green' : 'red'}-700">
                                ${futureTransactionType}
                            </div>
                        </div>
                        
                        <!-- Lots -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Lots</label>
                            <input type="number" id="futureLots" value="1" min="1" 
                                   class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
                            <p class="text-xs text-gray-500 mt-1">Lot size will be auto-calculated</p>
                        </div>
                        
                        <!-- Order Type -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Order Type</label>
                            <select id="futureOrderType" class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
                                <option value="MARKET">MARKET</option>
                                <option value="LIMIT">LIMIT</option>
                                <option value="SL">SL</option>
                                <option value="SL-M">SL-M</option>
                            </select>
                        </div>
                        
                        <!-- Price Fields (conditional) -->
                        <div id="futurePriceFields" class="hidden">
                            <div id="futureLimitPriceField" class="mb-3 hidden">
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                                <input type="number" id="futurePrice" step="0.05" placeholder="0.00"
                                       class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
                            </div>
                            <div id="futureTriggerPriceField" class="mb-3 hidden">
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Trigger Price</label>
                                <input type="number" id="futureTriggerPrice" step="0.05" placeholder="0.00"
                                       class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
                            </div>
                        </div>
                        
                        <!-- Product -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Product</label>
                            <select id="futureProduct" class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500">
                                <option value="MIS">MIS</option>
                                <option value="NRML">NRML</option>
                                <option value="CNC">CNC</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Hedge Order Panel -->
                    <div class="border-2 border-${strategyColor}-200 rounded-xl p-4 bg-${strategyColor}-50">
                        <h3 class="text-lg font-bold text-${strategyColor}-900 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            Hedge Order (${strategyType === 'bullish' ? 'PUT' : 'CALL'})
                        </h3>
                        
                        <!-- Symbol -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Symbol</label>
                            <div class="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 font-mono text-sm">
                                ${data.hedge.symbol}
                            </div>
                        </div>
                        
                        <!-- Transaction Type (Always BUY) -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Transaction Type</label>
                            <div class="bg-green-100 border-2 border-green-300 rounded-lg px-3 py-2 font-bold text-green-700">
                                BUY
                            </div>
                        </div>
                        
                        <!-- Lots -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Lots</label>
                            <input type="number" id="hedgeLots" value="1" min="1" 
                                   class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-${strategyColor}-500">
                            <p class="text-xs text-gray-500 mt-1">Lot size will be auto-calculated</p>
                        </div>
                        
                        <!-- Order Type -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Order Type</label>
                            <select id="hedgeOrderType" class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-${strategyColor}-500">
                                <option value="MARKET">MARKET</option>
                                <option value="LIMIT">LIMIT</option>
                                <option value="SL">SL</option>
                                <option value="SL-M">SL-M</option>
                            </select>
                        </div>
                        
                        <!-- Price Fields (conditional) -->
                        <div id="hedgePriceFields" class="hidden">
                            <div id="hedgeLimitPriceField" class="mb-3 hidden">
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                                <input type="number" id="hedgePrice" step="0.05" placeholder="0.00"
                                       class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-${strategyColor}-500">
                            </div>
                            <div id="hedgeTriggerPriceField" class="mb-3 hidden">
                                <label class="block text-sm font-semibold text-gray-700 mb-1">Trigger Price</label>
                                <input type="number" id="hedgeTriggerPrice" step="0.05" placeholder="0.00"
                                       class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-${strategyColor}-500">
                            </div>
                        </div>
                        
                        <!-- Product -->
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Product</label>
                            <select id="hedgeProduct" class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-${strategyColor}-500">
                                <option value="MIS">MIS</option>
                                <option value="NRML">NRML</option>
                                <option value="CNC">CNC</option>
                            </select>
                        </div>
                    </div>
                    
                </div>
                
                <!-- Margin Check Result -->
                <div id="marginCheckResult" class="mt-6 hidden"></div>
                
                <!-- Action Buttons -->
                <div class="flex gap-4 mt-6">
                    <button onclick="checkStrategyMargin('${strategyType}')" class="flex-1 border-2 border-blue-500 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors">
                        💰 Check Margin
                    </button>
                    <button onclick="deployStrategy('${strategyType}')" class="flex-1 bg-${strategyColor}-600 hover:bg-${strategyColor}-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        🚀 Deploy Orders
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event listeners for order type changes
    setupOrderTypeDependencies('future');
    setupOrderTypeDependencies('hedge');
}

/**
 * Setup order type dependencies (show/hide price fields)
 */
function setupOrderTypeDependencies(prefix) {
    const orderTypeSelect = document.getElementById(`${prefix}OrderType`);
    const priceFields = document.getElementById(`${prefix}PriceFields`);
    const limitPriceField = document.getElementById(`${prefix}LimitPriceField`);
    const triggerPriceField = document.getElementById(`${prefix}TriggerPriceField`);
    
    if (!orderTypeSelect) return;
    
    orderTypeSelect.addEventListener('change', (e) => {
        const orderType = e.target.value;
        
        if (orderType === 'MARKET') {
            priceFields.classList.add('hidden');
            limitPriceField.classList.add('hidden');
            triggerPriceField.classList.add('hidden');
        } else if (orderType === 'LIMIT') {
            priceFields.classList.remove('hidden');
            limitPriceField.classList.remove('hidden');
            triggerPriceField.classList.add('hidden');
        } else if (orderType === 'SL') {
            priceFields.classList.remove('hidden');
            limitPriceField.classList.remove('hidden');
            triggerPriceField.classList.remove('hidden');
        } else if (orderType === 'SL-M') {
            priceFields.classList.remove('hidden');
            limitPriceField.classList.add('hidden');
            triggerPriceField.classList.remove('hidden');
        }
    });
}

/**
 * Close deployment modal
 */
function closeDeploymentModal() {
    const modal = document.getElementById('deploymentModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Check margin for strategy basket
 */
async function checkStrategyMargin(strategyType) {
    const data = selectedStrategyData[strategyType];
    if (!data) return;
    
    const resultDiv = document.getElementById('marginCheckResult');
    resultDiv.innerHTML = '<div class="text-center py-4"><div class="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div></div>';
    resultDiv.classList.remove('hidden');
    
    try {
        // Gather order data
        const orders = gatherOrderData(strategyType, data);
        
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/check-basket-margin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({ orders })
        });
        
        const marginData = await response.json();
        
        if (marginData.success) {
            const sufficient = marginData.sufficient;
            const color = sufficient ? 'green' : 'red';
            
            resultDiv.innerHTML = `
                <div class="p-4 bg-${color}-50 border-2 border-${color}-200 rounded-lg">
                    <h4 class="font-bold text-${color}-900 mb-2">💰 Margin Check</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Available:</span>
                            <span class="font-semibold">₹${marginData.available_balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Required:</span>
                            <span class="font-semibold">₹${marginData.total_required.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                    <div class="mt-2 font-bold text-${color}-700">
                        ${sufficient ? '✅ Sufficient funds' : '⚠️ Insufficient funds'}
                    </div>
                </div>
            `;
        } else {
            throw new Error(marginData.error);
        }
        
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p class="text-red-700">❌ Error: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Deploy strategy orders
 */
async function deployStrategy(strategyType) {
    const data = selectedStrategyData[strategyType];
    if (!data) return;
    
    if (!confirm('Are you sure you want to place these orders?')) {
        return;
    }
    
    try {
        // Gather order data
        const orders = gatherOrderData(strategyType, data);
        
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/deploy-basket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({ orders })
        });
        
        const result = await response.json();
        
        if (result.success) {
            let successCount = result.results.filter(r => r.success).length;
            let failCount = result.results.filter(r => !r.success).length;
            
            let message = `✅ Deployment Complete!\n\n`;
            message += `Success: ${successCount} orders\n`;
            if (failCount > 0) {
                message += `Failed: ${failCount} orders\n`;
            }
            message += `\nOrder Details:\n`;
            
            result.results.forEach(r => {
                if (r.success) {
                    message += `✓ ${r.symbol}: ${r.lots} lots (${r.quantity} qty) - Order ID: ${r.order_id}\n`;
                } else {
                    message += `✗ ${r.symbol}: ${r.error}\n`;
                }
            });
            
            alert(message);
            
            // Close modal
            closeDeploymentModal();
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        alert('Error deploying strategy: ' + error.message);
    }
}

/**
 * Gather order data from form
 */
function gatherOrderData(strategyType, data) {
    const futureTransactionType = strategyType === 'bullish' ? 'BUY' : 'SELL';
    
    const orders = [];
    
    // Future order
    const futureOrder = {
        exchange: 'NFO',
        tradingsymbol: data.future.symbol,
        transaction_type: futureTransactionType,
        lots: parseInt(document.getElementById('futureLots').value),
        order_type: document.getElementById('futureOrderType').value,
        product: document.getElementById('futureProduct').value,
        variety: 'regular'
    };
    
    if (futureOrder.order_type === 'LIMIT' || futureOrder.order_type === 'SL') {
        const price = parseFloat(document.getElementById('futurePrice').value);
        if (price) futureOrder.price = price;
    }
    
    if (futureOrder.order_type === 'SL' || futureOrder.order_type === 'SL-M') {
        const triggerPrice = parseFloat(document.getElementById('futureTriggerPrice').value);
        if (triggerPrice) futureOrder.trigger_price = triggerPrice;
    }
    
    orders.push(futureOrder);
    
    // Hedge order
    const hedgeOrder = {
        exchange: 'NFO',
        tradingsymbol: data.hedge.symbol,
        transaction_type: 'BUY',
        lots: parseInt(document.getElementById('hedgeLots').value),
        order_type: document.getElementById('hedgeOrderType').value,
        product: document.getElementById('hedgeProduct').value,
        variety: 'regular'
    };
    
    if (hedgeOrder.order_type === 'LIMIT' || hedgeOrder.order_type === 'SL') {
        const price = parseFloat(document.getElementById('hedgePrice').value);
        if (price) hedgeOrder.price = price;
    }
    
    if (hedgeOrder.order_type === 'SL' || hedgeOrder.order_type === 'SL-M') {
        const triggerPrice = parseFloat(document.getElementById('hedgeTriggerPrice').value);
        if (triggerPrice) hedgeOrder.trigger_price = triggerPrice;
    }
    
    orders.push(hedgeOrder);
    
    return orders;
}

// Update setup function to include deploy buttons
function setupStrategiesListeners() {
    document.getElementById('executeBullishBtn')?.addEventListener('click', executeBullishStrategy);
    document.getElementById('executeBearishBtn')?.addEventListener('click', executeBearishStrategy);
    document.getElementById('deployBullishBtn')?.addEventListener('click', openBullishDeployment);
    document.getElementById('deployBearishBtn')?.addEventListener('click', openBearishDeployment);
}

// Make functions available globally
window.closeDeploymentModal = closeDeploymentModal;
window.checkStrategyMargin = checkStrategyMargin;
window.deployStrategy = deployStrategy;
