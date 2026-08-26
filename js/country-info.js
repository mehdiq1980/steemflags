// Steem Flags - Country information helper
// Displays additional information after answering a question.

export function showCountryInfo(container, country) {
  if (!container) return;

  container.hidden = false;
  container.style.display = 'block';
  container.innerHTML = `
    <h3>More Information...</h3>
    <p>${country || ''}</p>
  `;
}

export function hideCountryInfo(container) {
  if (!container) return;
  container.hidden = true;
  container.style.display = 'none';
  container.innerHTML = '';
}
