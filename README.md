# Empty Repository

This architecture is responsible for the projects in Franca's office.
The objectives are to be simple, efficient and scalable, meeting the most varied situations without complications.

## Configuration
The only adjustments you need to make are in `package.json`.

![package.json](https://clickqi.vteximg.com.br/arquivos/package-json-empty-repository.png?v=12983721937)

You need to change the following values, according to the information and needs of the project:
- `name`: The name of the account created at VTEX. This value will be used by BrowserSync.
- `storeName`: This value will be used as the name of the generated JS and CSS files.
- `vtexCheckout`: This value will be inserted in the checkout JS and CSS files, such as `checkout6-custom.js` and `checkout6-custom.css`, for example.
- `vtexCheckoutConfirmation`: This value will be inserted in the JS and CSS files of the purchase confirmation page, such as `checkout-confirmation4-custom.js` and `checkout-confirmation4-custom.css`, for example.
- `description`: A brief description of the project or just its name.

---

After that, install the project dependencies:
`npm install`
or
`yarn`

---
After the installation is complete, run the development script:
`npm run dev`
or
`yarn dev`

---

To generate the production files, run:
`npm run prod`
or
`yarn prod`
