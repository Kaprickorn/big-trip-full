export function formatDuration(dateFrom, dateTo) {
  const diffMs = new Date(dateTo) - new Date(dateFrom);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  const mins = diffMins % 60;
  const hours = diffHours % 24;
  
  if (diffDays > 0) {
    return `${diffDays}D ${hours.toString().padStart(2, '0')}H ${mins.toString().padStart(2, '0')}M`;
  }
  if (diffHours > 0) {
    return `${hours.toString().padStart(2, '0')}H ${mins.toString().padStart(2, '0')}M`;
  }
  return `${mins}M`;
}

export function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
}

export function getDateForFlatpickr(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}