<template>
  <div class="ap-popup">
    <div class="ap-popup-header">
      <img class="ap-popup-logo" :src="logoUrl" alt="SourceFinder" />
      <span class="ap-popup-name">SourceFinder</span>
      <span class="ap-popup-version">v{{ version }}</span>
    </div>
    <div class="ap-popup-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['ap-tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="ap-popup-content">
      <SearchByImage v-if="activeTab === 'searchByImage'" />
      <div v-else class="ap-tab-placeholder">
        <p>{{ getTabLabel(activeTab) }} — 준비 중</p>
      </div>
    </div>
  </div>
</template>

<script>
import SearchByImage from './components/tabs/SearchByImage.vue';

export default {
  name: 'App',
  components: { SearchByImage },
  data() {
    return {
      activeTab: 'searchByImage',
      version: '1.0.0',
      tabs: [
        { id: 'searchByImage', label: '이미지 검색' },
        { id: 'sameProducts', label: '동일 상품' },
        { id: 'priceHistory', label: '가격 이력' },
        { id: 'sellerAnalysis', label: '판매자 분석' },
        { id: 'reviews', label: '리뷰' },
        { id: 'currencyConverter', label: '환율' },
        { id: 'favorites', label: '즐겨찾기' },
        { id: 'daigou', label: '구매대행' },
      ],
    };
  },
  computed: {
    logoUrl() {
      return chrome.runtime.getURL('icons/32.png');
    },
  },
  methods: {
    getTabLabel(id) {
      const tab = this.tabs.find(t => t.id === id);
      return tab ? tab.label : id;
    },
  },
};
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.ap-popup {
  width: 360px;
  min-height: 480px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #333;
  background: #fff;
}
.ap-popup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}
.ap-popup-logo {
  width: 24px; height: 24px;
}
.ap-popup-name {
  font-size: 14px;
  font-weight: 600;
  color: #0ea5e9;
}
.ap-popup-version {
  font-size: 11px;
  color: #999;
}
.ap-popup-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.ap-tab-btn {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
}
.ap-tab-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}
.ap-tab-btn.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}
.ap-popup-content {
  padding: 12px;
  min-height: 360px;
}
.ap-tab-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}
</style>
