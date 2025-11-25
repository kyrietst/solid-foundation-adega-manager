/**
 * Dashboard Date Helpers
 * Utilities for date formatting and calculations in dashboard components
 */

/**
 * Returns the current month label in Portuguese (e.g., "Novembro 2025")
 * Always uses São Paulo timezone for consistency
 */
export const getCurrentMonthLabel = (): string => {
  const nowSP = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[nowSP.getMonth()]} ${nowSP.getFullYear()}`;
};

/**
 * Returns the first day of the current month at 00:00:00 in São Paulo timezone
 * Used for Month-to-Date (MTD) calculations
 */
export const getMonthStartDate = (): Date => {
  const nowSP = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  return new Date(nowSP.getFullYear(), nowSP.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Returns the current date/time in São Paulo timezone
 */
export const getNowSaoPaulo = (): Date => {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
};

/**
 * Returns a formatted date range string for the current MTD period
 * Example: "01/11 até 24/11"
 */
export const getDataPeriodLabel = (): string => {
  const nowSP = getNowSaoPaulo();
  const startDay = '01';
  const currentDay = nowSP.getDate().toString().padStart(2, '0');
  const month = (nowSP.getMonth() + 1).toString().padStart(2, '0');
  return `${startDay}/${month} até ${currentDay}/${month}`;
};
