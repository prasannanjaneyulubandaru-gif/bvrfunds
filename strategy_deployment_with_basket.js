// =========================================================
// ENHANCED STRATEGY DEPLOYMENT WITH ORDER STATUS TRACKING
// Ultra-compact version - 40% smaller deployment modal
// =========================================================

// Store selected strategy data
let selectedStrategyData = {
    bullish: null,
    bearish: null
};

// Store basket orders
let strategyBasket = [];

// Store deployed order IDs for status tracking
let deployedOrderIds = [];

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
    
    if (lowerPremium >= upperPremium) {
        alert('Lower premium must be less than upper premium');
        return;
    }
    
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
            selectedStrategyData.bullish = data;
            displayBullishResults(data);
            
            if (deployBtn) {
                deployBtn.classList.remove('hidden');
            }
            
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
    
    // Clear basket when opening new deployment
    strategyBasket = [];
    deployedOrderIds = [];
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
    
    strategyBasket = [];
    deployedOrderIds = [];
    showDeploymentModal('bearish', data);
}

/**
 * Show ULTRA-COMPACT deployment modal (40% smaller)
 */
function showDeploymentModal(strategyType, data) {
    const modal = document.createElement('div');
    modal.id = 'deploymentModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.style.animation = 'fadeIn 0.3s ease-out';
    
    const futureTransactionType = strategyType === 'bullish' ? 'BUY' : 'SELL';
    const hedgeTransactionType = 'BUY';
    
    const strategyTitle = strategyType === 'bullish' ? 'Bullish Future Spread' : 'Bearish Future Spread';
    const strategyColor = strategyType === 'bullish' ? 'green' : 'red';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <!-- Ultra-Compact Header -->
            <div class="bg-gradient-to-r from-${strategyColor}-50 to-${strategyColor}-100 p-3 border-b border-gray-200 sticky top-0 z-10">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-bold text-gray-900">🚀 ${strategyTitle}</h2>
                    <button onclick="closeDeploymentModal()" class="text-gray-600 hover:text-gray-900 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="p-4">
                <!-- Ultra-Compact Order Panels -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                    
                    <!-- Future Order Panel - ULTRA COMPACT -->
                    <div class="border border-blue-200 rounded-lg p-2 bg-blue-50">
                        <h3 class="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                            Future
                        </h3>
                        
                        <div class="space-y-2">
                            <div class="bg-white rounded px-2 py-1 font-mono text-xs">${data.future.symbol}</div>
                            
                            <div class="bg-${futureTransactionType === 'BUY' ? 'green' : 'red'}-100 rounded px-2 py-1 text-xs font-bold text-${futureTransactionType === 'BUY' ? 'green' : 'red'}-700">
                                ${futureTransactionType}
                            </div>
                            
                            <input type="number" id="futureLots" value="1" min="1" 
                                   class="w-full px-2 py-1 border border-gray-300 rounded text-xs" placeholder="Lots">
                            
                            <select id="futureOrderType" class="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                                <option value="MARKET">MARKET</option>
                                <option value="LIMIT">LIMIT</option>
                                <option value="SL">SL</option>
                                <option value="SL-M">SL-M</option>
                            </select>
                            
                            <div id="futurePriceFields" class="hidden space-y-1">
                                <input type="number" id="futurePrice" step="0.05" placeholder="Price"
                                       class="w-full px-2 py-1 border border-gray-300 rounded text-xs hidden" id="futureLimitPriceField">
                                <input type="number" id="futureTriggerPrice" step="0.05" placeholder="Trigger"
                                       class="w-full px-2 py-1 border border-gray-300 rounded text-xs hidden" id="futureTriggerPriceField">
                            </div>
                            
                            <select id="futureProduct" class="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                                <option value="MIS">MIS</option>
                                <option value="NRML">NRML</option>
                                <option value="CNC">CNC</option>
                            </select>
                            
                            <button onclick="addFutureToBasket('${strategyType}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 rounded text-xs">
                                + Add
                            </button>
                        </div>
                    </div>
                    
                    <!-- Hedge Order Panel - ULTRA COMPACT -->
                    <div class="border border-${strategyColor}-200 rounded-lg p-2 bg-${strategyColor}-50">
                        <h3 class="text-xs font-bold text-${strategyColor}-900 mb-2 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            ${strategyType === 'bullish' ? 'PUT' : 'CALL'} Hedge
                        </h3>
                        
                        <div class="space-y-2">
                            <div class="bg-white rounded px-2 py-1 font-mono text-xs">${data.hedge.symbol}</div>
                            
                            <div class="bg-green-100 rounded px-2 py-1 text-xs font-bold text-green-700">BUY</div>
                            
                            <input type="number" id="hedgeLots" value="1" min="1" 
                                   class="w-full px-2 py-1 border border-gray-300 rounded text-xs" placeholder="Lots">
                            
                            <select id="hedgeOrderType" class="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                                <option value="MARKET">MARKET</option>
                                <option value="LIMIT">LIMIT</option>
                                <option value="SL">SL</option>
                                <option value="SL-M">SL-M</option>
                            </select>
                            
                            <div id="hedgePriceFields" class="hidden space-y-1">
                                <input type="number" id="hedgePrice" step="0.05" placeholder="Price"
                                       class="w-full px-2 py-1 border border-gray-300 rounded text-xs hidden" id="hedgeLimitPriceField">
                                <input type="number" id="hedgeTriggerPrice" step="0.05" placeholder="Trigger"
                                       class="w-full px-2 py-1 border border-gray-300 rounded text-xs hidden" id="hedgeTriggerPriceField">
                            </div>
                            
                            <select id="hedgeProduct" class="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                                <option value="MIS">MIS</option>
                                <option value="NRML">NRML</option>
                                <option value="CNC">CNC</option>
                            </select>
                            
                            <button onclick="addHedgeToBasket('${strategyType}')" class="w-full bg-${strategyColor}-600 hover:bg-${strategyColor}-700 text-white font-semibold py-1 rounded text-xs">
                                + Add
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Ultra-Compact Basket Display -->
                <div id="orderBasketDisplay" class="mb-3 hidden">
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-2">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-xs font-bold text-orange-900 flex items-center gap-1">
                                📦 Basket <span id="basketCount" class="bg-orange-500 text-white text-xs px-1.5 rounded-full ml-1">0</span>
                            </h3>
                            <button onclick="clearBasket()" class="text-red-600 hover:text-red-700 text-xs font-semibold">Clear</button>
                        </div>
                        <div id="basketItems" class="space-y-1.5"></div>
                    </div>
                </div>
                
                <!-- Margin Check Result - ULTRA COMPACT -->
                <div id="marginCheckResult" class="mb-3 hidden"></div>
                
                <!-- Ultra-Compact Action Buttons -->
                <div class="flex gap-2">
                    <button onclick="checkBasketMargin()" class="flex-1 border border-blue-500 text-blue-600 font-semibold py-2 rounded text-xs hover:bg-blue-50">
                        💰 Check Margin
                    </button>
                    <button onclick="deployBasket()" class="flex-1 bg-${strategyColor}-600 hover:bg-${strategyColor}-700 text-white font-semibold py-2 rounded text-xs">
                        ⚡ Deploy
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setupOrderTypeDependencies('future');
    setupOrderTypeDependencies('hedge');
}

