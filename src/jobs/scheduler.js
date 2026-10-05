const log = require('../core/logger').child('jobs');

const JOBS = [
  { name: 'loans', every: 60_000, run: require('./loanCollector') },
  { name: 'raffle', every: 15_000, run: require('./raffleDraw') },
  { name: 'cooldowns', every: 60 * 60_000, run: require('./cooldownCleanup') },
];

const timers = [];

function start(client) {
  for (const job of JOBS) {
    let running = false;
    const tick = async () => {
      if (running) return;
      running = true;
      try {
        await job.run(client);
      } catch (error) {
        log.error(`Job "${job.name}" failed:`, error);
      } finally {
        running = false;
      }
    };
    tick();
    timers.push(setInterval(tick, job.every));
  }
  log.info(`Started ${JOBS.length} background jobs.`);
}

function stop() {
  for (const timer of timers.splice(0)) clearInterval(timer);
}

module.exports = { start, stop };
