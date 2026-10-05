const s = (count, word, plural = `${word}s`) => `${count} ${count === 1 ? word : plural}`;

module.exports = {
  meta: { name: 'English', flag: '🇬🇧' },

  common: {
    wallet: 'Wallet',
    bank: 'Bank',
    netWorth: 'Net worth',
    yourWallet: 'Your wallet',
    none: 'None',
    by: 'By {user}',
    invalidAmount: 'Enter a valid amount such as `500`, `2.5k`, `half` or `all`.',
    notEnoughWallet: 'You only have {amount} in your wallet.',
    notEnoughBank: 'You only have {amount} in the bank.',
    emptyWallet: 'Your wallet is empty.',
    emptyBank: 'Your bank account is empty.',
    botsNoAccount: 'Bots do not have accounts.',
    cooldown: 'You can {action} again {time}.',
    adminOnly: 'Only administrators can use this.',
    notYours: 'This panel belongs to someone else. Run {command} to open your own.',
    error: 'Something went wrong. Please try again. Reference: `{ref}`',
    invalidDuration: 'Invalid duration. Use formats like `30m`, `12h` or `1d`.',
  },

  // Themed name of every module
  features: {
    balance: 'Balance',
    bank: 'Stellar Bank',
    work: 'Space Jobs',
    collect: 'Stellar Income',
    wheel: 'Cosmic Wheel',
    rob: 'Space Heist',
    leaderboard: 'Galactic Leaderboard',
    slots: 'Nebula Slots',
    roulette: 'Orbital Roulette',
    horserace: 'Comet Derby',
    keno: 'Cosmic Keno',
    raffle: 'Galactic Raffle',
    loans: 'Stellar Loans',
    shop: 'Starport Shop',
    inventory: 'Cargo Hold',
    config: 'Mission Control',
    help: 'SpaceBet Guide',
  },

  status: 'Betting across the galaxy',

  balance: {
    subtitle: 'Commander {user}',
    rank: 'Rank **#{rank}**',
    activeLoan: 'Active loan',
    loanDue: '{amount} due {time}',
  },

  bank: {
    depositTitle: 'Deposit complete',
    depositBody: 'You stored {amount} in the Stellar Bank.',
    withdrawTitle: 'Withdrawal complete',
    withdrawBody: 'You withdrew {amount} from the Stellar Bank.',
  },

  pay: {
    self: 'You cannot pay yourself.',
    bot: 'You cannot pay a bot.',
    title: 'Transfer sent',
    body: '{sender} sent {amount} to {target}.',
  },

  work: {
    action: 'work',
    noJobs: 'There are no jobs available right now. Ask an admin to add some with {command}.',
    title: 'Shift complete',
    fallback: '{message} You earned {amount}.',
    next: 'Next shift',
    defaultMessages: [
      'You repaired a hyperdrive on a stranded freighter and earned {amount}.',
      'You mapped an uncharted nebula and sold the data for {amount}.',
      'You mined asteroid ore in the outer belt and made {amount}.',
      'You escorted a cargo convoy through pirate space and were paid {amount}.',
      'You calibrated the station telescopes and earned {amount}.',
    ],
  },

  collect: {
    action: 'collect',
    noRewards: 'None of your roles earn income yet.',
    title: 'Income collected',
    body: 'You collected {amount} from your roles.',
    next: 'Next collection',
  },

  wheel: {
    action: 'spin the wheel',
    empty: 'The wheel has no prizes configured. Ask an admin to add some.',
    spinning: 'Spinning... {label}',
    won: 'The wheel stopped on {label}!',
    lost: 'The wheel stopped on {label}. Better luck next time!',
    nothing: 'Nothing',
    next: 'Next spin',
  },

  rob: {
    self: 'You cannot rob yourself.',
    bot: 'Bots keep their coins in a black hole.',
    action: 'rob someone',
    thiefPoor: 'You need at least {amount} in your wallet to cover a possible fine.',
    targetPoor: '{target} is not carrying enough coins to be worth it.',
    successTitle: 'Heist successful',
    successBody: "You slipped into {target}'s cargo hold and stole {amount}.",
    failTitle: 'Busted!',
    failBody: 'Station security caught you. You paid {amount} in compensation to {target}.',
    next: 'Next attempt',
  },

  leaderboard: {
    subtitle: 'Richest commanders by net worth (wallet + bank).',
    empty: 'Nobody has any coins yet. Be the first!',
    you: 'you',
    yourRank: 'Your rank: #{rank}',
  },

  games: {
    action: 'play {game}',
    minWallet: 'You need at least {min} in your wallet to play. You have {wallet}.',
    invalidBet: 'Enter a valid bet such as `500`, `2.5k`, `half` or `all`.',
    minBet: 'The minimum bet is {min}.',
    won: 'You won {amount}',
    refund: 'You got your bet back',
    lost: 'You lost {amount}',
    bet: 'Bet',
    payout: 'Payout',
  },

  slots: {
    spinning: 'Spinning the reels...',
    jackpot: 'JACKPOT!',
    triple: 'Three of a kind!',
    pair: 'A pair!',
    none: 'No match',
    paytable: 'Pair ×{pair} · Triple ×{triple} · Jackpot ×{jackpot}',
  },

  roulette: {
    needsNumber: 'Choose the `number` (0-36) for a single number bet.',
    spinning: 'The ball is spinning... you bet on **{bet}**.',
    landed: 'The ball landed on {icon} **{number} {color}**',
    win: 'Your bet on **{bet}** wins!',
    lose: 'Your bet on **{bet}** loses.',
    number: 'Number {n}',
    colors: { red: 'red', black: 'black', green: 'green' },
    bets: {
      red: 'Red',
      black: 'Black',
      even: 'Even',
      odd: 'Odd',
      low: 'Low (1-18)',
      high: 'High (19-36)',
      dozen1: '1st dozen (1-12)',
      dozen2: '2nd dozen (13-24)',
      dozen3: '3rd dozen (25-36)',
      column1: '1st column',
      column2: '2nd column',
      column3: '3rd column',
      straight: 'Single number (0-36)',
    },
  },

  horserace: {
    backed: 'You backed **{horse}**',
    results: 'Results',
    finished: '**{horse}** finished in position **{place}**.',
  },

  keno: {
    badRange: 'Every number must be between 1 and {max}.',
    repeated: 'Do not repeat numbers.',
    badCount: 'Pick between 1 and {max} numbers.',
    summary: '**{hits}** of your **{picks}** numbers were drawn.',
    yours: 'Your numbers',
    drawn: 'Drawn numbers ({count})',
    paytable: '{spots} spots: {table}',
    hits: ({ n }) => s(n, 'hit'),
  },

  raffle: {
    duplicate: 'You already hold ticket {number}.',
    funds: 'A ticket costs {price}. You do not have enough in your wallet.',
    boughtTitle: 'Ticket purchased',
    boughtBody: 'You hold number {number} for {price}.',
    pot: 'Pot',
    draw: 'Draw',
    yourTickets: 'Your tickets',
    announce: 'Results are announced in this channel',
    infoSubtitle: 'Holders of the winning number split the pot. No winner? It rolls over!',
    ticketPrice: 'Ticket price',
    sold: 'Tickets sold',
    afterFirst: '{duration} after the first ticket',
    resultsTitle: 'Results',
    winning: 'The winning number is {number}',
    winnerSingle: '{winners} won the pot of {pot}!',
    winnerSplit: '{winners} split the pot of {pot}! Each winner receives {share}.',
    noWinner:
      'Nobody held the winning number among **{tickets}** tickets.\nThe pot rolls over to the next round: {pot}',
    footer: 'Buy a ticket with /raffle buy',
  },

  loans: {
    statusTitle: 'Loan status',
    statusSubtitle: 'Repay before the due date or it is collected automatically.',
    borrowed: 'Borrowed',
    interest: 'Interest',
    amountDue: 'Amount due',
    due: 'Due',
    repayButton: 'Repay now',
    cannotRepayYet: 'Not enough coins in your wallet to repay yet',
    none: 'You do not have an active loan. You can borrow up to {max} at {rate}% interest.',
    noLoan: 'You do not have an active loan.',
    needToRepay:
      'You need {amount} in your wallet to repay. Withdraw from the bank first if needed.',
    repaidTitle: 'Loan repaid',
    repaidBody: 'You paid back {amount}. You are debt-free!',
    already: 'You already have an active loan. Repay it first with {command}.',
    negative: 'You cannot borrow while you have a negative balance.',
    range: 'Enter an amount between 1 and {max}.',
    approvedTitle: 'Loan approved',
    approvedBody: '{amount} were added to your wallet.',
    term: '{time} · term {duration}',
    footer: 'Overdue loans are collected from your wallet, then your bank',
    notYours: 'This is not your loan.',
    collectedTitle: 'Loan collected',
    collectedBody: 'Your loan reached its due date.',
    collectedAmount: 'Amount collected',
    debtLeft: 'Debt left in your wallet',
    debtLeftValue: '{amount} — your wallet is now negative.',
  },

  shop: {
    subtitle: 'Press **Buy** to purchase one, or use {command} for more.',
    empty: 'The shop is empty right now. Check back soon!',
    consumable: 'Consumable',
    permanent: 'Permanent',
    grants: 'Grants {role}',
    buy: 'Buy',
    items: ({ count }) => s(count, 'item'),
    gone: 'That item is no longer for sale.',
    boughtQuick: 'You bought **{item}** for {amount}.',
    boughtRole: 'You received {role}.',
    walletNow: 'Wallet: {amount}',
    notFound: 'That item does not exist. Check {command} for the catalogue.',
    purchaseTitle: 'Purchase complete',
    purchaseBody: 'You bought **{quantity}× {item}** for {amount}.',
    roleReceived: 'Role received',
    owned: 'Owned',
    useHint: 'Use it with /use',
    alreadyOwned: 'You already own **{item}** — it can only be bought once.',
    cantAfford: 'That costs {total} but you only have {wallet} in your wallet.',
    refunded: '{reason} You were refunded.',
    roleRejected: 'Discord rejected the role assignment. You were refunded.',
    roleMissing: 'The role linked to this item no longer exists.',
    roleNotEditable: 'I cannot assign {role} — move my role above it and give me **Manage Roles**.',
  },

  use: {
    notFound: 'That item does not exist.',
    permanent: '**{item}** is permanent and cannot be used up.',
    roleOne: 'Role items can only be used one at a time.',
    notEnough: 'You only have **{quantity}× {item}**.',
    alreadyHad: 'You already have {role} — the item was not consumed.',
    roleRejected: 'Discord rejected the role assignment. The item was not consumed.',
    title: 'Item used',
    body: 'You used **{quantity}× {item}**.',
    remaining: 'Remaining',
  },

  inventory: {
    subtitle: 'Cargo hold of {user}',
    empty: 'Empty — visit {command} to buy something.',
    value: 'Value: {amount}',
  },

  managemoney: {
    add: "Added {amount} to {user}'s {account}.",
    remove: "Removed {amount} from {user}'s {account}.",
    set: "Set {user}'s {account} to {amount}.",
    reset: 'Reset all money of {user}.',
    accounts: { wallet: 'wallet', bank: 'bank' },
  },

  managecollect: {
    set: '{role} now earns {amount} per collection.',
    removed: '{role} no longer earns income.',
    cleared: ({ count }) => `Removed the income of ${s(count, 'role')}.`,
  },

  managewheel: {
    full: 'The wheel already has the maximum of {max} slots.',
    added: 'Added {label} to the wheel.',
    missing: 'That slot does not exist.',
    removed: 'Removed {label} from the wheel.',
    reset: 'The wheel prizes were restored to the defaults.',
  },

  managework: {
    full: 'There is a limit of {max} messages.',
    added: 'Added job message #{n}.',
    missing: 'That message does not exist.',
    removed: 'Removed: “{message}”',
    reset: 'Work settings restored to their defaults.',
    noMessages: 'No job messages — /work is disabled until you add one.',
    usingDefaults: 'Using the built-in job messages, shown in the language of each reply.',
  },

  manageshop: {
    notFound: 'That item does not exist.',
    removed: '**{item}** was removed from the shop.',
    exists: 'An item called **{item}** already exists.',
    badRole: 'That role cannot be assigned by bots.',
    addedBody: '**{item}** is now for sale.',
    price: 'Price',
    type: 'Type',
    cantAssign: '— I cannot assign this role yet',
    description: 'Description',
  },

  manageloans: {
    cancelled: 'The loan of {user} was cancelled.',
    none: '{user} has no active loan.',
    cancelledAll: ({ count }) => `Cancelled ${s(count, 'active loan')}.`,
    listTitle: 'Active loans',
    empty: 'Nobody owes the bank anything.',
    due: 'due {time}',
  },

  config: {
    subtitle: 'Changes apply instantly. Pick a category below.',
    placeholder: 'Choose a category to configure',
    edit: 'Edit',
    reset: 'Restore defaults',
    saved: 'Settings saved.',
    restored: 'Defaults restored.',
    invalid: 'Invalid value for **{field}** — {hint}.',
    unknown: 'Unknown category.',
    modalTitle: '{category} settings',
    languagePlaceholder: 'Choose the bot language',
    languageSaved: 'Language updated.',
    minMax: 'The minimum pay cannot be higher than the maximum.',
    hints: {
      coins: 'A whole number, e.g. 2500',
      percent: 'A whole number from 0 to 1000',
      duration: 'e.g. 30s, 15m, 1h30m, 2d',
    },
    languages: {
      auto: 'Automatic',
      autoDescription: "Each member's Discord language",
      en: 'English',
      es: 'Español',
    },
    categories: {
      general: { label: 'General', description: 'Language of the bot' },
      members: { label: 'Members', description: 'Adjust balances and see economy stats' },
      work: { label: 'Work', description: 'Pay, cooldown and job messages of /work' },
      collect: { label: 'Role income', description: 'Income per role and cooldown of /collect' },
      wheel: { label: 'Cosmic Wheel', description: 'Prizes and cooldown of /dailywheel' },
      games: { label: 'Games', description: 'Cooldowns of the casino games and /rob' },
      shop: { label: 'Shop', description: 'Add and remove items for sale' },
      loans: { label: 'Loans', description: 'Loan terms and active loans' },
      raffle: { label: 'Raffle', description: 'Ticket price, starting pot and draw delay' },
    },
    fields: {
      general: {
        language: {
          label: 'Language',
          help: "Language of every reply. Automatic follows each member's Discord language.",
        },
      },
      work: {
        min: { label: 'Minimum pay', help: 'Lowest amount a /work shift can pay.' },
        max: { label: 'Maximum pay', help: 'Highest amount a /work shift can pay.' },
        cooldown: { label: 'Cooldown', help: 'Time a member must wait between shifts.' },
      },
      collect: {
        cooldown: { label: 'Cooldown', help: 'Time between two /collect for the same member.' },
      },
      wheel: {
        cooldown: { label: 'Cooldown', help: 'Time between two spins of /dailywheel.' },
      },
      games: {
        slots: { label: 'Slots cooldown', help: 'Wait between two /slots games.' },
        roulette: { label: 'Roulette cooldown', help: 'Wait between two /roulette bets.' },
        horserace: { label: 'Horse race cooldown', help: 'Wait between two /horserace bets.' },
        keno: { label: 'Keno cooldown', help: 'Wait between two /keno games.' },
        rob: { label: 'Rob cooldown', help: 'Wait between two /rob attempts.' },
      },
      loans: {
        rate: { label: 'Interest rate (%)', help: 'Extra percentage added to every new loan.' },
        duration: { label: 'Loan term', help: 'Time before a loan is collected automatically.' },
        max: { label: 'Maximum loan', help: 'Largest amount a member can borrow.' },
      },
      raffle: {
        price: { label: 'Ticket price', help: 'Cost of one raffle ticket.' },
        pot: { label: 'Starting pot', help: 'Pot of a new round after someone wins.' },
        delay: {
          label: 'Draw delay',
          help: 'Time between the first ticket of a round and the draw.',
        },
      },
    },
  },

  panel: {
    more: '…and {count} more',
    confirm: 'Confirm',
    cancel: 'Cancel',
    cancelled: 'Action cancelled.',
    clearAll: 'Remove all',
    members: {
      adjust: 'Adjust a balance',
      accounts: 'Members with coins',
      inWallets: 'Coins in wallets',
      inBanks: 'Coins in banks',
      hint: 'Add, remove or set the coins of any member, or reset them to zero.',
      modalTitle: 'Adjust a balance',
      member: 'Member',
      action: 'Action',
      actions: {
        add: 'Add coins',
        remove: 'Remove coins',
        set: 'Set exact amount',
        reset: 'Reset to zero',
      },
      account: 'Account',
      amount: 'Amount',
      amountHint: 'Not needed to reset',
      amountRequired: 'Enter an amount for that action.',
    },
    work: {
      messages: 'Job messages',
      add: 'Add message',
      removePlaceholder: 'Remove a job message…',
      modalTitle: 'New job message',
      messageLabel: 'Message',
      messageHint: 'Use {amount} where the pay should appear.',
      confirmReset: 'This restores the pay, the cooldown and the built-in job messages.',
    },
    collect: {
      roles: 'Roles with income',
      empty: 'No roles earn income yet.',
      add: 'Set role income',
      removePlaceholder: 'Remove the income of a role…',
      modalTitle: 'Role income',
      roleLabel: 'Role',
      amountLabel: 'Coins per collection',
      confirmClear: 'This removes the income of every role.',
    },
    wheel: {
      prizes: 'Prizes',
      empty: 'The wheel is empty.',
      add: 'Add prize',
      resetPrizes: 'Restore prizes',
      removePlaceholder: 'Remove a prize…',
      modalTitle: 'New prize',
      amountLabel: 'Coins (0 = empty slot)',
      labelLabel: 'Custom name (optional)',
      confirmReset: 'This replaces every prize with the defaults.',
    },
    shop: {
      items: 'Items for sale',
      add: 'Add item',
      removePlaceholder: 'Remove an item…',
      hint: 'Permanent items with a role grant it when bought; consumables grant it when used.',
      modalTitle: 'New shop item',
      name: 'Name',
      nameRequired: 'The item needs a name.',
      typeHint: 'Consumables are used up with /use',
      role: 'Role (optional)',
      roleHint: 'Granted on purchase (permanent) or on use (consumable)',
      confirmRemove: 'Remove **{item}**? It also disappears from every inventory.',
    },
    loans: {
      cancelAll: 'Forgive all',
      cancelPlaceholder: 'Forgive the loan of…',
      confirmCancelAll: 'This forgives every active loan.',
    },
    raffle: {
      round: 'Current round',
      waiting: 'Waiting for the first ticket',
    },
  },

  help: {
    subtitle: 'Your guide to every command, game and setting.',
    placeholder: 'Browse a section',
    commandPlaceholder: 'Open a command',
    unknownCommand: 'There is no command called `{name}`.',
    usage: 'Usage',
    options: 'Options',
    optional: 'optional',
    cooldown: 'Cooldown',
    adminOnly: 'Administrators only',
    configuredIn: 'Configurable in {command}',
    currentValue: 'Current value',
    commandsTitle: 'Commands',
    tip: 'Tip: use `/help command:<name>` to jump straight to one command.',
    home: {
      intro:
        'SpaceBet is a space-themed economy. Earn coins, keep them safe in the bank, try your luck in the casino and spend your fortune in the shop.',
      quickStart: 'Quick start',
      steps: [
        '{work} to earn your first coins',
        '{deposit} to protect them from thieves',
        '{slots} or another game to multiply them',
        '{shop} to spend them',
      ],
      amounts: 'Amounts accept `500`, `1,500`, `2.5k`, `1m`, `half` or `all`.',
    },
    sections: {
      economy: {
        label: 'Economy',
        description: 'Earn, save and send coins',
        intro:
          'Your money lives in two places: the **wallet** (spendable, but others can rob it) and the **bank** (safe from robbery). Games, payments and the shop always use the wallet.',
      },
      games: {
        label: 'Casino',
        description: 'Games, payouts and the raffle',
        intro:
          'Every game takes your bet from the wallet first and pays the total shown by the multiplier (×2 returns double your bet). The minimum bet is {min}.',
        payouts: 'Payouts',
      },
      loans: {
        label: 'Loans',
        description: 'Borrow from the Stellar Bank',
        intro:
          'Borrow coins now and pay them back with interest. If the loan reaches its due date, it is collected automatically: wallet first, then bank, and any shortfall leaves your wallet negative.',
      },
      shop: {
        label: 'Shop',
        description: 'Items, roles and inventory',
        intro:
          '**Permanent** items stay in your inventory; if they grant a role you get it right away and can only buy them once. **Consumable** items are used up with /use, and can grant a role when used.',
      },
      admin: {
        label: 'Administration',
        description: 'The Mission Control panel',
        intro:
          'Everything is managed from the {command} panel: language, balances, work, role income, wheel prizes, game cooldowns, shop, loans and the raffle. It is only visible to administrators — you can grant it to other roles in Server Settings → Integrations.',
      },
      config: {
        label: 'Settings guide',
        description: 'Every setting and its current value',
        intro: 'All of these can be changed live with {command}.',
      },
    },
    payouts: {
      slots: 'Pair ×{pair} · Three of a kind ×{triple} · Three sevens ×{jackpot}',
      roulette: 'Colour, even/odd, low/high ×2 · Dozen or column ×3 · Single number ×36',
      horserace: '1st ×{first} · 2nd ×{second} · 3rd ×{third}',
      keno: 'Pick 1-10 numbers, 20 of 80 are drawn. More hits pay more — up to ×{max}.',
    },
    commands: {
      balance: {
        about:
          'Shows the wallet, bank, net worth and leaderboard rank of you or another member, plus any active loan.',
      },
      deposit: {
        about:
          'Moves coins from your wallet to the bank. Coins in the bank cannot be stolen with /rob.',
      },
      withdraw: {
        about: 'Moves coins from the bank back to your wallet so you can spend or bet them.',
      },
      pay: { about: 'Sends coins from your wallet to another member instantly.' },
      work: {
        about:
          'Takes a random job and pays a random amount inside the configured range. Has a cooldown between shifts.',
      },
      collect: {
        about:
          'Pays the income of every role you have that an admin configured in /config. The amounts of all your roles add up.',
      },
      dailywheel: {
        about:
          'Spins the Cosmic Wheel for a free prize. Every slot has the same chance, and some slots are empty.',
      },
      rob: {
        about:
          "Tries to steal part of another member's wallet. If you are caught, you pay a fine to your victim. You need some coins yourself to attempt it, and the target must be carrying enough.",
      },
      leaderboard: { about: 'Ranks members by net worth (wallet + bank), 10 per page.' },
      slots: {
        about:
          'Spins three reels. Two matching symbols or three of a kind pay out, and three sevens hit the jackpot.',
      },
      roulette: {
        about:
          'Bet on a colour, parity, half, dozen, column or a single number. The ball lands on 0-36; 0 is green and only wins single-number bets.',
      },
      horserace: {
        about:
          'Back one of 10 horses. You get paid if your horse finishes in the top 3, and you can watch the race live.',
      },
      keno: {
        about:
          'Pick 1-10 numbers from 1 to 80 (or use quickpick). The bot draws 20; the payout depends on how many you picked and how many were drawn.',
      },
      raffle: {
        about:
          'Buy tickets with a number from 000 to 999. The draw happens a while after the first ticket of a round; holders of the winning number split the pot, otherwise it rolls over and keeps growing.',
      },
      loan: {
        about:
          'Request a loan, check its status or repay it. You can only have one loan at a time, and the interest is added when you borrow.',
      },
      shop: {
        about: 'Browses the catalogue, 5 items per page, with a Buy button on every item.',
      },
      buy: { about: 'Buys one or more of an item. Start typing to search the catalogue.' },
      use: {
        about:
          'Uses consumable items from your inventory. If the item grants a role, you receive it.',
      },
      inventory: {
        about: 'Lists the items you (or another member) own and their total value.',
      },
      help: { about: 'Opens this guide.' },
      config: {
        about:
          'Opens Mission Control, the full admin panel: language, member balances, work, role income, wheel prizes, game cooldowns, shop items, loans and the raffle — all with buttons, menus and forms. Destructive actions ask for confirmation.',
      },
    },
  },
};