/**
 * Setup order type dependencies
 */
function setupOrderTypeDependencies(prefix) {
    const orderTypeSelect = document.getElementById(`${prefix}OrderType`);
    const limitPriceField = document.getElementById(`${prefix}LimitPriceField`);
    const triggerPriceField = document.getElementById(`${prefix}TriggerPriceField`);
    
    if (!orderTypeSelect) return;
    
    orderTypeSelect.addEventListener('change', (e) => {
        const orderType = e.target.value;
        
        if (orderType === 'MARKET') {
            if (limitPriceField) limitPriceField.classList.add('hidden');
            if (triggerPriceField) triggerPriceField.classList.add('hidden');
        } else if (orderType === 'LIMIT') {
            if (limitPriceField) limitPriceField.classList.remove('hidden');
            if (triggerPriceField) triggerPriceField.classList.add('hidden');
        } else if (orderType === 'SL') {
            if (limitPriceField) limitPriceField.classList.remove('hidden');
            if (triggerPriceField) triggerPriceField.classList.remove('hidden');
        } else if (orderType === 'SL-M') {
            if (limitPriceField) limitPriceField.classList.add('hidden');
            if (triggerPriceField) triggerPriceField.classList.remove('hidden');
        }
    });
}

/**
 * Add future order to basket
 */
