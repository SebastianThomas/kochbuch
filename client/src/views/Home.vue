<template>
  <div class="containter">
    <table>
      <tr>
        <td v-if="showImages" style="min-width: fit-content;" :width="imgWidth">
          <img
            :src="'/api/icons/icon/name/7a12730c7c8432cef48a6ba59d989dac.png'"
            alt="Ein Kochtopf"
            width="100%"
            id="img_kochtopf"
          />
        </td>
        <td>
          <div class="home">
            <h3 class="hello" v-if="loggedIn">
              Herzlich Willkommen
              {{ username }}!
            </h3>
            <h3 class="hello" v-if="!loggedIn">Herzlich Willkommen!</h3>
            <i>Hier sind alle Rezepte durch mindestens einmaliges Kochen oder Backen geprüft.</i>
            <p v-if="loggedIn">
              Sie möchten ein Rezept hinzufügen? Dann klicken Sie doch
              <router-link :to="{name: 'AddRecipe'}" exact class="router-links noMargin">hier</router-link>.
            </p>
            <p>Wir wünschen Ihnen einen guten Appetit!</p>
          </div>
        </td>
        <td v-if="showImages" style="min-width: fit-content;" :width="imgWidth">
          <img
            :src="'/api/icons/icon/name/0895f35d11c37cad72b0ba6634064842.png'"
            alt="Eine Kochmütze"
            width="100%"
            id="img_muetze"
          />
        </td>
      </tr>
    </table>
    <hr class="fatHr" />
    <div v-if="loggedIn">
      <div class="favorites">
        <ShowFavoriteRecipes></ShowFavoriteRecipes>
      </div>
      <hr class="fatHr" />
    </div>
    <div class="categories">
      <BrowseRecipesShort />
    </div>
    <!--<hr class="fatHr" />
    <div id="recipesDivision">
      <h3>Alle Rezepte</h3>
      <p>Hier sehen Sie alle unsere Rezepte. Wenn Sie mögen, probieren Sie sie doch direkt aus!</p>

      <ShowRecipes :items="this.recipes"></ShowRecipes>
    </div>-->
  </div>
</template>

<script>
import BrowseRecipesShort from '../recipes/BrowseRecipesShort.vue';
// import ShowRecipes from '../recipes/ShowRecipes.vue';
import ShowFavoriteRecipes from '../recipes/favorites/ShowFavoriteRecipes.vue';

import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Home',
  data() {
    return {
      items: [],

      showImages: window.innerWidth > 500,
      imgWidth: window.innerWidth < 600 ? '100%' : '15%',

      username: '',
      error: '',
    };
  },
  beforeMount() {
    this.username = sessionStorage.username ? sessionStorage.username : '';
  },
  computed: mapGetters(['user', 'loggedIn', 'recipes']),
  created() {
    if (sessionStorage) {
      if (sessionStorage.username) this.fetchUser(sessionStorage.username);
    }
    this.fetchRecipes();
  },
  components: {
    // ShowRecipes,
    ShowFavoriteRecipes,
    BrowseRecipesShort,
  },
  methods: {
    ...mapActions(['fetchRecipes', 'fetchUser']),
  },
  mounted() {
    if (sessionStorage) {
      if (sessionStorage.username) this.fetchUser(sessionStorage.username);
    }
  },
  updated() {
    if (sessionStorage) {
      if (sessionStorage.username) this.fetchUser(sessionStorage.username);
    }
  },
};
</script>

<style scoped>
.favorites {
  margin: 1rem 0 1rem 0;
}
#recipesDivision {
  margin: 1rem;
}
</style>
