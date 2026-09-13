import 'dotenv/config';
import { applyUIFieldCorrection } from '../agent.js';
import type { FieldToExtract } from '../context/llm-extractor.js';

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
// SUITE 14: UI Inline Field Correction & Complex Name Parsing
// ============================================================================

async function runTests() {
  // Test 1: Complex 4-part name: "David L. Patten Jr."
  {
    const profile: any = {};
    const mockExtractor = async (input: string, _utterance: any, _fields: FieldToExtract[]) => {
      return {
        contact_first_name: { value: 'David' },
        contact_middle_name: { value: 'L.' },
        contact_last_name: { value: 'Patten' },
        contact_suffix: { value: 'Jr.' },
      };
    };

    await applyUIFieldCorrection({ field: 'fullName', value: 'David L. Patten Jr.' }, profile, mockExtractor as any);

    assert(profile.contact_first_name === 'David', 'Extracts first name "David"');
    assert(profile.contact_middle_name === 'L.', 'Extracts middle name "L."');
    assert(profile.contact_last_name === 'Patten', 'Extracts last name "Patten"');
    assert(profile.contact_suffix === 'Jr.', 'Extracts suffix "Jr."');
    assert(profile.contact_name === 'David L. Patten Jr.', 'Assembles complete full name');
    assert(profile.borrower_name === 'David L. Patten Jr.', 'Synchronizes borrower_name');
    assert(profile.legal_name === 'David L. Patten Jr.', 'Synchronizes legal_name');
    assert(profile.contact_name_confirmed === true, 'Sets contact_name_confirmed flag');
    assert(profile.contact_first_name_confirmed === true, 'Sets contact_first_name_confirmed flag');
    assert(profile.contact_last_name_confirmed === true, 'Sets contact_last_name_confirmed flag');
  }

  // Test 2: Multi-word last name: "Maria de la Cruz"
  {
    const profile: any = {};
    const mockExtractor = async () => ({
      contact_first_name: { value: 'Maria' },
      contact_middle_name: { value: null },
      contact_last_name: { value: 'de la Cruz' },
      contact_suffix: { value: null },
    });

    await applyUIFieldCorrection({ field: 'fullName', value: 'Maria de la Cruz' }, profile, mockExtractor as any);

    assert(profile.contact_first_name === 'Maria', 'Extracts first name "Maria"');
    assert(profile.contact_last_name === 'de la Cruz', 'Extracts compound surname "de la Cruz"');
    assert(profile.contact_name === 'Maria de la Cruz', 'Assembles full name with compound surname');
  }

  // Test 3: Mononym / Single-word name: "Cher"
  {
    const profile: any = {};
    const mockExtractor = async () => ({
      contact_first_name: { value: 'Cher' },
      contact_middle_name: { value: null },
      contact_last_name: { value: null },
      contact_suffix: { value: null },
    });

    await applyUIFieldCorrection({ field: 'fullName', value: 'Cher' }, profile, mockExtractor as any);

    assert(profile.contact_first_name === 'Cher', 'Handles single name as first name');
    assert(profile.contact_last_name === 'Cher', 'Falls back last name to single name');
    assert(profile.contact_name === 'Cher', 'Full name is "Cher" without duplicate suffix');
  }

  // Test 4: Extractor returns full name string in contact_first_name
  {
    const profile: any = {};
    const mockExtractor = async () => ({
      contact_first_name: { value: 'Johnathan Edward Doe' },
      contact_middle_name: { value: null },
      contact_last_name: { value: null },
      contact_suffix: { value: null },
    });

    await applyUIFieldCorrection({ field: 'fullName', value: 'Johnathan Edward Doe' }, profile, mockExtractor as any);

    assert(profile.contact_first_name === 'Johnathan', 'Splits first name from compound string');
    assert(profile.contact_last_name === 'Edward Doe', 'Assigns remainder to last name');
    assert(profile.contact_name.includes('Johnathan'), 'Full name properly assembled');
  }

  // Test 5: Fallback when extractor returns null / fails to extract
  {
    const profile: any = {};
    const mockExtractor = async () => ({
      contact_first_name: { value: null },
      contact_middle_name: { value: null },
      contact_last_name: { value: null },
      contact_suffix: { value: null },
    });

    await applyUIFieldCorrection({ field: 'fullName', value: 'Jane Elizabeth Smith' }, profile, mockExtractor as any);

    assert(profile.contact_name === 'Jane Elizabeth Smith', 'Fallback preserves full string in contact_name');
    assert(profile.contact_first_name === 'Jane', 'Fallback extracts first token');
    assert(profile.contact_last_name === 'Elizabeth Smith', 'Fallback extracts remaining tokens');
    assert(profile.contact_name_confirmed === true, 'Fallback confirms name');
  }

  // Test 6: Fallback when extractor throws an unexpected network error
  {
    const profile: any = {};
    const mockExtractor = async () => {
      throw new Error('LiveKit Inference Network Timeout');
    };

    await applyUIFieldCorrection({ field: 'fullName', value: 'Robert Frost' }, profile, mockExtractor as any);

    assert(profile.contact_name === 'Robert Frost', 'Network error fallback preserves contact_name');
    assert(profile.contact_first_name === 'Robert', 'Network error fallback extracts first name');
    assert(profile.contact_last_name === 'Frost', 'Network error fallback extracts last name');
  }

  // Test 7: Empty or whitespace-only name
  {
    const profile: any = { contact_name: 'Existing Name' };
    await applyUIFieldCorrection({ field: 'fullName', value: '   ' }, profile);
    assert(profile.contact_name === 'Existing Name', 'Whitespace input does not overwrite existing profile name');
  }

  // Test 8: Field 'name' alias works identically to 'fullName'
  {
    const profile: any = {};
    const mockExtractor = async () => ({
      contact_first_name: { value: 'Alice' },
      contact_middle_name: { value: null },
      contact_last_name: { value: 'Wonderland' },
      contact_suffix: { value: null },
    });

    await applyUIFieldCorrection({ field: 'name', value: 'Alice Wonderland' }, profile, mockExtractor as any);
    assert(profile.contact_name === 'Alice Wonderland', 'Alias field="name" correctly updates profile');
  }

  // Test 9: Independent First Name correction
  {
    const profile: any = {
      contact_first_name: 'David',
      contact_middle_name: 'L.',
      contact_last_name: 'Patten',
      contact_suffix: 'Jr.',
      contact_name: 'David L. Patten Jr.',
    };

    await applyUIFieldCorrection({ field: 'firstName', value: 'Dave' }, profile);

    assert(profile.contact_first_name === 'Dave', 'Updates contact_first_name');
    assert(profile.contactFirstName === 'Dave', 'Updates contactFirstName camelCase alias');
    assert(profile.contact_first_name_confirmed === true, 'Confirms first name');
    assert(profile.contact_name === 'Dave L. Patten Jr.', 'Recomputes full contact_name preserving middle, last, suffix');
  }

  // Test 10: Independent Last Name correction
  {
    const profile: any = {
      contact_first_name: 'Dave',
      contact_middle_name: 'L.',
      contact_last_name: 'Patten',
      contact_suffix: 'Jr.',
      contact_name: 'Dave L. Patten Jr.',
    };

    await applyUIFieldCorrection({ field: 'lastName', value: 'Patton' }, profile);

    assert(profile.contact_last_name === 'Patton', 'Updates contact_last_name');
    assert(profile.contactLastName === 'Patton', 'Updates contactLastName camelCase alias');
    assert(profile.contact_last_name_confirmed === true, 'Confirms last name');
    assert(profile.contact_name === 'Dave L. Patton Jr.', 'Recomputes full contact_name preserving first, middle, suffix');
  }

  // Test 11: Email correction with whitespace and casing
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'email', value: '  David.Patten@Gmail.COM  ' }, profile);

    assert(profile.contact_email === 'david.patten@gmail.com', 'Cleans, trims and lowercases email');
    assert(profile.contact_email_confirmed === true, 'Marks contact_email_confirmed');
  }

  // Test 12: Mobile correction with dashes, spaces, and brackets
  {
    const profile: any = {};
    await applyUIFieldCorrection({ field: 'mobile', value: '+1 (555) 234-5678 ' }, profile);

    assert(profile.contact_mobile === '15552345678', 'Strips all non-numeric formatting from mobile');
    assert(profile.contact_mobile_confirmed === true, 'Marks contact_mobile_confirmed');
  }

  console.log('\n======================================================');
  console.log(`✨ ALL ${totalTests} UI FIELD CORRECTION TESTS PASSED (0 FAILED)!`);
  console.log('======================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Fatal error running UI Field Correction tests:', err);
  process.exit(1);
});
