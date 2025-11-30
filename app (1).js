// ═══════════════════════════════════════════════════
// Global State
// ═══════════════════════════════════════════════════
let db = { cases: [], finance: [], library: [], schedule: [] };
let charts = {};
let currentLibraryId = null;

// Pagination state
let pagination = {
    cases: { currentPage: 1, itemsPerPage: 12 },
    schedule: { currentPage: 1, itemsPerPage: 10 },
    finance: { currentPage: 1, itemsPerPage: 20 },
    debtors: { currentPage: 1, itemsPerPage: 10 }
};

// ═══════════════════════════════════════════════════
// تبدیل اعداد فارسی به انگلیسی
// ═══════════════════════════════════════════════════
function convertToEnglishNumbers(str) {
    if (!str) return str;
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    
    for (let i = 0; i < 10; i++) {
        str = str.replace(new RegExp(persianNumbers[i], 'g'), i);
        str = str.replace(new RegExp(arabicNumbers[i], 'g'), i);
    }
    return str;
}

function convertToPersianNumbers(str) {
    if (!str) return str;
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/[0-9]/g, d => persianNumbers[d]);
}

// ═══════════════════════════════════════════════════
// جداکننده هزارگان
// ═══════════════════════════════════════════════════
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseFormattedNumber(str) {
    if (!str) return 0;
    return parseInt(str.replace(/,/g, '')) || 0;
}

// ═══════════════════════════════════════════════════
// Initialize
// ═══════════════════════════════════════════════════
window.onload = async () => {
    // Set today date
    const today = new Date().toLocaleDateString('fa-IR');
    document.getElementById('todayDate').textContent = today;
    document.getElementById('todayDateSchedule').textContent = today;
    document.getElementById('financeDate').value = today;
    document.getElementById('scheduleDate').value = today;
    
    // Load theme
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
    
    // Initialize charts FIRST
    initCharts();
    
    // Then load data
    await loadData();
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#clientSuggestions') && !e.target.closest('#scheduleClient')) {
            document.getElementById('clientSuggestions').classList.add('hidden');
        }
    });
};

// ═══════════════════════════════════════════════════
// API Functions
// ═══════════════════════════════════════════════════
async function loadData() {
    try {
        const res = await fetch('api.php?action=get_data');
        const data = await res.json();
        if (data.success) {
            db = data.data;
            if (!db.schedule) db.schedule = [];
            refreshAll();
        }
    } catch (err) {
        console.error('Load error:', err);
    }
}

async function saveData(syncType = null, syncItem = null) {
    try {
        const body = { db };
        if (syncType && syncItem) {
            body.syncType = syncType;
            body.syncItem = syncItem;
        }
        
        const res = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        if (data.success) {
            showSyncStatus();
        }
        return data.success;
    } catch (err) {
        console.error('Save error:', err);
        return false;
    }
}

function showSyncStatus() {
    const el = document.getElementById('syncStatus');
    el.classList.remove('hidden');
    el.classList.add('flex');
    setTimeout(() => {
        el.classList.add('hidden');
        el.classList.remove('flex');
    }, 2000);
}

// ═══════════════════════════════════════════════════
// Refresh Functions
// ═══════════════════════════════════════════════════
function refreshAll() {
    renderDashboard();
    renderCases();
    renderSchedule();
    renderFinance();
    renderLibrary();
    updateCaseSelects();
}

function updateCaseSelects() {
    const options = '<option value="">بدون پرونده</option>' + 
        db.cases.map(c => `<option value="${c.id}">${c.name} - ${c.title} ${c.archiveNo ? '('+c.archiveNo+')' : ''}</option>`).join('');
    
    document.getElementById('scheduleCaseId').innerHTML = options;
    document.getElementById('financeCaseId').innerHTML = options;
}

