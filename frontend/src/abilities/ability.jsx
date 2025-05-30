import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export const defineAbilityFor = (user, group = null) => {
  const { can, rules } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    can("read", "Group");
    return createMongoAbility(rules);
  }

  if (["admin", "admin_groupe"].includes(user.role)) {
    can("manage", "Group");
  } else {
    can("read", "Group");
    can("join", "Group");
    can("leave", "Group");
  }

  if (group?.roles) {
    const isPiloteLocal = group.roles.some(
      (r) => r.userId?.toString() === user.id && r.role === "pilote"
    );
    if (isPiloteLocal) {
      can("update", "Group");
    }
  }

  return createMongoAbility(rules);
};
