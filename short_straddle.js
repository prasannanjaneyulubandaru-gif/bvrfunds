// Short Straddle Module
// Automated straddle strategy with intelligent trailing stop loss

const STRADDLE_CONFIG = {
    backendUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000'
        : 'https://shark-app-hyd9r.ondigitalocean.app'
};

// State management
let currentStraddleStrategy = null;
let straddleStatusInterval = null;

// ===========================================
// FETCH STRADDLE STRATEGY
// ===========================================

async function fetchShortStraddle() {
    const skipStrikes = parseInt(document.getElementById('straddleSkipStrikes').value);
    const expiry = parseInt(document.getElementById('straddleExpiry').value);
    const lots = parseInt(document.getElementById('straddleLots').value);
    const initialSlPercent = parseFloat(document.getElementById('straddleInitialSL').value);
    
    const resultDiv = document.getElementById('straddleResult');
    resultDiv.innerHTML = '<div class="text-center py-4 text-gray-600">Loading straddle strategy...</div>';
    
    try {
        const userId = sessionStorage.getItem('user_id');
        
        const response = await fetch(`${STRADDLE_CONFIG.backendUrl}/api/straddle/fetch-short-straddle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId
            },
            body: JSON.stringify({
                skip_strikes: skipStrikes,
                expiry_days: expiry
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentStraddleStrategy = { 
                ...data, 
                lots,
                initialSlPercent,
                trailPoints: 6,  // Default
                stepSize: 0.5    // Default
            };
            displayStraddleResult(data, lots, initialSlPercent);
        } else {
            resultDiv.innerHTML = `<div class="text-center py-4 text-red-600">Error: ${data.error || 'Failed to fetch strategy'}</div>`;
        }
    } catch (error) {
        console.error('Straddle fetch error:', error);
        resultDiv.innerHTML = `<div class="text-center py-4 text-red-600">Error: ${error.message}</div>`;
    }
}

function displayStraddleResult(data, lots, initialSlPercent) {
    const resultDiv = document.getElementById('straddleResult');
    
    const atmCall = data.atm_call;
    const atmPut = data.atm_put;
    const hedgeCall = data.hedge_call;
    const hedgePut = data.hedge_put;
    
    // Calculate total premium received
    const totalPremium = (atmCall.last_price + atmPut.last_price) * lots * atmCall.lot_size;
    
    // Calculate initial SL levels
    const ceSlPrice = atmCall.last_price * (1 + initialSlPercent / 100);
    const peSlPrice = atmPut.last_price * (1 + initialSlPercent / 100);
    
    let html = `
        <!-- NIFTY Info -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <div class="text-center">
                <div class="text-sm text-gray-600 mb-1">NIFTY 50</div>
                <div class="text-3xl font-bold text-gray-900">₹${data.nifty_price.toFixed(2)}</div>
                <div class="text-xs text-gray-500 mt-1">ATM Strike: ${data.atm_strike}</div>
            </div>
        </div>
        
        <!-- Strategy Summary -->
        <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-bold text-gray-900">Strategy Summary</h4>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">SHORT STRADDLE</span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-600">Total Premium:</span>
                    <span class="font-bold text-green-600 ml-2">₹${totalPremium.toFixed(2)}</span>
                </div>
                <div>
                    <span class="text-gray-600">Initial SL:</span>
                    <span class="font-bold text-red-600 ml-2">${initialSlPercent}%</span>
                </div>
            </div>
        </div>
        
        <!-- ATM Options (Sell) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- ATM CALL -->
            <div class="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-bold text-gray-900">ATM CALL (Sell)</h4>
                    <span class="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">SELL</span>
                </div>
                <div class="space-y-2 text-sm">
                    <div><span class="text-gray-600">Symbol:</span> <span class="font-mono font-semibold">${atmCall.symbol}</span></div>
                    <div><span class="text-gray-600">Strike:</span> <span class="font-bold">${atmCall.strike}</span></div>
                    <div><span class="text-gray-600">LTP:</span> <span class="font-bold text-green-600">₹${atmCall.last_price.toFixed(2)}</span></div>
                    <div><span class="text-gray-600">Initial SL:</span> <span class="font-bold text-red-600">₹${ceSlPrice.toFixed(2)}</span></div>
                    <div><span class="text-gray-600">Lots:</span> <span class="font-bold">${lots}</span></div>
                </div>
            </div>
            
            <!-- ATM PUT -->
            <div class="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-bold text-gray-900">ATM PUT (Sell)</h4>
                    <span class="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">SELL</span>
                </div>
                <div class="space-y-2 text-sm">
                    <div><span class="text-gray-600">Symbol:</span> <span class="font-mono font-semibold">${atmPut.symbol}</span></div>
                    <div><span class="text-gray-600">Strike:</span> <span class="font-bold">${atmPut.strike}</span></div>
                    <div><span class="text-gray-600">LTP:</span> <span class="font-bold text-green-600">₹${atmPut.last_price.toFixed(2)}</span></div>
                    <div><span class="text-gray-600">Initial SL:</span> <span class="font-bold text-red-600">₹${peSlPrice.toFixed(2)}</span></div>
                    <div><span class="text-gray-600">Lots:</span> <span class="font-bold">${lots}</span></div>
                </div>
            </div>
        </div>
        
        <!-- Hedge Options (Buy) -->
        <div class="mb-4">
            <h4 class="font-bold text-gray-700 mb-2 text-sm">Hedge Positions</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- HEDGE CALL -->
                <div class="border border-green-200 rounded-lg p-3 bg-green-50">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-semibold text-gray-700">Hedge CALL (Buy)</span>
                        <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">BUY</span>
                    </div>
                    <div class="text-xs space-y-1">
                        <div><span class="text-gray-600">Strike:</span> <span class="font-bold">${hedgeCall.strike}</span></div>
                        <div><span class="text-gray-600">LTP:</span> <span class="font-bold text-green-600">₹${hedgeCall.last_price.toFixed(2)}</span></div>
                    </div>
                </div>
                
                <!-- HEDGE PUT -->
                <div class="border border-green-200 rounded-lg p-3 bg-green-50">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-semibold text-gray-700">Hedge PUT (Buy)</span>
                        <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">BUY</span>
                    </div>
                    <div class="text-xs space-y-1">
                        <div><span class="text-gray-600">Strike:</span> <span class="font-bold">${hedgePut.strike}</span></div>
                        <div><span class="text-gray-600">LTP:</span> <span class="font-bold text-green-600">₹${hedgePut.last_price.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 justify-center">
            <button onclick="checkStraddleMargin()" 
                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all">
                💰 Check Margin Required
            </button>
            <button onclick="showStraddleDeployModal()" 
                    class="btn-primary text-white font-semibold px-8 py-3 rounded-lg transition-all">
                🚀 Deploy Short Straddle
            </button>
        </div>
        
        <!-- Margin Result Div -->
        <div id="straddleMarginResult" class="mt-4"></div>
    `;
    
    resultDiv.innerHTML = html;
}

// ===========================================
// MARGIN CHECKING
// ===========================================

async function checkStraddleMargin() {
    if (!currentStraddleStrategy) {
        showToast('Please fetch straddle strategy first', 'error');
        return;
    }
    
    const resultDiv = document.getElementById('straddleMarginResult');
    resultDiv.innerHTML = '<div class="text-center py-4 text-gray-600">Checking margin...</div>';
    
    try {
        const userId = sessionStorage.getItem('user_id');
        const lots = currentStraddleStrategy.lots;
        
        // Prepare orders for margin check
        const orders = [
            {
                tradingsymbol: currentStraddleStrategy.atm_call.symbol,
                exchange: 'NFO',
                transaction_type: 'SELL',
                quantity: lots * currentStraddleStrategy.atm_call.lot_size,
                product: 'MIS',
                order_type: 'MARKET',
                price: 0
            },
            {
                tradingsymbol: currentStraddleStrategy.atm_put.symbol,
                exchange: 'NFO',
                transaction_type: 'SELL',
                quantity: lots * currentStraddleStrategy.atm_put.lot_size,
                product: 'MIS',
                order_type: 'MARKET',
                price: 0
            },
            {
                tradingsymbol: currentStraddleStrategy.hedge_call.symbol,
                exchange: 'NFO',
                transaction_type: 'BUY',
                quantity: lots * currentStraddleStrategy.hedge_call.lot_size,
                product: 'MIS',
                order_type: 'MARKET',
                price: 0
            },
            {
                tradingsymbol: currentStraddleStrategy.hedge_put.symbol,
                exchange: 'NFO',
                transaction_type: 'BUY',
                quantity: lots * currentStraddleStrategy.hedge_put.lot_size,
                product: 'MIS',
                order_type: 'MARKET',
                price: 0
            }
        ];
        
        const response = await fetch(`${STRADDLE_CONFIG.backendUrl}/api/strategy/check-basket-margin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId
            },
            body: JSON.stringify({ orders })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayMarginResult(data);
        } else {
            resultDiv.innerHTML = `<div class="text-center py-4 text-red-600">Error: ${data.error || 'Failed to check margin'}</div>`;
        }
    } catch (error) {
        console.error('Margin check error:', error);
        resultDiv.innerHTML = `<div class="text-center py-4 text-red-600">Error: ${error.message}</div>`;
    }
}

