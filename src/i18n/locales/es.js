const s = (count, word, plural = `${word}s`) => `${count} ${count === 1 ? word : plural}`;

module.exports = {
  meta: { name: 'Español', flag: '🇪🇸' },

  common: {
    wallet: 'Cartera',
    bank: 'Banco',
    netWorth: 'Patrimonio',
    yourWallet: 'Tu cartera',
    none: 'Ninguno',
    by: 'Por {user}',
    invalidAmount: 'Escribe una cantidad válida como `500`, `2.5k`, `mitad` o `todo`.',
    notEnoughWallet: 'Solo tienes {amount} en tu cartera.',
    notEnoughBank: 'Solo tienes {amount} en el banco.',
    emptyWallet: 'Tu cartera está vacía.',
    emptyBank: 'Tu cuenta bancaria está vacía.',
    botsNoAccount: 'Los bots no tienen cuenta.',
    cooldown: 'Podrás {action} de nuevo {time}.',
    adminOnly: 'Solo los administradores pueden usar esto.',
    notYours: 'Este panel es de otra persona. Usa {command} para abrir el tuyo.',
    error: 'Algo salió mal. Inténtalo de nuevo. Referencia: `{ref}`',
    invalidDuration: 'Duración no válida. Usa formatos como `30m`, `12h` o `1d`.',
  },

  features: {
    balance: 'Saldo',
    bank: 'Banco Estelar',
    work: 'Trabajos Espaciales',
    collect: 'Ingresos Estelares',
    wheel: 'Rueda Cósmica',
    rob: 'Atraco Espacial',
    leaderboard: 'Clasificación Galáctica',
    slots: 'Tragamonedas Nebulosa',
    roulette: 'Ruleta Orbital',
    horserace: 'Derby de Cometas',
    keno: 'Keno Cósmico',
    raffle: 'Rifa Galáctica',
    loans: 'Préstamos Estelares',
    shop: 'Tienda del Puerto Estelar',
    inventory: 'Bodega de Carga',
    config: 'Centro de Control',
    help: 'Guía de SpaceBet',
  },

  status: 'Apostando por toda la galaxia',

  balance: {
    subtitle: 'Comandante {user}',
    rank: 'Puesto **#{rank}**',
    activeLoan: 'Préstamo activo',
    loanDue: '{amount} vence {time}',
  },

  bank: {
    depositTitle: 'Depósito completado',
    depositBody: 'Guardaste {amount} en el Banco Estelar.',
    withdrawTitle: 'Retiro completado',
    withdrawBody: 'Retiraste {amount} del Banco Estelar.',
  },

  pay: {
    self: 'No puedes pagarte a ti mismo.',
    bot: 'No puedes pagarle a un bot.',
    title: 'Transferencia enviada',
    body: '{sender} envió {amount} a {target}.',
  },

  work: {
    action: 'trabajar',
    noJobs:
      'No hay trabajos disponibles ahora mismo. Pide a un admin que añada alguno con {command}.',
    title: 'Turno completado',
    fallback: '{message} Ganaste {amount}.',
    next: 'Próximo turno',
    defaultMessages: [
      'Reparaste el hiperimpulsor de un carguero varado y ganaste {amount}.',
      'Cartografiaste una nebulosa inexplorada y vendiste los datos por {amount}.',
      'Extrajiste mineral de asteroides en el cinturón exterior y sacaste {amount}.',
      'Escoltaste un convoy de carga por territorio pirata y te pagaron {amount}.',
      'Calibraste los telescopios de la estación y ganaste {amount}.',
    ],
  },

  collect: {
    action: 'cobrar',
    noRewards: 'Ninguno de tus roles genera ingresos todavía.',
    title: 'Ingresos cobrados',
    body: 'Cobraste {amount} gracias a tus roles.',
    next: 'Próximo cobro',
  },

  wheel: {
    action: 'girar la rueda',
    empty: 'La rueda no tiene premios configurados. Pide a un admin que añada alguno.',
    spinning: 'Girando... {label}',
    won: '¡La rueda se detuvo en {label}!',
    lost: 'La rueda se detuvo en {label}. ¡Más suerte la próxima vez!',
    nothing: 'Nada',
    next: 'Próximo giro',
  },

  rob: {
    self: 'No puedes robarte a ti mismo.',
    bot: 'Los bots guardan sus monedas en un agujero negro.',
    action: 'robar',
    thiefPoor: 'Necesitas al menos {amount} en tu cartera para cubrir una posible multa.',
    targetPoor: '{target} no lleva suficientes monedas como para que valga la pena.',
    successTitle: 'Atraco exitoso',
    successBody: 'Te colaste en la bodega de {target} y robaste {amount}.',
    failTitle: '¡Te atraparon!',
    failBody: 'La seguridad de la estación te atrapó. Pagaste {amount} de compensación a {target}.',
    next: 'Próximo intento',
  },

  leaderboard: {
    subtitle: 'Los comandantes más ricos por patrimonio (cartera + banco).',
    empty: 'Nadie tiene monedas todavía. ¡Sé el primero!',
    you: 'tú',
    yourRank: 'Tu puesto: #{rank}',
  },

  games: {
    action: 'jugar a {game}',
    minWallet: 'Necesitas al menos {min} en tu cartera para jugar. Tienes {wallet}.',
    invalidBet: 'Escribe una apuesta válida como `500`, `2.5k`, `mitad` o `todo`.',
    minBet: 'La apuesta mínima es {min}.',
    won: 'Ganaste {amount}',
    refund: 'Recuperaste tu apuesta',
    lost: 'Perdiste {amount}',
    bet: 'Apuesta',
    payout: 'Premio',
  },

  slots: {
    spinning: 'Girando los rodillos...',
    jackpot: '¡JACKPOT!',
    triple: '¡Tres iguales!',
    pair: '¡Una pareja!',
    none: 'Sin premio',
    paytable: 'Pareja ×{pair} · Tres iguales ×{triple} · Jackpot ×{jackpot}',
  },

  roulette: {
    needsNumber: 'Elige el `number` (0-36) para apostar a un número.',
    spinning: 'La bola está girando... apostaste a **{bet}**.',
    landed: 'La bola cayó en {icon} **{number} {color}**',
    win: '¡Tu apuesta a **{bet}** gana!',
    lose: 'Tu apuesta a **{bet}** pierde.',
    number: 'Número {n}',
    colors: { red: 'rojo', black: 'negro', green: 'verde' },
    bets: {
      red: 'Rojo',
      black: 'Negro',
      even: 'Par',
      odd: 'Impar',
      low: 'Bajo (1-18)',
      high: 'Alto (19-36)',
      dozen1: '1.ª docena (1-12)',
      dozen2: '2.ª docena (13-24)',
      dozen3: '3.ª docena (25-36)',
      column1: '1.ª columna',
      column2: '2.ª columna',
      column3: '3.ª columna',
      straight: 'Número único (0-36)',
    },
  },

  horserace: {
    backed: 'Apostaste por **{horse}**',
    results: 'Resultados',
    finished: '**{horse}** terminó en la posición **{place}**.',
  },

  keno: {
    badRange: 'Cada número debe estar entre 1 y {max}.',
    repeated: 'No repitas números.',
    badCount: 'Elige entre 1 y {max} números.',
    summary: 'Salieron **{hits}** de tus **{picks}** números.',
    yours: 'Tus números',
    drawn: 'Números sorteados ({count})',
    paytable: '{spots} números: {table}',
    hits: ({ n }) => s(n, 'acierto'),
  },

  raffle: {
    duplicate: 'Ya tienes el boleto {number}.',
    funds: 'Un boleto cuesta {price}. No tienes suficiente en tu cartera.',
    boughtTitle: 'Boleto comprado',
    boughtBody: 'Tienes el número {number} por {price}.',
    pot: 'Bote',
    draw: 'Sorteo',
    yourTickets: 'Tus boletos',
    announce: 'Los resultados se anunciarán en este canal',
    infoSubtitle:
      'Quienes tengan el número ganador se reparten el bote. ¿Sin ganador? ¡Se acumula!',
    ticketPrice: 'Precio del boleto',
    sold: 'Boletos vendidos',
    afterFirst: '{duration} después del primer boleto',
    resultsTitle: 'Resultados',
    winning: 'El número ganador es {number}',
    winnerSingle: '¡{winners} ganó el bote de {pot}!',
    winnerSplit: '¡{winners} se reparten el bote de {pot}! Cada ganador recibe {share}.',
    noWinner:
      'Nadie tenía el número ganador entre **{tickets}** boletos.\nEl bote se acumula para la próxima ronda: {pot}',
    footer: 'Compra un boleto con /raffle buy',
  },

  loans: {
    statusTitle: 'Estado del préstamo',
    statusSubtitle: 'Págalo antes de la fecha de vencimiento o se cobrará automáticamente.',
    borrowed: 'Prestado',
    interest: 'Interés',
    amountDue: 'Total a pagar',
    due: 'Vence',
    repayButton: 'Pagar ahora',
    cannotRepayYet: 'Todavía no tienes suficientes monedas en la cartera para pagar',
    none: 'No tienes ningún préstamo activo. Puedes pedir hasta {max} con un {rate}% de interés.',
    noLoan: 'No tienes ningún préstamo activo.',
    needToRepay:
      'Necesitas {amount} en tu cartera para pagar. Retira del banco primero si hace falta.',
    repaidTitle: 'Préstamo pagado',
    repaidBody: 'Devolviste {amount}. ¡Ya no tienes deudas!',
    already: 'Ya tienes un préstamo activo. Págalo primero con {command}.',
    negative: 'No puedes pedir un préstamo con saldo negativo.',
    range: 'Escribe una cantidad entre 1 y {max}.',
    approvedTitle: 'Préstamo aprobado',
    approvedBody: 'Se añadieron {amount} a tu cartera.',
    term: '{time} · plazo de {duration}',
    footer: 'Los préstamos vencidos se cobran de tu cartera y después del banco',
    notYours: 'Este préstamo no es tuyo.',
    collectedTitle: 'Préstamo cobrado',
    collectedBody: 'Tu préstamo llegó a su fecha de vencimiento.',
    collectedAmount: 'Cantidad cobrada',
    debtLeft: 'Deuda pendiente en tu cartera',
    debtLeftValue: '{amount} — tu cartera ahora está en negativo.',
  },

  shop: {
    subtitle: 'Pulsa **Comprar** para llevarte uno, o usa {command} para comprar más.',
    empty: 'La tienda está vacía ahora mismo. ¡Vuelve pronto!',
    consumable: 'Consumible',
    permanent: 'Permanente',
    grants: 'Da el rol {role}',
    buy: 'Comprar',
    items: ({ count }) => s(count, 'artículo'),
    gone: 'Ese artículo ya no está a la venta.',
    boughtQuick: 'Compraste **{item}** por {amount}.',
    boughtRole: 'Recibiste {role}.',
    walletNow: 'Cartera: {amount}',
    notFound: 'Ese artículo no existe. Revisa el catálogo con {command}.',
    purchaseTitle: 'Compra completada',
    purchaseBody: 'Compraste **{quantity}× {item}** por {amount}.',
    roleReceived: 'Rol recibido',
    owned: 'En tu inventario',
    useHint: 'Úsalo con /use',
    alreadyOwned: 'Ya tienes **{item}** — solo se puede comprar una vez.',
    cantAfford: 'Cuesta {total} pero solo tienes {wallet} en tu cartera.',
    refunded: '{reason} Se te devolvió el dinero.',
    roleRejected: 'Discord rechazó la asignación del rol. Se te devolvió el dinero.',
    roleMissing: 'El rol vinculado a este artículo ya no existe.',
    roleNotEditable: 'No puedo asignar {role} — sube mi rol por encima y dame **Gestionar roles**.',
  },

  use: {
    notFound: 'Ese artículo no existe.',
    permanent: '**{item}** es permanente y no se puede consumir.',
    roleOne: 'Los artículos con rol solo se pueden usar de uno en uno.',
    notEnough: 'Solo tienes **{quantity}× {item}**.',
    alreadyHad: 'Ya tienes {role} — el artículo no se consumió.',
    roleRejected: 'Discord rechazó la asignación del rol. El artículo no se consumió.',
    title: 'Artículo usado',
    body: 'Usaste **{quantity}× {item}**.',
    remaining: 'Te quedan',
  },

  inventory: {
    subtitle: 'Bodega de carga de {user}',
    empty: 'Vacía — visita {command} para comprar algo.',
    value: 'Valor: {amount}',
  },

  managemoney: {
    add: 'Se añadieron {amount} a la {account} de {user}.',
    remove: 'Se quitaron {amount} de la {account} de {user}.',
    set: 'La {account} de {user} ahora es {amount}.',
    reset: 'Se reinició todo el dinero de {user}.',
    accounts: { wallet: 'cartera', bank: 'cuenta bancaria' },
  },

  managecollect: {
    set: '{role} ahora gana {amount} por cobro.',
    removed: '{role} ya no genera ingresos.',
    cleared: ({ count }) => `Se quitaron los ingresos de ${s(count, 'rol', 'roles')}.`,
  },

  managewheel: {
    full: 'La rueda ya tiene el máximo de {max} casillas.',
    added: 'Se añadió {label} a la rueda.',
    missing: 'Esa casilla no existe.',
    removed: 'Se quitó {label} de la rueda.',
    reset: 'Los premios de la rueda volvieron a los valores por defecto.',
  },

  managework: {
    full: 'Hay un límite de {max} mensajes.',
    added: 'Se añadió el mensaje de trabajo #{n}.',
    missing: 'Ese mensaje no existe.',
    removed: 'Eliminado: “{message}”',
    reset: 'Los ajustes de trabajo volvieron a los valores por defecto.',
    noMessages: 'No hay mensajes de trabajo — /work está desactivado hasta que añadas uno.',
    usingDefaults: 'Se usan los mensajes integrados, mostrados en el idioma de cada respuesta.',
  },

  manageshop: {
    notFound: 'Ese artículo no existe.',
    removed: '**{item}** se quitó de la tienda.',
    exists: 'Ya existe un artículo llamado **{item}**.',
    badRole: 'Los bots no pueden asignar ese rol.',
    addedBody: '**{item}** ya está a la venta.',
    price: 'Precio',
    type: 'Tipo',
    cantAssign: '— todavía no puedo asignar este rol',
    description: 'Descripción',
  },

  manageloans: {
    cancelled: 'Se canceló el préstamo de {user}.',
    none: '{user} no tiene ningún préstamo activo.',
    cancelledAll: ({ count }) =>
      `Se ${count === 1 ? 'canceló' : 'cancelaron'} ${s(count, 'préstamo activo', 'préstamos activos')}.`,
    listTitle: 'Préstamos activos',
    empty: 'Nadie le debe nada al banco.',
    due: 'vence {time}',
  },

  config: {
    subtitle: 'Los cambios se aplican al instante. Elige una categoría abajo.',
    placeholder: 'Elige una categoría para configurar',
    edit: 'Editar',
    reset: 'Restaurar valores',
    saved: 'Ajustes guardados.',
    restored: 'Valores por defecto restaurados.',
    invalid: 'Valor no válido en **{field}** — {hint}.',
    unknown: 'Categoría desconocida.',
    modalTitle: 'Ajustes: {category}',
    languagePlaceholder: 'Elige el idioma del bot',
    languageSaved: 'Idioma actualizado.',
    minMax: 'El pago mínimo no puede ser mayor que el máximo.',
    hints: {
      coins: 'Un número entero, p. ej. 2500',
      percent: 'Un número entero de 0 a 1000',
      duration: 'p. ej. 30s, 15m, 1h30m, 2d',
    },
    languages: {
      auto: 'Automático',
      autoDescription: 'El idioma de Discord de cada miembro',
      en: 'English',
      es: 'Español',
    },
    categories: {
      general: { label: 'General', description: 'Idioma del bot' },
      members: { label: 'Miembros', description: 'Ajusta saldos y mira las estadísticas' },
      work: { label: 'Trabajo', description: 'Pago, espera y mensajes de /work' },
      collect: {
        label: 'Ingresos por rol',
        description: 'Ingresos de cada rol y espera de /collect',
      },
      wheel: { label: 'Rueda Cósmica', description: 'Premios y espera de /dailywheel' },
      games: { label: 'Juegos', description: 'Esperas de los juegos de casino y /rob' },
      shop: { label: 'Tienda', description: 'Añade y quita artículos a la venta' },
      loans: { label: 'Préstamos', description: 'Condiciones y préstamos activos' },
      raffle: { label: 'Rifa', description: 'Precio del boleto, bote inicial y espera del sorteo' },
    },
    fields: {
      general: {
        language: {
          label: 'Idioma',
          help: 'Idioma de todas las respuestas. Automático sigue el idioma de Discord de cada miembro.',
        },
      },
      work: {
        min: { label: 'Pago mínimo', help: 'Lo mínimo que puede pagar un turno de /work.' },
        max: { label: 'Pago máximo', help: 'Lo máximo que puede pagar un turno de /work.' },
        cooldown: { label: 'Espera', help: 'Tiempo que un miembro debe esperar entre turnos.' },
      },
      collect: {
        cooldown: { label: 'Espera', help: 'Tiempo entre dos /collect del mismo miembro.' },
      },
      wheel: {
        cooldown: { label: 'Espera', help: 'Tiempo entre dos giros de /dailywheel.' },
      },
      games: {
        slots: { label: 'Espera de tragamonedas', help: 'Espera entre dos partidas de /slots.' },
        roulette: { label: 'Espera de ruleta', help: 'Espera entre dos apuestas de /roulette.' },
        horserace: {
          label: 'Espera de carreras',
          help: 'Espera entre dos apuestas de /horserace.',
        },
        keno: { label: 'Espera de keno', help: 'Espera entre dos partidas de /keno.' },
        rob: { label: 'Espera de robo', help: 'Espera entre dos intentos de /rob.' },
      },
      loans: {
        rate: { label: 'Interés (%)', help: 'Porcentaje extra que se suma a cada préstamo nuevo.' },
        duration: {
          label: 'Plazo',
          help: 'Tiempo antes de que un préstamo se cobre automáticamente.',
        },
        max: { label: 'Préstamo máximo', help: 'La cantidad más alta que un miembro puede pedir.' },
      },
      raffle: {
        price: { label: 'Precio del boleto', help: 'Lo que cuesta un boleto de la rifa.' },
        pot: { label: 'Bote inicial', help: 'Bote de una ronda nueva cuando alguien gana.' },
        delay: {
          label: 'Espera del sorteo',
          help: 'Tiempo entre el primer boleto de una ronda y el sorteo.',
        },
      },
    },
  },

  panel: {
    more: '…y {count} más',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    cancelled: 'Acción cancelada.',
    clearAll: 'Quitar todos',
    members: {
      adjust: 'Ajustar un saldo',
      accounts: 'Miembros con monedas',
      inWallets: 'Monedas en carteras',
      inBanks: 'Monedas en bancos',
      hint: 'Añade, quita o fija las monedas de cualquier miembro, o déjalas a cero.',
      modalTitle: 'Ajustar un saldo',
      member: 'Miembro',
      action: 'Acción',
      actions: {
        add: 'Añadir monedas',
        remove: 'Quitar monedas',
        set: 'Fijar cantidad exacta',
        reset: 'Reiniciar a cero',
      },
      account: 'Cuenta',
      amount: 'Cantidad',
      amountHint: 'No hace falta para reiniciar',
      amountRequired: 'Escribe una cantidad para esa acción.',
    },
    work: {
      messages: 'Mensajes de trabajo',
      add: 'Añadir mensaje',
      removePlaceholder: 'Quitar un mensaje de trabajo…',
      modalTitle: 'Nuevo mensaje de trabajo',
      messageLabel: 'Mensaje',
      messageHint: 'Usa {amount} donde debe aparecer el pago.',
      confirmReset: 'Esto restaura el pago, la espera y los mensajes integrados.',
    },
    collect: {
      roles: 'Roles con ingresos',
      empty: 'Ningún rol genera ingresos todavía.',
      add: 'Asignar ingresos a un rol',
      removePlaceholder: 'Quitar los ingresos de un rol…',
      modalTitle: 'Ingresos por rol',
      roleLabel: 'Rol',
      amountLabel: 'Monedas por cobro',
      confirmClear: 'Esto quita los ingresos de todos los roles.',
    },
    wheel: {
      prizes: 'Premios',
      empty: 'La rueda está vacía.',
      add: 'Añadir premio',
      resetPrizes: 'Restaurar premios',
      removePlaceholder: 'Quitar un premio…',
      modalTitle: 'Nuevo premio',
      amountLabel: 'Monedas (0 = casilla vacía)',
      labelLabel: 'Nombre personalizado (opcional)',
      confirmReset: 'Esto reemplaza todos los premios por los de por defecto.',
    },
    shop: {
      items: 'Artículos a la venta',
      add: 'Añadir artículo',
      removePlaceholder: 'Quitar un artículo…',
      hint: 'Los artículos permanentes con rol lo dan al comprarlos; los consumibles al usarlos.',
      modalTitle: 'Nuevo artículo',
      name: 'Nombre',
      nameRequired: 'El artículo necesita un nombre.',
      typeHint: 'Los consumibles se gastan con /use',
      role: 'Rol (opcional)',
      roleHint: 'Se da al comprarlo (permanente) o al usarlo (consumible)',
      confirmRemove: '¿Quitar **{item}**? También desaparecerá de todos los inventarios.',
    },
    loans: {
      cancelAll: 'Perdonar todos',
      cancelPlaceholder: 'Perdonar el préstamo de…',
      confirmCancelAll: 'Esto perdona todos los préstamos activos.',
    },
    raffle: {
      round: 'Ronda actual',
      waiting: 'Esperando el primer boleto',
    },
  },

  help: {
    subtitle: 'Tu guía de cada comando, juego y ajuste.',
    placeholder: 'Explora una sección',
    commandPlaceholder: 'Abre un comando',
    unknownCommand: 'No existe ningún comando llamado `{name}`.',
    usage: 'Uso',
    options: 'Opciones',
    optional: 'opcional',
    cooldown: 'Espera',
    adminOnly: 'Solo administradores',
    configuredIn: 'Se configura en {command}',
    currentValue: 'Valor actual',
    commandsTitle: 'Comandos',
    tip: 'Consejo: usa `/help command:<nombre>` para ir directo a un comando.',
    home: {
      intro:
        'SpaceBet es una economía con temática espacial. Gana monedas, guárdalas en el banco, prueba suerte en el casino y gasta tu fortuna en la tienda.',
      quickStart: 'Primeros pasos',
      steps: [
        '{work} para ganar tus primeras monedas',
        '{deposit} para protegerlas de los ladrones',
        '{slots} u otro juego para multiplicarlas',
        '{shop} para gastarlas',
      ],
      amounts: 'Las cantidades aceptan `500`, `1,500`, `2.5k`, `1m`, `mitad` o `todo`.',
    },
    sections: {
      economy: {
        label: 'Economía',
        description: 'Gana, guarda y envía monedas',
        intro:
          'Tu dinero está en dos sitios: la **cartera** (para gastar, pero te la pueden robar) y el **banco** (a salvo de robos). Los juegos, los pagos y la tienda siempre usan la cartera.',
      },
      games: {
        label: 'Casino',
        description: 'Juegos, premios y la rifa',
        intro:
          'Cada juego toma tu apuesta de la cartera y paga el total que indica el multiplicador (×2 devuelve el doble de tu apuesta). La apuesta mínima es {min}.',
        payouts: 'Premios',
      },
      loans: {
        label: 'Préstamos',
        description: 'Pide prestado al Banco Estelar',
        intro:
          'Pide monedas ahora y devuélvelas con interés. Si el préstamo llega a su vencimiento se cobra automáticamente: primero de la cartera, luego del banco, y lo que falte deja tu cartera en negativo.',
      },
      shop: {
        label: 'Tienda',
        description: 'Artículos, roles e inventario',
        intro:
          'Los artículos **permanentes** se quedan en tu inventario; si dan un rol lo recibes al momento y solo se pueden comprar una vez. Los **consumibles** se gastan con /use y pueden dar un rol al usarlos.',
      },
      admin: {
        label: 'Administración',
        description: 'El panel del Centro de Control',
        intro:
          'Todo se gestiona desde el panel {command}: idioma, saldos, trabajo, ingresos por rol, premios de la rueda, esperas de los juegos, tienda, préstamos y la rifa. Solo lo ven los administradores — puedes dárselo a otros roles en Ajustes del servidor → Integraciones.',
      },
      config: {
        label: 'Guía de ajustes',
        description: 'Cada ajuste y su valor actual',
        intro: 'Todo esto se puede cambiar en vivo con {command}.',
      },
    },
    payouts: {
      slots: 'Pareja ×{pair} · Tres iguales ×{triple} · Tres sietes ×{jackpot}',
      roulette: 'Color, par/impar, bajo/alto ×2 · Docena o columna ×3 · Número único ×36',
      horserace: '1.º ×{first} · 2.º ×{second} · 3.º ×{third}',
      keno: 'Elige de 1 a 10 números; salen 20 de 80. Más aciertos pagan más — hasta ×{max}.',
    },
    commands: {
      balance: {
        about:
          'Muestra la cartera, el banco, el patrimonio y el puesto en la clasificación tuyos o de otro miembro, además de cualquier préstamo activo.',
      },
      deposit: {
        about:
          'Pasa monedas de tu cartera al banco. Las monedas del banco no se pueden robar con /rob.',
      },
      withdraw: {
        about: 'Pasa monedas del banco a tu cartera para poder gastarlas o apostarlas.',
      },
      pay: { about: 'Envía monedas de tu cartera a otro miembro al instante.' },
      work: {
        about:
          'Haces un trabajo al azar y cobras una cantidad aleatoria dentro del rango configurado. Tiene una espera entre turnos.',
      },
      collect: {
        about:
          'Paga los ingresos de cada rol que tengas y que un admin haya configurado en /config. Las cantidades de todos tus roles se suman.',
      },
      dailywheel: {
        about:
          'Gira la Rueda Cósmica para ganar un premio gratis. Todas las casillas tienen la misma probabilidad y algunas están vacías.',
      },
      rob: {
        about:
          'Intenta robar parte de la cartera de otro miembro. Si te atrapan, pagas una multa a tu víctima. Necesitas tener algunas monedas para intentarlo y el objetivo debe llevar suficientes.',
      },
      leaderboard: {
        about: 'Ordena a los miembros por patrimonio (cartera + banco), 10 por página.',
      },
      slots: {
        about:
          'Gira tres rodillos. Dos símbolos iguales o tres iguales dan premio, y tres sietes ganan el jackpot.',
      },
      roulette: {
        about:
          'Apuesta a un color, par o impar, mitad, docena, columna o a un número. La bola cae entre 0 y 36; el 0 es verde y solo gana en apuestas a número.',
      },
      horserace: {
        about:
          'Apuesta por uno de 10 caballos. Cobras si tu caballo termina entre los 3 primeros, y puedes ver la carrera en directo.',
      },
      keno: {
        about:
          'Elige de 1 a 10 números del 1 al 80 (o usa quickpick). El bot sortea 20; el premio depende de cuántos elegiste y cuántos salieron.',
      },
      raffle: {
        about:
          'Compra boletos con un número del 000 al 999. El sorteo es un tiempo después del primer boleto de la ronda; quienes tengan el número ganador se reparten el bote y, si nadie lo tiene, se acumula y sigue creciendo.',
      },
      loan: {
        about:
          'Pide un préstamo, consulta su estado o págalo. Solo puedes tener un préstamo a la vez y el interés se suma al pedirlo.',
      },
      shop: {
        about: 'Muestra el catálogo, 5 artículos por página, con un botón Comprar en cada uno.',
      },
      buy: {
        about: 'Compra uno o varios de un artículo. Empieza a escribir para buscar en el catálogo.',
      },
      use: {
        about: 'Usa artículos consumibles de tu inventario. Si el artículo da un rol, lo recibes.',
      },
      inventory: {
        about: 'Muestra los artículos que tienes tú (u otro miembro) y su valor total.',
      },
      help: { about: 'Abre esta guía.' },
      config: {
        about:
          'Abre el Centro de Control, el panel de administración completo: idioma, saldos de los miembros, trabajo, ingresos por rol, premios de la rueda, esperas de los juegos, artículos de la tienda, préstamos y la rifa — todo con botones, menús y formularios. Las acciones destructivas piden confirmación.',
      },
    },
  },
};
