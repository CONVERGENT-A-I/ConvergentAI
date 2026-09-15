export function applyContactUpdates(profile: any, updates: any): void {
  // Extract explicit partials if provided in updates
  let explicitFirst = updates.contact_first_name ? String(updates.contact_first_name).trim() : null;
  let explicitMiddle = updates.contact_middle_name ? String(updates.contact_middle_name).trim() : null;
  let explicitLast = updates.contact_last_name ? String(updates.contact_last_name).trim() : null;
  let explicitSuffix = updates.contact_suffix ? String(updates.contact_suffix).trim() : null;

  // Route generic alias 'fullName' to explicitFirst so it flows through the normalization and deduplication engines
  if (!explicitFirst && !explicitLast && (updates.name || updates.fullName)) {
    explicitFirst = String(updates.name || updates.fullName).trim();
    explicitMiddle = null;
    explicitSuffix = null;
  }

  // Deduplicate adjacent repeated tokens (e.g. STT artifact "David Patten PATTEN" -> "David Patten")
  function deduplicateTokens(str: string | null): string | null {
    if (!str) return str;
    const tokens = str.split(/\s+/);
    const result: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const currentToken = tokens[i];
      if (!currentToken) continue;

      if (result.length > 0) {
        const lastToken = result[result.length - 1];
        if (lastToken && lastToken.toLowerCase() === currentToken.toLowerCase()) {
          continue;
        }
      }
      result.push(currentToken);
    }
    return result.join(' ');
  }

  explicitFirst = deduplicateTokens(explicitFirst);
  explicitMiddle = deduplicateTokens(explicitMiddle);
  explicitLast = deduplicateTokens(explicitLast);
  explicitSuffix = deduplicateTokens(explicitSuffix);

  // Normalize ALL CAPS extractions from STT spelling
  function normalizeCase(str: string): string {
    if (!str) return str;
    if (str === str.toUpperCase() && str.length > 1) {
      return str.split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
    return str;
  }
  
  explicitFirst = normalizeCase(explicitFirst as string);
  explicitMiddle = normalizeCase(explicitMiddle as string);
  explicitLast = normalizeCase(explicitLast as string);


  // If first name has spaces and no explicit last name was given, split it
  if (explicitFirst && !explicitLast && explicitFirst.includes(' ')) {
    const parts = explicitFirst.split(/\s+/);
    explicitFirst = parts[0] || null;
    explicitLast = parts.slice(1).join(' ');
  }

  // Determine the new base pieces, falling back to existing profile values if not explicitly updated
  const first = explicitFirst !== null ? explicitFirst : (profile.contact_first_name || '');
  const middle = explicitMiddle !== null ? explicitMiddle : (profile.contact_middle_name || '');
  const last = explicitLast !== null ? explicitLast : (profile.contact_last_name || '');
  const suffix = explicitSuffix !== null ? explicitSuffix : (profile.contact_suffix || '');

  // Apply to profile (snake_case)
  if (explicitFirst !== null) {
    profile.contact_first_name = first;
    profile.contact_first_name_confirmed = true;
    
    // If we only have a single name (like "Cher"), it acts as both first and last, 
    // but the full name logic should not duplicate it.
    if (!last && explicitLast === null) {
      profile.contact_last_name = first;
      profile.contact_last_name_confirmed = true;
    }
  }
  if (explicitMiddle !== null) {
    profile.contact_middle_name = middle;
  }
  if (explicitLast !== null) {
    profile.contact_last_name = last || first;
    profile.contact_last_name_confirmed = true;
  }
  if (explicitSuffix !== null) {
    profile.contact_suffix = suffix;
  }

  // Recompute full name
  // To avoid "Cher Cher", we only include last if it's different from first
  const currentFirst = profile.contact_first_name || '';
  const currentMiddle = profile.contact_middle_name || '';
  const currentLast = profile.contact_last_name || '';
  const currentSuffix = profile.contact_suffix || '';

  const nameParts = [currentFirst, currentMiddle];
  if (currentLast && currentLast.toLowerCase() !== currentFirst.toLowerCase()) {
    nameParts.push(currentLast);
  }
  if (currentSuffix) {
    nameParts.push(currentSuffix);
  }

  const fullName = nameParts.filter(Boolean).join(' ') || currentFirst;
  
  if (fullName) {
    profile.contact_name = fullName;
    profile.borrower_name = fullName;
    profile.legal_name = fullName;
    profile.contact_name_confirmed = true;
  }

  // Ensure camelCase aliases for the UI are always perfectly synchronized
  profile.contactFirstName = profile.contact_first_name || '';
  profile.contactLastName = profile.contact_last_name || '';

  // Synchronize email and mobile if provided
  if (updates.contact_email !== undefined && updates.contact_email !== null) {
    const email = String(updates.contact_email).toLowerCase().trim();
    if (email) {
      profile.contact_email = email;
      profile.contact_email_confirmed = true;
    }
  }
  
  if (updates.contact_mobile !== undefined && updates.contact_mobile !== null) {
    const mobile = String(updates.contact_mobile).replace(/\D/g, '');
    if (mobile) {
      profile.contact_mobile = mobile;
      profile.contact_mobile_confirmed = true;
    }
  }
}
