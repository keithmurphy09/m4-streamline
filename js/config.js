// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Configuration & Global State
// ═══════════════════════════════════════════════════════════════════

// Supabase Client (must be global for all modules)
window.supabaseClient = window.supabase.createClient('https://xviustrrsuhidzbcpgow.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY');
const supabaseClient = window.supabaseClient;
window.supabaseDB = window.supabaseClient; // Alias for CRUD operations
const supabase = window.supabaseDB;

// User & Authentication
let currentUser = null;
let subscription = null;
let isAdmin = false;

// Application State
let activeTab = localStorage.getItem('activeTab') || 'dashboard';
let darkMode = localStorage.getItem('darkMode') === 'true' || false;
let showModal = false;
let isLoading = false;
let loadingMessage = 'Loading...';
let modalType = '';
let editingItem = null;

// Data Collections
let clients = [];
let jobs = [];
let quotes = [];
let invoices = [];
let expenses = [];
let teamMembers = [];
let payments = [];

// Settings
let stripeSettings = null;
let emailSettings = null;
let smsSettings = null;
let companySettings = null;

// Demo Mode
let demoMode = null;
let useDemoData = false;
let demoClients = [];
let demoJobs = [];
let demoQuotes = [];
let demoInvoices = [];
let demoExpenses = [];
let demoTeamMembers = [];

// View State
let scheduleView = 'list';
let calendarFilter = 'all';
let invoiceFilter = 'unpaid';
let expenseFilter = 'all';
let analyticsChartRange = 'current';

// Search State
let clientSearch = '';
let quoteSearch = '';
let invoiceSearch = '';
let jobSearch = '';
let expenseSearch = '';

// Selection State
let selectedQuotes = [];
let selectedInvoices = [];
let selectedJobs = [];
let selectedExpenses = [];
let selectedClients = [];

// Pagination
let currentPage = {
    clients: 1,
    quotes: 1,
    invoices: 1,
    jobs: 1,
    expenses: 1
};
const itemsPerPage = 50;

// UI State
let lastCreatedQuote = null;
let searchDebounceTimer = null;
let selectedAccountType = 'sole_trader';
let currentReceiptFile = null;
let quoteItems = [];

// Session Management
let sessionTimeout;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

console.log('✅ Config loaded');
