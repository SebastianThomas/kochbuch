import { createStore } from 'vuex';

import authentication from './modules/authentication';
import recipes from './modules/recipes';
import shoppinglist from './modules/shoppinglist';

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    authentication,
    recipes,
    shoppinglist,
  },
});
