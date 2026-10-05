const { sql, transaction } = require('../database');
const economy = require('./economy');
const settings = require('./settings');

function getLoan(userId) {
  return sql('SELECT * FROM loans WHERE user_id = ?').get(userId) ?? null;
}

function listLoans() {
  return sql('SELECT * FROM loans ORDER BY due_at').all();
}

function terms(amount) {
  const interestRate = settings.get('loan.interestRate');
  const duration = settings.get('loan.duration');
  return {
    interestRate,
    amountDue: amount + Math.ceil((amount * interestRate) / 100),
    dueAt: Date.now() + duration * 1000,
  };
}

/** Grants a loan and credits the wallet. Returns the created loan. */
function takeLoan(userId, amount) {
  const { interestRate, amountDue, dueAt } = terms(amount);
  return transaction(() => {
    sql(
      `INSERT INTO loans (user_id, principal, interest_rate, amount_due, due_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(userId, amount, interestRate, amountDue, dueAt);
    economy.credit(userId, amount);
    return getLoan(userId);
  });
}

/** Repays the full loan from the wallet. Returns false if funds are short. */
function repay(userId) {
  return transaction(() => {
    const loan = getLoan(userId);
    if (!loan || !economy.debit(userId, loan.amount_due)) return false;
    sql('DELETE FROM loans WHERE user_id = ?').run(userId);
    return true;
  });
}

function cancel(userId) {
  return sql('DELETE FROM loans WHERE user_id = ?').run(userId).changes > 0;
}

function cancelAll() {
  return sql('DELETE FROM loans').run().changes;
}

/**
 * Collects every overdue loan: wallet first, then bank, and whatever is
 * still missing is left as a negative wallet balance.
 */
function collectOverdue() {
  const overdue = sql('SELECT * FROM loans WHERE due_at <= ?').all(Date.now());

  return overdue.map((loan) =>
    transaction(() => {
      let remaining = loan.amount_due;
      remaining -= economy.debitUpTo(loan.user_id, remaining, 'wallet');
      remaining -= economy.debitUpTo(loan.user_id, remaining, 'bank');
      if (remaining > 0) economy.forceDebit(loan.user_id, remaining, 'wallet');
      sql('DELETE FROM loans WHERE user_id = ?').run(loan.user_id);
      return { ...loan, shortfall: remaining };
    }),
  );
}

module.exports = {
  getLoan,
  listLoans,
  terms,
  takeLoan,
  repay,
  cancel,
  cancelAll,
  collectOverdue,
};
