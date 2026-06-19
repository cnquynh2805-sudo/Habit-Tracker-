const axios = require('axios');
require('dotenv').config();

// Replace with your Xano Base URL (found in Xano API Group settings)
const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:YOUR_API_GROUP';

async function runTests() {
  console.log(`Testing Xano API connection at: ${XANO_BASE_URL}`);

  try {
    // 1. Test basic GET request to /habits (assumes endpoint is created in Xano)
    console.log('\n--- 1. Testing GET /habits ---');
    const getResponse = await axios.get(`${XANO_BASE_URL}/habits`);
    console.log('✅ Success! Connection to Xano established.');
    console.log('Status:', getResponse.status);
    console.log('Data:', getResponse.data);

    // If the database has data, let's print the first item
    if (Array.isArray(getResponse.data) && getResponse.data.length > 0) {
      console.log('First habit:', getResponse.data[0]);
    } else if (getResponse.data.data && getResponse.data.data.length > 0) {
      // Handles paginated response format from our openapi.yaml
      console.log('First habit:', getResponse.data.data[0]);
    } else {
      console.log('Database is connected but currently empty.');
    }

  } catch (error) {
    console.error('❌ API Test Failed.');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Xano returned status:', error.response.status);
      console.error('Error payload:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Xano. Check your XANO_BASE_URL setting.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    console.log('\nMake sure you have created the API endpoints in Xano that match your openapi.yaml specification.');
  }
}

// Run the test
runTests();