// ═══════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════
function renderDashboard() {
    const today = getTodayPersian();
    
    // Stats
    const activeCases = db.cases.filter(c => c.status === 'جاری').length;
    const todaySchedules = db.schedule.filter(s => comparePersianDates(s.date, today) === 0).length;
    const income = db.finance.filter(f => f.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = db.finance.filter(f => f.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    
    document.getElementById('stat-cases').textContent = activeCases;
    document.getElementById('stat-today').textContent = todaySchedules;
    document.getElementById('stat-income').textContent = formatNumber(income);
    document.getElementById('stat-balance').textContent = formatNumber(income - expense);
    
    // Upcoming schedules
const upcoming = db.schedule
    .filter(s => comparePersianDates(s.date, today) >= 0 && !s.is_done)
    .sort((a, b) => {
        const dateCompare = comparePersianDates(a.date, b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.time || '').localeCompare(b.time || '');
    })
    .slice(0, 4);
    
    document.getElementById('upcomingList').innerHTML = upcoming.length ? upcoming.map(s => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-xl">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <i class="fas fa-clock text-amber-600 dark:text-amber-400"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-700 dark:text-gray-300">${s.client || 'بدون نام'}</p>
                    <p class="text-xs text-gray-400">${s.label || 'برنامه'}</p>
                </div>
            </div>
            <div class="text-left">
                <p class="font-mono text-sm font-bold text-primary-600 dark:text-gold-500">${s.date.split('/').slice(1).join('/')}</p>
                <p class="text-xs text-gray-400">${s.time}</p>
            </div>
        </div>
    `).join('') : '<p class="text-center text-gray-400 py-4">برنامه‌ای نیست</p>';
    
    // Recent cases
    document.getElementById('recentCasesList').innerHTML = db.cases.slice(0, 4).map(c => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-700 transition" onclick="showCaseDetail(${c.id})">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 ${c.status === 'جاری' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-lg flex items-center justify-center">
                    <i class="fas fa-folder ${c.status === 'جاری' ? 'text-emerald-600' : 'text-red-600'}"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-700 dark:text-gray-300">${c.name}</p>
                    <p class="text-xs text-gray-400">${c.title}</p>
                </div>
            </div>
            <span class="${c.status === 'جاری' ? 'badge-success' : 'badge-danger'} text-xs px-2 py-1 rounded">${c.status}</span>
        </div>
    `).join('') || '<p class="text-center text-gray-400 py-4">پرونده‌ای نیست</p>';
    
    // Recent finance
    document.getElementById('recentFinanceList').innerHTML = db.finance.slice(0, 4).map(f => {
        const cs = db.cases.find(c => c.id == f.caseId);
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-xl">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 ${f.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-lg flex items-center justify-center">
                        <i class="fas ${f.type === 'income' ? 'fa-arrow-down text-emerald-600' : 'fa-arrow-up text-red-600'}"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-700 dark:text-gray-300">${cs ? cs.name : 'بدون پرونده'}</p>
                        <p class="text-xs text-gray-400">${f.date}</p>
                    </div>
                </div>
                <p class="font-mono font-bold ${f.type === 'income' ? 'text-emerald-600' : 'text-red-600'}" dir="ltr">${formatNumber(f.amount)}</p>
            </div>
        `;
    }).join('') || '<p class="text-center text-gray-400 py-4">تراکنشی نیست</p>';
    
    // Update charts
    updateCharts();
}

// ═══════════════════════════════════════════════════
// Charts
// ═══════════════════════════════════════════════════
function initCharts() {
    const casesCtx = document.getElementById('casesChart').getContext('2d');
    const financeCtx = document.getElementById('financeChart').getContext('2d');
    
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';
    
    charts.cases = new Chart(casesCtx, {
        type: 'doughnut',
        data: {
            labels: ['جاری', 'مختومه'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Vazirmatn' } }
                }
            }
        }
    });
    
    charts.finance = new Chart(financeCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                { label: 'دریافت', data: [], backgroundColor: '#10b981' },
                { label: 'هزینه', data: [], backgroundColor: '#ef4444' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: textColor, font: { family: 'Vazirmatn' } }
                }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Vazirmatn' } } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });
}

function updateCharts() {
    // Check if charts exist
    if (!charts.cases || !charts.finance) return;
    
    // Cases chart
    const active = db.cases.filter(c => c.status === 'جاری').length;
    const closed = db.cases.filter(c => c.status === 'مختومه').length;
    charts.cases.data.datasets[0].data = [active, closed];
    charts.cases.update();
    
    // Finance chart - Last 6 months
    const months = {};
    db.finance.forEach(f => {
        if (!f.date) return;
        const month = f.date.split('/').slice(0, 2).join('/');
        if (!months[month]) months[month] = { income: 0, expense: 0 };
        if (f.type === 'income' || f.type === 'expense') {
            months[month][f.type] += Number(f.amount) || 0;
        }
    });
    
    const sortedMonths = Object.keys(months).sort().slice(-6);
    charts.finance.data.labels = sortedMonths;
    charts.finance.data.datasets[0].data = sortedMonths.map(m => months[m]?.income || 0);
    charts.finance.data.datasets[1].data = sortedMonths.map(m => months[m]?.expense || 0);
    charts.finance.update();
}

// ═══════════════════════════════════════════════════
// Pagination Helper
// ═══════════════════════════════════════════════════
function renderPagination(containerId, totalItems, currentPage, itemsPerPage, onPageChange) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        document.getElementById(containerId).innerHTML = '';
        return;
    }
    
    let html = `
        <button onclick="${onPageChange}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Show first page
    if (currentPage > 3) {
        html += `<button onclick="${onPageChange}(1)">1</button>`;
        if (currentPage > 4) html += `<span class="px-2">...</span>`;
    }
    
    // Show pages around current
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        html += `<button onclick="${onPageChange}(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    // Show last page
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) html += `<span class="px-2">...</span>`;
        html += `<button onclick="${onPageChange}(${totalPages})">${totalPages}</button>`;
    }
    
    html += `
        <button onclick="${onPageChange}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    document.getElementById(containerId).innerHTML = html;
}

// ═══════════════════════════════════════════════════
// Cases
// ═══════════════════════════════════════════════════
function renderCases() {
    const search = document.getElementById('searchCases')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterCaseStatus')?.value || '';
    const typeFilter = document.getElementById('filterCaseType')?.value || '';
    
    const filtered = db.cases.filter(c => {
        if (search && !JSON.stringify(c).toLowerCase().includes(search)) return false;
        if (statusFilter && c.status !== statusFilter) return false;
        if (typeFilter && c.type !== typeFilter) return false;
        return true;
    }).sort((a, b) => (b.officeNo || 0) - (a.officeNo || 0));
    
    const { currentPage, itemsPerPage } = pagination.cases;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedItems = filtered.slice(startIdx, endIdx);
    
    const grid = document.getElementById('casesGrid');
    grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 content-start";

    grid.innerHTML = paginatedItems.map(c => {
        const tags = (c.tags && c.tags.trim()) ? c.tags.split(',').filter(t => t.trim()).slice(0, 2).map(t => 
            `<span class="inline-block px-1.5 py-0.5 text-[10px] rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">${t.trim()}</span>`
        ).join('') : '';
        
        return `
            <div class="card p-3 cursor-pointer hover:border-primary-500 dark:hover:border-gold-500 transition group" onclick="showCaseDetail(${c.id})">
            
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                            <i class="fas fa-user text-primary-600 dark:text-primary-400 text-sm"></i>
                        </div>
                        
                        <div>
                            <h4 class="font-bold text-gray-800 dark:text-white text-sm">${c.name}</h4>
                            <p class="text-xs text-gray-400 font-mono">${c.mobile}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1">
                        <span class="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600" title="شماره دفتر">
                            #${c.officeNo || '-'}
                        </span>
                        <span class="${c.status === 'جاری' ? 'badge-success' : 'badge-danger'} text-[10px] px-1.5 py-0.5 rounded">${c.status}</span>
                    </div>
                </div>
                
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-1 truncate font-bold">${c.title}</p>
                
                <div class="flex items-center justify-between text-[10px] text-gray-400">
                    <div class="flex items-center gap-2">
                        <span>${c.type}</span>
                        ${c.archiveNo ? `<span class="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1 rounded font-mono dir-ltr">📁 ${c.archiveNo}</span>` : ''}
                    </div>
                    <div class="flex gap-1">
                        ${c.hasProsecutor ? '<span title="دادسرا">⚖️</span>' : ''}
                        ${c.hasExecution ? '<span title="اجرای احکام">📋</span>' : ''}
                    </div>
                </div>
                
                ${tags ? `<div class="flex flex-wrap gap-1 mt-2">${tags}</div>` : ''}
                
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-dark-700">
                    <span class="text-[10px] text-gray-400 font-mono">${c.updatedAt || '-'}</span>
                    <div class="flex gap-0.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="event.stopPropagation(); editCase(${c.id})" class="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded transition" title="ویرایش">
                            <i class="fas fa-edit text-gray-400 text-xs"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deleteCase(${c.id})" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition" title="حذف">
                            <i class="fas fa-trash text-red-400 text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('') || '<div class="col-span-full text-center py-12 text-gray-400"><i class="fas fa-folder-open text-4xl mb-4"></i><p>پرونده‌ای یافت نشد</p></div>';
    
    renderPagination('casesPagination', filtered.length, currentPage, itemsPerPage, 'goToCasesPage');
}

function goToCasesPage(page) {
    pagination.cases.currentPage = page;
    renderCases();
    document.getElementById('casesGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openCaseModal(id = null) {
    document.getElementById('caseForm').reset();
    document.getElementById('caseId').value = '';
    document.getElementById('caseModalTitle').innerHTML = '<i class="fas fa-folder-plus ml-2"></i> پرونده جدید';
    document.getElementById('prosecutorFields').classList.add('hidden');
    document.getElementById('executionFields').classList.add('hidden');
    
    if (id) {
        const c = db.cases.find(x => x.id == id);
        if (c) {
            document.getElementById('caseModalTitle').innerHTML = '<i class="fas fa-edit ml-2"></i> ویرایش پرونده';
            document.getElementById('caseId').value = c.id;
            document.getElementById('caseName').value = c.name || '';
            document.getElementById('caseMobile').value = c.mobile || '';
            document.getElementById('caseNational').value = c.national || '';
            document.getElementById('caseBirth').value = c.birthDate || '';
            document.getElementById('caseAddress').value = c.address || '';
            document.getElementById('caseTitle').value = c.title || '';
            document.getElementById('caseType').value = c.type || 'حقوقی';
            document.getElementById('caseStatus').value = c.status || 'جاری';
            document.getElementById('caseBranch').value = c.branch || '';
            document.getElementById('caseArchiveNo').value = c.archiveNo || '';
            document.getElementById('caseOpponent').value = c.opponent || '';
            document.getElementById('caseContract').value = c.contract || '';
            document.getElementById('casePrice').value = formatNumber(c.totalPrice || '');
            
            document.getElementById('caseHasProsecutor').checked = c.hasProsecutor || false;
            document.getElementById('caseProsecutorBranch').value = c.prosecutorBranch || '';
            document.getElementById('caseProsecutorArchive').value = c.prosecutorArchive || '';
            if (c.hasProsecutor) document.getElementById('prosecutorFields').classList.remove('hidden');
            
            document.getElementById('caseHasExecution').checked = c.hasExecution || false;
            document.getElementById('caseExecutionBranch').value = c.executionBranch || '';
            document.getElementById('caseExecutionArchive').value = c.executionArchive || '';
            if (c.hasExecution) document.getElementById('executionFields').classList.remove('hidden');
            
            document.getElementById('caseTags').value = c.tags || '';
            document.getElementById('caseNotes').value = c.notes || '';
        }
    }
    
    openModal('caseModal');
}

function editCase(id) {
    openCaseModal(id);
}

async function saveCase(e) {
    e.preventDefault();
    
    const id = document.getElementById('caseId').value;
    
    let officeNo;
    if (id) {
        const existingCase = db.cases.find(c => c.id == id);
        officeNo = existingCase ? (existingCase.officeNo || '-') : '-';
    } else {
        const maxNo = db.cases.reduce((max, c) => Math.max(max, parseInt(c.officeNo || 0)), 0);
        officeNo = maxNo + 1;
    }

    const rawPrice = convertToEnglishNumbers(document.getElementById('casePrice').value);
    const cleanPrice = parseFormattedNumber(rawPrice);

    const item = {
        id: id || Date.now(),
        officeNo: officeNo,
        name: document.getElementById('caseName').value,
        mobile: convertToEnglishNumbers(document.getElementById('caseMobile').value),
        national: convertToEnglishNumbers(document.getElementById('caseNational').value),
        birthDate: convertToEnglishNumbers(document.getElementById('caseBirth').value),

        address: document.getElementById('caseAddress').value,
        title: document.getElementById('caseTitle').value,
        type: document.getElementById('caseType').value,
        status: document.getElementById('caseStatus').value,
        branch: document.getElementById('caseBranch').value,
        archiveNo: convertToEnglishNumbers(document.getElementById('caseArchiveNo').value),
        opponent: document.getElementById('caseOpponent').value,
        
        contract: convertToEnglishNumbers(document.getElementById('caseContract').value),
        totalPrice: cleanPrice,
        
        hasProsecutor: document.getElementById('caseHasProsecutor').checked,
        prosecutorBranch: document.getElementById('caseProsecutorBranch').value,
        prosecutorArchive: convertToEnglishNumbers(document.getElementById('caseProsecutorArchive').value),
        
        hasExecution: document.getElementById('caseHasExecution').checked,
        executionBranch: document.getElementById('caseExecutionBranch').value,
        executionArchive: convertToEnglishNumbers(document.getElementById('caseExecutionArchive').value),
        
        tags: document.getElementById('caseTags').value,
        notes: document.getElementById('caseNotes').value,
        updatedAt: new Date().toLocaleDateString('fa-IR')
    };
    
    if (id) {
        const idx = db.cases.findIndex(c => c.id == id);
        if (idx >= 0) db.cases[idx] = item;
    } else {
        db.cases.unshift(item);
    }
    
    closeModal('caseModal');
    refreshAll();
    await saveData('cases', item);
    
    Swal.fire({ icon: 'success', title: `ذخیره شد | شماره دفتر: ${officeNo}`, timer: 2000, showConfirmButton: false });
}

async function deleteCase(id) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'حذف پرونده',
        text: 'آیا مطمئن هستید؟',
        showCancelButton: true,
        confirmButtonText: 'بله، حذف شود',
        cancelButtonText: 'انصراف',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        db.cases = db.cases.filter(c => c.id != id);
        refreshAll();
        await saveData();
    }
}

function showCaseDetail(id) {
    const c = db.cases.find(x => x.id == id);
    if (!c) return;
    
    const tags = c.tags ? c.tags.split(',').filter(Boolean).map(t => 
        `<span class="tag">${t.trim()}</span>`
    ).join('') : '<span class="text-gray-400">-</span>';
    
    // Calculate finances
    const finances = db.finance.filter(f => f.caseId == id);
    const income = finances.filter(f => f.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = finances.filter(f => f.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const totalPrice = parseFormattedNumber(c.totalPrice || 0);
    const debt = totalPrice - income;
    
    // Check if this person has multiple cases
    const personCases = db.cases.filter(cs => cs.name === c.name);
    let multiCaseInfo = '';
    if (personCases.length > 1) {
        const totalDebtAllCases = personCases.reduce((sum, cs) => {
            const caseIncome = db.finance.filter(f => f.caseId == cs.id && f.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
            const casePrice = parseFormattedNumber(cs.totalPrice || 0);
            return sum + (casePrice - caseIncome);
        }, 0);
        
        multiCaseInfo = `
            <div class="col-span-full bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900/30">
                <p class="text-sm text-amber-800 dark:text-amber-300 mb-2">
                    <i class="fas fa-info-circle ml-1"></i>
                    این شخص ${personCases.length} پرونده دارد
                </p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-amber-700 dark:text-amber-400">بدهی کل از همه پرونده‌ها:</span>
                    <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono" dir="ltr">${formatNumber(totalDebtAllCases)} تومان</span>
                </div>
            </div>
        `;
    }
    
    document.getElementById('caseDetailContent').innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-gray-100 dark:border-dark-800">
            <div class="col-span-2 md:col-span-1">
                <p class="text-xs text-gray-400 mb-1">موکل</p>
                <p class="font-bold text-xl text-gray-800 dark:text-white">${c.name}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">تماس</p>
                <p class="font-mono">${c.mobile}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">کد ملی</p>
                <p class="font-mono">${c.national || '-'}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">تولد</p>
                <p class="font-mono">${c.birthDate || '-'}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-gray-100 dark:border-dark-800">
            <div class="col-span-2">
                <p class="text-xs text-gray-400 mb-1">عنوان پرونده</p>
                <p class="font-bold text-primary-600 dark:text-gold-500">${c.title}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">نوع</p>
                <p>${c.type}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">وضعیت</p>
                <span class="${c.status === 'جاری' ? 'badge-success' : 'badge-danger'} px-3 py-1 rounded">${c.status}</span>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">شعبه</p>
                <p>${c.branch || '-'}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">طرف دعوی</p>
                <p>${c.opponent || '-'}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">شماره قرارداد</p>
                <p class="font-mono bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded inline-block">${c.contract || '-'}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 mb-1">آدرس</p>
                <p class="text-sm">${c.address || '-'}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-dark-800">
            <div class="card p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">حق‌الوکاله</p>
                <p class="font-mono font-bold text-blue-600" dir="ltr">${formatNumber(totalPrice)}</p>
            </div>
            <div class="card p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">دریافتی</p>
                <p class="font-mono font-bold text-emerald-600" dir="ltr">${formatNumber(income)}</p>
            </div>
            <div class="card p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">هزینه</p>
                <p class="font-mono font-bold text-red-600" dir="ltr">${formatNumber(expense)}</p>
            </div>
            <div class="card p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">بدهی این پرونده</p>
                <p class="font-mono font-bold ${debt > 0 ? 'text-orange-600' : 'text-emerald-600'}" dir="ltr">${formatNumber(debt)}</p>
            </div>
            ${multiCaseInfo}
        </div>
        
        <div class="mb-6">
            <p class="text-xs text-gray-400 mb-2">تگ‌ها</p>
            <div class="flex flex-wrap gap-2">${tags}</div>
        </div>
        
        <div>
            <p class="text-xs text-gray-400 mb-2">یادداشت</p>
            <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${c.notes || 'یادداشتی ثبت نشده'}</p>
            </div>
        </div>
    `;
    
    openModal('caseDetailModal');
}

// ═══════════════════════════════════════════════════
// Schedule
// ═══════════════════════════════════════════════════
function renderSchedule() {
    const search = document.getElementById('searchSchedule')?.value.toLowerCase() || '';
    const labelFilter = document.getElementById('filterScheduleLabel')?.value || '';
    const today = getTodayPersian();
    
    const filtered = db.schedule.filter(s => {
        if (search && !JSON.stringify(s).toLowerCase().includes(search)) return false;
        if (labelFilter && s.label !== labelFilter) return false;
        return true;
    }).sort((a, b) => {
        const dateCompare = comparePersianDates(a.date, b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.time || '').localeCompare(b.time || '');
    });
    
    const todayItems = filtered.filter(s => comparePersianDates(s.date, today) === 0);
    const upcomingItems = filtered.filter(s => {
        const daysUntil = getDaysUntil(s.date);
        return daysUntil > 0 && daysUntil <= 30;
    });
    const pastItems = filtered.filter(s => comparePersianDates(s.date, today) < 0).reverse();
    
    const totalUpcoming = filtered.filter(s => getDaysUntil(s.date) > 0).length;
    const thisWeek = filtered.filter(s => {
        const d = getDaysUntil(s.date);
        return d >= 0 && d <= 7;
    }).length;
    
    document.getElementById('scheduleSummary').innerHTML = `
        <div class="flex items-center gap-4 text-xs mb-4">
            <span class="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                📅 این هفته: <b>${thisWeek}</b>
            </span>
            <span class="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded">
                📊 کل آینده: <b>${totalUpcoming}</b>
            </span>
        </div>
    `;
    
    document.getElementById('todayScheduleList').innerHTML = renderScheduleItems(todayItems, 'today');
    
    // Pagination for upcoming
    const { currentPage, itemsPerPage } = pagination.schedule;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedUpcoming = upcomingItems.slice(startIdx, endIdx);
    
    document.getElementById('upcomingScheduleList').innerHTML = renderScheduleItems(paginatedUpcoming, 'upcoming');
    renderPagination('schedulePagination', upcomingItems.length, currentPage, itemsPerPage, 'goToSchedulePage');
    
    document.getElementById('pastScheduleList').innerHTML = renderScheduleItems(pastItems.slice(0, 10), 'past');
}

function goToSchedulePage(page) {
    pagination.schedule.currentPage = page;
    renderSchedule();
    document.getElementById('upcomingScheduleList').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderScheduleItems(items, type) {
    if (!items.length) {
        return `<p class="text-center text-gray-400 py-4">${type === 'today' ? 'برنامه‌ای برای امروز نیست' : 'موردی نیست'}</p>`;
    }
    
    return items.map((s, i) => {
        const cs = s.caseId ? db.cases.find(c => c.id == s.caseId) : null;
        const labelColors = {
            'جلسه': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'دادگاه': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'تنظیم': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'پیگیری': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        };
        
        const idx = db.schedule.indexOf(s);
        const today = getTodayPersian();
        const daysLeft = getDaysUntil(s.date);
        const dayName = getPersianDayName(s.date);
        
        let daysLeftText = '';
        let daysLeftClass = '';
        if (daysLeft === 0) {
            daysLeftText = '📍 امروز';
            daysLeftClass = 'text-red-600 dark:text-red-400 font-bold';
        } else if (daysLeft === 1) {
            daysLeftText = '⏰ فردا';
            daysLeftClass = 'text-orange-600 dark:text-orange-400 font-bold';
        } else if (daysLeft > 0) {
            daysLeftText = `${daysLeft} روز مانده`;
            daysLeftClass = 'text-emerald-600 dark:text-emerald-400';
        } else {
            daysLeftText = `${Math.abs(daysLeft)} روز قبل`;
            daysLeftClass = 'text-gray-400';
        }
        
        const gDate = shamsiToMiladi(s.date);
        let googleLink = '#';
        if (gDate) {
            const pad = (n) => n < 10 ? '0' + n : n;
            const timeParts = s.time ? s.time.split(':') : ['09', '00'];
            gDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
            const startISO = gDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
            gDate.setHours(gDate.getHours() + 1);
            const endISO = gDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
            
            const title = encodeURIComponent(`وکیل‌یار: ${s.client || 'جلسه'} - ${s.label || ''}`);
            const details = encodeURIComponent(`${s.desc || ''}\n\nپرونده: ${cs ? cs.name : '-'}`);
            
            googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}`;
        }
        return `
            <div class="card p-3 ${s.is_done ? 'opacity-50' : ''} transition group">
                <div class="flex items-start gap-3">
                    <label class="cursor-pointer mt-1">
                        <input type="checkbox" class="hidden" onchange="toggleScheduleDone(${idx})" ${s.is_done ? 'checked' : ''}>
                        <div class="w-5 h-5 rounded-full border-2 ${s.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center transition">
                            ${s.is_done ? '<i class="fas fa-check text-white text-[10px]"></i>' : ''}
                        </div>
                    </label>
                    
                    <div class="flex-1 min-w-0 cursor-pointer" onclick="openScheduleModal(${idx})">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-gray-800 dark:text-white text-sm ${s.is_done ? 'line-through' : ''}">${s.client || 'بدون نام'}</h4>
                            ${s.label ? `<span class="${labelColors[s.label] || 'bg-gray-100 text-gray-700'} text-[10px] px-1.5 py-0.5 rounded">${s.label}</span>` : ''}
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">${s.desc || '-'}</p>
                        ${cs ? `<p class="text-[10px] text-primary-600 dark:text-gold-500"><i class="fas fa-folder ml-1"></i> ${cs.name} ${cs.archiveNo ? '| 📁' + cs.archiveNo : ''}</p>` : ''}
                        ${s.result ? `<p class="text-[10px] text-emerald-600 mt-1"><i class="fas fa-check-double ml-1"></i> ${s.result}</p>` : ''}
                    </div>
                    
                    <div class="text-left shrink-0">
                        <p class="text-xs font-bold text-gray-800 dark:text-white">${s.date}</p>
                        <p class="text-[10px] text-gray-400">${dayName} - ${s.time}</p>
                        <p class="text-[10px] ${daysLeftClass}">${daysLeftText}</p>
                    </div>
                    <a href="${googleLink}" target="_blank" onclick="event.stopPropagation()" class="p-1 opacity-0 group-hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition mr-1" title="افزودن به گوگل">
                        <i class="fab fa-google text-blue-500 text-xs"></i>
                    </a>
                    <button onclick="event.stopPropagation(); deleteSchedule(${idx})" class="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                        <i class="fas fa-trash text-red-400 text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function togglePastSchedule() {
    const list = document.getElementById('pastScheduleList');
    const icon = document.getElementById('pastScheduleIcon');
    list.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

function suggestClients(input) {
    const val = input.value.toLowerCase();
    const box = document.getElementById('clientSuggestions');
    
    if (val.length < 1) {
        box.classList.add('hidden');
        return;
    }
    
    const clients = [...new Set(db.cases.map(c => c.name))];
    const matches = clients.filter(n => n.toLowerCase().includes(val));
    
    if (matches.length) {
        box.innerHTML = matches.map(name => `
            <div class="p-3 hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer text-sm" onclick="selectClient('${name}')">${name}</div>
        `).join('');
        box.classList.remove('hidden');
    } else {
        box.classList.add('hidden');
    }
}

function selectClient(name) {
    document.getElementById('scheduleClient').value = name;
    document.getElementById('clientSuggestions').classList.add('hidden');
}

function openScheduleModal(idx = null) {
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleId').value = '';
    document.getElementById('scheduleDate').value = new Date().toLocaleDateString('fa-IR');
    document.getElementById('scheduleModalTitle').innerHTML = '<i class="fas fa-calendar-plus ml-2"></i> برنامه جدید';
    updateCaseSelects();
    
    if (idx !== null && db.schedule[idx]) {
        const s = db.schedule[idx];
        document.getElementById('scheduleModalTitle').innerHTML = '<i class="fas fa-edit ml-2"></i> ویرایش برنامه';
        document.getElementById('scheduleId').value = idx;
        document.getElementById('scheduleDate').value = s.date || '';
        document.getElementById('scheduleTime').value = s.time || '';
        document.getElementById('scheduleClient').value = s.client || '';
        document.getElementById('scheduleCaseId').value = s.caseId || '';
        document.getElementById('scheduleLabel').value = s.label || '';
        document.getElementById('scheduleDesc').value = s.desc || '';
        document.getElementById('scheduleResult').value = s.result || '';
    }
    
    openModal('scheduleModal');
}

async function saveSchedule(e) {
    e.preventDefault();
    
    const idx = document.getElementById('scheduleId').value;
    const item = {
        id: idx !== '' ? db.schedule[idx].id : Date.now(),
        date: convertToEnglishNumbers(document.getElementById('scheduleDate').value),
        time: document.getElementById('scheduleTime').value,
        client: document.getElementById('scheduleClient').value,
        caseId: document.getElementById('scheduleCaseId').value,
        label: document.getElementById('scheduleLabel').value,
        desc: document.getElementById('scheduleDesc').value,
        result: document.getElementById('scheduleResult').value,
        is_done: idx !== '' ? db.schedule[idx].is_done : false
    };
    
    if (item.caseId) {
        const cs = db.cases.find(c => c.id == item.caseId);
        if (cs) item.caseName = cs.name;
    }
    
    if (idx !== '') {
        db.schedule[idx] = item;
    } else {
        db.schedule.push(item);
    }
    
    closeModal('scheduleModal');
    refreshAll();
    await saveData('schedule', item);
    
    Swal.fire({ icon: 'success', title: 'ذخیره شد', timer: 1500, showConfirmButton: false });
}

async function toggleScheduleDone(idx) {
    db.schedule[idx].is_done = !db.schedule[idx].is_done;
    refreshAll();
    await saveData('schedule', db.schedule[idx]);
}

async function deleteSchedule(idx) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'حذف برنامه',
        text: 'آیا مطمئن هستید؟',
        showCancelButton: true,
        confirmButtonText: 'بله',
        cancelButtonText: 'خیر',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        db.schedule.splice(idx, 1);
        refreshAll();
        await saveData();
    }
}

// ═══════════════════════════════════════════════════
// Finance
// ═══════════════════════════════════════════════════
function renderFinance() {
    const search = document.getElementById('searchFinance')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('filterFinanceType')?.value || '';
    const dateFrom = convertToEnglishNumbers(document.getElementById('filterDateFrom')?.value || '');
    const dateTo = convertToEnglishNumbers(document.getElementById('filterDateTo')?.value || '');
    
    const filtered = db.finance.filter(f => {
        if (search && !JSON.stringify(f).toLowerCase().includes(search)) return false;
        if (typeFilter && f.type !== typeFilter) return false;
        
        // Date range filter
        if (dateFrom && comparePersianDates(f.date, dateFrom) < 0) return false;
        if (dateTo && comparePersianDates(f.date, dateTo) > 0) return false;
        
        return true;
    });
    
    // Totals
    const income = filtered.filter(f => f.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = filtered.filter(f => f.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    
    document.getElementById('totalIncome').textContent = formatNumber(income);
    document.getElementById('totalExpense').textContent = formatNumber(expense);
    document.getElementById('totalBalance').textContent = formatNumber(income - expense);
    
    // Pagination
    const { currentPage, itemsPerPage } = pagination.finance;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedItems = filtered.slice(startIdx, endIdx);
    
    // Table
    document.getElementById('financeTableBody').innerHTML = paginatedItems.map((f, i) => {
        const cs = db.cases.find(c => c.id == f.caseId);
        const idx = db.finance.indexOf(f);
        
        return `
            <tr class="table-row">
                <td class="p-4 font-mono text-sm text-gray-500">${f.date}</td>
                <td class="p-4">
                    ${cs ? `<span class="font-medium text-gray-700 dark:text-gray-300">${cs.name}</span>` : '<span class="text-gray-400">بدون پرونده</span>'}
                </td>
                <td class="p-4">
                    <span class="${f.type === 'income' ? 'badge-success' : 'badge-danger'} px-2 py-1 rounded text-xs font-medium">
                        ${f.type === 'income' ? 'دریافت' : 'هزینه'}
                    </span>
                </td>
                <td class="p-4 font-mono font-bold ${f.type === 'income' ? 'text-emerald-600' : 'text-red-600'}" dir="ltr">
                    ${formatNumber(f.amount)}
                </td>
                <td class="p-4 text-sm text-gray-500 max-w-[200px] truncate">${f.desc || '-'}</td>
                <td class="p-4 text-center">
                    <button onclick="editFinance(${idx})" class="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition">
                        <i class="fas fa-edit text-gray-400"></i>
                    </button>
                    <button onclick="deleteFinance(${idx})" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                        <i class="fas fa-trash text-red-400"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6" class="p-8 text-center text-gray-400">تراکنشی یافت نشد</td></tr>';
    
    renderPagination('financePagination', filtered.length, currentPage, itemsPerPage, 'goToFinancePage');
}

function goToFinancePage(page) {
    pagination.finance.currentPage = page;
    renderFinance();
    document.getElementById('financeTableBody').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearDateFilters() {
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    renderFinance();
}

function searchCasesForFinance(input) {
    const val = input.value.toLowerCase();
    const select = document.getElementById('financeCaseId');
    const options = select.querySelectorAll('option');
    
    options.forEach(opt => {
        if (opt.value === '' || opt.textContent.toLowerCase().includes(val)) {
            opt.style.display = '';
        } else {
            opt.style.display = 'none';
        }
    });
}

function openFinanceModal(idx = null) {
    document.getElementById('financeForm').reset();
    document.getElementById('financeId').value = '';
    document.getElementById('financeDate').value = new Date().toLocaleDateString('fa-IR');
    document.getElementById('financeModalTitle').innerHTML = '<i class="fas fa-money-bill-wave ml-2"></i> تراکنش جدید';
    updateCaseSelects();
    
    if (idx !== null && db.finance[idx]) {
        const f = db.finance[idx];
        document.getElementById('financeModalTitle').innerHTML = '<i class="fas fa-edit ml-2"></i> ویرایش تراکنش';
        document.getElementById('financeId').value = idx;
        document.getElementById('financeCaseId').value = f.caseId || '';
        document.getElementById('financeType').value = f.type || 'income';
        document.getElementById('financeDate').value = f.date || '';
        document.getElementById('financeAmount').value = formatNumber(f.amount || '');
        document.getElementById('financeDesc').value = f.desc || '';
    }
    
    openModal('financeModal');
}

function editFinance(idx) {
    openFinanceModal(idx);
}

async function saveFinance(e) {
    e.preventDefault();
    
    const idx = document.getElementById('financeId').value;
    const rawAmount = convertToEnglishNumbers(document.getElementById('financeAmount').value);
    const cleanAmount = parseFormattedNumber(rawAmount);
    
    const item = {
        id: idx !== '' ? db.finance[idx].id : Date.now(),
        caseId: document.getElementById('financeCaseId').value,
        type: document.getElementById('financeType').value,
        date: convertToEnglishNumbers(document.getElementById('financeDate').value),
        amount: cleanAmount,
        desc: document.getElementById('financeDesc').value
    };
    
    if (item.caseId) {
        const cs = db.cases.find(c => c.id == item.caseId);
        if (cs) item.caseName = cs.name;
    }
    
    if (idx !== '') {
        db.finance[idx] = item;
    } else {
        db.finance.unshift(item);
    }
    
    closeModal('financeModal');
    refreshAll();
    await saveData('finance', item);
    
    Swal.fire({ icon: 'success', title: 'ذخیره شد', timer: 1500, showConfirmButton: false });
}

async function deleteFinance(idx) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'حذف تراکنش',
        text: 'آیا مطمئن هستید؟',
        showCancelButton: true,
        confirmButtonText: 'بله',
        cancelButtonText: 'خیر',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        db.finance.splice(idx, 1);
        refreshAll();
        await saveData();
    }
}

// ═══════════════════════════════════════════════════
// Debtors
// ═══════════════════════════════════════════════════
let allDebtors = [];

function openDebtorsModal() {
    calculateDebtors();
    renderDebtors();
    openModal('debtorsModal');
}

function calculateDebtors() {
    allDebtors = [];
    let totalAllDebt = 0;
    
    db.cases.forEach(c => {
        const contractAmount = parseInt(c.totalPrice) || 0;
        if (contractAmount === 0) return;
        
        const paidAmount = db.finance
            .filter(f => f.caseId == c.id && f.type === 'income')
            .reduce((sum, f) => {
                const amount = parseInt(convertToEnglishNumbers(f.amount).replace(/,/g, '')) || 0;
                return sum + amount;
            }, 0);
            
        const debt = contractAmount - paidAmount;
        
        if (debt > 0) {
            allDebtors.push({
                id: c.id,
                name: c.name,
                title: c.title,
                contract: contractAmount,
                paid: paidAmount,
                debt: debt,
                mobile: c.mobile
            });
            totalAllDebt += debt;
        }
    });
    
    allDebtors.sort((a, b) => b.debt - a.debt);
    document.getElementById('totalDebtAmount').innerText = formatNumber(totalAllDebt) + ' تومان';
}

function renderDebtors() {
    const search = document.getElementById('searchDebtors')?.value.toLowerCase() || '';
    
    const filtered = allDebtors.filter(d => {
        if (search && !JSON.stringify(d).toLowerCase().includes(search)) return false;
        return true;
    });
    
    const { currentPage, itemsPerPage } = pagination.debtors;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedItems = filtered.slice(startIdx, endIdx);
    
    let debtorsHTML = '';
    
    if (paginatedItems.length === 0) {
        debtorsHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-check-circle text-4xl mb-3 text-emerald-500"></i>
                <p>هیچ بدهکاری یافت نشد${search ? ' با این جستجو' : '. تمام حساب‌ها تسویه شده‌اند'}!</p>
            </div>
        `;
    } else {
        debtorsHTML = paginatedItems.map(d => {
            const percent = Math.min(100, Math.round((d.paid / d.contract) * 100));
            
            return `
            <div class="card p-4 border-r-4 border-r-orange-500 hover:bg-gray-50 dark:hover:bg-dark-800 transition">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-gray-800 dark:text-white">${d.name}</h4>
                        <p class="text-xs text-gray-500">${d.title}</p>
                    </div>
                    <div class="text-left">
                        <p class="text-xs text-gray-400 mb-1">مانده بدهی</p>
                        <p class="font-bold text-lg text-orange-600 dark:text-orange-400 font-mono">${formatNumber(d.debt)}</p>
                    </div>
                </div>
                
                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>کل قرارداد: ${formatNumber(d.contract)}</span>
                    <span>پرداخت شده: ${formatNumber(d.paid)}</span>
                </div>
                
                <div class="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 overflow-hidden">
                    <div class="bg-emerald-500 h-2 rounded-full" style="width: ${percent}%"></div>
                </div>
                <div class="mt-3 flex justify-end">
                    <a href="tel:${d.mobile}" class="text-xs flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                        <i class="fas fa-phone"></i> پیگیری
                    </a>
                </div>
            </div>
            `;
        }).join('');
    }
    
    document.getElementById('debtorsListContent').innerHTML = debtorsHTML;
    renderPagination('debtorsPagination', filtered.length, currentPage, itemsPerPage, 'goToDebtorsPage');
}

function goToDebtorsPage(page) {
    pagination.debtors.currentPage = page;
    renderDebtors();
}

// ═══════════════════════════════════════════════════
// Library
// ═══════════════════════════════════════════════════
function renderLibrary() {
    const search = document.getElementById('searchLibrary')?.value.toLowerCase() || '';
    
    const filtered = db.library.filter(l => {
        if (search && !l.title.toLowerCase().includes(search) && !(l.content || '').toLowerCase().includes(search)) return false;
        return true;
    });
    
    document.getElementById('libraryList').innerHTML = filtered.map(l => `
        <div onclick="viewLibrary(${l.id})" class="p-4 rounded-xl cursor-pointer transition border ${currentLibraryId == l.id ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-gold-500' : 'bg-gray-50 dark:bg-dark-800 border-transparent hover:border-gray-200 dark:hover:border-dark-700'}">
            <div class="flex items-start justify-between mb-2">
                <h4 class="font-bold text-gray-800 dark:text-white text-sm">${l.title}</h4>
                <span class="tag text-xs">${l.type}</span>
            </div>
            <p class="text-xs text-gray-400 line-clamp-2">${(l.content || '').substring(0, 100)}...</p>
        </div>
    `).join('') || '<p class="text-center text-gray-400 py-8">متنی یافت نشد</p>';
}

function viewLibrary(id) {
    const l = db.library.find(x => x.id == id);
    if (!l) return;
    
    currentLibraryId = id;
    
    document.getElementById('libraryEmpty').classList.add('hidden');
    document.getElementById('libraryContent').classList.remove('hidden');
    
    document.getElementById('libraryViewTitle').textContent = l.title;
    document.getElementById('libraryViewType').textContent = l.type;
    document.getElementById('libraryViewContent').textContent = l.content || '';
    
    renderLibrary();
}

function openLibraryModal(id = null) {
    document.getElementById('libraryForm').reset();
    document.getElementById('libraryId').value = '';
    document.getElementById('libraryModalTitle').innerHTML = '<i class="fas fa-file-alt ml-2"></i> متن جدید';
    
    if (id) {
        const l = db.library.find(x => x.id == id);
        if (l) {
            document.getElementById('libraryModalTitle').innerHTML = '<i class="fas fa-edit ml-2"></i> ویرایش متن';
            document.getElementById('libraryId').value = l.id;
            document.getElementById('libraryTitle').value = l.title || '';
            document.getElementById('libraryType').value = l.type || 'لایحه';
            document.getElementById('libraryInputText').value = l.content || ''; 
        }
    }
    
    openModal('libraryModal');
}

function editLibrary() {
    if (currentLibraryId) {
        openLibraryModal(currentLibraryId);
    }
}

async function saveLibrary(e) {
    e.preventDefault();
    
    const id = document.getElementById('libraryId').value;
    const item = {
        id: id || Date.now(),
        title: document.getElementById('libraryTitle').value,
        type: document.getElementById('libraryType').value,
        content: document.getElementById('libraryInputText').value 
    };
    
    if (id) {
        const idx = db.library.findIndex(l => l.id == id);
        if (idx >= 0) db.library[idx] = item;
    } else {
        db.library.unshift(item);
    }
    
    closeModal('libraryModal');
    currentLibraryId = item.id;
    refreshAll();
    viewLibrary(item.id);
    await saveData('library', item);
    
    Swal.fire({ icon: 'success', title: 'ذخیره شد', timer: 1500, showConfirmButton: false });
}

async function deleteLibrary() {
    if (!currentLibraryId) return;
    
    const result = await Swal.fire({
        icon: 'warning',
        title: 'حذف متن',
        text: 'آیا مطمئن هستید؟',
        showCancelButton: true,
        confirmButtonText: 'بله',
        cancelButtonText: 'خیر',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        db.library = db.library.filter(l => l.id != currentLibraryId);
        currentLibraryId = null;
        
        document.getElementById('libraryEmpty').classList.remove('hidden');
        document.getElementById('libraryContent').classList.add('hidden');
        
        refreshAll();
        await saveData();
    }
}

async function copyLibraryContent() {
    const content = document.getElementById('libraryViewContent').textContent;
    await navigator.clipboard.writeText(content);
    
    Swal.fire({
        icon: 'success',
        title: 'کپی شد!',
        timer: 1000,
        showConfirmButton: false,
        position: 'bottom-end',
        toast: true
    });
}

// ═══════════════════════════════════════════════════
// Modal Functions
// ═══════════════════════════════════════════════════
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalOnOverlay(event, id) {
    if (event.target === event.currentTarget) {
        closeModal(id);
    }
}

function openQuickAdd() {
    openModal('quickAddModal');
}

// ═══════════════════════════════════════════════════
// Navigation & Theme
// ═══════════════════════════════════════════════════
function setView(view, element = null) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + view).classList.remove('hidden');
    
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            if (item.textContent.includes(getViewTitle(view))) {
                item.classList.add('active');
            }
        });
    }
    
    document.getElementById('pageTitle').textContent = getViewTitle(view);
    closeSidebar();
}

function getViewTitle(view) {
    const titles = {
        'dashboard': 'داشبورد',
        'cases': 'پرونده‌ها',
        'schedule': 'تقویم کاری',
        'finance': 'امور مالی',
        'library': 'بانک لوایح'
    };
    return titles[view] || view;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth < 1024) {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (charts.cases || charts.finance) {
        updateChartsTheme();
    }
}

function updateChartsTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';
    
    if (charts.cases) {
        charts.cases.options.plugins.legend.labels.color = textColor;
        charts.cases.update();
    }
    
    if (charts.finance) {
        charts.finance.options.plugins.legend.labels.color = textColor;
        charts.finance.options.scales.x.grid.color = gridColor;
        charts.finance.options.scales.x.ticks.color = textColor;
        charts.finance.options.scales.y.grid.color = gridColor;
        charts.finance.options.scales.y.ticks.color = textColor;
        charts.finance.update();
    }
}

// ═══════════════════════════════════════════════════
// Backup & Restore
// ═══════════════════════════════════════════════════
function downloadBackup() {
    const dataStr = JSON.stringify(db, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    Swal.fire({
        icon: 'success',
        title: 'بک‌آپ دانلود شد',
        timer: 2000,
        showConfirmButton: false
    });
}

async function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const result = await Swal.fire({
        icon: 'warning',
        title: 'بازگردانی بک‌آپ',
        text: 'تمام داده‌های فعلی جایگزین می‌شوند. آیا مطمئن هستید؟',
        showCancelButton: true,
        confirmButtonText: 'بله، بازگردانی شود',
        cancelButtonText: 'انصراف',
        confirmButtonColor: '#ef4444'
    });
    
    if (!result.isConfirmed) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const restored = JSON.parse(e.target.result);
            if (restored.cases && restored.finance && restored.library && restored.schedule) {
                db = restored;
                await saveData();
                refreshAll();
                Swal.fire({
                    icon: 'success',
                    title: 'بازگردانی موفق',
                    text: 'داده‌ها با موفقیت بازگردانی شدند',
                    confirmButtonText: 'باشه'
                });
            } else {
                throw new Error('فرمت فایل نامعتبر است');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'خطا',
                text: 'فایل بک‌آپ معتبر نیست',
                confirmButtonText: 'باشه'
            });
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

// ═══════════════════════════════════════════════════
// Sync to Google Sheets
// ═══════════════════════════════════════════════════
async function syncAllToGoogleSheet() {
    const result = await Swal.fire({
        icon: 'question',
        title: 'ارسال به گوگل شیت',
        text: 'تمام داده‌ها به گوگل شیت ارسال می‌شوند. ادامه می‌دهید؟',
        showCancelButton: true,
        confirmButtonText: 'بله، ارسال شود',
        cancelButtonText: 'انصراف'
    });
    
    if (!result.isConfirmed) return;
    
    Swal.fire({
        title: 'در حال ارسال...',
        text: 'لطفاً صبر کنید',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        let successCount = 0;
        
        for (const caseItem of db.cases) {
            await saveData('cases', caseItem);
            successCount++;
        }
        
        for (const financeItem of db.finance) {
            await saveData('finance', financeItem);
            successCount++;
        }
        
        for (const scheduleItem of db.schedule) {
            await saveData('schedule', scheduleItem);
            successCount++;
        }
        
        for (const libraryItem of db.library) {
            await saveData('library', libraryItem);
            successCount++;
        }
        
        Swal.fire({
            icon: 'success',
            title: 'ارسال موفق',
            text: `${successCount} مورد به گوگل شیت ارسال شد`,
            confirmButtonText: 'عالی'
        });
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'خطا در ارسال',
            text: 'لطفاً اتصال اینترنت و تنظیمات گوگل شیت را بررسی کنید',
            confirmButtonText: 'باشه'
        });
    }
}

async function testGoogleSheetConnection() {
    try {
        const res = await fetch('api.php?action=test_google');
        const data = await res.json();
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'متصل است! ✅',
                text: 'اتصال به گوگل شیت برقرار است',
                confirmButtonText: 'عالی'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'متصل نیست ❌',
                text: data.message || 'مشکل در اتصال به گوگل شیت',
                confirmButtonText: 'باشه'
            });
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'خطا',
            text: 'مشکل در ارتباط با سرور',
            confirmButtonText: 'باشه'
        });
    }
}

// ═══════════════════════════════════════════════════
// Logout
// ═══════════════════════════════════════════════════
async function logout() {
    const result = await Swal.fire({
        icon: 'question',
        title: 'خروج از سیستم',
        text: 'آیا می‌خواهید خارج شوید؟',
        showCancelButton: true,
        confirmButtonText: 'بله، خروج',
        cancelButtonText: 'انصراف'
    });
    
    if (result.isConfirmed) {
        await fetch('api.php?action=logout');
        location.reload();
    }
}

// ═══════════════════════════════════════════════════
// Keyboard Shortcuts
// ═══════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
    
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        openQuickAdd();
    }
});