function addFutureToBasket(strategyType) {
    const data = selectedStrategyData[strategyType];
    const futureTransactionType = strategyType === 'bullish' ? 'BUY' : 'SELL';
    
    const order = {
        type: 'future',
        exchange: 'NFO',
        tradingsymbol: data.future.symbol,
        transaction_type: futureTransactionType,
        lots: parseInt(document.getElementById('futureLots').value),
        order_type: document.getElementById('futureOrderType').value,
        product: document.getElementById('futureProduct').value,
        variety: 'regular'
    };
    
    if (order.order_type === 'LIMIT' || order.order_type === 'SL') {
        const price = parseFloat(document.getElementById('futurePrice').value);
        if (price) order.price = price;
    }
    
    if (order.order_type === 'SL' || order.order_type === 'SL-M') {
        const triggerPrice = parseFloat(document.getElementById('futureTriggerPrice').value);
        if (triggerPrice) order.trigger_price = triggerPrice;
    }
    
    strategyBasket.push(order);
    updateBasketDisplay();
    
    console.log('Added to basket:', order);
}

/**
 * Add hedge order to basket
 */
function addHedgeToBasket(strategyType) {
    const data = selectedStrategyData[strategyType];
    
    const order = {
        type: 'hedge',
        exchange: 'NFO',
        tradingsymbol: data.hedge.symbol,
        transaction_type: 'BUY',
        lots: parseInt(document.getElementById('hedgeLots').value),
        order_type: document.getElementById('hedgeOrderType').value,
        product: document.getElementById('hedgeProduct').value,
        variety: 'regular'
    };
    
    if (order.order_type === 'LIMIT' || order.order_type === 'SL') {
        const price = parseFloat(document.getElementById('hedgePrice').value);
        if (price) order.price = price;
    }
    
    if (order.order_type === 'SL' || order.order_type === 'SL-M') {
        const triggerPrice = parseFloat(document.getElementById('hedgeTriggerPrice').value);
        if (triggerPrice) order.trigger_price = triggerPrice;
    }
    
    strategyBasket.push(order);
    updateBasketDisplay();
    
    console.log('Added to basket:', order);
}

/**
 * Update basket display - ULTRA COMPACT
 */