function displayMarginResult(data) {
    const resultDiv = document.getElementById('straddleMarginResult');
    
    const sufficient = data.sufficient;
    const borderColor = sufficient ? 'border-green-300' : 'border-red-300';
    const bgColor = sufficient ? 'bg-green-50' : 'bg-red-50';
    const textColor = sufficient ? 'text-green-800' : 'text-red-800';
    
    let html = `
        <div class="border-2 ${borderColor} ${bgColor} rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-bold ${textColor}">Margin Analysis</h4>
                <span class="px-3 py-1 ${sufficient ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-xs font-semibold rounded-full">
                    ${sufficient ? '✓ SUFFICIENT' : '✗ INSUFFICIENT'}
                </span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                    <div class="text-gray-600">Available Balance</div>
                    <div class="font-bold text-lg ${textColor}">₹${data.available_balance.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-gray-600">Required Margin</div>
                    <div class="font-bold text-lg ${textColor}">₹${data.total_required.toFixed(2)}</div>
                </div>
            </div>
            
            ${!sufficient ? `
                <div class="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                    <p class="text-sm text-red-800 font-semibold">⚠️ Insufficient funds!</p>
                    <p class="text-xs text-red-700 mt-1">You need ₹${(data.total_required - data.available_balance).toFixed(2)} more to place these orders.</p>
                </div>
            ` : ''}
        </div>
    `;
    
    resultDiv.innerHTML = html;
}

