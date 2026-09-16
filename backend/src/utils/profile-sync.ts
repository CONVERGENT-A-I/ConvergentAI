export function applyContactUpdates(profile: any, updates: any): void {
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

  // Normalize ALL CAPS extractions from STT spelling
  function normalizeCase(str: string): string {
    if (!str) return str;
    if (str === str.toUpperCase() && str.length > 1) {
      return str.split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
    return str;
  }

  let newContactName = profile.contact_name || '';

  if (updates.name || updates.fullName) {
    let fullName = String(updates.name || updates.fullName).trim();
    fullName = deduplicateTokens(fullName) || '';
    fullName = normalizeCase(fullName);
    if (fullName) {
      newContactName = fullName;
    }
  } else if (updates.firstName || updates.lastName) {
    let currentParts = newContactName.split(/\s+/).filter(Boolean);
    
    if (updates.firstName) {
      let first = deduplicateTokens(String(updates.firstName).trim()) || '';
      first = normalizeCase(first);
      if (first) {
        if (currentParts.length > 0) {
          currentParts[0] = first;
        } else {
          currentParts = [first];
        }
      }
    }
    
    if (updates.lastName) {
      let last = deduplicateTokens(String(updates.lastName).trim()) || '';
      last = normalizeCase(last);
      if (last) {
        if (currentParts.length > 1) {
          currentParts[currentParts.length - 1] = last;
        } else if (currentParts.length === 1 && currentParts[0].toLowerCase() !== last.toLowerCase()) {
          currentParts.push(last);
        } else if (currentParts.length === 0) {
          currentParts = [last];
        }
      }
    }
    newContactName = currentParts.join(' ');
  }

  if (newContactName) {
    profile.contact_name = newContactName;
    profile.borrower_name = newContactName;
    profile.legal_name = newContactName;
    profile.contact_name_confirmed = true;
  }

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
