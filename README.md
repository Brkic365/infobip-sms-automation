# Infobip SMS Automation Assignment

This is a Node.js solution that reads a CSV file, sends SMS messages via the Infobip API (v3), and logs the results back to a file.

## Prerequisites
- Node.js installed
- An Infobip Account (API Key & Base URL)

## Setup
1. Clone the folder.
2. Install dependencies:

```bash
   npm install
```

3. Configure the environment variables:
Create a .env file in the root directory and add your credentials:

```env
INFOBIP_BASE_URL=https://your-base-url.api.infobip.com
INFOBIP_API_KEY=your_api_key
```

4. Prepare the input file:
Update messages.csv with the correct SenderId and your destination phone number.

5. Run the application:

```bash
node index.js
```

## Note on Message IDs:

During testing on the Free Trial account using the shared sender (ServiceSMS / 447491163443), the Infobip platform overrides the custom messageId provided in the request with an internal tracking ID.

The script handles this by validating the Status Description (e.g., "Pending" or "Message sent") instead of requiring a strict ID match. The output CSV preserves the generated messageId as per the assignment instructions.