// ===========================================
// DEPLOY STRADDLE (NEW - USING BASKET PATTERN)
// ===========================================

function showStraddleDeployModal() {
    if (!currentStraddleStrategy) {
        showToast('Please fetch straddle strategy first', 'error');
        return;
    }
    
    const atmCall = currentStraddleStrategy.atm_call;
    const atmPut = currentStraddleStrategy.atm_put;
    const hedgeCall = currentStraddleStrategy.hedge_call;
    const hedgePut = currentStraddleStrategy.hedge_put;
    const lots = currentStraddleStrategy.lots;
    
    const orders = [
        {
            symbol: atmCall.symbol,
            token: atmCall.token,
            transaction_type: 'SELL',
            lots: lots,
            label: `ATM CALL ${atmCall.strike} (Sell)`
        },
        {
            symbol: atmPut.symbol,
            token: atmPut.token,
            transaction_type: 'SELL',
            lots: lots,
            label: `ATM PUT ${atmPut.strike} (Sell)`
        },
        {
            symbol: hedgeCall.symbol,
            token: hedgeCall.token,
            transaction_type: 'BUY',
            lots: lots,
            label: `Hedge CALL ${hedgeCall.strike} (Buy)`
        },
        {
            symbol: hedgePut.symbol,
            token: hedgePut.token,
            transaction_type: 'BUY',
            lots: lots,
            label: `Hedge PUT ${hedgePut.strike} (Buy)`
        }
    ];
    
    // Store straddle config for later deployment
    window.currentStraddleConfig = {
        initialSlPercent: currentStraddleStrategy.initialSlPercent,
        trailPoints: currentStraddleStrategy.trailPoints,
        stepSize: currentStraddleStrategy.stepSize,
        atmCall: atmCall,
        atmPut: atmPut,
        hedgeCall: hedgeCall,
        hedgePut: hedgePut,
        lots: lots
    };
    
    // Show the basket deploy modal
    window.BasketManager.showDeployModal(orders, 'Short Straddle Strategy');
}

