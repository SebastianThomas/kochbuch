import axios from 'axios';

const url = '/api/send/';

class SendEmail {
  static async send(address, subject, content) {
    try {
      const request = await axios.post(`${url}plain`, {
        address,
        subject,
        content,
      });

      return request.status >= 200 && request.status < 300;
    } catch (err) {
      console.log('err: ');
      console.log(err);
      return false;
    }
  }

  static async sendHTML(address, subject, htmlContent) {
    try {
      const request = await axios.post(`${url}html`, {
        address,
        subject,
        htmlContent,
      });

      return request.status >= 200 && request.status < 300;
    } catch (err) {
      console.log('err: ');
      console.log(err);
      return false;
    }
  }
}

export default SendEmail;
