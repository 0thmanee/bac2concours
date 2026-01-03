/**
 * Report Generator Utilities
 * Generates beautifully formatted HTML/PDF reports from report data
 * Uses dynamic app theme colors from globals.css
 */

import type {
  BudgetReport,
  ExpenseReport,
  ActivityReport,
} from "@/lib/types/report.types";
import { formatCurrency } from "./startup.utils";

// Helper to format date for reports
function formatReportDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ReportMetadata {
  reportType: string;
  period: string;
  startupName?: string;
  generatedAt: Date;
}

// Dynamic app theme colors - Updated brand colors
// Primary: #047C6E (Teal), replaced Midnight Blue (#0B1C2D)
const COLORS = {
  primary: "#047C6E", // Primary Teal
  primaryLight: "#E8F9F7",
  primaryDark: "#035854",

  textPrimary: "#0F172A", // slate-900
  textSecondary: "#475569", // slate-600
  textTertiary: "#64748B", // slate-500
  textInverse: "#FFFFFF",

  background: "#F8FAFC", // slate-50
  surface: "#FFFFFF",

  border: "#E2E8F0", // slate-200
  borderStrong: "#CBD5E1", // slate-300

  success: "#22C55E",
  successLight: "#DCFCE7",
  warning: "#EAB308",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
};

// Fetch and cache logo as base64
let cachedLogoBase64: string | null = null;