// Override the basket deployment to add straddle-specific logic
const originalDeployBasket = window.BasketManager?.deploy;
if (originalDeployBasket) {
    window.BasketManager.deployStraddle = async function(onProgress, onComplete, onError) {
        try {
            // First deploy using standard basket
            const result = await originalDeployBasket(onProgress, (summary) => {
                // After successful deployment, activate straddle monitoring
                if (summary.successful > 0 && window.currentStraddleConfig) {
                    activateStraddleMonitoring(summary);
                }
                if (onComplete) onComplete(summary);
            }, onError);
            
            return result;
        } catch (error) {
            if (onError) onError(error.message);
            return null;
        }
    };
}

async function activateStraddleMonitoring(deploymentSummary) {
    try {
        const userId = sessionStorage.getItem('user_id');
        const config = window.currentStraddleConfig;
        
        if (!config) {
            console.error('No straddle config found');
            return;
        }
        
        // Prepare straddle data for backend monitoring
        const straddleData = {
            initial_sl_percent: config.initialSlPercent,
            trail_points: config.trailPoints,
            step_size: config.stepSize,
            atm_call: config.atmCall,
            atm_put: config.atmPut,
            hedge_call: config.hedgeCall,
            hedge_put: config.hedgePut,
            lots: config.lots,
            order_ids: deploymentSummary.results
                .filter(r => r.success)
                .map(r => r.order_id)
        };
        
        const response = await fetch(`${STRADDLE_CONFIG.backendUrl}/api/straddle/activate-monitoring`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId
            },
            body: JSON.stringify(straddleData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('Straddle monitoring activated');
            startStraddleMonitoring();
            showToast('✅ Straddle deployed and monitoring activated!', 'success');
        } else {
            console.error('Failed to activate monitoring:', data.error);
            showToast('⚠️ Orders placed but monitoring failed to activate', 'warning');
        }
        
        // Clear the config
        delete window.currentStraddleConfig;
        
    } catch (error) {
        console.error('Error activating straddle monitoring:', error);
        showToast('⚠️ Orders placed but monitoring failed', 'warning');
    }
}

// ===========================================
// STRADDLE MONITORING
// ===========================================

function startStraddleMonitoring() {
    // Clear any existing interval
    if (straddleStatusInterval) {
        clearInterval(straddleStatusInterval);
    }
    
    // Show monitor section
    document.getElementById('straddleMonitor').classList.remove('hidden');
    
    // Update immediately
    updateStraddleStatus();
    
    // Update every 3 seconds
    straddleStatusInterval = setInterval(updateStraddleStatus, 3000);
}