// ═══════════════════════════════════════════════════
// Responsive Handler
// ═══════════════════════════════════════════════════
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        document.getElementById('sidebar').classList.remove('translate-x-full');
        document.getElementById('sidebarOverlay').classList.add('hidden');
    }
});

// ═══════════════════════════════════════════════════
// تبدیل خودکار اعداد در inputها
// ═══════════════════════════════════════════════════
document.addEventListener('input', function(e) {
    const target = e.target;
    
    if (target.id === 'scheduleDate' || 
        target.id === 'financeDate' || 
        target.id === 'caseBirth' ||
        target.id === 'caseNational' ||
        target.id === 'caseMobile' ||
        target.id === 'caseContract' ||
        target.id === 'filterDateFrom' ||
        target.id === 'filterDateTo') {
        
        const start = target.selectionStart;
        const end = target.selectionEnd;
        target.value = convertToEnglishNumbers(target.value);
        target.setSelectionRange(start, end);
    }
    
    // جداکننده هزارگان برای فیلدهای مبلغ
    if (target.id === 'financeAmount' || target.id === 'casePrice') {
        const start = target.selectionStart;
        let val = target.value.replace(/,/g, '');
        val = convertToEnglishNumbers(val).replace(/[^\d]/g, '');
        
        if (val) {
            val = formatNumber(val);
        }
        target.value = val;
        
        // Adjust cursor position after formatting
        const diff = val.length - target.value.length;
        target.setSelectionRange(start + diff, start + diff);
    }
});

