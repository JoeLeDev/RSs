// middlewares/checkAbility.js
const { defineAbilityFor } = require("../abilities/defineAbilityFor");

function checkAbility(action, subject) {
  return async (req, res, next) => {
    const ability = defineAbilityFor(req.user, req.group); // req.group est défini par un middleware en amont
    if (ability.can(action, subject)) {
      return next();
    }
    return res.status(403).json({ message: "Accès refusé." });
  };
}

module.exports = checkAbility;
