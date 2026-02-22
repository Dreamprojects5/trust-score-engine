#!/usr/bin/env node

/**
 * Test script for the Crusoe Underwriting API
 * Usage: node test-underwriting.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

async function testUnderwritingAPI() {
  try {
    console.log('🚀 Testing Underwriting API Endpoint...\n');

    const payload = {
      github_username: 'octocat',
      stackoverflow_id: '1',
      solana_address: 'EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf',
      collateral_asset: 'BTC'
    };

    console.log('📤 Sending request to /api/v1/underwriting');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('\n⏳ Waiting for response...\n');

    const response = await axios.post(`${API_BASE_URL}/api/v1/underwriting`, payload, {
      timeout: 60000
    });

    console.log('✅ Response received!\n');
    console.log(JSON.stringify(response.data, null, 2));

    // Parse the trust score
    if (response.data.data?.underwriting?.calculated_trust_score) {
      console.log(`\n🎯 Trust Score: ${response.data.data.underwriting.calculated_trust_score}`);
      console.log(`📊 Trust Tier: ${response.data.data.underwriting.underwriting_decision?.trust_tier}`);
      console.log(`💰 Required Collateral: ${response.data.data.underwriting.underwriting_decision?.required_collateral_percentage}%`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testUnderwritingAPI();
