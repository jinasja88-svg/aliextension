import { createShadowHost, removeShadowHost } from './shadow-host';

const PANEL_ID = 'ap-aside-panel';
let panelState = 'closed'; // 'closed', 'open', 'minimized'

/**
 * Show the search results panel
 */
export function showResultsPanel(results = [], options = {}) {
  const shadow = createShadowHost(PANEL_ID);

  // Clear previous content (keep base style)
  const existing = shadow.querySelector('.ap-panel');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.textContent = `
    .ap-panel {
      position: fixed;
      top: 0; right: 0;
      width: 380px;
      height: 100vh;
      background: #fff;
      box-shadow: -2px 0 8px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483646;
    }
    .ap-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e8e8e8;
      background: #fafafa;
    }
    .ap-panel-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    .ap-panel-controls {
      display: flex;
      gap: 8px;
    }
    .ap-panel-btn {
      width: 28px; height: 28px;
      border: none; border-radius: 4px;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      color: #666;
      display: flex; align-items: center; justify-content: center;
    }
    .ap-panel-btn:hover { background: #e8e8e8; }
    .ap-panel-filters {
      display: flex;
      gap: 4px;
      padding: 8px 16px;
      overflow-x: auto;
      border-bottom: 1px solid #f0f0f0;
    }
    .ap-filter-tab {
      padding: 4px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 16px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
      color: #666;
    }
    .ap-filter-tab.active {
      background: #1890ff;
      color: #fff;
      border-color: #1890ff;
    }
    .ap-panel-results {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .ap-result-card {
      display: flex;
      gap: 10px;
      padding: 10px;
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .ap-result-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .ap-result-img {
      width: 80px; height: 80px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .ap-result-info {
      flex: 1;
      min-width: 0;
    }
    .ap-result-title {
      font-size: 13px;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .ap-result-price {
      font-size: 15px;
      font-weight: 600;
      color: #ff4d4f;
    }
    .ap-result-platform {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
    }
    .ap-panel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #999;
    }
    .ap-panel-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #666;
    }
    .ap-panel.minimized {
      width: 48px;
      height: 48px;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 8px 0 0 8px;
      box-shadow: -2px 0 8px rgba(0,0,0,0.2);
      cursor: pointer;
      overflow: hidden;
    }
  `;
  shadow.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'ap-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'ap-panel-header';
  header.innerHTML = `
    <span class="ap-panel-title">이미지 검색 결과</span>
    <div class="ap-panel-controls">
      <button class="ap-panel-btn ap-btn-minimize" title="최소화">−</button>
      <button class="ap-panel-btn ap-btn-close" title="닫기">×</button>
    </div>
  `;
  panel.appendChild(header);

  // Close/Minimize handlers
  header.querySelector('.ap-btn-close').addEventListener('click', () => {
    hideResultsPanel();
  });
  header.querySelector('.ap-btn-minimize').addEventListener('click', () => {
    panel.classList.toggle('minimized');
    panelState = panel.classList.contains('minimized') ? 'minimized' : 'open';
  });

  // Platform filter tabs
  const platforms = [...new Set(results.map(r => r.platform))];
  if (platforms.length > 1) {
    const filters = document.createElement('div');
    filters.className = 'ap-panel-filters';

    const allTab = document.createElement('button');
    allTab.className = 'ap-filter-tab active';
    allTab.textContent = `전체 (${results.length})`;
    allTab.addEventListener('click', () => {
      filters.querySelectorAll('.ap-filter-tab').forEach(t => t.classList.remove('active'));
      allTab.classList.add('active');
      renderResults(resultsContainer, results);
    });
    filters.appendChild(allTab);

    platforms.forEach(p => {
      const tab = document.createElement('button');
      tab.className = 'ap-filter-tab';
      const count = results.filter(r => r.platform === p).length;
      tab.textContent = `${p} (${count})`;
      tab.addEventListener('click', () => {
        filters.querySelectorAll('.ap-filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderResults(resultsContainer, results.filter(r => r.platform === p));
      });
      filters.appendChild(tab);
    });

    panel.appendChild(filters);
  }

  // Results container
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'ap-panel-results';
  panel.appendChild(resultsContainer);

  renderResults(resultsContainer, results);

  shadow.appendChild(panel);
  panelState = 'open';
}

/**
 * Render result cards
 */
function renderResults(container, results) {
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<div class="ap-panel-empty"><p>검색 결과가 없습니다</p></div>';
    return;
  }

  results.forEach(result => {
    const card = document.createElement('div');
    card.className = 'ap-result-card';
    card.addEventListener('click', () => {
      window.open(result.productUrl, '_blank');
    });

    card.innerHTML = `
      <img class="ap-result-img" src="${result.imageUrl || ''}" alt="" onerror="this.style.display='none'">
      <div class="ap-result-info">
        <div class="ap-result-title">${result.title || '제목 없음'}</div>
        <div class="ap-result-price">${result.price || ''}</div>
        <div class="ap-result-platform">${result.platform || ''}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Show loading state
 */
export function showLoadingPanel() {
  const shadow = createShadowHost(PANEL_ID);
  const existing = shadow.querySelector('.ap-panel');
  if (existing) {
    const results = existing.querySelector('.ap-panel-results');
    if (results) {
      results.innerHTML = '<div class="ap-panel-loading">검색 중...</div>';
    }
    return;
  }
  showResultsPanel([], {});
}

/**
 * Add results to existing panel
 */
export function appendResults(newResults) {
  const host = document.getElementById(PANEL_ID);
  if (!host) return showResultsPanel(newResults);

  const shadow = host.shadowRoot;
  const container = shadow.querySelector('.ap-panel-results');
  if (!container) return;

  newResults.forEach(result => {
    const card = document.createElement('div');
    card.className = 'ap-result-card';
    card.addEventListener('click', () => window.open(result.productUrl, '_blank'));
    card.innerHTML = `
      <img class="ap-result-img" src="${result.imageUrl || ''}" alt="" onerror="this.style.display='none'">
      <div class="ap-result-info">
        <div class="ap-result-title">${result.title || '제목 없음'}</div>
        <div class="ap-result-price">${result.price || ''}</div>
        <div class="ap-result-platform">${result.platform || ''}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Hide the results panel
 */
export function hideResultsPanel() {
  removeShadowHost(PANEL_ID);
  panelState = 'closed';
}