// ═══════════════════════════════════════════════════
// مقایسه تاریخ شمسی
// ═══════════════════════════════════════════════════
function comparePersianDates(date1, date2) {
    const d1 = convertToEnglishNumbers(date1 || '');
    const d2 = convertToEnglishNumbers(date2 || '');
    
    const normalize = (d) => {
        const parts = d.split('/');
        if (parts.length !== 3) return 0;
        return parseInt(parts[0]) * 10000 + parseInt(parts[1]) * 100 + parseInt(parts[2]);
    };
    
    return normalize(d1) - normalize(d2);
}

function getTodayPersian() {
    return convertToEnglishNumbers(new Date().toLocaleDateString('fa-IR'));
}

// ═══════════════════════════════════════════════════
// Toggle Functions
// ═══════════════════════════════════════════════════
function toggleProsecutor() {
    const checked = document.getElementById('caseHasProsecutor').checked;
    document.getElementById('prosecutorFields').classList.toggle('hidden', !checked);
}

function toggleExecution() {
    const checked = document.getElementById('caseHasExecution').checked;
    document.getElementById('executionFields').classList.toggle('hidden', !checked);
}

// ═══════════════════════════════════════════════════
// توابع کمکی تاریخ
// ═══════════════════════════════════════════════════
function getDaysUntil(targetDate) {
    const today = getTodayPersian();
    const t = convertToEnglishNumbers(today).split('/').map(Number);
    const d = convertToEnglishNumbers(targetDate || '').split('/').map(Number);
    
    if (t.length !== 3 || d.length !== 3) return 0;
    
    const todayDays = t[0] * 365 + t[1] * 30 + t[2];
    const targetDays = d[0] * 365 + d[1] * 30 + d[2];
    
    return targetDays - todayDays;
}

