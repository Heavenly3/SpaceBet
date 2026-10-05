// Spanish names shown by the Discord client for descriptions, options and
// choices. Command and option names stay in English so they are the same
// for everyone; Discord limits each text to 100 characters.
const { roulette } = require('../../config/games');
const es = require('../locales/es');

const amount = 'Cantidad — p. ej. 500, 2.5k, mitad o todo';
const bet = 'Tu apuesta — p. ej. 500, 2.5k, mitad o todo';

module.exports = {
  balance: {
    description: 'Muestra tu saldo o el de otro miembro.',
    options: { user: 'Miembro a consultar' },
  },
  deposit: {
    description: 'Pasa dinero de tu cartera al banco.',
    options: { amount },
  },
  withdraw: {
    description: 'Pasa dinero del banco a tu cartera.',
    options: { amount },
  },
  pay: {
    description: 'Envía dinero de tu cartera a otro miembro.',
    options: { user: 'Quién recibe el dinero', amount },
  },
  work: { description: 'Haz un trabajo por la galaxia y gana monedas.' },
  collect: { description: 'Cobra los ingresos que te dan tus roles.' },
  dailywheel: { description: 'Gira la Rueda Cósmica para ganar un premio gratis.' },
  rob: {
    description: 'Intenta robar de la cartera de otro miembro. ¡Es arriesgado!',
    options: { user: 'Tu víctima' },
  },
  leaderboard: { description: 'Mira a los comandantes más ricos de la galaxia.' },

  slots: {
    description: 'Tira de la palanca de la Tragamonedas Nebulosa.',
    options: { bet },
  },
  roulette: {
    description: 'Apuesta en la Ruleta Orbital.',
    options: {
      bet,
      on: 'A qué apuestas',
      number: 'El número al que apuestas (solo para "Número único")',
    },
    choices: {
      on: Object.fromEntries(
        Object.entries(roulette.bets).map(([value, { multiplier }]) => [
          value,
          `${es.roulette.bets[value]} — paga ×${multiplier}`,
        ]),
      ),
    },
  },
  horserace: {
    description: 'Apuesta por un caballo en el Derby de Cometas.',
    options: { bet, horse: 'El caballo por el que apuestas' },
  },
  keno: {
    description: 'Elige hasta 10 números y espera que salgan.',
    options: {
      bet,
      numbers: 'Hasta 10 números del 1 al 80, p. ej. "4 8 15 16 23 42"',
      quickpick: 'Deja que el bot elija esta cantidad de números por ti',
    },
  },
  raffle: {
    description: 'La Rifa Galáctica — elige un número y gana el bote.',
    subcommands: {
      buy: {
        description: 'Compra un boleto con un número del 000 al 999.',
        options: { number: 'Tu número de la suerte (0-999)' },
      },
      info: { description: 'Mira el bote, la hora del sorteo y tus boletos.' },
    },
  },

  loan: {
    description: 'Pide monedas prestadas al Banco Estelar.',
    subcommands: {
      request: {
        description: 'Pide un préstamo nuevo.',
        options: { amount: 'Cuánto pedir — p. ej. 5000 o 10k' },
      },
      status: { description: 'Consulta tu préstamo activo.' },
      repay: { description: 'Paga tu préstamo completo.' },
    },
  },

  shop: { description: 'Mira los artículos a la venta.' },
  buy: {
    description: 'Compra un artículo de la tienda.',
    options: { item: 'El artículo que quieres comprar', quantity: 'Cuántos (por defecto 1)' },
  },
  use: {
    description: 'Usa un artículo consumible de tu inventario.',
    options: { item: 'El artículo que quieres usar', quantity: 'Cuántos (por defecto 1)' },
  },
  inventory: {
    description: 'Mira los artículos que tienes tú u otro miembro.',
    options: { user: 'Miembro a consultar' },
  },

  help: {
    description: 'Guía de todos los comandos, juegos y ajustes del bot.',
    options: { command: 'Abre directamente la ayuda de un comando' },
  },

  config: { description: 'Abre el Centro de Control para gestionar todo el bot.' },
};
