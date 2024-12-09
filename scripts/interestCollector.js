const { User } = require('../models/User');

const collectInterest = async () => {
  const usersWithActiveLoans = await User.findAll({
    where: { loanActive: true },
  });

  for (const user of usersWithActiveLoans) {
    const loanAmount = user.loanAmount;
    const loanInterest = user.loanInterest;
    const currentDate = new Date();
    const dueDate = new Date(user.loanDueDate);

    // Cobrar el préstamo y el interés en la fecha de vencimiento
    if (currentDate >= dueDate) {
      // Calcular el interés a cobrar
      const interestAmount = (loanAmount * loanInterest) / 100;
      const totalAmountToCollect = loanAmount + interestAmount;

      // Cobrar desde la wallet y el bank
      if (user.wallet >= totalAmountToCollect) {
        user.wallet -= totalAmountToCollect; // Cobrar todo de la billetera
      } else {
        const remainingAmount = totalAmountToCollect - user.wallet;
        user.wallet = 0; // Dejar la billetera en cero

        if (user.bank >= remainingAmount) {
          user.bank -= remainingAmount; // Cobrar el resto del banco
        } else {
          const negativeBalance = remainingAmount - user.bank;
          user.bank = 0; // Dejar el banco en cero
          user.wallet -= negativeBalance; // Permitir saldo negativo en la billetera
        }
      }

      // Eliminar el préstamo del usuario
      user.loanActive = false;
      user.loanAmount = 0;
      user.loanInterest = 0;
      user.loanDueDate = null;

      await user.save();

      console.log(
        `Collected total amount of ${totalAmountToCollect} from user ${user.username}. Loan has been cleared.`,
      );
    }
  }
};

module.exports = collectInterest;
