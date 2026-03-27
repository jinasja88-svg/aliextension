<template>
  <div class="sbi-container">
    <h3 class="sbi-title">이미지로 검색</h3>
    <p class="sbi-desc">이미지를 업로드하거나 URL을 입력하여 유사 상품을 검색합니다.</p>

    <div class="sbi-input-group">
      <input
        v-model="imageUrl"
        type="text"
        placeholder="이미지 URL 입력..."
        class="sbi-input"
        @keyup.enter="searchByUrl"
      />
      <button class="sbi-btn" @click="searchByUrl" :disabled="!imageUrl">검색</button>
    </div>

    <div class="sbi-shortcut-info">
      <p><kbd>Ctrl+Shift+1</kbd> — 스크린샷으로 검색</p>
      <p><kbd>Ctrl+Shift+2</kbd> — 페이지 번역</p>
      <p><kbd>Ctrl+Shift+3</kbd> — 스크린샷 번역</p>
    </div>

    <div class="sbi-platforms">
      <h4>검색 플랫폼</h4>
      <div class="sbi-platform-grid">
        <label v-for="p in platforms" :key="p.id" class="sbi-platform-item">
          <input type="checkbox" v-model="selectedPlatforms" :value="p.id" />
          <span>{{ p.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { IMAGE_SEARCH_PLATFORMS } from '../../../shared/platforms';
import { sendMessage } from '../../../shared/wext';
import { ROUTES } from '../../../shared/constants';

export default {
  name: 'SearchByImage',
  data() {
    return {
      imageUrl: '',
      platforms: IMAGE_SEARCH_PLATFORMS.slice(0, 15),
      selectedPlatforms: ['alibabaCN', 'taobao', 'googleLens', 'naverShopping'],
    };
  },
  methods: {
    async searchByUrl() {
      if (!this.imageUrl) return;
      await sendMessage(ROUTES.TAB_CREATE, {
        url: this.imageUrl,
        active: true,
      });
    },
  },
};
</script>

<style scoped>
.sbi-container { padding: 4px; }
.sbi-title { font-size: 15px; margin-bottom: 8px; }
.sbi-desc { font-size: 12px; color: #666; margin-bottom: 14px; }
.sbi-input-group {
  display: flex; gap: 6px; margin-bottom: 16px;
}
.sbi-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
}
.sbi-input:focus {
  outline: none;
  border-color: #1890ff;
}
.sbi-btn {
  padding: 6px 16px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.sbi-btn:hover { background: #40a9ff; }
.sbi-btn:disabled { background: #d9d9d9; cursor: not-allowed; }
.sbi-shortcut-info {
  background: #f6f6f6;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}
.sbi-shortcut-info p {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.sbi-shortcut-info kbd {
  background: #e8e8e8;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-family: monospace;
}
.sbi-platforms h4 { font-size: 13px; margin-bottom: 8px; }
.sbi-platform-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}
.sbi-platform-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; cursor: pointer;
}
.sbi-platform-item input { margin: 0; }
</style>
