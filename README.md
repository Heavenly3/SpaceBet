# SpaceBet

**SpaceBet** is an exciting Discord bot that combines betting and gambling with space exploration, inspired by the casino from Cowboy Bebop. Discover, bet, and win in the vast universe!

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [NPM Scripts](#npm-scripts)
- [Contribution](#contribution)
- [License](#license)

## Description

**SpaceBet** is a space-inspired betting and gambling platform in the form of a Discord bot. Users can participate in various types of bets and games to win rewards, just like in the casino from Cowboy Bebop. The application is built using Node.js and Sequelize for database management.

## Installation

Follow these steps to install and set up the project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/Heavenly3/SpaceBet.git
   ```

2. Navigate to the project directory:

   ```bash
   cd SpaceBet
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables:

   Create a .env file in the root of the project and add the following variables:

   ```bash
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GUILD_ID=your_discord_guild_id
   ADMIN_ROLE=Admin
   ```

## Usage
To start the bot, run the following command:

```bash
npm start
```

The bot will become active on your Discord server.

## Configuration
### Prettier and ESLint
To ensure your code is clean and well-formatted, use Prettier and ESLint.

To format the code, run:

```bash
npm run format
```

To lint the code with ESLint, run:

```bash
npm run lint
```

## Environment Variables
The .env file should contain the following configuration:

- `TOKEN`: This is your Discord bot token. You can obtain this from the Discord Developer Portal.
- `CLIENT_ID`: This is the client ID of your Discord bot. Also found in the Discord Developer Portal.
- `GUILD_ID`: This is the ID of the Discord server (guild) where the bot will operate.
- `ADMIN_ROLE`: This is the name of the role in your Discord server that has administrative privileges.

## NPM Scripts
Here are the NPM scripts available in the project and their purposes:

- `npm start`: Starts the bot using nodemon, which automatically restarts the application when file changes in the directory are detected.
- `npm run deploy`: Runs the deploy-commands.js script to load the commands into the Discord bot.
- `npm run lint`: Uses ESLint to lint the codebase, ensuring that it follows the coding standards.
- `npm run format`: Uses Prettier to format the codebase, making sure it is clean and consistent.

## Contribution
If you would like to contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push your changes to the branch (`git push origin feature/new-feature`).
5. Create a Pull Request.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
