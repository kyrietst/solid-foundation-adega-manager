/**
 * @fileoverview Utilitários padronizados para timezone de São Paulo
 *
 * IMPORTANTE: Todo o sistema deve usar EXCLUSIVAMENTE estas funções
 * para operações de data/hora. Isso garante consistência em:
 * - Timestamps de criação de registros
 * - Filtros de relatórios
 * - Logs e auditoria
 * - Estimativas de delivery
 *
 * @author Adega Manager Team
 * @version 1.0.0 - Timezone São Paulo Padronizado
 */

const SAO_PAULO_TIMEZONE = 'America/Sao_Paulo'; // Sem acento para compatibilidade Node.js

/**
 * Obter timestamp atual em formato ISO string no horário de São Paulo
 *
 * USO: Substituir new Date().toISOString() em TODOS os locais
 *
 * @returns {string} Timestamp ISO em horário de São Paulo
 */
export function getSaoPauloTimestamp(): string {
  const now = new Date();
  const spTime = new Date(now.toLocaleString("en-US", {timeZone: SAO_PAULO_TIMEZONE}));
  return spTime.toISOString();
}

/**
 * Converter qualquer timestamp para horário de São Paulo
 *
 * @param {string | Date} timestamp - Timestamp UTC ou Date object
 * @returns {Date} Date object no horário de São Paulo
 */
export function convertToSaoPaulo(timestamp: string | Date): Date {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return new Date(date.toLocaleString("en-US", {timeZone: SAO_PAULO_TIMEZONE}));
}

/**
 * Formatar timestamp no padrão brasileiro (dd/mm/aaaa hh:mm)
 *
 * @param {string | Date} timestamp - Timestamp para formatar
 * @returns {string} Data formatada em português brasileiro
 */
export function formatBrazilian(timestamp: string | Date): string {
  const spDate = convertToSaoPaulo(timestamp);
  return spDate.toLocaleString('pt-BR', {
    timeZone: SAO_PAULO_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Criar ranges de data para filtros (períodos de relatórios)
 *
 * USO: Substituir new Date() em filtros de dashboard/relatórios
 *
 * @param {number} windowDays - Número de dias para o período
 * @returns {object} Objeto com ranges current e previous
 */
export function getSaoPauloDateRange(windowDays: number) {
  // Obter data atual em São Paulo
  const nowSP = convertToSaoPaulo(new Date());

  const endDate = new Date(nowSP);
  const startDate = new Date(nowSP);
  startDate.setDate(endDate.getDate() - windowDays);

  // Período anterior para comparação
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(startDate.getDate() - windowDays);

  return {
    current: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    previous: {
      start: prevStartDate.toISOString(),
      end: startDate.toISOString()
    }
  };
}

/**
 * Verificar se uma data é hoje (no horário de São Paulo)
 *
 * @param {string | Date} timestamp - Timestamp para verificar
 * @returns {boolean} True se for hoje
 */
export function isToday(timestamp: string | Date): boolean {
  const spDate = convertToSaoPaulo(timestamp);
  const today = convertToSaoPaulo(new Date());
  return spDate.toDateString() === today.toDateString();
}

/**
 * Obter data de início do dia atual em São Paulo
 *
 * USO: Para filtros de "vendas de hoje", "movimentações de hoje"
 *
 * @returns {string} ISO string do início do dia (00:00:00)
 */
export function getTodayStartSaoPaulo(): string {
  const nowSP = convertToSaoPaulo(new Date());
  const startOfDay = new Date(nowSP);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.toISOString();
}

/**
 * Obter data de fim do dia atual em São Paulo
 *
 * USO: Para filtros de "vendas de hoje", "movimentações de hoje"
 *
 * @returns {string} ISO string do fim do dia (23:59:59)
 */
export function getTodayEndSaoPaulo(): string {
  const nowSP = convertToSaoPaulo(new Date());
  const endOfDay = new Date(nowSP);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
}

/**
 * Calcular tempo estimado de entrega baseado no horário de São Paulo
 *
 * USO: Para delivery estimates no sistema de vendas
 *
 * @param {number} minutesToAdd - Minutos para adicionar ao horário atual
 * @returns {string} ISO string do horário estimado
 */
export function calculateDeliveryTime(minutesToAdd: number): string {
  const nowSP = convertToSaoPaulo(new Date());
  const estimatedTime = new Date(nowSP.getTime() + minutesToAdd * 60 * 1000);
  return estimatedTime.toISOString();
}

/**
 * Função para logs com timestamp de São Paulo
 *
 * USO: Substituir new Date().toISOString() em console.log
 *
 * @returns {string} Timestamp formatado para logs
 */
export function getLogTimestamp(): string {
  return formatBrazilian(new Date());
}

// Exportar também como funções de conveniência
export {
  getSaoPauloTimestamp as now,
  getSaoPauloDateRange as dateRange,
  formatBrazilian as format,
  calculateDeliveryTime as deliveryEta
};

/**
 * REGRAS DE USO OBRIGATÓRIAS:
 *
 * ❌ NUNCA USAR:
 * - new Date().toISOString()
 * - date.toISOString() sem conversão
 * - new Date() para filtros de período
 * - Date.now() para timestamps
 *
 * ✅ SEMPRE USAR:
 * - getSaoPauloTimestamp() para timestamps
 * - getSaoPauloDateRange() para filtros
 * - convertToSaoPaulo() para conversões
 * - calculateDeliveryTime() para delivery
 *
 * 📝 EXEMPLOS:
 *
 * // ❌ Errado
 * created_at: new Date().toISOString()
 *
 * // ✅ Correto
 * created_at: getSaoPauloTimestamp()
 *
 * // ❌ Errado
 * const startDate = new Date()
 * startDate.setDate(endDate.getDate() - 30)
 *
 * // ✅ Correto
 * const { current } = getSaoPauloDateRange(30)
 *
 */