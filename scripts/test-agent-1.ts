/**
 * Test Script for Agent 1: Conversation Extractor & Validator
 * 
 * Run with: npx tsx scripts/test-agent-1.ts
 */

import { conversationExtractorAgent } from '../lib/agents/conversation-extractor-agent';

async function runTests() {
  console.log('🧪 Testing Agent 1: Conversation Extractor & Validator\n');

  // Test Case 1: High confidence Darija (should auto-promote)
  console.log('Test 1: High confidence Darija');
  console.log('Input: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط"');
  const result1 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط. المشكل هو الأهل كيعانيو من توصيل ولادهم كل يوم",
    speaker_phone: "+212612345678",
    speaker_email: "test@example.com",
    speaker_context: "Workshop participant"
  });
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.log('✅ Expected: success=true, needsValidation=false, ideaId present\n');

  // Test Case 2: Low confidence (needs clarification)
  console.log('Test 2: Low confidence (needs clarification)');
  console.log('Input: "شي حاجة للتعليم"');
  const result2 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "شي حاجة للتعليم",
    speaker_phone: "+212612345678"
  });
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.log('✅ Expected: success=true, needsValidation=true, validationQuestion in Darija\n');

  // Test Case 3: French input
  console.log('Test 3: French input');
  console.log('Input: "Je pense qu\'on devrait créer une application pour les étudiants"');
  const result3 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "Je pense qu'on devrait créer une application pour les étudiants de Casablanca",
    speaker_phone: "+212612345678"
  });
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.log('✅ Expected: success=true, category extracted, location=casablanca\n');

  // Test Case 4: Tamazight input
  console.log('Test 4: Tamazight input');
  console.log('Input: "Adggar d uranday? Ssawal amaynu"');
  const result4 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "Adggar d uranday? Ssawal amaynu. Bghiti ad nerr aferyigh bach n3awn iselmaden",
    speaker_phone: "+212612345678"
  });
  console.log('Result:', JSON.stringify(result4, null, 2));
  console.log('✅ Expected: success=true, fields in Latin script\n');

  // Test Case 5: No idea (should return success=false)
  console.log('Test 5: No valid idea');
  console.log('Input: "مرحبا كيف الحال"');
  const result5 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "مرحبا كيف الحال",
    speaker_phone: "+212612345678"
  });
  console.log('Result:', JSON.stringify(result5, null, 2));
  console.log('✅ Expected: success=false (not an idea)\n');

  console.log('✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);

