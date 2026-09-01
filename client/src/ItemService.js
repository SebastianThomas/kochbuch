import axios from 'axios';

const url = '/api/items/';

class ItemService {
  static checkContains(string, toCheck) {
    const toCheckStrings = toCheck.split('+');

    for (let i = 0; i < toCheckStrings.length; i += 1) {
      const toCheckString = toCheckStrings[i];
      if (toCheckString !== '+') {
        const toCheckStringLowerCase = toCheckString.toLowerCase();
        const stringLowerCase = string.toLowerCase();

        if (!stringLowerCase.includes(toCheckStringLowerCase)) {
          return false;
        }
      }
    }
    return true;
  }

  static arrayCheckContains(array, toCheck) {
    const toCheckStrings = toCheck.split('+');
    let contained = false;

    for (let i = 0; i < toCheckStrings.length; i += 1) {
      const toCheckString = toCheckStrings[i];
      if (toCheckString !== '+') {
        const toCheckStringLowerCase = toCheckString.toLowerCase();

        let includes = array.some((el) => {
          let elName = el.name;
          let elNameLowerCase = elName.toLowerCase();
          contained = elNameLowerCase.includes(toCheckStringLowerCase);
          if (contained) return true;
        });

        if (includes) return true;
      }
    }
    return false;
  }

  // Get Items
  static getItems() {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
      })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => reject(err));
    });
  }

  static getItemsByRecipeType(recipeType) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
      })
        .then((res) => {
          resolve(
            res.data.filter((item) => {
              const isRightType = this.checkContains(
                item.recipeType,
                recipeType,
              );
              return isRightType;
            }),
          );
        })
        .catch((err) => reject(err));
    });
  }

  // Get some Items by title
  static getItemsByTitle(title) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
      })
        .then((res) => {
          resolve(
            res.data.filter((item) => this.checkContains(item.title, title)),
          );
        })
        .catch((err) => reject(err));
    });
  }

  // Get some Items by ingredients
  static getItemsByIngredients(ing) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
      })
        .then((res) => {
          resolve(
            res.data.filter((item) => {
              let contains = this.arrayCheckContains(item.ingredients, ing);
              return contains;
            }),
          );
        })
        .catch((err) => reject(err));
    });
  }

  // Get one Item
  static getItemById(id) {
    // item._id or item.id???
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
  static insertItem(title, ingredients, description, recipeType, username) {
    title = title.trim();
    description = description.trim();

    return axios.post(url, {
      title,
      ingredients,
      description,
      recipeType,
      username,
    });
  }

  // Update Item
  static updateItem(id, title, ingredients, description, recipeType, username) {
    return axios.patch(`${url}${id}`, {
      title,
      ingredients,
      description,
      recipeType,
      username,
    });
  }

  static async addPictureToItem(recipeId, imageName) {
    console.log(`recipeId in addPictureToItem: ${recipeId}`);

    // axios post (image array)
    return await axios.patch(`${url}addimage/${recipeId}`, {
      imageName,
    });
  }

  // Delete Item
  static deleteItem(id, username) {
    const body = {
      data: { username: username },
    };

    return axios.delete(`${url}${id}`, body);
  }
}

export default ItemService;
