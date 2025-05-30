const { AbilityBuilder, Ability } = require('@casl/ability');

function defineAbilityFor(user, group = null) {
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  // 🔓 Visiteur non connecté
  if (!user) {
    can('read', 'Group'); // tout le monde peut lire les groupes
    can('read', 'Post'); // tout le monde peut lire les posts
    can('read', 'Comment'); // tout le monde peut lire les commentaires
    return new Ability(rules);
  }

  // --- Permissions de base pour les utilisateurs connectés ---
  can('read', 'Group');
  can('join', 'Group');
  can('leave', 'Group');
  
  // Posts
  can('create', 'Post');
  can('read', 'Post');
  can('update', 'Post', { author: user._id });
  can('delete', 'Post', { author: user._id });
  can('like', 'Post');
  cannot('unlike', 'Post', { likes: { $nin: [user._id] } }); // Cannot unlike if not liked

  // Comments
  can('create', 'Comment');
  can('read', 'Comment');
  can('update', 'Comment', { author: user._id });
  can('delete', 'Comment', { author: user._id });

  // --- Permissions par rôle global ---
  switch (user.role) {
    case 'admin':
      can('manage', 'all'); // Admin peut tout faire
      break;
    case 'gestionnaire_groupe':
      can('manage', 'Group'); // Gestionnaire groupe peut tout faire sur les groupes
      // Peut aussi gérer les membres et rôles dans n'importe quel groupe
      can('kick', 'Group'); // Action spécifique pour expulser
      can('changeRole', 'Group'); // Action spécifique pour changer rôle
      break;
    case 'gestionnaire_events':
      // Permissions pour les événements à ajouter plus tard
      break;
    // Le rôle 'user' par défaut a déjà les permissions de base
  }

  // --- Permissions spécifiques au groupe (si un groupe est fourni) ---
  if (group && group.roles) {
    const isPiloteLocal = group.roles.some(
      (r) => r.userId.toString() === user._id.toString() && r.role === 'pilote'
    );

    if (isPiloteLocal) {
      can('update', 'Group', { _id: group._id }); // Pilote peut modifier *ce* groupe
      // Pilote peut gérer les membres et rôles dans *son* groupe
      can('kick', 'Group', { _id: group._id }); // Peut expulser dans *ce* groupe
      can('changeRole', 'Group', { _id: group._id }); // Peut changer rôle dans *ce* groupe

      // Peut masquer les commentaires dans les posts de son groupe
      can('hide', 'Comment', { post: { group: group._id } });
    }
  }

  return new Ability(rules);
}

module.exports = { defineAbilityFor };