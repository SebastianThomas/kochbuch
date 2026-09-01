<template>
  <div class="container">
    <p class="error" v-if="error">{{ error }}</p>
    <p class="noneFound" v-if="!item">Das Rezept existiert nicht (mehr)...</p>

    <div v-if="item">
      <button class="genpdf" @click="genpdfButtonClicked" style="width: 50px; height: 50px;">PDF</button>

      <button
        class="delete"
        @click="deleteButtonClicked"
        v-if="loggedIn && user.username === item.username"
        style="width: 50px; height: 50px;"
      >
        <img
          id="editIcon"
          src="../assets/delete_icon.png"
          alt="Suchen"
          style="width: 30px; height: 30px;"
        />
      </button>

      <button
        class="edit"
        @click="editButtonClicked"
        v-if="loggedIn && user.username === item.username"
        style="width: 50px; height: 50px;"
      >
        <img
          id="editIcon"
          src="../assets/edit_icon.png"
          alt="Suchen"
          style="width: 30px; height: 30px;"
        />
      </button>

      <button
        class="favorite"
        @click="favoriteButtonClicked"
        v-if="loggedIn"
        style="width: 50px; height: 50px;"
        :class="{favoriteClass: isFavorite}"
      >
        <img
          id="favoriteIcon"
          src="../assets/favorite_icon.svg"
          alt="Lieblingsrezept"
          style="width: 30px; height: 30px;"
        />
      </button>

      <h3>Rezept:</h3>
      <h4>{{ item.title }}</h4>
      <p>
        Hinzugefügt von
        <router-link
          :to="{name: 'User', params: {username: this.item.username}}"
          class="router-links noMargin"
        >{{ this.item.username }}</router-link>
        am {{ this.createdAt }}
      </p>
      <hr class="fatHr" />

      <div class="table">
        <div style="max-width: fit-content; max-width: 100%; float: left;">
          <Ingredients :ingredients="item.ingredients" style="max-width: 100%;" />
        </div>
        <div style="overflow: hidden;">
          <h4>Beschreibung</h4>
          <pre>{{ this.item.description }}</pre>
        </div>

        <div class="pictures">
          <ShowPictures :recipeId="this.$route.params.id"></ShowPictures>
          <router-link
            :to="{name: 'AddPicture', params: {recipeId: this.item._id}}"
            class="router-links"
          >Bild Hinzufügen</router-link>
        </div>
      </div>
    </div>
    <p class="message">{{ message }}</p>
  </div>
</template>

<script>
import ItemService from '../ItemService';
import UserService from '../UserService';

import Ingredients from './recipe/Ingredients.vue';
import ShowPictures from '../components/ShowPictures.vue';

import { mapGetters, mapActions } from 'vuex';

import PDFUtils from '../PDFUtils';

