require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const BASE_URL = process.env.INFOBIP_BASE_URL;
const API_KEY = process.env.INFOBIP_API_KEY;

const INPUT_FILE = 'messages.csv';
const OUTPUT_FILE = 'messages_updated.csv';

const generateMessageId = () => {
    return Math.floor(Math.random() * 1000000000).toString();
};

const main = async () => {
    console.log("Starting Infobip SMS Sender...");

    const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const rows = fileContent.trim().split('\n');
    const header = rows.shift();

    const updatedRows = [];
    updatedRows.push(header);

    for (const row of rows) {
        const columns = row.split(',').map(col => col.trim());
        
        if (columns.length < 2) continue;

        const senderId = columns[0];
        const phone = columns[1];
        
        const myMessageId = generateMessageId();
        
        console.log(`\nSending message to ${phone} from ${senderId}...`);

        try {
            const response = await axios.post(
                `${BASE_URL}/sms/3/messages`,
                {
                    messages: [
                        {
                            sender: senderId,
                            destinations: [{ to: phone }],
                            content: { text: `Your code is ${myMessageId}. Good luck!` },
                            messageId: myMessageId 
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `App ${API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            const responseData = response.data.messages[0];
            const returnedMessageId = responseData.messageId;
            const statusDescription = responseData.status.description;

            const isSuccess = responseData.status.groupName === "PENDING" || 
                              responseData.status.groupName === "ACCEPTED" ||
                              statusDescription.startsWith("Message sent");

            if (isSuccess) {
                console.log(`Success! Status: ${statusDescription}`);
                
                updatedRows.push(`${senderId},${phone},${myMessageId},${statusDescription}`);
            } else {
                console.warn(`ID Mismatch! Sent: ${myMessageId}, Received: ${returnedMessageId}`);
                updatedRows.push(`${senderId},${phone},${myMessageId},ID Mismatch Error`);
            }

        } catch (error) {
            console.error(`Error sending to ${phone}:`, error.response ? error.response.data : error.message);
            updatedRows.push(`${senderId},${phone},${myMessageId},API Error`);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, updatedRows.join('\n'));
    console.log(`\nDone! Results saved to ${OUTPUT_FILE}`);
};

main();