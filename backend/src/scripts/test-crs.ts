import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { callCrsSoftPull, SANDBOX_IDENTITIES } from '../services/crs-service.js';

async function runTestForIdentity(key: 'WILLIE' | 'BARBARA') {
  const identity = SANDBOX_IDENTITIES[key];
  const addr = identity.addresses[0]!;

  console.log(`\n==================================================`);
  console.log(`TESTING IDENTITY: ${identity.firstName} ${identity.middleName} ${identity.lastName}`);
  console.log(`SSN: ${identity.ssn} | DOB: ${identity.birthDate}`);
  console.log(`Address: ${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.postalCode}`);
  console.log(`==================================================`);

  const startTime = Date.now();
  const result = await callCrsSoftPull({}, key);
  const duration = Date.now() - startTime;

  if (result) {
    console.log(`✅ SUCCESS! (took ${duration}ms)`);
    console.log('Parsed CRS Result:');
    console.log(`- Credit Score: ${result.creditScore} (${result.creditScoreModel})`);
    console.log(`- Credit Range: ${result.creditRangeLabel} (${result.creditRange})`);
    console.log(`- Open Accounts: ${result.openAccounts}`);
    console.log(`- Late Payments (24m): ${result.latePaymentsLast24Mo}`);
    console.log(`- Employer on record: ${result.employer ?? 'None listed'}`);
  } else {
    console.error(`❌ FAILED! (took ${duration}ms)`);
    console.error('CRS API call returned null for this identity.');
  }
}

async function runAllTests() {
  console.log('=== CRS API MULTI-IDENTITY TEST ===');
  console.log(`CRS_BASE_URL: ${process.env.CRS_BASE_URL}`);
  console.log(`CRS_CLIENT_ID: ${process.env.CRS_CLIENT_ID ? (process.env.CRS_CLIENT_ID.includes('your_') ? process.env.CRS_CLIENT_ID : '*****' + process.env.CRS_CLIENT_ID.slice(-4)) : 'NOT SET'}`);
  console.log('-----------------------------------');

  if (!process.env.CRS_CLIENT_ID || process.env.CRS_CLIENT_ID === 'your_sandbox_client_id') {
    console.error('\n❌ ERROR: Please set real CRS_CLIENT_ID and CRS_CLIENT_SECRET in backend/.env before running this test.');
    process.exit(1);
  }

  await runTestForIdentity('WILLIE');
  await runTestForIdentity('BARBARA');
  console.log('\n=== ALL TESTS COMPLETE ===\n');
}

runAllTests();