async function getLogoBase64(): Promise<string> {
  if (cachedLogoBase64) return cachedLogoBase64;

  try {
    if (typeof window !== "undefined") {
      const response = await fetch("/logo.png");
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          cachedLogoBase64 = base64;
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.warn("Failed to load logo:", error);
  }

  return "";
}

// Type detection helpers
function isBudgetReport(
  data: BudgetReport | ExpenseReport | ActivityReport
): data is BudgetReport {
  return (
    "summary" in data && "report" in data && "totalStartups" in data.summary
  );
}

function isExpenseReport(
  data: BudgetReport | ExpenseReport | ActivityReport
): data is ExpenseReport {
  return "summary" in data && "byStatus" in data && "byCategory" in data;
}

function isActivityReport(
  data: BudgetReport | ExpenseReport | ActivityReport
): data is ActivityReport {
  return "summary" in data && "progressUpdates" in data && "timeline" in data;
}

function generateLogoHeader(logoBase64: string): string {
  return `
    <div class="logo-header">
      <div class="logo-container">
        <img src="${logoBase64}" alt="2BAConcours Logo" />
      </div>
    </div>
  `;
}

function generateHeader(metadata: ReportMetadata): string {
  const periodDisplay =
    metadata.period === "all-time"
      ? "All Time"
      : metadata.period
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

  return `
    <div class="header">
      <h1>${metadata.reportType}</h1>
      <div class="header-meta">
        <div class="header-meta-item"><strong>Period:</strong> ${periodDisplay}</div>
        ${
          metadata.startupName
            ? `<div class="header-meta-item"><strong>Startup:</strong> ${metadata.startupName}</div>`
            : ""
        }
        <div class="header-meta-item"><strong>Generated:</strong> ${formatReportDate(
          metadata.generatedAt
        )}</div>
      </div>
    </div>
  `;
}

function generateBudgetReportHTML(data: BudgetReport): string {
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-card-label">Total Startups</div>
        <div class="summary-card-value">${data.summary.totalStartups}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Budget</div>
        <div class="summary-card-value">${formatCurrency(
          data.summary.totalBudget,
          { useK: true }
        )}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Allocated</div>
        <div class="summary-card-value">${formatCurrency(
          data.summary.totalAllocated,
          { useK: true }
        )}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Spent</div>
        <div class="summary-card-value">${formatCurrency(
          data.summary.totalSpent,
          { useK: true }
        )}</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Budget by Startup</h2>
      ${data.report
        .map(
          (item) => `
        <div class="card">
          <h3 class="card-title">${item.startup.name}</h3>
          <div class="card-grid">
            <div class="card-item">
              <div class="card-item-label">Total Budget</div>
              <div class="card-item-value">${formatCurrency(
                item.budget.total
              )}</div>
            </div>
            <div class="card-item">
              <div class="card-item-label">Allocated</div>
              <div class="card-item-value">${formatCurrency(
                item.budget.allocated
              )}</div>
            </div>
            <div class="card-item">
              <div class="card-item-label">Spent</div>
              <div class="card-item-value">${formatCurrency(
                item.budget.spent
              )}</div>
            </div>
            <div class="card-item">
              <div class="card-item-label">Remaining</div>
              <div class="card-item-value">${formatCurrency(
                item.budget.remaining
              )}</div>
            </div>
            <div class="card-item">
              <div class="card-item-label">Utilization</div>
              <div class="card-item-value">${(
                (item.budget.spent / item.budget.total) *
                100
              ).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function generateExpenseReportHTML(data: ExpenseReport): string {
  const pendingCount = data.byStatus.PENDING?.count || 0;

  return `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-card-label">Total Expenses</div>
        <div class="summary-card-value">${data.summary.totalExpenses}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Amount</div>
        <div class="summary-card-value">${formatCurrency(
          data.summary.totalAmount,
          { useK: true }
        )}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Approved</div>
        <div class="summary-card-value">${formatCurrency(
          data.summary.approvedAmount,
          { useK: true }
        )}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Pending</div>
        <div class="summary-card-value">${pendingCount}</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Expenses by Status</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Total Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(data.byStatus)
              .map(
                ([status, item]) => `
              <tr>
                <td><span class="badge badge-${status.toLowerCase()}">${status}</span></td>
                <td>${item.count}</td>
                <td>${formatCurrency(item.total)}</td>
                <td>${
                  data.summary.totalAmount > 0
                    ? ((item.total / data.summary.totalAmount) * 100).toFixed(1)
                    : 0
                }%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Expenses by Category</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Startup</th>
              <th>Count</th>
              <th>Total Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${data.byCategory
              .map(
                (item) => `
              <tr>
                <td>${item.categoryName}</td>
                <td>${item.startupName}</td>
                <td>${item.count}</td>
                <td>${formatCurrency(item.total)}</td>
                <td>${
                  data.summary.totalAmount > 0
                    ? ((item.total / data.summary.totalAmount) * 100).toFixed(1)
                    : 0
                }%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function generateActivityReportHTML(data: ActivityReport): string {
  const updates = data.progressUpdates.items || [];

  return `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-card-label">Total Progress Updates</div>
        <div class="summary-card-value">${
          data.summary.totalProgressUpdates
        }</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Active Startups</div>
        <div class="summary-card-value">${data.summary.activeStartups}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Expenses</div>
        <div class="summary-card-value">${data.summary.totalExpenses}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Expense Amount</div>
        <div class="summary-card-value">${formatCurrency(data.expenses.total, {
          useK: true,
        })}</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Recent Progress Updates</h2>
      ${
        updates.length === 0
          ? '<p style="color: ' +
            COLORS.textSecondary +
            ';">No progress updates found for the selected period.</p>'
          : updates
              .slice(0, 20)
              .map(
                (update) => `
        <div class="card">
          <h3 class="card-title">${update.startup.name}</h3>
          <div class="card-grid">
            <div class="card-item">
              <div class="card-item-label">Updated</div>
              <div class="card-item-value">${formatReportDate(
                update.createdAt
              )}</div>
            </div>
            <div class="card-item">
              <div class="card-item-label">Submitted By</div>
              <div class="card-item-value">${update.submittedBy.name}</div>
            </div>
          </div>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${
            COLORS.border
          };">
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 600; color: ${
                COLORS.textPrimary
              }; margin-bottom: 4px;">What Was Done</div>
              <div style="color: ${
                COLORS.textSecondary
              }; white-space: pre-wrap; word-break: break-word;">${
                  update.whatWasDone || "N/A"
                }</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 600; color: ${
                COLORS.textPrimary
              }; margin-bottom: 4px;">What Is Blocked</div>
              <div style="color: ${
                COLORS.textSecondary
              }; white-space: pre-wrap; word-break: break-word;">${
                  update.whatIsBlocked || "N/A"
                }</div>
            </div>
            <div>
              <div style="font-weight: 600; color: ${
                COLORS.textPrimary
              }; margin-bottom: 4px;">What Is Next</div>
              <div style="color: ${
                COLORS.textSecondary
              }; white-space: pre-wrap; word-break: break-word;">${
                  update.whatIsNext || "N/A"
                }</div>
            </div>
          </div>
        </div>
      `
              )
              .join("")
      }
    </div>

    ${
      data.activityByStartup.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">Activity by Startup</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Startup</th>
              <th>Progress Updates</th>
              <th>Expenses</th>
              <th>Total Spent</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            ${data.activityByStartup
              .map(
                (item) => `
              <tr>
                <td>${item.startup.name}</td>
                <td>${item.progressUpdateCount}</td>
                <td>${item.expenseCount}</td>
                <td>${formatCurrency(item.totalExpenseAmount)}</td>
                <td>${formatReportDate(item.lastActivity)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
    `
        : ""
    }
  `;
}

function generateFooter(metadata: ReportMetadata): string {
  return `
    <div class="footer">
      <p>Généré par 2BAConcours le ${formatReportDate(
        metadata.generatedAt
      )}</p>
      <span>•</span>
      <p>Ceci est un rapport automatisé. Pour toute question, veuillez contacter votre administrateur.</p>
    </div>
  `;
}

