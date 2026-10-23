/**
 * Library Management System - College Academic Prototype
 * Client-Side JavaScript Logic using HTML5 Web Storage (localStorage)
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Constants & State Management
  // ==========================================================================
  const STORAGE_KEY = 'library_management_records_v1';

  let books = [];
  let currentCatalogFilter = {
    search: '',
    category: 'all',
    availability: 'all',
    sortBy: 'titleAsc'
  };

  let currentLoansFilter = 'all'; // 'all', 'overdue', 'ontime'
  let pendingDeleteBookId = null;
  let confirmCallback = null;

  // DOM Elements Cache
  const elements = {
    // Header & KPIs
    headerTodayDate: document.getElementById('headerTodayDate'),
    kpiTotalTitles: document.getElementById('kpiTotalTitles'),
    kpiTotalCopiesSubtext: document.getElementById('kpiTotalCopiesSubtext'),
    kpiAvailableCopies: document.getElementById('kpiAvailableCopies'),
    kpiIssuedCopies: document.getElementById('kpiIssuedCopies'),
    kpiOverdueCopies: document.getElementById('kpiOverdueCopies'),
    circulationRateText: document.getElementById('circulationRateText'),
    circulationRatioText: document.getElementById('circulationRatioText'),
    circulationBarFill: document.getElementById('circulationBarFill'),

    // Tabs
    tabCatalogBtn: document.getElementById('tabCatalogBtn'),
    tabLoansBtn: document.getElementById('tabLoansBtn'),
    tabCatalogCount: document.getElementById('tabCatalogCount'),
    tabLoansCount: document.getElementById('tabLoansCount'),
    tabOverdueBadge: document.getElementById('tabOverdueBadge'),
    catalogView: document.getElementById('catalogView'),
    loansView: document.getElementById('loansView'),

    // Catalog Controls
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    filterCategory: document.getElementById('filterCategory'),
    filterAvailability: document.getElementById('filterAvailability'),
    catalogSortBy: document.getElementById('catalogSortBy'),
    btnResetFilters: document.getElementById('btnResetFilters'),
    btnLoadSample: document.getElementById('btnLoadSample'),
    btnClearData: document.getElementById('btnClearData'),

    // Catalog Grid & State
    booksGrid: document.getElementById('booksGrid'),
    catalogCountBadge: document.getElementById('catalogCountBadge'),
    catalogEmptyState: document.getElementById('catalogEmptyState'),
    catalogEmptyTitle: document.getElementById('catalogEmptyTitle'),
    catalogEmptyDesc: document.getElementById('catalogEmptyDesc'),
    btnEmptyAddBook: document.getElementById('btnEmptyAddBook'),
    btnEmptyLoadSample: document.getElementById('btnEmptyLoadSample'),

    // Loans Tab
    filterLoanStatus: document.getElementById('filterLoanStatus'),
    loansTable: document.getElementById('loansTable'),
    loansTableBody: document.getElementById('loansTableBody'),
    loansEmptyState: document.getElementById('loansEmptyState'),

    // Add / Edit Book Modal
    bookModal: document.getElementById('bookModal'),
    bookModalTitle: document.getElementById('bookModalTitle'),
    bookModalIcon: document.getElementById('bookModalIcon'),
    btnOpenAddBookModal: document.getElementById('btnOpenAddBookModal'),
    btnCloseBookModal: document.getElementById('btnCloseBookModal'),
    btnCancelBookModal: document.getElementById('btnCancelBookModal'),
    bookForm: document.getElementById('bookForm'),
    bookIdInput: document.getElementById('bookIdInput'),
    bookTitleInput: document.getElementById('bookTitleInput'),
    bookAuthorInput: document.getElementById('bookAuthorInput'),
    bookIsbnInput: document.getElementById('bookIsbnInput'),
    bookCategoryInput: document.getElementById('bookCategoryInput'),
    bookCopiesInput: document.getElementById('bookCopiesInput'),
    availableHintWrapper: document.getElementById('availableHintWrapper'),
    editCurrentlyIssuedText: document.getElementById('editCurrentlyIssuedText'),
    submitBookBtnText: document.getElementById('submitBookBtnText'),

    // Book Form Errors
    bookTitleError: document.getElementById('bookTitleError'),
    bookAuthorError: document.getElementById('bookAuthorError'),
    bookIsbnError: document.getElementById('bookIsbnError'),
    bookCategoryError: document.getElementById('bookCategoryError'),
    bookCopiesError: document.getElementById('bookCopiesError'),

    // Issue Book Modal
    issueModal: document.getElementById('issueModal'),
    btnCloseIssueModal: document.getElementById('btnCloseIssueModal'),
    btnCancelIssueModal: document.getElementById('btnCancelIssueModal'),
    issueForm: document.getElementById('issueForm'),
    issueBookIdInput: document.getElementById('issueBookIdInput'),
    issueSummaryTitle: document.getElementById('issueSummaryTitle'),
    issueSummaryAuthor: document.getElementById('issueSummaryAuthor'),
    issueSummaryIsbn: document.getElementById('issueSummaryIsbn'),
    issueSummaryAvailable: document.getElementById('issueSummaryAvailable'),
    outOfStockAlert: document.getElementById('outOfStockAlert'),
    studentNameInput: document.getElementById('studentNameInput'),
    studentRollInput: document.getElementById('studentRollInput'),
    issueDateInput: document.getElementById('issueDateInput'),
    returnDateInput: document.getElementById('returnDateInput'),
    btnSubmitIssue: document.getElementById('btnSubmitIssue'),

    // Issue Form Errors
    studentNameError: document.getElementById('studentNameError'),
    studentRollError: document.getElementById('studentRollError'),
    issueDateError: document.getElementById('issueDateError'),
    returnDateError: document.getElementById('returnDateError'),

    // View Loans Modal
    viewLoansModal: document.getElementById('viewLoansModal'),
    btnCloseViewLoansModal: document.getElementById('btnCloseViewLoansModal'),
    btnCloseViewLoansFooter: document.getElementById('btnCloseViewLoansFooter'),
    viewLoansBookTitle: document.getElementById('viewLoansBookTitle'),
    viewLoansBookMeta: document.getElementById('viewLoansBookMeta'),
    viewLoansListContainer: document.getElementById('viewLoansListContainer'),

    // Confirmation Modal
    confirmModal: document.getElementById('confirmModal'),
    confirmIcon: document.getElementById('confirmIcon'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    btnCancelConfirm: document.getElementById('btnCancelConfirm'),
    btnProceedConfirm: document.getElementById('btnProceedConfirm'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================================================
  // 2. Date Utilities
  // ==========================================================================

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDateWithOffset(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isLoanOverdue(returnDateStr) {
    if (!returnDateStr) return false;
    const today = getTodayString();
    return returnDateStr < today;
  }

  function getLoanDateStatus(returnDateStr) {
    if (!returnDateStr) return { text: 'No Date', type: 'normal' };

    const todayStr = getTodayString();
    const [tY, tM, tD] = todayStr.split('-').map(Number);
    const [rY, rM, rD] = returnDateStr.split('-').map(Number);

    const todayDate = new Date(tY, tM - 1, tD);
    const returnDate = new Date(rY, rM - 1, rD);

    const diffDays = Math.round((returnDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const pastDays = Math.abs(diffDays);
      return {
        text: `⚠️ Overdue by ${pastDays} ${pastDays === 1 ? 'day' : 'days'}`,
        badgeClass: 'status-overdue',
        isOverdue: true
      };
    } else if (diffDays === 0) {
      return {
        text: '⏰ Due Today',
        badgeClass: 'status-due-today',
        isOverdue: false
      };
    } else if (diffDays === 1) {
      return {
        text: '⏳ Due Tomorrow',
        badgeClass: 'status-ontime',
        isOverdue: false
      };
    } else {
      return {
        text: `✓ Due in ${diffDays} days`,
        badgeClass: 'status-ontime',
        isOverdue: false
      };
    }
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  // ==========================================================================
  // 3. Realistic College Sample Dataset
  // ==========================================================================
  function generateSampleBooks() {
    return [
      {
        id: 'book_sample_1',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
        isbn: '978-0262033848',
        category: 'Computer Science',
        totalCopies: 4,
        availableCopies: 2,
        issuedLoans: [
          {
            loanId: 'loan_s1_1',
            studentName: 'Aarav Sharma',
            rollNumber: '21CS014',
            issueDate: getDateWithOffset(-18),
            returnDate: getDateWithOffset(-4), // Overdue loan for demonstration!
            createdAt: new Date().toISOString()
          },
          {
            loanId: 'loan_s1_2',
            studentName: 'Sneha Patel',
            rollNumber: '21CS042',
            issueDate: getDateWithOffset(-5),
            returnDate: getDateWithOffset(9),
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'book_sample_2',
        title: 'Operating System Concepts (Silberschatz)',
        author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
        isbn: '978-1119800361',
        category: 'Computer Science',
        totalCopies: 3,
        availableCopies: 2,
        issuedLoans: [
          {
            loanId: 'loan_s2_1',
            studentName: 'Rohan Gupta',
            rollNumber: '22IT018',
            issueDate: getDateWithOffset(-3),
            returnDate: getDateWithOffset(11),
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'book_sample_3',
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
        isbn: '978-0078022159',
        category: 'Information Technology',
        totalCopies: 2,
        availableCopies: 0, // OUT OF STOCK for requirement #9 demonstration
        issuedLoans: [
          {
            loanId: 'loan_s3_1',
            studentName: 'Vikram Malhotra',
            rollNumber: '21CS089',
            issueDate: getDateWithOffset(-10),
            returnDate: getDateWithOffset(4),
            createdAt: new Date().toISOString()
          },
          {
            loanId: 'loan_s3_2',
            studentName: 'Ananya Roy',
            rollNumber: '21CS102',
            issueDate: getDateWithOffset(-2),
            returnDate: getDateWithOffset(12),
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'book_sample_4',
        title: 'Computer Networking: A Top-Down Approach',
        author: 'James Kurose, Keith Ross',
        isbn: '978-0133594140',
        category: 'Computer Science',
        totalCopies: 3,
        availableCopies: 3, // All available
        issuedLoans: []
      },
      {
        id: 'book_sample_5',
        title: 'Signals and Systems',
        author: 'Alan V. Oppenheim, Alan S. Willsky',
        isbn: '978-0138147570',
        category: 'Electronics & Communication',
        totalCopies: 2,
        availableCopies: 1,
        issuedLoans: [
          {
            loanId: 'loan_s5_1',
            studentName: 'Kavita Nair',
            rollNumber: '22EC033',
            issueDate: getDateWithOffset(-16),
            returnDate: getDateWithOffset(-2), // Overdue loan for demonstration!
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'book_sample_6',
        title: 'Discrete Mathematics and Its Applications',
        author: 'Kenneth H. Rosen',
        isbn: '978-0073383095',
        category: 'Mathematics',
        totalCopies: 5,
        availableCopies: 5, // All available
        issuedLoans: []
      }
    ];
  }

  // ==========================================================================
  // 4. Persistence & LocalStorage
  // ==========================================================================
  function loadBooksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Normalize copies & loans
          return parsed.map(b => {
            const issuedLoans = Array.isArray(b.issuedLoans) ? b.issuedLoans : [];
            const totalCopies = Number(b.totalCopies) || 1;
            const availableCopies = Math.max(0, totalCopies - issuedLoans.length);
            return {
              ...b,
              totalCopies,
              availableCopies,
              issuedLoans
            };
          });
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    const initialSamples = generateSampleBooks();
    saveBooksToStorage(initialSamples);
    return initialSamples;
  }

  function saveBooksToStorage(booksArray) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(booksArray));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      showToast('⚠️ Storage quota exceeded or disabled.', 'danger');
    }
  }

  // ==========================================================================
  // 5. Dashboard Metrics & Progress Math
  // ==========================================================================
  function updateDashboard() {
    const totalTitles = books.length;
    let totalCopies = 0;
    let availableCopies = 0;
    let issuedCopies = 0;
    let overdueCopies = 0;

    books.forEach(b => {
      const t = Number(b.totalCopies) || 0;
      const loans = Array.isArray(b.issuedLoans) ? b.issuedLoans : [];
      const issued = loans.length;
      const avail = Math.max(0, t - issued);

      totalCopies += t;
      availableCopies += avail;
      issuedCopies += issued;

      // Check overdue loans
      loans.forEach(loan => {
        if (isLoanOverdue(loan.returnDate)) {
          overdueCopies++;
        }
      });
    });

    // Update KPI UI
    elements.kpiTotalTitles.textContent = totalTitles;
    elements.kpiTotalCopiesSubtext.textContent = `${totalCopies} total physical copies in library`;
    elements.kpiAvailableCopies.textContent = availableCopies;
    elements.kpiIssuedCopies.textContent = issuedCopies;
    elements.kpiOverdueCopies.textContent = overdueCopies;

    // Tabs counters
    elements.tabCatalogCount.textContent = totalTitles;
    elements.tabLoansCount.textContent = issuedCopies;

    if (overdueCopies > 0) {
      elements.tabOverdueBadge.style.display = 'inline-block';
      elements.tabOverdueBadge.textContent = `${overdueCopies} Overdue`;
    } else {
      elements.tabOverdueBadge.style.display = 'none';
    }

    // Circulation Rate Percentage
    const circulationPercent = totalCopies === 0 ? 0 : Math.round((issuedCopies / totalCopies) * 100);
    elements.circulationRateText.textContent = `${circulationPercent}%`;
    elements.circulationRatioText.textContent = `(${issuedCopies} of ${totalCopies} physical copies currently issued)`;
    elements.circulationBarFill.style.width = `${circulationPercent}%`;

    // Dynamic gradient / color for circulation
    if (circulationPercent >= 75) {
      elements.circulationBarFill.style.background = 'linear-gradient(90deg, #2563eb 0%, #d97706 70%, #dc2626 100%)';
    } else {
      elements.circulationBarFill.style.background = 'linear-gradient(90deg, #2563eb 0%, #0284c7 60%, #10b981 100%)';
    }
  }

  // ==========================================================================
  // 6. Dynamic Categories & Filtering
  // ==========================================================================
  function populateCategoryFilter() {
    const currentSelected = elements.filterCategory.value;
    const catSet = new Set();

    books.forEach(b => {
      if (b.category && b.category.trim()) {
        catSet.add(b.category.trim());
      }
    });

    elements.filterCategory.innerHTML = '<option value="all">All Categories</option>';
    Array.from(catSet).sort().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      elements.filterCategory.appendChild(opt);
    });

    if (catSet.has(currentSelected)) {
      elements.filterCategory.value = currentSelected;
    } else {
      elements.filterCategory.value = 'all';
      currentCatalogFilter.category = 'all';
    }
  }

  function getFilteredAndSortedCatalog() {
    const searchLower = currentCatalogFilter.search.trim().toLowerCase();

    const filtered = books.filter(book => {
      // 1. Search Query (Title, Author, ISBN)
      if (searchLower) {
        const matchesTitle = book.title && book.title.toLowerCase().includes(searchLower);
        const matchesAuthor = book.author && book.author.toLowerCase().includes(searchLower);
        const matchesIsbn = book.isbn && book.isbn.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesAuthor && !matchesIsbn) {
          return false;
        }
      }

      // 2. Category
      if (currentCatalogFilter.category !== 'all' && book.category !== currentCatalogFilter.category) {
        return false;
      }

      // 3. Availability Filter
      const avail = book.availableCopies;
      const loans = Array.isArray(book.issuedLoans) ? book.issuedLoans : [];
      const hasOverdue = loans.some(l => isLoanOverdue(l.returnDate));

      if (currentCatalogFilter.availability === 'available' && avail <= 0) return false;
      if (currentCatalogFilter.availability === 'outOfStock' && avail > 0) return false;
      if (currentCatalogFilter.availability === 'issued' && loans.length === 0) return false;
      if (currentCatalogFilter.availability === 'overdue' && !hasOverdue) return false;

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (currentCatalogFilter.sortBy) {
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'authorAsc':
          return a.author.localeCompare(b.author);
        case 'availableDesc':
          return b.availableCopies - a.availableCopies;
        case 'copiesDesc':
          return b.totalCopies - a.totalCopies;
        default:
          return 0;
      }
    });

    return filtered;
  }

  function getAllActiveLoans() {
    const list = [];
    books.forEach(book => {
      if (Array.isArray(book.issuedLoans)) {
        book.issuedLoans.forEach(loan => {
          list.push({
            ...loan,
            bookId: book.id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookIsbn: book.isbn
          });
        });
      }
    });

    // Sort by return date ascending (earliest / most overdue first)
    list.sort((a, b) => (a.returnDate || '').localeCompare(b.returnDate || ''));

    // Filter by loans filter
    if (currentLoansFilter === 'overdue') {
      return list.filter(l => isLoanOverdue(l.returnDate));
    } else if (currentLoansFilter === 'ontime') {
      return list.filter(l => !isLoanOverdue(l.returnDate));
    }

    return list;
  }

  // ==========================================================================
  // 7. Render Views
  // ==========================================================================
  function render() {
    updateDashboard();
    populateCategoryFilter();
    renderCatalog();
    renderLoansTable();
  }

  function renderCatalog() {
    const filteredBooks = getFilteredAndSortedCatalog();
    const totalTitles = books.length;
    const filteredCount = filteredBooks.length;

    // Toggle Clear Search Button
    elements.btnClearSearch.style.display = elements.searchInput.value.trim() ? 'block' : 'none';

    // Count badge
    if (totalTitles === 0) {
      elements.catalogCountBadge.textContent = '0 books recorded';
    } else if (filteredCount === totalTitles) {
      elements.catalogCountBadge.textContent = `Showing all ${totalTitles} books`;
    } else {
      elements.catalogCountBadge.textContent = `Showing ${filteredCount} of ${totalTitles} books`;
    }

    // Empty state
    if (filteredBooks.length === 0) {
      elements.booksGrid.innerHTML = '';
      elements.catalogEmptyState.style.display = 'flex';

      if (totalTitles === 0) {
        elements.catalogEmptyTitle.textContent = 'Library Catalog is Empty';
        elements.catalogEmptyDesc.textContent = 'No book titles recorded yet. Add a new book or click "Load Sample Books" to populate demo records.';
        elements.btnEmptyAddBook.style.display = 'inline-flex';
        elements.btnEmptyLoadSample.style.display = 'inline-flex';
      } else {
        elements.catalogEmptyTitle.textContent = 'No Matching Books Found';
        elements.catalogEmptyDesc.textContent = 'Try adjusting your search query, clearing filters, or switching categories.';
        elements.btnEmptyAddBook.style.display = 'none';
        elements.btnEmptyLoadSample.style.display = 'none';
      }
      return;
    }

    elements.catalogEmptyState.style.display = 'none';

    // Render Cards
    elements.booksGrid.innerHTML = filteredBooks.map(book => {
      const loans = Array.isArray(book.issuedLoans) ? book.issuedLoans : [];
      const issuedCount = loans.length;
      const isOutOfStock = book.availableCopies <= 0;
      const overdueLoans = loans.filter(l => isLoanOverdue(l.returnDate));
      const hasOverdue = overdueLoans.length > 0;

      return `
        <article class="book-card ${isOutOfStock ? 'is-out-of-stock' : ''} ${hasOverdue ? 'has-overdue' : ''}" data-id="${book.id}" id="book-${book.id}">
          
          <div class="book-card-top">
            <div class="book-tags-row">
              <span class="badge-category">📂 ${escapeHtml(book.category || 'General')}</span>
              <span class="badge-stock ${isOutOfStock ? 'stock-out' : 'stock-in'}">
                ${isOutOfStock ? 'Out of Stock (0 Avail)' : `${book.availableCopies} of ${book.totalCopies} Available`}
              </span>
            </div>

            <h3 class="book-title">${escapeHtml(book.title)}</h3>
            <div class="book-author">✍️ ${escapeHtml(book.author)}</div>
            
            <div class="book-isbn-box">
              <span>ISBN:</span>
              <span class="isbn-code">${escapeHtml(book.isbn)}</span>
            </div>

            <!-- Overdue Warning Badge inside card -->
            ${hasOverdue ? `
              <div class="book-overdue-strip">
                <span>🚨</span>
                <span>${overdueLoans.length} ${overdueLoans.length === 1 ? 'copy is' : 'copies are'} OVERDUE for return!</span>
              </div>
            ` : ''}

            <!-- Inventory Breakdown -->
            <div class="book-inventory-stats">
              <div class="inv-stat-item">
                <span class="inv-stat-label">Total</span>
                <span class="inv-stat-val">${book.totalCopies}</span>
              </div>
              <div class="inv-stat-item">
                <span class="inv-stat-label">Available</span>
                <span class="inv-stat-val val-avail">${book.availableCopies}</span>
              </div>
              <div class="inv-stat-item">
                <span class="inv-stat-label">Issued</span>
                <span class="inv-stat-val val-issued">${issuedCount}</span>
              </div>
              <div class="inv-stat-item">
                <span class="inv-stat-label">Overdue</span>
                <span class="inv-stat-val val-overdue">${overdueLoans.length}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="book-card-actions">
            <!-- Issue Button: Disabled when availableCopies <= 0 (Feature #9) -->
            <button 
              type="button" 
              class="btn btn-primary btn-issue" 
              data-action="issue" 
              data-id="${book.id}"
              ${isOutOfStock ? 'disabled title="Cannot issue: 0 copies available in stock"' : 'title="Issue a copy to a student"'}
            >
              📤 Issue Book
            </button>

            <!-- View / Return Loans Button -->
            <button 
              type="button" 
              class="btn btn-outline btn-loans" 
              data-action="view-loans" 
              data-id="${book.id}"
              title="View student loans and process returns"
            >
              📥 Return (${issuedCount})
            </button>

            <!-- Edit Book Record -->
            <button 
              type="button" 
              class="btn-icon-action btn-edit" 
              data-action="edit" 
              data-id="${book.id}" 
              title="Edit book details"
              aria-label="Edit book"
            >
              ✏️
            </button>

            <!-- Delete Book Record -->
            <button 
              type="button" 
              class="btn-icon-action btn-delete" 
              data-action="delete" 
              data-id="${book.id}" 
              title="Delete book record"
              aria-label="Delete book"
            >
              🗑️
            </button>
          </div>

        </article>
      `;
    }).join('');
  }

  function renderLoansTable() {
    const activeLoans = getAllActiveLoans();

    if (activeLoans.length === 0) {
      elements.loansTableBody.innerHTML = '';
      elements.loansTable.style.display = 'none';
      elements.loansEmptyState.style.display = 'flex';
      return;
    }

    elements.loansTable.style.display = 'table';
    elements.loansEmptyState.style.display = 'none';

    elements.loansTableBody.innerHTML = activeLoans.map((loan, idx) => {
      const isOverdue = isLoanOverdue(loan.returnDate);
      const dateStatus = getLoanDateStatus(loan.returnDate);
      const issueDateFormatted = formatDisplayDate(loan.issueDate);
      const returnDateFormatted = formatDisplayDate(loan.returnDate);

      return `
        <tr class="${isOverdue ? 'row-overdue' : ''}">
          <td><strong>${idx + 1}</strong></td>
          <td>
            <div class="loan-student-name">${escapeHtml(loan.studentName)}</div>
          </td>
          <td>
            <span class="loan-roll-pill">${escapeHtml(loan.rollNumber)}</span>
          </td>
          <td>
            <div class="loan-book-title">${escapeHtml(loan.bookTitle)}</div>
            <div class="loan-book-isbn">ISBN: ${escapeHtml(loan.bookIsbn)}</div>
          </td>
          <td>
            <span class="loan-date-val">${issueDateFormatted}</span>
          </td>
          <td>
            <span class="loan-date-val">${returnDateFormatted}</span>
          </td>
          <td>
            <span class="badge-loan-status ${dateStatus.badgeClass}">
              ${dateStatus.text}
            </span>
          </td>
          <td>
            <button 
              type="button" 
              class="btn btn-success-sm" 
              data-action="return-loan" 
              data-book-id="${loan.bookId}" 
              data-loan-id="${loan.loanId}"
              title="Process student book return"
            >
              📥 Mark Returned
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================================================
  // 8. CRUD Operations
  // ==========================================================================

  // --- Add / Edit Book Record ---
  function handleBookFormSubmit(e) {
    e.preventDefault();

    const title = elements.bookTitleInput.value.trim();
    const author = elements.bookAuthorInput.value.trim();
    const isbn = elements.bookIsbnInput.value.trim();
    const category = elements.bookCategoryInput.value.trim();
    const copies = parseInt(elements.bookCopiesInput.value, 10);
    const bookId = elements.bookIdInput.value.trim();

    let isValid = true;

    if (!title || title.length < 2) {
      elements.bookTitleError.style.display = 'block';
      elements.bookTitleInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.bookTitleError.style.display = 'none';
      elements.bookTitleInput.classList.remove('has-error');
    }

    if (!author || author.length < 2) {
      elements.bookAuthorError.style.display = 'block';
      elements.bookAuthorInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.bookAuthorError.style.display = 'none';
      elements.bookAuthorInput.classList.remove('has-error');
    }

    if (!isbn || isbn.length < 6) {
      elements.bookIsbnError.style.display = 'block';
      elements.bookIsbnInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.bookIsbnError.style.display = 'none';
      elements.bookIsbnInput.classList.remove('has-error');
    }

    if (!category || category.length < 2) {
      elements.bookCategoryError.style.display = 'block';
      elements.bookCategoryInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.bookCategoryError.style.display = 'none';
      elements.bookCategoryInput.classList.remove('has-error');
    }

    // Check copies validation
    if (isNaN(copies) || copies < 1) {
      elements.bookCopiesError.textContent = 'Please enter a valid number of copies (at least 1).';
      elements.bookCopiesError.style.display = 'block';
      elements.bookCopiesInput.classList.add('has-error');
      isValid = false;
    } else if (bookId) {
      // If editing, total copies cannot be less than currently issued copies!
      const currentBook = books.find(b => b.id === bookId);
      const currentlyIssued = (currentBook && currentBook.issuedLoans) ? currentBook.issuedLoans.length : 0;
      if (copies < currentlyIssued) {
        elements.bookCopiesError.textContent = `Total copies cannot be less than ${currentlyIssued} (number of copies currently issued to students).`;
        elements.bookCopiesError.style.display = 'block';
        elements.bookCopiesInput.classList.add('has-error');
        isValid = false;
      } else {
        elements.bookCopiesError.style.display = 'none';
        elements.bookCopiesInput.classList.remove('has-error');
      }
    } else {
      elements.bookCopiesError.style.display = 'none';
      elements.bookCopiesInput.classList.remove('has-error');
    }

    if (!isValid) return;

    if (bookId) {
      // Update existing book
      const index = books.findIndex(b => b.id === bookId);
      if (index !== -1) {
        const existing = books[index];
        const issuedCount = existing.issuedLoans ? existing.issuedLoans.length : 0;
        books[index] = {
          ...existing,
          title,
          author,
          isbn,
          category,
          totalCopies: copies,
          availableCopies: Math.max(0, copies - issuedCount),
          updatedAt: new Date().toISOString()
        };
        saveBooksToStorage(books);
        closeBookModal();
        render();
        showToast('Book details updated successfully!', 'success');
      }
    } else {
      // Add new book
      const newBook = {
        id: 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title,
        author,
        isbn,
        category,
        totalCopies: copies,
        availableCopies: copies,
        issuedLoans: [],
        createdAt: new Date().toISOString()
      };
      books.unshift(newBook);
      saveBooksToStorage(books);
      closeBookModal();
      render();
      showToast('New book added to library catalog!', 'success');
    }
  }

  function openAddBookModal() {
    resetBookModalForm();
    elements.bookModalTitle.textContent = 'Add New Book Record';
    elements.bookModalIcon.textContent = '📖';
    elements.submitBookBtnText.textContent = 'Save Book Record';
    elements.availableHintWrapper.style.display = 'none';
    elements.bookCopiesInput.value = 3;

    elements.bookModal.classList.add('is-open');
    elements.bookModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => elements.bookTitleInput.focus(), 100);
  }

  function openEditBookModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    resetBookModalForm();
    elements.bookIdInput.value = book.id;
    elements.bookModalTitle.textContent = 'Edit Book Record';
    elements.bookModalIcon.textContent = '✏️';
    elements.submitBookBtnText.textContent = 'Update Book Record';

    elements.bookTitleInput.value = book.title;
    elements.bookAuthorInput.value = book.author;
    elements.bookIsbnInput.value = book.isbn;
    elements.bookCategoryInput.value = book.category;
    elements.bookCopiesInput.value = book.totalCopies;

    const issuedCount = book.issuedLoans ? book.issuedLoans.length : 0;
    elements.availableHintWrapper.style.display = 'block';
    elements.editCurrentlyIssuedText.textContent = `${issuedCount} copies currently issued (${book.availableCopies} available)`;

    elements.bookModal.classList.add('is-open');
    elements.bookModal.setAttribute('aria-hidden', 'false');
  }

  function closeBookModal() {
    elements.bookModal.classList.remove('is-open');
    elements.bookModal.setAttribute('aria-hidden', 'true');
    resetBookModalForm();
  }

  function resetBookModalForm() {
    elements.bookForm.reset();
    elements.bookIdInput.value = '';
    elements.bookTitleError.style.display = 'none';
    elements.bookAuthorError.style.display = 'none';
    elements.bookIsbnError.style.display = 'none';
    elements.bookCategoryError.style.display = 'none';
    elements.bookCopiesError.style.display = 'none';
    elements.bookTitleInput.classList.remove('has-error');
    elements.bookAuthorInput.classList.remove('has-error');
    elements.bookIsbnInput.classList.remove('has-error');
    elements.bookCategoryInput.classList.remove('has-error');
    elements.bookCopiesInput.classList.remove('has-error');
  }

  // --- Delete Book ---
  function requestDeleteBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const issuedCount = book.issuedLoans ? book.issuedLoans.length : 0;
    if (issuedCount > 0) {
      showToast(`⚠️ Cannot delete "${book.title.substring(0, 24)}...": ${issuedCount} copies are currently issued to students. Process returns first.`, 'warning');
      return;
    }

    pendingDeleteBookId = bookId;
    showConfirmDialog({
      icon: '🗑️',
      title: 'Delete Book Record?',
      message: `Are you sure you want to remove "${book.title}" from the catalog? This action cannot be undone.`,
      confirmText: 'Delete Book',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        books = books.filter(b => b.id !== pendingDeleteBookId);
        saveBooksToStorage(books);
        render();
        showToast('Book removed from catalog.', 'danger');
        pendingDeleteBookId = null;
      }
    });
  }

  // ==========================================================================
  // 9. Issue Book to Student (Feature #5, #7, #9)
  // ==========================================================================
  function openIssueModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    resetIssueForm();
    elements.issueBookIdInput.value = book.id;
    elements.issueSummaryTitle.textContent = book.title;
    elements.issueSummaryAuthor.textContent = book.author;
    elements.issueSummaryIsbn.textContent = book.isbn;
    elements.issueSummaryAvailable.textContent = `${book.availableCopies} of ${book.totalCopies}`;

    // Feature #9: Check if available copies <= 0
    if (book.availableCopies <= 0) {
      elements.outOfStockAlert.style.display = 'block';
      elements.btnSubmitIssue.disabled = true;
      elements.studentNameInput.disabled = true;
      elements.studentRollInput.disabled = true;
      elements.issueDateInput.disabled = true;
      elements.returnDateInput.disabled = true;
    } else {
      elements.outOfStockAlert.style.display = 'none';
      elements.btnSubmitIssue.disabled = false;
      elements.studentNameInput.disabled = false;
      elements.studentRollInput.disabled = false;
      elements.issueDateInput.disabled = false;
      elements.returnDateInput.disabled = false;

      // Pre-fill today's issue date & default 14-day expected return date
      const today = getTodayString();
      const returnDefault = getDateWithOffset(14);
      elements.issueDateInput.value = today;
      elements.returnDateInput.value = returnDefault;
    }

    elements.issueModal.classList.add('is-open');
    elements.issueModal.setAttribute('aria-hidden', 'false');

    if (book.availableCopies > 0) {
      setTimeout(() => elements.studentNameInput.focus(), 100);
    }
  }

  function closeIssueModal() {
    elements.issueModal.classList.remove('is-open');
    elements.issueModal.setAttribute('aria-hidden', 'true');
    resetIssueForm();
  }

  function resetIssueForm() {
    elements.issueForm.reset();
    elements.issueBookIdInput.value = '';
    elements.studentNameError.style.display = 'none';
    elements.studentRollError.style.display = 'none';
    elements.issueDateError.style.display = 'none';
    elements.returnDateError.style.display = 'none';
    elements.studentNameInput.classList.remove('has-error');
    elements.studentRollInput.classList.remove('has-error');
    elements.issueDateInput.classList.remove('has-error');
    elements.returnDateInput.classList.remove('has-error');
  }

  function handleIssueFormSubmit(e) {
    e.preventDefault();

    const bookId = elements.issueBookIdInput.value;
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Feature #9: Prevent issuing if 0 copies available
    if (book.availableCopies <= 0) {
      showToast('⚠️ Cannot issue: No copies are currently available in stock.', 'danger');
      return;
    }

    const studentName = elements.studentNameInput.value.trim();
    const rollNumber = elements.studentRollInput.value.trim().toUpperCase();
    const issueDate = elements.issueDateInput.value;
    const returnDate = elements.returnDateInput.value;

    let isValid = true;

    if (!studentName || studentName.length < 2) {
      elements.studentNameError.style.display = 'block';
      elements.studentNameInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.studentNameError.style.display = 'none';
      elements.studentNameInput.classList.remove('has-error');
    }

    if (!rollNumber || rollNumber.length < 3) {
      elements.studentRollError.style.display = 'block';
      elements.studentRollInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.studentRollError.style.display = 'none';
      elements.studentRollInput.classList.remove('has-error');
    }

    if (!issueDate) {
      elements.issueDateError.style.display = 'block';
      elements.issueDateInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.issueDateError.style.display = 'none';
      elements.issueDateInput.classList.remove('has-error');
    }

    if (!returnDate || returnDate < issueDate) {
      elements.returnDateError.style.display = 'block';
      elements.returnDateInput.classList.add('has-error');
      isValid = false;
    } else {
      elements.returnDateError.style.display = 'none';
      elements.returnDateInput.classList.remove('has-error');
    }

    if (!isValid) return;

    // Create loan object
    const newLoan = {
      loanId: 'loan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      studentName,
      rollNumber,
      issueDate,
      returnDate,
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(book.issuedLoans)) {
      book.issuedLoans = [];
    }

    book.issuedLoans.push(newLoan);
    book.availableCopies = Math.max(0, book.totalCopies - book.issuedLoans.length);

    saveBooksToStorage(books);
    closeIssueModal();
    render();
    showToast(`✅ Book issued to ${studentName} (${rollNumber})!`, 'success');
  }

  // ==========================================================================
  // 10. Return Book Workflow (Feature #6)
  // ==========================================================================
  function returnLoan(bookId, loanId) {
    const book = books.find(b => b.id === bookId);
    if (!book || !Array.isArray(book.issuedLoans)) return;

    const loanIndex = book.issuedLoans.findIndex(l => l.loanId === loanId);
    if (loanIndex === -1) return;

    const loan = book.issuedLoans[loanIndex];
    book.issuedLoans.splice(loanIndex, 1);
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);

    saveBooksToStorage(books);
    render();
    showToast(`📗 Copy returned by ${loan.studentName} (${loan.rollNumber})!`, 'success');

    // If view loans modal is open, refresh its content
    if (elements.viewLoansModal.classList.contains('is-open')) {
      openViewLoansModal(bookId);
    }
  }

  function openViewLoansModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    elements.viewLoansBookTitle.textContent = book.title;
    elements.viewLoansBookMeta.textContent = `Author: ${book.author} • ISBN: ${book.isbn} • (${book.availableCopies} available)`;

    const loans = Array.isArray(book.issuedLoans) ? book.issuedLoans : [];

    if (loans.length === 0) {
      elements.viewLoansListContainer.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-icon" style="font-size: 2rem;">📗</div>
          <h4 style="font-size: 1rem; font-weight: 700;">No Active Loans</h4>
          <p style="font-size: 0.85rem; color: #64748b;">All copies of this book are currently on the shelf.</p>
        </div>
      `;
    } else {
      elements.viewLoansListContainer.innerHTML = loans.map(loan => {
        const isOverdue = isLoanOverdue(loan.returnDate);
        const dateStatus = getLoanDateStatus(loan.returnDate);

        return `
          <div class="loan-entry-card ${isOverdue ? 'entry-overdue' : ''}">
            <div class="loan-entry-info">
              <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">
                ${escapeHtml(loan.studentName)} <span class="loan-roll-pill">${escapeHtml(loan.rollNumber)}</span>
              </div>
              <div style="font-size: 0.8rem; color: #64748b;">
                Issued: <strong>${formatDisplayDate(loan.issueDate)}</strong> &bull; Return by: <strong>${formatDisplayDate(loan.returnDate)}</strong>
              </div>
              <div>
                <span class="badge-loan-status ${dateStatus.badgeClass}">
                  ${dateStatus.text}
                </span>
              </div>
            </div>

            <div>
              <button 
                type="button" 
                class="btn btn-success-sm" 
                data-action="return-loan" 
                data-book-id="${book.id}" 
                data-loan-id="${loan.loanId}"
                title="Mark this copy as returned"
              >
                📥 Return Copy
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    elements.viewLoansModal.classList.add('is-open');
    elements.viewLoansModal.setAttribute('aria-hidden', 'false');
  }

  function closeViewLoansModal() {
    elements.viewLoansModal.classList.remove('is-open');
    elements.viewLoansModal.setAttribute('aria-hidden', 'true');
  }

  // ==========================================================================
  // 11. Sample Data & Reset (Feature #11)
  // ==========================================================================
  function loadSampleData() {
    books = generateSampleBooks();
    saveBooksToStorage(books);
    render();
    showToast('✨ College library sample books & loans loaded!', 'success');
  }

  function requestClearAllData() {
    showConfirmDialog({
      icon: '⚠️',
      title: 'Reset Demo Library Records?',
      message: 'This will wipe all books, active student loans, and circulation history from your browser localStorage.',
      confirmText: 'Reset Everything',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        books = [];
        saveBooksToStorage(books);
        render();
        showToast('All library records cleared.', 'warning');
      }
    });
  }

  // ==========================================================================
  // 12. Confirm Dialog & Toast Helpers
  // ==========================================================================
  function showConfirmDialog({ icon, title, message, confirmText, confirmClass, onConfirm }) {
    elements.confirmIcon.textContent = icon || '⚠️';
    elements.confirmTitle.textContent = title || 'Confirm Action';
    elements.confirmMessage.textContent = message || 'Are you sure?';
    elements.btnProceedConfirm.textContent = confirmText || 'Confirm';
    elements.btnProceedConfirm.className = `btn ${confirmClass || 'btn-danger'}`;

    confirmCallback = onConfirm;
    elements.confirmModal.classList.add('is-open');
    elements.confirmModal.setAttribute('aria-hidden', 'false');
  }

  function closeConfirmDialog() {
    elements.confirmModal.classList.remove('is-open');
    elements.confirmModal.setAttribute('aria-hidden', 'true');
    confirmCallback = null;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '🗑️';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==========================================================================
  // 13. Event Listeners Setup
  // ==========================================================================
  function setupEventListeners() {
    // Current Date display
    const today = new Date();
    elements.headerTodayDate.textContent = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Tab Navigation
    elements.tabCatalogBtn.addEventListener('click', () => {
      elements.tabCatalogBtn.classList.add('active');
      elements.tabLoansBtn.classList.remove('active');
      elements.catalogView.classList.add('active');
      elements.loansView.classList.remove('active');
    });

    elements.tabLoansBtn.addEventListener('click', () => {
      elements.tabLoansBtn.classList.add('active');
      elements.tabCatalogBtn.classList.remove('active');
      elements.loansView.classList.add('active');
      elements.catalogView.classList.remove('active');
    });

    // Add Book Modal
    elements.btnOpenAddBookModal.addEventListener('click', openAddBookModal);
    elements.btnCloseBookModal.addEventListener('click', closeBookModal);
    elements.btnCancelBookModal.addEventListener('click', closeBookModal);
    elements.bookModal.addEventListener('click', (e) => {
      if (e.target === elements.bookModal) closeBookModal();
    });
    elements.bookForm.addEventListener('submit', handleBookFormSubmit);

    // Issue Book Modal
    elements.btnCloseIssueModal.addEventListener('click', closeIssueModal);
    elements.btnCancelIssueModal.addEventListener('click', closeIssueModal);
    elements.issueModal.addEventListener('click', (e) => {
      if (e.target === elements.issueModal) closeIssueModal();
    });
    elements.issueForm.addEventListener('submit', handleIssueFormSubmit);

    // View Loans Modal
    elements.btnCloseViewLoansModal.addEventListener('click', closeViewLoansModal);
    elements.btnCloseViewLoansFooter.addEventListener('click', closeViewLoansModal);
    elements.viewLoansModal.addEventListener('click', (e) => {
      if (e.target === elements.viewLoansModal) closeViewLoansModal();
    });

    // Confirm Dialog
    elements.btnCancelConfirm.addEventListener('click', closeConfirmDialog);
    elements.confirmModal.addEventListener('click', (e) => {
      if (e.target === elements.confirmModal) closeConfirmDialog();
    });
    elements.btnProceedConfirm.addEventListener('click', () => {
      if (typeof confirmCallback === 'function') {
        confirmCallback();
      }
      closeConfirmDialog();
    });

    // Catalog Search & Clear
    elements.searchInput.addEventListener('input', (e) => {
      currentCatalogFilter.search = e.target.value;
      renderCatalog();
    });

    elements.btnClearSearch.addEventListener('click', () => {
      elements.searchInput.value = '';
      currentCatalogFilter.search = '';
      renderCatalog();
      elements.searchInput.focus();
    });

    // Catalog Dropdowns
    elements.filterCategory.addEventListener('change', (e) => {
      currentCatalogFilter.category = e.target.value;
      renderCatalog();
    });

    elements.filterAvailability.addEventListener('change', (e) => {
      currentCatalogFilter.availability = e.target.value;
      renderCatalog();
    });

    elements.catalogSortBy.addEventListener('change', (e) => {
      currentCatalogFilter.sortBy = e.target.value;
      renderCatalog();
    });

    // Reset Filters
    elements.btnResetFilters.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.filterCategory.value = 'all';
      elements.filterAvailability.value = 'all';
      elements.catalogSortBy.value = 'titleAsc';
      currentCatalogFilter = {
        search: '',
        category: 'all',
        availability: 'all',
        sortBy: 'titleAsc'
      };
      renderCatalog();
      showToast('Filters reset to default.', 'info');
    });

    // Active Loans Filter
    elements.filterLoanStatus.addEventListener('change', (e) => {
      currentLoansFilter = e.target.value;
      renderLoansTable();
    });

    // Sample & Clear Buttons
    elements.btnLoadSample.addEventListener('click', loadSampleData);
    elements.btnClearData.addEventListener('click', requestClearAllData);

    // Empty state buttons
    elements.btnEmptyAddBook.addEventListener('click', openAddBookModal);
    elements.btnEmptyLoadSample.addEventListener('click', loadSampleData);

    // Delegation on Catalog Grid (Issue, Return/Loans, Edit, Delete)
    elements.booksGrid.addEventListener('click', (e) => {
      const issueBtn = e.target.closest('[data-action="issue"]');
      if (issueBtn) {
        const id = issueBtn.getAttribute('data-id');
        openIssueModal(id);
        return;
      }

      const loansBtn = e.target.closest('[data-action="view-loans"]');
      if (loansBtn) {
        const id = loansBtn.getAttribute('data-id');
        openViewLoansModal(id);
        return;
      }

      const editBtn = e.target.closest('[data-action="edit"]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openEditBookModal(id);
        return;
      }

      const deleteBtn = e.target.closest('[data-action="delete"]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        requestDeleteBook(id);
        return;
      }
    });

    // Delegation on Loans Table & View Loans Modal (Return Loan)
    document.addEventListener('click', (e) => {
      const returnBtn = e.target.closest('[data-action="return-loan"]');
      if (returnBtn) {
        const bookId = returnBtn.getAttribute('data-book-id');
        const loanId = returnBtn.getAttribute('data-loan-id');
        returnLoan(bookId, loanId);
      }
    });

    // Keyboard ESC to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.bookModal.classList.contains('is-open')) closeBookModal();
        if (elements.issueModal.classList.contains('is-open')) closeIssueModal();
        if (elements.viewLoansModal.classList.contains('is-open')) closeViewLoansModal();
        if (elements.confirmModal.classList.contains('is-open')) closeConfirmDialog();
      }
    });
  }

  // ==========================================================================
  // 14. Application Initialization
  // ==========================================================================
  function init() {
    setupEventListeners();
    books = loadBooksFromStorage();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
