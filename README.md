# 📖 Library Management System - College Academic Prototype

An interactive, responsive, and beginner-friendly web application designed for college departmental and central libraries to manage book inventories, student circulation, loan tracking, and overdue return warnings.

Built using **HTML5, Modern CSS3, and Vanilla JavaScript (ES6)** with **HTML5 Web Storage (`localStorage`)**.

---

## 🌟 Key Features

1. **Dashboard & Inventory Metrics**:
   - **Total Books**: Total distinct titles registered in the catalog.
   - **Available Copies**: Total physical books sitting on shelves ready to issue.
   - **Issued Copies**: Total copies currently borrowed by students.
   - **Overdue Alerts**: Real-time counter of books kept past their expected return date.
   - **Circulation & Utilization Rate**: Dynamic percentage progress bar tracking active inventory usage.
2. **Book Record Management (CRUD)**:
   - **Add Book**: Add Title, Author(s), ISBN code, Academic Category, and Total Copies.
   - **Edit Book**: Update book details with built-in validation preventing total copies from being set below currently issued copies.
   - **Delete Book**: Remove books from the catalog with confirmation (safely prevents deletion if copies are still out on loan).
3. **Student Issue Workflow**:
   - Issue books to students using their **Full Name** and **College Roll Number / ID**.
   - Select **Issue Date** and **Expected Return Date** (defaults to 14 days loan period).
   - Decrements available copies immediately and logs the loan in circulation history.
4. **Out-of-Stock Prevention**:
   - When a book reaches `0 Available Copies`, the "Issue Book" button is automatically disabled and tagged with an **"Out of Stock (0 Avail)"** badge.
   - Form submission validates available copies to prevent over-issuing beyond physical stock.
5. **Student Book Return Workflow**:
   - Process returns directly from the **Active Loans Registry tab** or via the **Book Catalog card ("Return" button)**.
   - Restores the available physical copies count immediately and removes the active borrower record.
6. **Automatic Overdue Detection & Warnings**:
   - Compares the expected return date with today's date (`YYYY-MM-DD`).
   - If an issued book is past its return date, it is prominently highlighted:
     - Crimson warning border and pulsating `⚠️ Overdue` badge.
     - Days overdue calculation (e.g. `⚠️ Overdue by 4 days`).
     - Real-time overdue counter reflected on the dashboard KPI card.
7. **Dual-Tab Interface**:
   - **Tab 1: Book Catalog & Inventory**: Card grid with real-time stock breakdown, issue/return actions, and filter controls.
   - **Tab 2: Active Student Loans & Overdue Registry**: Clean structured data table of all students currently holding library books with direct one-click "Mark Returned" buttons.
8. **Real-Time Search & Multi-Filters**:
   - Search by **Title**, **Author**, or **ISBN**.
   - Filter by **Academic Category** (Computer Science, IT, Electronics, Mathematics, Mechanical, etc.).
   - Filter by **Availability Status** (Available only, Out of Stock, Issued, or Overdue).
   - Sort by Title (A-Z), Author, Most Available Copies, or Total Copies.
9. **Persistent LocalStorage**:
   - Stores all books, copies counts, and active borrower records under `library_management_records_v1`. All data survives browser refreshes and restarts.
10. **Pre-Seeded College Sample Dataset & Reset**:
    - Pre-loaded with 6 popular engineering textbooks across CS, IT, ECE, and Mathematics.
    - Includes available books, an out-of-stock book, and active student loans with overdue dates to immediately demonstrate all features.
    - Includes "Load Sample Books" and "Reset Demo Data" buttons.
11. **Responsive Mobile-Friendly Layout**:
    - Designed with CSS Flexbox and Grid, Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*), and touch-friendly buttons for phones, tablets, and desktop computers.

---

## 📁 File Structure

```text
library-management/
├── index.html       # Semantic HTML5 markup, KPI dashboard, dual tabs, modals
├── style.css        # Modern design, overdue warning animations, and responsive rules
├── script.js        # ES6 inventory logic, issue/return workflows, and localStorage sync
├── server.js        # Zero-dependency local Node.js static server (Port 8087)
└── README.md        # Documentation, run guide, and College Viva Q&A
```

---

## 🚀 How to Run the Project

### Method 1: Via Local Node.js Server (Recommended)
1. Open PowerShell or Terminal in the `library management` folder:
   ```powershell
   cd "c:\Users\THARUN\Downloads\santhosh projects\library management"
   ```
2. Start the local static server:
   ```powershell
   node server.js
   ```
3. Open your browser and navigate to **http://localhost:8087** (the script will also attempt to open it automatically).

---

### Method 2: Directly in Any Web Browser
Double-click [index.html](file:///c:/Users/THARUN/Downloads/santhosh%20projects/library%20management/index.html) or right-click &rarr; **Open with Google Chrome / Microsoft Edge**.

---

## 🎓 College Viva Voce Questions & Answers

**Q1: How does the system prevent issuing a book when no copies are available?**  
*Answer*: The system computes $\text{availableCopies} = \text{totalCopies} - \text{issuedLoans.length}$. When this value is $\le 0$, the "Issue Book" button is disabled in the DOM, an "Out of Stock" badge is rendered, and the issue submission handler rejects any attempt to issue the book.

**Q2: How is an overdue book determined in JavaScript?**  
*Answer*: The system retrieves the current date in normalized `YYYY-MM-DD` format and compares it against the loan's `returnDate`. If $\text{returnDate} < \text{todayDate}$, the loan is flagged as overdue, computing the difference in days using `Math.round((returnTime - todayTime) / (1000 * 60 * 60 * 24))`.

**Q3: How does the return process update stock accurately?**  
*Answer*: When a return is processed, the student's loan record is removed from the book's `issuedLoans` array, and $\text{availableCopies}$ is incremented by 1 (clamped to $\le \text{totalCopies}$). The updated array is persisted to `localStorage` and triggers an immediate re-render of both the catalog and the KPI dashboard.

**Q4: Why is dual-view tab architecture beneficial for a library system?**  
*Answer*: It separates the **inventory catalog** (focused on book titles, authors, and stock quantities) from the **circulation desk** (focused on students, roll numbers, issue dates, and overdue penalties), mimicking real-world library operations.