export function generateHTMLReport(
  reportData: BudgetReport | ExpenseReport | ActivityReport,
  metadata: ReportMetadata,
  logoBase64?: string
): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.reportType} Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: ${COLORS.textPrimary};
      background: ${COLORS.background};
      padding: 40px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: ${COLORS.surface};
      padding: 40px;
      border-radius: 8px;
    }

    .logo-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${COLORS.border};
    }

    .logo-container {
      width: 140px;
      height: 56px;
      flex-shrink: 0;
    }

    .logo-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .header {
      border-bottom: 3px solid ${COLORS.primary};
      padding-bottom: 30px;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      color: ${COLORS.textPrimary};
      margin-bottom: 10px;
    }

    .header-meta {
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
      font-size: 14px;
      color: ${COLORS.textSecondary};
      margin-top: 15px;
    }

    .header-meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .summary-card {
      background: ${COLORS.primaryLight};
      border: 1px solid ${COLORS.border};
      padding: 24px;
      border-radius: 8px;
    }

    .summary-card-label {
      font-size: 13px;
      color: ${COLORS.textSecondary};
      margin-bottom: 8px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-card-value {
      font-size: 28px;
      font-weight: 700;
      color: ${COLORS.primary};
    }

    .section {
      margin-bottom: 50px;
    }

    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: ${COLORS.textPrimary};
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid ${COLORS.border};
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 30px;
      border-radius: 8px;
      border: 1px solid ${COLORS.border};
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: ${COLORS.primary};
      color: ${COLORS.textInverse};
    }

    th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 16px;
      border-bottom: 1px solid ${COLORS.border};
      font-size: 14px;
      color: ${COLORS.textPrimary};
    }

    tbody tr:hover {
      background: ${COLORS.background};
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-pending {
      background: ${COLORS.warningLight};
      color: #92400e;
    }

    .badge-approved {
      background: ${COLORS.successLight};
      color: #065f46;
    }

    .badge-rejected {
      background: ${COLORS.errorLight};
      color: #991b1b;
    }

    .card {
      background: ${COLORS.surface};
      border: 1px solid ${COLORS.border};
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: ${COLORS.textPrimary};
      margin-bottom: 16px;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }

    .card-item {
      display: flex;
      flex-direction: column;
    }

    .card-item-label {
      font-size: 12px;
      color: ${COLORS.textSecondary};
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-item-value {
      font-size: 20px;
      font-weight: 700;
      color: ${COLORS.primary};
    }

    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid ${COLORS.border};
      text-align: center;
      color: ${COLORS.textSecondary};
      font-size: 13px;
      page-break-inside: avoid;
    }

    .footer p {
      display: inline-block;
      margin: 0 8px;
      vertical-align: middle;
    }

    @media print {
      body {
        padding: 20px;
      }

      .container {
        padding: 30px;
      }

      .summary-card {
        break-inside: avoid;
      }

      .section {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .table-container {
        overflow: visible;
      }

      .footer {
        page-break-inside: avoid;
      }
    }

    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }

      .card-grid {
        grid-template-columns: 1fr;
      }

      table {
        font-size: 12px;
      }

      th, td {
        padding: 10px;
      }

      .logo-container {
        width: 120px;
        height: 48px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${logoBase64 ? generateLogoHeader(logoBase64) : ""}
    ${generateHeader(metadata)}
    ${isBudgetReport(reportData) ? generateBudgetReportHTML(reportData) : ""}
    ${isExpenseReport(reportData) ? generateExpenseReportHTML(reportData) : ""}
    ${
      isActivityReport(reportData) ? generateActivityReportHTML(reportData) : ""
    }
    ${generateFooter(metadata)}
  </div>
</body>
</html>
  `;

  return html.trim();
}

/**
 * Generate and download HTML report
 */
export function downloadHTMLReport(
  reportData: BudgetReport | ExpenseReport | ActivityReport,
  metadata: ReportMetadata,
  logoBase64?: string
): void {
  const html = generateHTMLReport(reportData, metadata, logoBase64);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${metadata.reportType.toLowerCase().replace(/\s+/g, "-")}-${
    metadata.period
  }-${new Date().toISOString().split("T")[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download PDF report using jsPDF and html2canvas
 */
export async function downloadPDFReport(
  reportData: BudgetReport | ExpenseReport | ActivityReport,
  metadata: ReportMetadata,
  logoBase64?: string
): Promise<void> {
  try {
    const jsPDFModule = await import("jspdf");
    const html2canvasModule = await import("html2canvas");
    const jsPDF = jsPDFModule.default;
    const html2canvas = html2canvasModule.default;

    const html = generateHTMLReport(reportData, metadata, logoBase64);

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "1200px";
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: COLORS.background,
        windowWidth: 1200,
        height: tempDiv.scrollHeight + 100,
        scrollY: 0,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      const fileName = `${metadata.reportType
        .toLowerCase()
        .replace(/\s+/g, "-")}-${metadata.period}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
    } finally {
      document.body.removeChild(tempDiv);
    }
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}

/**
 * Load logo and return base64 data URL
 */
export async function loadLogoBase64(): Promise<string> {
  return getLogoBase64();
}
