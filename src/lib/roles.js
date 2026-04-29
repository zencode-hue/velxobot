/**
 * Check if the interaction member has a specific role
 */
export function hasRole(interaction, roleId) {
  if (!roleId) return false;
  return interaction.member?.roles?.cache?.has(roleId) ?? false;
}