function getPersianDayName(dateStr) {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    
    try {
        const d = convertToEnglishNumbers(dateStr || '').split('/').map(Number);
        if (d.length !== 3) return '';
        
        const gYear = d[0] + 621;
        const gMonth = d[1] <= 6 ? d[1] + 3 : d[1] - 6;
        const gDay = d[2];
        
        const date = new Date(gYear, gMonth - 1, gDay);
        return days[date.getDay()];
    } catch {
        return '';
    }
}

// ═══════════════════════════════════════════════════
// تبدیل تاریخ شمسی به میلادی
// ═══════════════════════════════════════════════════
function shamsiToMiladi(shamsiDate) {
    if(!shamsiDate) return null;
    const jalali = shamsiDate.split('/').map(Number);
    let jy = jalali[0], jm = jalali[1], jd = jalali[2];
    let gy = (jy <= 979) ? 621 : 1600;
    jy -= (jy <= 979) ? 0 : 979;
    let days = (365 * jy) + ((parseInt(jy / 33)) * 8) + parseInt(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    gy += 400 * parseInt(days / 146097);
    days %= 146097;
    if (days > 36524) {
        gy += 100 * parseInt(--days / 36524);
        days %= 36524;
        if (days >= 365) days++;
    }
    gy += 4 * parseInt((days) / 1461);
    days %= 1461;
    gy += parseInt((days - 1) / 365);
    if (days > 365) days = (days - 1) % 365;
    let gd = days + 1;
    let sal_a = [0, 31, ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm;
    for (gm = 0; gm < 13; gm++) {
        let v = sal_a[gm];
        if (gd <= v) break;
        gd -= v;
    }
    return new Date(gy, gm - 1, gd);
}

// ═══════════════════════════════════════════════════
// سیستم هوشمند اعلان‌ها
// ═══════════════════════════════════════════════════
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("مرورگر شما از اعلان‌ها پشتیبانی نمی‌کند");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

function checkReminders() {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    
    db.schedule.forEach(s => {
        if (s.is_done) return;
        
        const eventDate = shamsiToMiladi(s.date);
        if (!eventDate) return;
        
        const timeParts = s.time ? s.time.split(':') : ['09', '00'];
        eventDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
        
        const diffMs = eventDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        const id24 = `notif_24_${s.id}`;
        const id1 = `notif_1_${s.id}`;

        if (diffHours > 23 && diffHours < 24.1 && !localStorage.getItem(id24)) {
            sendNotification(`📅 یادآوری فردا: ${s.client}`, `فردا ساعت ${s.time} برنامه "${s.label}" دارید.`);
            localStorage.setItem(id24, 'sent');
        }

        if (diffHours > 0.8 && diffHours < 1.1 && !localStorage.getItem(id1)) {
            const urgency = s.label === 'دادگاه' ? '🚨 مهم: ' : '⏰ ';
            sendNotification(`${urgency}یک ساعت تا جلسه`, `ساعت ${s.time} با ${s.client} - ${s.desc || ''}`);
            localStorage.setItem(id1, 'sent');
        }
        
        if (diffHours < 0 && diffHours > -24 && !localStorage.getItem(`overdue_${s.id}`)) {
             if(s.label === 'دادگاه' || s.label === 'تنظیم') {
                 sendNotification(`⚠️ مهلت گذشت!`, `برنامه ${s.client} در تاریخ ${s.date} انجام نشده است.`);
                 localStorage.setItem(`overdue_${s.id}`, 'sent');
             }
        }
    });
}

function sendNotification(title, body) {
    const notif = new Notification(title, {
        body: body,
        icon: 'https://img.icons8.com/fluency/96/law.png',
        dir: 'rtl'
    });
}

setInterval(checkReminders, 300000); 

window.addEventListener('load', () => {
    if (Notification.permission === "default") {
        setTimeout(requestNotificationPermission, 2000);
    }
    checkReminders();
});