function updateBasketDisplay() {
    const basketDisplay = document.getElementById('orderBasketDisplay');
    const basketItems = document.getElementById('basketItems');
    const basketCount = document.getElementById('basketCount');
    
    if (strategyBasket.length === 0) {
        basketDisplay.classList.add('hidden');
        return;
    }
    
    basketDisplay.classList.remove('hidden');
    basketCount.textContent = strategyBasket.length;
    
    basketItems.innerHTML = strategyBasket.map((order, index) => {
        const sideColor = order.transaction_type === 'BUY' ? 'green' : 'red';
        
        let priceInfo = '';
        if (order.price) priceInfo += ` @ ₹${order.price.toFixed(2)}`;
        if (order.trigger_price) priceInfo += ` (T:₹${order.trigger_price.toFixed(2)})`;
        
        return `
            <div class="flex items-center justify-between p-1.5 bg-white rounded border border-gray-200 text-xs">
                <div class="flex items-center gap-1 flex-wrap flex-1">
                    <span class="font-mono font-semibold">${order.tradingsymbol}</span>
                    <span class="px-1 bg-${sideColor}-100 text-${sideColor}-700 font-bold rounded">${order.transaction_type}</span>
                    <span class="text-gray-600">${order.lots}L</span>
                    <span class="px-1 bg-gray-100 text-gray-700 rounded">${order.order_type}</span>
                    ${priceInfo ? `<span class="text-gray-600">${priceInfo}</span>` : ''}
                </div>
                <button onclick="removeFromBasket(${index})" class="text-red-600 hover:text-red-700 ml-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Remove order from basket
 */
function removeFromBasket(index) {
    strategyBasket.splice(index, 1);
    updateBasketDisplay();
    
    // Clear margin result when basket changes
    const marginResult = document.getElementById('marginCheckResult');
    if (marginResult) {
        marginResult.classList.add('hidden');
    }
}

/**
 * Clear all orders from basket
 */
function clearBasket() {
    if (strategyBasket.length === 0) return;
    
    if (confirm('Clear all orders from basket?')) {
        strategyBasket = [];
        updateBasketDisplay();
        
        const marginResult = document.getElementById('marginCheckResult');
        if (marginResult) {
            marginResult.classList.add('hidden');
        }
    }
}

/**
 * Check margin for basket - ULTRA COMPACT
 */
async function checkBasketMargin() {
    if (strategyBasket.length === 0) {
        alert('Basket is empty! Add orders first.');
        return;
    }
    
    const resultDiv = document.getElementById('marginCheckResult');
    resultDiv.innerHTML = '<div class="text-center py-2"><div class="inline-block w-4 h-4 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div></div>';
    resultDiv.classList.remove('hidden');
    
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/check-basket-margin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({ orders: strategyBasket })
        });
        
        const marginData = await response.json();
        
        if (marginData.success) {
            const sufficient = marginData.sufficient;
            const color = sufficient ? 'green' : 'red';
            
            resultDiv.innerHTML = `
                <div class="p-2 bg-${color}-50 border border-${color}-200 rounded-lg text-xs">
                    <div class="grid grid-cols-3 gap-2 mb-2">
                        <div class="bg-white rounded p-1.5 border border-${color}-200 text-center">
                            <div class="font-bold text-sm">₹${(marginData.available_balance/1000).toFixed(1)}K</div>
                            <div class="text-xs text-gray-600">Available</div>
                        </div>
                        <div class="bg-white rounded p-1.5 border border-${color}-200 text-center">
                            <div class="font-bold text-sm">₹${(marginData.total_required/1000).toFixed(1)}K</div>
                            <div class="text-xs text-gray-600">Required</div>
                        </div>
                        <div class="bg-white rounded p-1.5 border border-${color}-200 text-center">
                            <div class="font-bold text-sm">₹${((marginData.available_balance - marginData.total_required)/1000).toFixed(1)}K</div>
                            <div class="text-xs text-gray-600">Remaining</div>
                        </div>
                    </div>
                    <div class="font-bold text-${color}-700 text-center">
                        ${sufficient ? '✅ Sufficient' : '⚠️ Insufficient'}
                    </div>
                </div>
            `;
            
            console.log('Margin Check:', marginData);
        } else {
            throw new Error(marginData.error);
        }
        
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="p-2 bg-red-50 border border-red-200 rounded-lg text-xs">
                <p class="text-red-700">❌ Error: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusConfig = {
        'COMPLETE': { color: 'green', icon: '✅', text: 'COMPLETE' },
        'OPEN': { color: 'blue', icon: '⏳', text: 'OPEN' },
        'PENDING': { color: 'yellow', icon: '⏱️', text: 'PENDING' },
        'TRIGGER PENDING': { color: 'orange', icon: '⏱️', text: 'TRIGGER PENDING' },
        'CANCELLED': { color: 'gray', icon: '❌', text: 'CANCELLED' },
        'REJECTED': { color: 'red', icon: '🚫', text: 'REJECTED' },
        'FAILED': { color: 'red', icon: '❌', text: 'FAILED' },
        'UNKNOWN': { color: 'gray', icon: '❓', text: 'UNKNOWN' }
    };
    
    const config = statusConfig[status] || statusConfig['UNKNOWN'];
    
    return `
        <span class="px-1.5 py-0.5 bg-${config.color}-100 text-${config.color}-700 text-xs font-bold rounded-full">
            ${config.icon} ${config.text}
        </span>
    `;
}

/**
 * Deploy basket orders with status tracking - ULTRA COMPACT
 */
async function deployBasket() {
    if (strategyBasket.length === 0) {
        showDeploymentStatus('error', 'Basket is empty! Add orders first.');
        return;
    }
    
    // Show loading state
    const deployBtn = document.querySelector('button[onclick="deployBasket()"]');
    const originalHTML = deployBtn.innerHTML;
    deployBtn.disabled = true;
    deployBtn.innerHTML = `<div class="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Deploying...`;
    
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/strategy/deploy-basket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({ orders: strategyBasket })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Build ULTRA-COMPACT status display
            let statusHTML = `
                <div class="bg-gradient-to-br from-green-50 to-blue-50 p-2 rounded-lg border border-green-200">
                    <h4 class="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                        <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Order Status
                    </h4>
                    
                    <!-- Ultra-Compact Summary -->
                    <div class="grid grid-cols-3 gap-1.5 mb-2">
                        <div class="bg-white rounded p-1 border border-gray-200 text-center">
                            <div class="text-base font-bold">${result.total_orders}</div>
                            <div class="text-xs text-gray-600">Total</div>
                        </div>
                        <div class="bg-green-100 rounded p-1 border border-green-300 text-center">
                            <div class="text-base font-bold text-green-700">${result.successful}</div>
                            <div class="text-xs text-green-700">Success</div>
                        </div>
                        <div class="bg-red-100 rounded p-1 border border-red-300 text-center">
                            <div class="text-base font-bold text-red-700">${result.failed}</div>
                            <div class="text-xs text-red-700">Failed</div>
                        </div>
                    </div>
                    
                    <!-- Ultra-Compact Order Details -->
                    <div class="space-y-1.5">
            `;
            
            result.results.forEach((r, index) => {
                if (r.success) {
                    deployedOrderIds.push(r.order_id);
                    const statusBadge = getStatusBadge(r.status);
                    
                    statusHTML += `
                        <div class="bg-white rounded p-1.5 border border-gray-200 text-xs">
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-mono font-semibold">${r.symbol}</span>
                                ${statusBadge}
                            </div>
                            <div class="grid grid-cols-2 gap-x-2 text-xs">
                                <div><span class="text-gray-600">ID:</span> <span class="font-mono">${r.order_id}</span></div>
                                <div><span class="text-gray-600">Qty:</span> ${r.quantity}</div>
                    `;
                    
                    if (r.filled_quantity > 0) {
                        statusHTML += `<div><span class="text-gray-600">Filled:</span> <span class="text-green-700 font-semibold">${r.filled_quantity}</span></div>`;
                    }
                    
                    if (r.average_price > 0) {
                        statusHTML += `<div><span class="text-gray-600">Price:</span> ₹${r.average_price.toFixed(2)}</div>`;
                    }
                    
                    statusHTML += `</div></div>`;
                } else {
                    statusHTML += `
                        <div class="bg-red-50 rounded p-1.5 border border-red-200 text-xs">
                            <div class="flex items-center gap-1 mb-0.5">
                                <span class="font-mono font-semibold">${r.symbol}</span>
                                ${getStatusBadge('FAILED')}
                            </div>
                            <div class="text-red-700">❌ ${r.error}</div>
                        </div>
                    `;
                }
            });
            
            statusHTML += `
                    </div>
                    
                    <!-- Ultra-Compact Action Buttons -->
                    <div class="flex gap-1.5 mt-2">
                        <button onclick="refreshAllOrderStatuses()" 
                                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded text-xs">
                            🔄 Refresh
                        </button>
                        <button onclick="clearDeploymentStatus()" 
                                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 rounded text-xs">
                            + Deploy More
                        </button>
                        <button onclick="closeDeploymentModal()" 
                                class="flex-1 border border-gray-400 text-gray-700 hover:bg-gray-100 font-semibold py-1.5 rounded text-xs">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            showDeploymentStatus('success', statusHTML);
            
            // Clear basket and re-enable button
            strategyBasket = [];
            updateBasketDisplay();
            deployBtn.disabled = false;
            deployBtn.innerHTML = originalHTML;
            
            console.log('✅ Deployment completed:', result.results);
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        showDeploymentStatus('error', `Error deploying orders: ${error.message}`);
        deployBtn.disabled = false;
        deployBtn.innerHTML = originalHTML;
        console.error('❌ Deployment error:', error);
    }
}

/**
 * Refresh status for a single order
 */
async function refreshOrderStatus(orderId) {
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/order-status/${orderId}`, {
            method: 'GET',
            headers: {
                'X-User-ID': state.userId
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Order status refreshed:', data);
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Error refreshing order status:', error);
    }
}

/**
 * Refresh all deployed order statuses
 */
async function refreshAllOrderStatuses() {
    if (deployedOrderIds.length === 0) {
        console.log('No orders to refresh');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.backendUrl}/api/orders-status/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({ order_ids: deployedOrderIds })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('All order statuses refreshed:', data.results);
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Error refreshing statuses:', error);
    }
}

/**
 * Show deployment status inline
 */
function showDeploymentStatus(type, message) {
    const marginResult = document.getElementById('marginCheckResult');
    
    if (type === 'success') {
        marginResult.innerHTML = message;
    } else if (type === 'error') {
        marginResult.innerHTML = `
            <div class="p-2 bg-red-50 border border-red-200 rounded-lg text-xs">
                <p class="text-red-700 font-semibold mb-2">${message}</p>
                <button onclick="clearDeploymentStatus()" class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 rounded text-xs">
                    Try Again
                </button>
            </div>
        `;
    }
    
    marginResult.classList.remove('hidden');
    marginResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Clear deployment status
 */
function clearDeploymentStatus() {
    const marginResult = document.getElementById('marginCheckResult');
    if (marginResult) {
        marginResult.classList.add('hidden');
        marginResult.innerHTML = '';
    }
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

// Setup function
function setupStrategiesListeners() {
    document.getElementById('executeBullishBtn')?.addEventListener('click', executeBullishStrategy);
    document.getElementById('executeBearishBtn')?.addEventListener('click', executeBearishStrategy);
    document.getElementById('deployBullishBtn')?.addEventListener('click', openBullishDeployment);
    document.getElementById('deployBearishBtn')?.addEventListener('click', openBearishDeployment);
}

// Make functions available globally
window.closeDeploymentModal = closeDeploymentModal;
window.addFutureToBasket = addFutureToBasket;
window.addHedgeToBasket = addHedgeToBasket;
window.removeFromBasket = removeFromBasket;
window.clearBasket = clearBasket;
window.checkBasketMargin = checkBasketMargin;
window.deployBasket = deployBasket;
window.showDeploymentStatus = showDeploymentStatus;
window.clearDeploymentStatus = clearDeploymentStatus;
window.refreshOrderStatus = refreshOrderStatus;
window.refreshAllOrderStatuses = refreshAllOrderStatuses;
