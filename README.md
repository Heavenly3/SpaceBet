# 🚀 SpaceBet

**SpaceBet** is a space-themed economy and casino bot for Discord. Members earn coins, bank them, gamble them across four casino games, take loans, join a jackpot raffle and spend their fortune in a role shop — all through modern slash commands and Discord's new **Components V2** message layout.

![Node](https://img.shields.io/badge/node-%E2%89%A522.13-339933?logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14.27-5865F2?logo=discord&logoColor=white)
![SQLite](<https://img.shields.io/badge/database-SQLite%20(built--in)-003B57?logo=sqlite&logoColor=white>)

---

## 📑 Contents

- [Features](#-features)
- [Commands](#-commands)
- [Quick start](#%EF%B8%8F-quick-start)
- [Configuration](#-configuration)
- [Upgrading from v1](#-upgrading-from-v1)
- [Project structure](#-project-structure)
- [Scripts](#-scripts)
- [License](#-license)

---

## ✨ Features

- **Components V2 interface** — every reply is a container with sections, avatars, dividers and inline buttons instead of classic embeds. Each feature has its own colour, icon and space-themed name (Stellar Bank, Nebula Slots, Orbital Roulette...).
- **English and Spanish** — replies follow each member's Discord language, or a language forced by the admins in `/config`. Slash command descriptions and options are translated in the Discord client too.
- **Built-in guide** — `/help` explains every command, option, game payout and setting, with live values and clickable commands.
- **Fair casino games** — slots, roulette, horse racing and keno with animated results, cryptographically secure randomness and a small house edge, so nobody can farm infinite money.
- **Full economy** — wallet and bank, payments, work shifts, role-based income, a daily wheel, robberies and a leaderboard.
- **Loans** with interest and a due date. Overdue loans are collected automatically, from the wallet first and then the bank.
- **Galactic Raffle** — a jackpot that rolls over until someone holds the winning number.
- **Role shop** — permanent or consumable items that can grant roles, with autocomplete and one-click **Buy** buttons.
- **Mission Control panel (`/config`)** — manage the whole bot without typing commands: language, member balances, work pay and job messages, role income, wheel prizes, game cooldowns, shop items, loans and the raffle. Forms use member and role pickers, and destructive actions ask for confirmation.
- **Nothing native to compile** — data lives in Node's built-in SQLite. Cooldowns and settings survive restarts.

---

## 🎮 Commands

Amounts accept `500`, `1,500`, `2.5k`, `1m`, `half`/`mitad` or `all`/`todo`. Run `/help` in Discord for the full guide, or `/help command:<name>` for one command.

| Category   | Commands                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 💰 Economy | `/balance` `/deposit` `/withdraw` `/pay` `/work` `/collect` `/dailywheel` `/rob` `/leaderboard` |
| 🎰 Games   | `/slots` `/roulette` `/horserace` `/keno` `/raffle buy` `/raffle info`                          |
| 🏦 Loans   | `/loan request` `/loan status` `/loan repay`                                                    |
| 🛒 Shop    | `/shop` `/buy` `/use` `/inventory`                                                              |
| ⚙️ Admin   | `/config` (Mission Control panel)                                                               |
| 📖 General | `/help`                                                                                         |

Admin commands are hidden from members without the **Administrator** permission. You can grant them to other roles in **Server Settings → Integrations → SpaceBet**.

### Payouts

All games return the stake multiplied by the number shown (stake included).

| Game          | Payouts                                                              |
| ------------- | -------------------------------------------------------------------- |
| 🎰 Slots      | Pair ×1.5 · Three of a kind ×10 · Three sevens ×25                   |
| 🎡 Roulette   | Colour / even / odd / low / high ×2 · Dozen / column ×3 · Number ×36 |
| 🏇 Horse race | 1st ×6 · 2nd ×2 · 3rd ×1 (bet back)                                  |
| 🎱 Keno       | Depends on how many numbers you pick (1–10) and how many are drawn   |

Paytables live in [src/config/games.js](src/config/games.js).

---

## ⚙️ Quick start

**Requirements:** [Node.js 22.13 or newer](https://nodejs.org/) (Node 24 LTS recommended).

1. **Clone and install**

   ```bash
   git clone https://github.com/Heavenly3/SpaceBet.git
   cd SpaceBet
   npm install
   ```

2. **Create the bot** in the [Discord Developer Portal](https://discord.com/developers/applications), copy its token and application ID, and invite it with the `bot` and `applications.commands` scopes and the **Manage Roles** permission (needed for shop roles).

3. **Configure the environment**

   ```bash
   cp .env.example .env
   ```

   | Variable        | Required | Description                                                            |
   | --------------- | -------- | ---------------------------------------------------------------------- |
   | `TOKEN`         | ✅       | Bot token.                                                             |
   | `CLIENT_ID`     | ✅       | Application ID.                                                        |
   | `GUILD_ID`      |          | Server ID for instant command updates. Leave empty to deploy globally. |
   | `DATABASE_PATH` |          | SQLite file location. Default: `storage/spacebet.db`.                  |
   | `LOG_LEVEL`     |          | `debug`, `info`, `warn` or `error`. Default: `info`.                   |

4. **Register the slash commands and start the bot**

   ```bash
   npm run deploy
   npm start
   ```

   Optionally add starter items to the shop with `npm run seed:shop`.

---

## 🔧 Configuration

- **Language:** `/config` → General. _Automatic_ (default) replies in each member's Discord language; you can also force English or Spanish for the whole server.

- **At runtime:** everything is managed from the `/config` panel.
- **Defaults:** [src/config/defaults.js](src/config/defaults.js) holds the starting value of every runtime setting.
- **Look and feel:** [src/config/theme.js](src/config/theme.js) (name and colours) and [src/config/emojis.js](src/config/emojis.js).

> **Custom emojis:** the coin, slot symbols and other custom emojis only render if the bot can use them. Upload them as **application emojis** in the Developer Portal (they then work in every server) and paste the new IDs into `src/config/emojis.js`, or replace them with standard Unicode emojis.

---

## ⬆️ Upgrading from v1

Version 2 uses a new database file. To bring over balances, loans, shop items, inventories, role income and settings from the old `database.sqlite`:

```bash
npm run migrate:legacy                    # reads ./database.sqlite
npm run migrate:legacy -- path/to/old.db  # custom location
```

Then redeploy the commands with `npm run deploy`. Several commands were renamed or merged (for example `/additem` is now part of the `/config` panel, and `/loanstatus` is now `/loan status`), so the old ones must be replaced.

---

## 🗂️ Project structure

```
src/
├── index.js            Entry point: client, events, graceful shutdown
├── deploy.js           Registers slash commands (guild or global)
├── commands/           One file per slash command, grouped by category
├── events/             ready and interactionCreate (commands, autocomplete, buttons, modals)
├── services/           Business logic: economy, games, loans, raffle, shop, settings...
├── database/           SQLite connection and versioned migrations
├── jobs/               Background tasks: loan collection, raffle draws, cleanup
├── panels/config/      The /config panel: one file per section (members, work, shop...)
├── ui/                 Components V2 card builder and notices
├── i18n/               Translations: locales/en.js, locales/es.js and command translations
├── config/             Environment, defaults, settings schema, game tables, theme and emojis
├── core/               Loader, logger and helpers
└── utils/              Formatting, parsing and secure randomness
scripts/                Legacy import and shop seeding
```

Buttons, menus and modals use the custom ID format `command:action:args`. The router in `events/interactionCreate.js` sends them to the `components` handlers of the command that created them, and passes every handler a `ctx` with a translator in the right language:

```js
async execute(interaction, { t }) {
  await interaction.reply(ui.success(t('pay.title')));
}
```

### Adding a language

1. Copy `src/i18n/locales/en.js` to a new file (for example `pt.js`) and translate it.
2. Register it in `src/i18n/index.js`, and add command translations in `src/i18n/commands/` and `src/i18n/localizeCommand.js`.
3. Run `npm run check:i18n` to find anything missing, then `npm run deploy`.

---

## 📜 Scripts

| Script                   | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `npm start`              | Start the bot.                                  |
| `npm run dev`            | Start with auto-restart on file changes.        |
| `npm run deploy`         | Register commands (guild if `GUILD_ID` is set). |
| `npm run deploy:global`  | Register commands globally.                     |
| `npm run deploy:clear`   | Remove all registered commands.                 |
| `npm run migrate:legacy` | Import data from the v1 database.               |
| `npm run seed:shop`      | Add starter items to the shop.                  |
| `npm run check:i18n`     | Verify that every translation is complete.      |
|  Lint with ESLint.       |
| `npm run format`         | Format with Prettier.                           |

---

## 📝 License

Licensed under [Creative Commons Attribution-NonCommercial 4.0](LICENSE).

**SpaceBet** — the universe of betting awaits you! 🌠