async function updateStraddleStatus() {
    try {
        const userId = sessionStorage.getItem('user_id');
        
        const response = await fetch(`${STRADDLE_CONFIG.backendUrl}/api/straddle/straddle-status`, {
            headers: { 'X-User-ID': userId }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayStraddleStatus(data);
        }
    } catch (error) {
        console.error('Status update error:', error);
    }
}

function displayStraddleStatus(data) {
    const statusDiv = document.getElementById('straddleStatusContent');
    const logsDiv = document.getElementById('straddleLogsContent');
    
    // Display active straddles
    if (data.active_straddles && data.active_straddles.length > 0) {
        let html = '<div class="space-y-3">';
        
        data.active_straddles.forEach(straddle => {
            const statusColor = straddle.status === 'active' ? 'green' : 
                                straddle.status === 'completed' ? 'gray' : 'orange';
            
            html += `
                <div class="border-2 border-${statusColor}-200 bg-${statusColor}-50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <span class="font-mono text-sm font-bold">${straddle.straddle_id}</span>
                        <span class="px-3 py-1 bg-${statusColor}-100 text-${statusColor}-700 text-xs font-semibold rounded-full">
                            ${straddle.status.toUpperCase()}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div class="text-gray-600 text-xs mb-1">CE Status</div>
                            <div class="font-bold ${straddle.ce_sl_hit ? 'text-red-600' : 'text-green-600'}">
                                ${straddle.ce_sl_hit ? '✗ SL Hit' : '✓ Active'}
                            </div>
                            ${straddle.ce_current_sl ? `
                                <div class="text-xs text-gray-600 mt-1">SL: ₹${straddle.ce_current_sl.toFixed(2)}</div>
                            ` : ''}
                        </div>
                        <div>
                            <div class="text-gray-600 text-xs mb-1">PE Status</div>
                            <div class="font-bold ${straddle.pe_sl_hit ? 'text-red-600' : 'text-green-600'}">
                                ${straddle.pe_sl_hit ? '✗ SL Hit' : '✓ Active'}
                            </div>
                            ${straddle.pe_current_sl ? `
                                <div class="text-xs text-gray-600 mt-1">SL: ₹${straddle.pe_current_sl.toFixed(2)}</div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        statusDiv.innerHTML = html;
    } else {
        statusDiv.innerHTML = '<div class="text-center text-gray-500 py-8">No active straddles</div>';
    }
    
    // Display logs
    if (data.logs && data.logs.length > 0) {
        let logsHtml = '<div class="space-y-2">';
        
        // Reverse to show newest first
        data.logs.reverse().forEach(log => {
            let logClass = 'log-entry info';
            
            if (log.message.includes('✅') || log.message.includes('✓')) {
                logClass = 'log-entry success';
            } else if (log.message.includes('❌') || log.message.includes('⚠️') || log.message.includes('✗')) {
                logClass = 'log-entry error';
            } else if (log.message.includes('🔽') || log.message.includes('🔼') || log.message.includes('🎯')) {
                logClass = 'log-entry info';
            }
            
            logsHtml += `
                <div class="${logClass}">
                    <div class="flex items-start justify-between">
                        <span class="text-xs flex-1">${log.message}</span>
                        <span class="text-xs text-gray-500 ml-2 whitespace-nowrap">${log.timestamp}</span>
                    </div>
                </div>
            `;
        });
        
        logsHtml += '</div>';
        logsDiv.innerHTML = logsHtml;
    } else {
        logsDiv.innerHTML = '<div class="text-center text-gray-500 py-4 text-sm">No logs yet</div>';
    }
}

function stopStraddleMonitoring() {
    if (straddleStatusInterval) {
        clearInterval(straddleStatusInterval);
        straddleStatusInterval = null;
    }
    
    document.getElementById('straddleMonitor').classList.add('hidden');
}

// ===========================================
// TOAST NOTIFICATION
// ===========================================

function showToast(message, type = 'info') {
    // Use BasketManager's toast if available
    if (window.BasketManager && window.BasketManager.showToast) {
        window.BasketManager.showToast(message, type);
        return;
    }
    
    // Fallback toast implementation
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 
                    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===========================================
// EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetchStraddleBtn');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', fetchShortStraddle);
    }
});

console.log('Short Straddle module initialized');
