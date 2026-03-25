import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import browser from 'webextension-polyfill';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    activeTab: 'searchByImage',
    settings: {
      enableSearchByImage: true,
      enableSearchByImageScreenshot: true,
      displaySearchByImageButtonOnImage: true,
      enableTranslator: true,
      enableGoogleTranslate: true,
      defaultCurrency: 'KRW',
      language: 'ko',
      searchByImageLastestSelectedStore: 'alibabaCN',
      searchByImageStoreFilters: [],
    },
    favorites: [],
    priceDropInbox: [],
  },
  mutations: {
    SET_ACTIVE_TAB(state, tab) {
      state.activeTab = tab;
    },
    UPDATE_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },
    SET_FAVORITES(state, favorites) {
      state.favorites = favorites;
    },
    ADD_FAVORITE(state, item) {
      state.favorites.push(item);
    },
    REMOVE_FAVORITE(state, index) {
      state.favorites.splice(index, 1);
    },
    SET_PRICE_DROP_INBOX(state, inbox) {
      state.priceDropInbox = inbox;
    },
  },
  actions: {
    updateSettings({ commit }, settings) {
      commit('UPDATE_SETTINGS', settings);
    },
  },
  plugins: [
    createPersistedState({
      key: '@@vwe-persistence',
      storage: {
        getItem: async (key) => {
          const result = await browser.storage.local.get(key);
          return result[key] || null;
        },
        setItem: async (key, value) => {
          await browser.storage.local.set({ [key]: value });
        },
        removeItem: async (key) => {
          await browser.storage.local.remove(key);
        },
      },
    }),
  ],
});
