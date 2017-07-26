# Sion
Gulp front-end environment with versioning and Pug!

## Features
- Scss
- Pug templating language
- Autoprefixer
- Imagemin
- BrowserSync
- Versioning!

## Get started
Clone this repo on your machine and run inside of it:

	npm install

or if you prefer Yarn

	yarn install

Once you have installed the dependencies you can run

	gulp serve

to instantly open up a dev server with BrowserSync and start coding.

## Installing a package
Sion has already the latest Bootstrap 3 stable release (currently 3.3.7) and jQuery included in dependencies.

To install a dependency just run

	bower install <package-name> --save

or

	yarn add <package-name>

then you need to run

	gulp inject

and launch again the webserver with

	gulp serve

you will now have your dependencies in vendor.js and/or vendor.css

## Build for production
When done with coding you can run

	gulp build

to minimize, optimize and hash your assets.

