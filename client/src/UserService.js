import axios from 'axios';

const url = 'api/users/';

class ItemService {
  // Get one Item by username
  static getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
      })
        .then((res) => {
          const searchedUser = res.data.filter(
            (user) => user.username.toString() === username,
          );

          resolve(searchedUser);
        })
        .catch((err) => reject(err));
    });
  }

  // Get one Item
  static getUserById(id) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${url}${id}`)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => reject(err));
    });
  }

  // Create Item
  static insertUser(username, password1, password2, description) {
    username = username.trim();
    description = description.trim();

    return axios.post(url, {
      username,
      password1,
      password2,
      description,
      favorites: [],
    });
  }

  // Update Item
  static async updateUser(username, password1, password2, description) {
    username = username.trim();
    description = description.trim();

    const currentUser = await this.getUserByUsername(username);

    const thisUser = currentUser[0];

    return axios.patch(`${url}${thisUser._id}`, {
      username,
      password1,
      password2,
      description,
    });
  }

  static async updatePassword(username, password1, password2) {
    username = username.trim();

    const currentUser = await this.getUserByUsername(username);

    const thisUser = currentUser[0];

    return axios.patch(`${url}${thisUser._id}/password`, {
      username,
      password1,
      password2,
    });
  }

  static async updateDescription(username, description) {
    username = username.trim();
    description = description.trim();

    const currentUser = await this.getUserByUsername(username);

    const thisUser = currentUser[0];

    return axios.patch(`${url}${thisUser._id}/description`, {
      username,
      description,
    });
  }

  static login(username, password) {
    return axios.post(`${url}login`, {
      username,
      password,
    });
  }

  static addFavorite(username, recipeId) {
    return new Promise((resolve, reject) => {
      this.getUserByUsername(username)
        .then((user) => {
          const id = user[0]._id;

          axios.patch(`${url}favorite/${id}`, {
            recipeId,
          });
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static removeFavorite(username, recipeId) {
    return new Promise((resolve, reject) => {
      this.getUserByUsername(username)
        .then((user) => {
          const id = user[0]._id;

          axios.patch(`${url}removeFavorite/${id}`, {
            recipeId,
          });
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // Delete Item
  static deleteUser(id) {
    return axios.delete(`${url}${id}`);
  }
}

export default ItemService;
