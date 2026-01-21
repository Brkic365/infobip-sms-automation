require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const Papa = require('papaparse');

const BASE_URL = process.env.INFOBIP_BASE_URL;
const API_KEY = process.env.INFOBIP_API_KEY;
const INPUT_FILE = 'messages.csv';
const OUTPUT_FILE = 'messages_results.csv';

const generateMessageId = () => {
  return `MSG_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

const validatePhone = (phone) => {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''));
};

const sendSMS = async (senderId, phone, messageId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/sms/3/messages`,
      {
        messages: [{
          sender: senderId,
          destinations: [{ to: phone }],
          content: { text: `Message sent!` },
          messageId: messageId
        }]
      },
      {
        headers: {
          'Authorization': `App ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const msg = response.data.messages[0];
    return {
      success: true,
      messageId: messageId,
      apiMessageId: msg.messageId,
      description: msg.status.description,
      statusGroup: msg.status.groupName
    };

  } catch (error) {
    return {
      success: false,
      messageId: messageId,
      description: error.response?.data?.requestError?.serviceException?.text || 'Network error'
    };
  }
};

const main = async () => {
  console.log('Starting Infobip SMS Bulk Sender\n');

  const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
  const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
  
  const results = [];

  for (const row of parsed.data) {
    const senderId = row.SenderId?.trim();
    const phone = row.MSISDN?.trim();

    if (!senderId || !phone) {
      console.log('Skipping row - missing data');
      continue;
    }

    if (!validatePhone(phone)) {
      console.log(`Invalid phone format: ${phone}`);
      results.push({ ...row, messageId: 'N/A', description: 'Invalid phone format' });
      continue;
    }

    const messageId = generateMessageId();
    console.log(`Sending message to ${phone}...`);

    const result = await sendSMS(senderId, phone, messageId);

    results.push({
      SenderId: senderId,
      MSISDN: phone,
      messageId: result.messageId,
      description: result.description,
      success: result.success
    });

    if (result.success) {
      console.log(`Success: ${result.description}`);
    } else {
      console.log(`Error: ${result.description}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const csvData = results.map(({ success, ...row }) => row);
  const csv = Papa.unparse(csvData);
  fs.writeFileSync(OUTPUT_FILE, csv);
  
  const successCount = results.filter(r => r.success).length;
  
  console.log(`\nProcess completed. Results saved to ${OUTPUT_FILE}`);
  console.log(`Total messages processed: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${results.length - successCount}`);
};

main().catch(console.error);