import axios from 'axios'
import ItemService from './ItemService'

const url = '/api/images/'

class ImageService {
  static checkContains(string, toCheck) {
    const toCheckStrings = toCheck.split('+')

    for (let i = 0; i < toCheckStrings.length; i += 1) {
      const toCheckString = toCheckStrings[i]
      if (toCheckString !== '+') {
        const toCheckStringLowerCase = toCheckString.toLowerCase()
        const stringLowerCase = string.toLowerCase()

        if (!stringLowerCase.includes(toCheckStringLowerCase)) {
          return false
        }
      }
    }
    return true
  }

  // Get Images
  static getImages() {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
      })
        .then(res => {
          resolve(res.data)
        })
        .catch(err => reject(err))
    })
  }

  // Get one Image
  static getImageById(id) {
    // image._id or image.id???
    return new Promise((resolve, reject) => {
      axios
        .get(`${url}image/${id}`)
        .then(res => {
          resolve(res.data)
        })
        .catch(err => reject(err))
    })
  }

  static getImageByName(filename) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${url}image/name/${filename}`)
        .then(res => {
          resolve(res.data)
        })
        .catch(err => reject(err))
    })
  }

  // Add Image
  static async addPicture(recipeId, image) {
    const formData = new FormData()
    formData.append('file', image)

    const imageRequest = await axios.post(url, formData)
    const img = imageRequest.data.file
    const imageName = img.filename

    return await ItemService.addPictureToItem(recipeId, imageName)
  }
}

export default ImageService
