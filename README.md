# Email Sending Application - my-mailer

This application is used for sending emails with customized HTML templates. It replaces placeholders in the email content, attaches images, compresses HTML, and sends the email to specified recipients.

## Technologies Used and Dependencies

This application uses the following technologies and dependencies:

- `fs`: Used for file operations.
- `nodemailer`: Used for sending emails.
- `uuidv4`: Used to generate unique identifiers for email attachments.
- `html-minifier`: Used to compress HTML content.
- `lodash`: Used for utility functions.
- `tokens.json`: Used for replacing placeholders.
- `pretty`: Used to prettify HTML code.

# Usage

This application can be used to create and send custom email templates and content. Here are the basic usage steps:

1. **Prepare Email Templates**: Prepare HTML templates that represent the email content and place your files in a specific folder.

2. **Customize Email Content**: Replace placeholders (`{{placeholder}}`) in the email content with custom data. Personalize the content using placeholders defined in the `tokens.json` file.

3. **Add Email Attachments (Optional)**: If you want to add images or files to your email, place the attachments in a specific folder. Then, incorporate these attachments into `<img>` tags in your HTML content.

4. **Sending Email**: Use the `sendMail` function to send the email. Specify the recipient address, sender address, and other required information. Set the email content and attachments.

5. **Email Sending Process**: The `sendMail` process sends the email to the specified recipients.

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
