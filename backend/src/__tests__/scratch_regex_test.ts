interface TestCase {
  utterance: string;
  expectedSubmit: boolean;
  expectedQuestion: boolean;
  expectedFastPath: boolean;
  description: string;
}

const testCases: TestCase[] = [
  // ── Positive Verbal Submit Cases (Should trigger fast-path) ──
  {
    utterance: "I think it looks as good as I would like it to be. I mean, it's the price range I'm looking for. It's using the money that I have available and uh, it has my income. So go ahead and submit it.",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "Complex turn 40 approval with 'looks as good... So go ahead and submit it.'"
  },
  {
    utterance: "go ahead and submit",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "Direct 'go ahead and submit'"
  },
  {
    utterance: "looks good to me, submit",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "Affirmation + submit ('looks good to me, submit')"
  },
  {
    utterance: "sounds good",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "Direct affirmative 'sounds good'"
  },
  {
    utterance: "let's go ahead",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "Direct affirmative 'let\\'s go ahead'"
  },
  {
    utterance: "I am ready to submit",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "'I am ready to submit'"
  },
  {
    utterance: "yes please submit it for me",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "'yes please submit it for me'"
  },
  {
    utterance: "proceed with review",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "'proceed with review'"
  },
  {
    utterance: "please submit",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "'please submit'"
  },
  {
    utterance: "looks good let's go ahead and submit",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "'looks good let\\'s go ahead and submit'"
  },
  {
    utterance: "can you submit this for me now",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "'can you submit this for me now'"
  },
  {
    utterance: "send my scenario",
    expectedSubmit: true,
    expectedQuestion: false,
    expectedFastPath: true,
    description: "'send my scenario'"
  },

  // ── Negative Cases / Questions / Conditionals (Should NOT trigger fast-path) ──
  {
    utterance: "what if I submit?",
    expectedSubmit: true,
    expectedQuestion: true,
    expectedFastPath: false,
    description: "Conditional question with submit keyword: 'what if I submit?'"
  },
  {
    utterance: "after we submit what happens?",
    expectedSubmit: true,
    expectedQuestion: true,
    expectedFastPath: false,
    description: "Post-submission process question: 'after we submit what happens?'"
  },
  {
    utterance: "will that affect my credit?",
    expectedSubmit: false,
    expectedQuestion: true,
    expectedFastPath: false,
    description: "Credit inquiry question: 'will that affect my credit?'"
  },
  {
    utterance: "how does it work?",
    expectedSubmit: false,
    expectedQuestion: true,
    expectedFastPath: false,
    description: "Mechanism question: 'how does it work?'"
  },
  {
    utterance: "before I submit can you explain the closing costs?",
    expectedSubmit: true,
    expectedQuestion: true,
    expectedFastPath: false,
    description: "Pre-submission question: 'before I submit can you explain...'"
  }
];

const verbalSubmitPattern = /\b(?:submit\s*(?:for\s*me|it|review|my\s*review|this|now)?|can\s+you\s+submit|please\s+submit|go\s+ahead\s+(?:and\s+)?submit|run\s+the\s+review|proceed\s+with\s+review|send\s+my\s+scenario|do\s+it\s+for\s+me|send\s+it|yes\s+submit|let'?s\s+submit|go\s+ahead|let'?s\s+go|proceed|ready\s+to\s+submit|i'?m\s+ready|yes\s+please|sounds\s+good|looks\s+good(?:.*?)\bsubmit\b)\b/i;

const isConditionalOrQuestion = /\b(what if|after (?:i|we) submit|if (?:i|we) submit|before (?:i|we) submit|will that affect|what will be the process|how does it work|can you explain|why does|tell me about)\b/i;

console.log("=== Fast-Path Regex & Guardrail Validation Suite ===");
let allPassed = true;
let passCount = 0;
let failCount = 0;

for (const tc of testCases) {
  const isSubmit = verbalSubmitPattern.test(tc.utterance);
  const isQuestion = isConditionalOrQuestion.test(tc.utterance);
  const actualFastPath = isSubmit && !isQuestion;

  const passedSubmit = isSubmit === tc.expectedSubmit;
  const passedQuestion = isQuestion === tc.expectedQuestion;
  const passedFastPath = actualFastPath === tc.expectedFastPath;
  const tcPassed = passedSubmit && passedQuestion && passedFastPath;

  if (tcPassed) {
    passCount++;
    console.log(`[PASS] ${tc.description}`);
    console.log(`       Utterance: "${tc.utterance}"`);
    console.log(`       fastPath: ${actualFastPath} (isSubmit=${isSubmit}, isQuestion=${isQuestion})\n`);
  } else {
    failCount++;
    allPassed = false;
    console.error(`[FAIL] ${tc.description}`);
    console.error(`       Utterance: "${tc.utterance}"`);
    console.error(`       Expected: fastPath=${tc.expectedFastPath} (submit=${tc.expectedSubmit}, question=${tc.expectedQuestion})`);
    console.error(`       Actual:   fastPath=${actualFastPath} (submit=${isSubmit}, question=${isQuestion})\n`);
  }
}

console.log(`Summary: ${passCount} Passed, ${failCount} Failed.`);
console.log(`Overall Regex Test Status: ${allPassed ? "PASS" : "FAIL"}`);

