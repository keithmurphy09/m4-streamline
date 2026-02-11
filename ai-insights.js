// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - AI Business Insights & Seasonal Trends
// ═══════════════════════════════════════════════════════════════════

// Generate AI-powered insights from business data
function generateBusinessInsights() {
    const insights = [];
    const today = new Date();
    
    // ═══════ QUOTE ACCEPTANCE INSIGHTS ═══════
    const quotesWithAcceptedDate = quotes.filter(q => q.accepted_date);
    if (quotesWithAcceptedDate.length >= 5) {
        const acceptanceTimes = quotesWithAcceptedDate.map(q => {
            const created = new Date(q.created_at || q.date);
            const accepted = new Date(q.accepted_date);
            return Math.ceil((accepted - created) / (1000 * 60 * 60 * 24)); // Days
        });
        
        const avgAcceptanceTime = acceptanceTimes.reduce((a, b) => a + b, 0) / acceptanceTimes.length;
        const industryAvg = 5; // Industry average benchmark
        
        insights.push({
            category: 'quotes',
            icon: '⚡',
            color: avgAcceptanceTime < industryAvg ? 'green' : 'orange',
            title: 'Quote Response Time',
            insight: `Your quotes are accepted in ${avgAcceptanceTime.toFixed(1)} days on average`,
            comparison: avgAcceptanceTime < industryAvg 
                ? `${((industryAvg - avgAcceptanceTime) / industryAvg * 100).toFixed(0)}% faster than industry average (${industryAvg} days)`
                : `${((avgAcceptanceTime - industryAvg) / industryAvg * 100).toFixed(0)}% slower than industry average (${industryAvg} days)`,
            action: avgAcceptanceTime > industryAvg ? 'Consider following up sooner or adjusting pricing' : 'Great work! Your response time is excellent'
        });
    }
    
    // ═══════ CLIENT VALUE INSIGHTS ═══════
    const clientRevenue = {};
    invoices.filter(i => i.status === 'paid').forEach(inv => {
        const clientName = clients.find(c => c.id === inv.client_id)?.name || 'Unknown';
        clientRevenue[clientName] = (clientRevenue[clientName] || 0) + (inv.total || 0);
    });
    
    const topClients = Object.entries(clientRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    if (topClients.length > 0) {
        const topRevenue = topClients.reduce((sum, [_, rev]) => sum + rev, 0);
        const totalRevenue = Object.values(clientRevenue).reduce((a, b) => a + b, 0);
        const concentration = (topRevenue / totalRevenue * 100).toFixed(0);
        
        insights.push({
            category: 'clients',
            icon: '👥',
            color: concentration > 60 ? 'orange' : 'green',
            title: 'Client Concentration',
            insight: `Top 3 clients represent ${concentration}% of revenue`,
            comparison: topClients.map(([name, rev]) => `${name}: $${rev.toLocaleString()}`).join(', '),
            action: concentration > 60 
                ? 'High concentration risk - consider diversifying client base'
                : 'Healthy client diversification'
        });
    }
    
    // ═══════ QUOTE VALUE PATTERNS ═══════
    const acceptedQuotes = quotes.filter(q => q.accepted || q.status === 'accepted');
    const declinedQuotes = quotes.filter(q => q.status === 'declined');
    
    if (acceptedQuotes.length >= 3 && declinedQuotes.length >= 2) {
        const avgAcceptedValue = acceptedQuotes.reduce((sum, q) => sum + (q.total || 0), 0) / acceptedQuotes.length;
        const avgDeclinedValue = declinedQuotes.reduce((sum, q) => sum + (q.total || 0), 0) / declinedQuotes.length;
        
        if (avgAcceptedValue > avgDeclinedValue * 1.2) {
            insights.push({
                category: 'quotes',
                icon: '💰',
                color: 'blue',
                title: 'Sweet Spot Identified',
                insight: `Higher value quotes perform better`,
                comparison: `Accepted quotes avg $${avgAcceptedValue.toFixed(0)} vs declined $${avgDeclinedValue.toFixed(0)}`,
                action: 'Focus on larger projects - your win rate is better at higher values'
            });
        } else if (avgDeclinedValue > avgAcceptedValue * 1.2) {
            insights.push({
                category: 'quotes',
                icon: '📊',
                color: 'orange',
                title: 'Pricing Pattern Detected',
                insight: `Lower value quotes have better conversion`,
                comparison: `Accepted quotes avg $${avgAcceptedValue.toFixed(0)} vs declined $${avgDeclinedValue.toFixed(0)}`,
                action: 'Consider adjusting pricing strategy for larger quotes'
            });
        }
    }
    
    // ═══════ SEASONAL REVENUE TRENDS ═══════
    const monthlyRevenue = {};
    invoices.filter(i => i.status === 'paid' && i.paid_date).forEach(inv => {
        const month = new Date(inv.paid_date).getMonth();
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (inv.total || 0);
    });
    
    if (Object.keys(monthlyRevenue).length >= 6) {
        const revenues = Object.entries(monthlyRevenue).map(([month, rev]) => ({ month: parseInt(month), revenue: rev }));
        revenues.sort((a, b) => b.revenue - a.revenue);
        
        const bestMonths = revenues.slice(0, 3).map(r => r.month);
        const worstMonths = revenues.slice(-3).map(r => r.month);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        insights.push({
            category: 'seasonal',
            icon: '📅',
            color: 'purple',
            title: 'Seasonal Pattern Detected',
            insight: `Your busiest months: ${bestMonths.map(m => monthNames[m]).join(', ')}`,
            comparison: `Slowest months: ${worstMonths.map(m => monthNames[m]).join(', ')}`,
            action: 'Plan marketing campaigns 1-2 months before peak season'
        });
    }
    
    // ═══════ PAYMENT BEHAVIOR INSIGHTS ═══════
    const paidInvoices = invoices.filter(i => i.status === 'paid' && i.issue_date && i.paid_date);
    if (paidInvoices.length >= 5) {
        const paymentTimes = paidInvoices.map(inv => {
            const issued = new Date(inv.issue_date);
            const paid = new Date(inv.paid_date);
            return Math.ceil((paid - issued) / (1000 * 60 * 60 * 24));
        });
        
        const avgPaymentTime = paymentTimes.reduce((a, b) => a + b, 0) / paymentTimes.length;
        const invoiceTerms = 30; // Standard NET 30
        
        insights.push({
            category: 'cash-flow',
            icon: '💸',
            color: avgPaymentTime <= invoiceTerms ? 'green' : 'red',
            title: 'Payment Collection Speed',
            insight: `Invoices paid in ${avgPaymentTime.toFixed(1)} days on average`,
            comparison: avgPaymentTime <= invoiceTerms 
                ? `${(invoiceTerms - avgPaymentTime).toFixed(0)} days faster than NET 30 terms`
                : `${(avgPaymentTime - invoiceTerms).toFixed(0)} days slower than NET 30 terms`,
            action: avgPaymentTime > invoiceTerms 
                ? 'Consider offering early payment discounts or sending reminders'
                : 'Excellent! Clients are paying quickly'
        });
    }
    
    // ═══════ PROFIT MARGIN TRENDS ═══════
    const last3Months = new Date();
    last3Months.setMonth(last3Months.getMonth() - 3);
    
    const recentRevenue = invoices.filter(i => 
        i.status === 'paid' && 
        i.paid_date && 
        new Date(i.paid_date) >= last3Months
    ).reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const recentExpenses = expenses.filter(e => 
        new Date(e.date) >= last3Months
    ).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    
    if (recentRevenue > 0) {
        const margin = ((recentRevenue - recentExpenses) / recentRevenue * 100);
        const healthyMargin = 30; // Industry benchmark
        
        insights.push({
            category: 'profit',
            icon: '📈',
            color: margin >= healthyMargin ? 'green' : margin >= 15 ? 'orange' : 'red',
            title: 'Profit Margin Analysis',
            insight: `Current profit margin: ${margin.toFixed(1)}%`,
            comparison: margin >= healthyMargin 
                ? `${(margin - healthyMargin).toFixed(1)}% above industry benchmark`
                : `${(healthyMargin - margin).toFixed(1)}% below industry benchmark (${healthyMargin}%)`,
            action: margin < 15 
                ? 'Critical: Review pricing and cost structure'
                : margin < healthyMargin
                    ? 'Consider optimizing expenses or increasing prices'
                    : 'Excellent profitability - maintain current strategy'
        });
    }
    
    // ═══════ EXPENSE CATEGORY INSIGHTS ═══════
    const expensesByCategory = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + parseFloat(exp.amount || 0);
    });
    
    const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
    const topExpenseCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];
    
    if (topExpenseCategory && totalExpenses > 0) {
        const percentage = (topExpenseCategory[1] / totalExpenses * 100).toFixed(0);
        
        insights.push({
            category: 'expenses',
            icon: '🔍',
            color: 'yellow',
            title: 'Biggest Cost Driver',
            insight: `${topExpenseCategory[0]} represents ${percentage}% of expenses`,
            comparison: `$${topExpenseCategory[1].toFixed(0)} of $${totalExpenses.toFixed(0)} total`,
            action: percentage > 40 
                ? 'High concentration - look for cost optimization opportunities'
                : 'Monitor this category for potential savings'
        });
    }
    
    // ═══════ GROWTH TRAJECTORY ═══════
    const last6Months = new Date();
    last6Months.setMonth(last6Months.getMonth() - 6);
    
    const last3MonthsRevenue = invoices.filter(i => 
        i.status === 'paid' && 
        i.paid_date && 
        new Date(i.paid_date) >= last3Months
    ).reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const prev3MonthsRevenue = invoices.filter(i => 
        i.status === 'paid' && 
        i.paid_date && 
        new Date(i.paid_date) >= last6Months &&
        new Date(i.paid_date) < last3Months
    ).reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    if (prev3MonthsRevenue > 0) {
        const growth = ((last3MonthsRevenue - prev3MonthsRevenue) / prev3MonthsRevenue * 100);
        const annualizedGrowth = growth * 4; // Approximate annual rate
        
        insights.push({
            category: 'growth',
            icon: growth >= 0 ? '🚀' : '⚠️',
            color: growth >= 10 ? 'green' : growth >= 0 ? 'blue' : 'red',
            title: 'Business Growth Trend',
            insight: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% revenue growth last 3 months`,
            comparison: `Annualized: ${growth >= 0 ? '+' : ''}${annualizedGrowth.toFixed(1)}% per year`,
            action: growth < 0 
                ? 'Negative trend - review sales and marketing strategy'
                : growth < 10
                    ? 'Steady growth - consider acceleration opportunities'
                    : 'Strong growth! Keep momentum going'
        });
    }
    
    return insights;
}

// Render insights widget for dashboard
function renderInsightsWidget() {
    const insights = generateBusinessInsights();
    
    if (insights.length === 0) {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
                <div class="text-gray-400 text-5xl mb-4">🤖</div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Insights Coming Soon</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Keep using M4 Streamline - insights will appear as you build more data</p>
            </div>
        `;
    }
    
    const colorClasses = {
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    };
    
    return `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-2">
                    <span class="text-2xl">🤖</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">AI Business Insights</h3>
                    <span class="ml-auto text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full font-medium">
                        ${insights.length} insight${insights.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>
            <div class="p-6 space-y-4 max-h-96 overflow-y-auto">
                ${insights.map(insight => `
                    <div class="border ${colorClasses[insight.color]} rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <div class="text-2xl">${insight.icon}</div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">${insight.title}</h4>
                                <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">${insight.insight}</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">${insight.comparison}</p>
                                <div class="flex items-center gap-2 text-xs">
                                    <span class="font-medium text-gray-900 dark:text-white">💡 Action:</span>
                                    <span class="text-gray-600 dark:text-gray-400">${insight.action}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Generate seasonal trends chart data
function getSeasonalTrendsData() {
    const monthlyData = {};
    
    // Collect revenue by month
    invoices.filter(i => i.status === 'paid' && i.paid_date).forEach(inv => {
        const date = new Date(inv.paid_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, expenses: 0, jobs: 0, quotes: 0 };
        }
        monthlyData[monthKey].revenue += (inv.total || 0);
    });
    
    // Collect expenses by month
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, expenses: 0, jobs: 0, quotes: 0 };
        }
        monthlyData[monthKey].expenses += parseFloat(exp.amount || 0);
    });
    
    // Sort by month
    const sortedMonths = Object.keys(monthlyData).sort();
    
    return {
        labels: sortedMonths.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(year, parseInt(month) - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        revenue: sortedMonths.map(m => monthlyData[m].revenue),
        expenses: sortedMonths.map(m => monthlyData[m].expenses),
        profit: sortedMonths.map(m => monthlyData[m].revenue - monthlyData[m].expenses)
    };
}

console.log('✅ AI Insights & Seasonal Trends loaded');