export default {
  name: 'Recipe',
  components: {
    Ingredients,
    ShowPictures,
  },
  computed: { ...mapGetters(['user', 'loggedIn']) },
  data() {
    return {
      // null (not {}) so `v-if="item"` / `v-if="!item"` genuinely gate on
      // "has the recipe loaded yet" instead of always being truthy.
      item: null,
      error: '',
      message: '',

      isFavorite: false,

      date: Date.now(),

      createdAt: '',

      // (background-) css colors
      color1: '',
      color2: '',
      textColor: '',
    };
  },
  methods: {
    ...mapActions(['deleteRecipe', 'fetchUser']),

    favoriteButtonClicked() {
      if (this.isFavorite) {
        console.log(`Removing ${this.item._id} from favorites`);
        UserService.removeFavorite(this.user.username, this.item._id).then(
          () => {
            this.fetchUser(sessionStorage.username);
            this.isFavorite = !this.isFavorite;
          },
        );
      } else {
        console.log(`Adding ${this.item._id} to favorites`);
        UserService.addFavorite(this.user.username, this.item._id).then(() => {
          this.fetchUser(sessionStorage.username);
          this.isFavorite = !this.isFavorite;
        });
      }
    },
    genpdfButtonClicked() {
      try {
        PDFUtils.createPdfForRecipe(this.item);
        this.message =
          'PDF heruntergeladen. Sie ist im Standard-Ordner für Downloads zu finden. ';
      } catch (err) {
        this.error = `Fehler beim generieren der PDF: ${err}`;
      }
    },
    editButtonClicked() {
      this.$router.push({
        name: 'EditRecipe',
        params: { id: this.$route.params.id },
      });
    },
    deleteButtonClicked() {
      if (window.confirm('Wollen Sie dieses Rezept wirklich löschen?')) {
        const params = {
          id: this.$route.params.id,
          username: this.user.username,
        };
        this.$store.dispatch('deleteRecipe', params);

        this.$router.push({
          name: 'BrowseRecipes',
        });
      } else {
        this.error = 'Gute Entscheidung...';
      }
    },
    initColors() {
      switch (this.item.recipeType) {
        case 'appetizer':
          this.color1 = '0, 204, 3, 0.56';
          this.color2 = '0, 204, 3, 0.28';
          this.textColor = '#2c3e50';
          break;
        case 'hearty':
          this.color1 = '63, 97, 191, 0.56';
          this.color2 = '63, 97, 191, 0.28';
          this.textColor = '#222244';
          break;
        case 'sweet':
          this.color1 = '161, 63, 191, 0.56';
          this.color2 = '161, 63, 191, 0.28';
          this.textColor = '#2c3e50';
          break;
        case 'bread':
          this.color1 = '243, 98, 6, 0.56';
          this.color2 = '243, 98, 6, 0.28';
          this.textColor = '#2c3e50';
          break;
        case 'bakery':
          this.color1 = '233, 142, 5, 0.56';
          this.color2 = '233, 142, 5, 0.28';
          this.textColor = '#2c3e50';
          break;

        default:
          this.color1 = '8, 126, 126, 1';
          this.color2 = '102, 228, 228, 1';
          this.textColor = '#2c3e50';
      }

      document.documentElement.style.setProperty('--color1', this.color1);
      document.documentElement.style.setProperty('--color2', this.color2);
      document.documentElement.style.setProperty('--textColor', this.textColor);
    },
  },
  async created() {
    try {
      this.item = await ItemService.getItemById(this.$route.params.id);
      if (this.item === null) {
        this.error = `Das Rezept mit der id ${this.route.params.id} existiert nicht (mehr)!`;
      }

      this.date = new Date(this.item.date);
      this.createdAt = `${this.date.getDate()}.${this.date.getMonth() +
        1}.${this.date.getFullYear()}`;

      if (this.loggedIn) {
        this.fetchUser(sessionStorage.username).then(() => {
          this.isFavorite = this.user.favorites.includes(
            this.item._id.toString(),
          );
        });
      }
    } catch (err) {
      console.log('ERR: ' + err);
      this.error = err.message;
    }
    this.initColors();
  },
  beforeMount() {
    if (this.error.includes('Network err')) {
      console.log('Network error, probably offline');
      this.$router.push({ name: 'Offline' });
    }
  },
};
</script>

<style scoped>
img {
  padding: 0;
  margin: 0;
}
.edit {
  position: absolute;
  float: right;
  right: 1rem;
  top: 12rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border: 2px solid #555555;
}
.delete {
  position: absolute;
  float: right;
  right: 1rem;
  top: calc(12rem + 52px);
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border: 2px solid #555555;
}
.genpdf {
  position: absolute;
  float: right;
  right: 1rem;
  top: calc(12rem - 52px);
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border: 2px solid #555555;
}

.table {
  display: flex;
  flex-wrap: wrap;
}
.table > * {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 280px;
}

hr {
  margin-bottom: 1rem;
}

.favoriteClass {
  background-color: #01ff2c;
}
</style>
