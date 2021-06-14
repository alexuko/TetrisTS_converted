## Title
* TETRIS: single & multiplayer
## About me
* [Alex](https://alejandro-rivera.com/) check my other projects

## Key Features
* Tetris Single player
* Tetris Multiplayer
* Records overview
* Highest Scores
* [KaTeX](https://khan.github.io/KaTeX/) Support

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/alexuko/TetrisTS_converted

# package.json file already has all of the libraries you will need 
# Install dependencies
$ npm install

# Run the app and make some modifications
$ npm run dev 

# Optionally build the app
$ npm run build 

# after you ran the code for the first time
# To run the server go to src/js/server
$ nodemon server.js

# Now you can access the server test and connect to other browsers

```

## File Structure
```bash

Tetris
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── css
│   │   └── main.scss
│   ├── js
│   └── ts
│       ├── app.ts
│       ├── assets
│       │   ├── assets.ts
│       │   ├── SRS_offsets.ts
│       │   └── tetrominoes.ts
│       ├── classes
│       │   ├── brush.ts
│       │   ├── gameBoard.ts
│       │   ├── piece.ts
│       │   └── records.ts
│       ├── controller.ts
│       └── server
│           ├── client-server.ts
│           ├── localStorage.ts
│           └── server.ts
├── tests
│   └── mod.test.js
└── tsconfig.json

```

Note: This project was developed in Linux.
If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## Credits

This software uses the following open source packages:

- [SASS](https://sass-lang.com/)
- [Node.js](https://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [UUID](https://www.npmjs.com/package/uuid)
- [TypeScript](https://www.typescriptlang.org/)
- [WS](https://www.npmjs.com/package/ws)
- [Chalk](https://www.npmjs.com/package/chalk)

## Related

[markdownify-web](https://github.com/amitmerchant1990/markdownify-web) - Web version of Markdownify



## License

* [License](https://github.com/alexuko/TetrisTS_converted/blob/main/LICENSE) 


