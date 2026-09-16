import 'dotenv/config';
import { applyUIFieldCorrection } from '../agent.js';

console.log('🧪 Running UI Inline Field Correction Unit Tests (Suite 14)...\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ Test ${totalTests}: ${testName}`);
  } else {
    console.error(`  ❌ Test ${totalTests} FAILED: ${testName}`, detail ?? '');
    process.exit(1);
  }
}

// ============================================================================
// SUITE 14: UI Inline Field Correction (Simplified unified name)
// ============================================================================

async function runTests() {
  // Test 1: Complex 4-part name: "David L. Patten Jr."
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'fullName', value: 'David L. Patten Jr.' }, profile);
    assert(profile.contact_name === 'David L. Patten Jr.', 'Assembles complete full name');
    assert(profile.borrower_name === 'David L. Patten Jr.', 'Synchronizes borrower_name');
    assert(profile.legal_name === 'David L. Patten Jr.', 'Synchronizes legal_name');
    assert(profile.contact_name_confirmed === true, 'Sets contact_name_confirmed flag');
  }

  // Test 2: Compound surname
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'fullName', value: 'Maria de la Cruz' }, profile);
    assert(profile.contact_name === 'Maria de la Cruz', 'Assembles full name with compound surname');
  }

  // Test 3: Single name
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'fullName', value: 'Cher' }, profile);
    assert(profile.contact_name === 'Cher', 'Full name is "Cher" without duplicate suffix');
  }

  // Test 4: Whitespace ignoring
  {
    const profile: any = { contact_name: 'Existing Name' };
    await applyUIFieldCorrection({ field: 'fullName', value: '   ' }, profile);
    assert(profile.contact_name === 'Existing Name', 'Whitespace input does not overwrite existing profile name');
  }

  // Test 5: Alias field="name"
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'name', value: 'Alice Wonderland' }, profile);
    assert(profile.contact_name === 'Alice Wonderland', 'Alias field="name" correctly updates profile');
  }

  // Test 6: firstName only (replaces first token)
  {
    const profile: any = { contact_name: 'David Patten' };
    await applyUIFieldCorrection({ field: 'firstName', value: 'Dave' }, profile);
    assert(profile.contact_name === 'Dave Patten', 'Updates first token of contact_name');
    assert(profile.contact_name_confirmed === true, 'Confirms name');
  }

  // Test 7: lastName only (replaces last token)
  {
    const profile: any = { contact_name: 'Dave Patten' };
    await applyUIFieldCorrection({ field: 'lastName', value: 'Patton' }, profile);
    assert(profile.contact_name === 'Dave Patton', 'Updates last token of contact_name');
  }

  // Test 8: lastName only (adds to single name)
  {
    const profile: any = { contact_name: 'Cher' };
    await applyUIFieldCorrection({ field: 'lastName', value: 'Sarkisian' }, profile);
    assert(profile.contact_name === 'Cher Sarkisian', 'Appends last name to single name');
  }

  // Test 9: email
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'email', value: '  David.Patten@Gmail.COM  ' }, profile);
    assert(profile.contact_email === 'david.patten@gmail.com', 'Cleans, trims and lowercases email');
    assert(profile.contact_email_confirmed === true, 'Marks contact_email_confirmed');
  }

  // Test 10: mobile
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'mobile', value: '+1 (555) 234-5678 ' }, profile);
    assert(profile.contact_mobile === '15552345678', 'Strips all non-numeric formatting from mobile');
    assert(profile.contact_mobile_confirmed === true, 'Marks contact_mobile_confirmed');
  }

  // Test 11: ALL CAPS normalization
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'fullName', value: 'DAVID PATTEN' }, profile);
    assert(profile.contact_name === 'David Patten', 'Normalizes all caps full name');
  }
  
  // Test 12: ALL CAPS first name normalization
  {
    const profile: any = { contact_name: 'David Patten' };
    await applyUIFieldCorrection({ field: 'firstName', value: 'DAVE' }, profile);
    assert(profile.contact_name === 'Dave Patten', 'Normalizes all caps first name update');
  }

  console.log(`\n======================================================`);
  console.log(`✨ ALL ${passedTests} UI FIELD CORRECTION TESTS PASSED (0 FAILED)!`);
  console.log(`======================================================\n`);
}

runTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
