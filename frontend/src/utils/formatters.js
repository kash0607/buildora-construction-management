/**
 * BUILDORA — Formatters & Helper Utilities
 * Centralized formatting for Currency, Dates, Percentages, and Quantities.
 */

/**
 * Format Indian Rupees (INR) with standard Crore / Lakh / Thousand suffixes or full commas.
 * @param {number} amount
 * @param {boolean} compact - If true, formats as ₹12.5 Cr / ₹4.2 Lakh
 */
export function formatCurrency(amount, compact = false) {
  const num = Number(amount) || 0;

  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lakh`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1)} K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format localized date strings (e.g. "24 Oct 2026")
 * @param {string|Date} dateInput
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format relative time or ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(dateInput) {
  if (!dateInput) return '';
  try {
    return new Date(dateInput).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 0) {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)}%`;
}
