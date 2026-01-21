# Infobip SMS Automation

Node.js application that reads SMS data from a CSV file and sends messages via the Infobip SMS API v3.

## Prerequisites

- Node.js 14+ installed
- Infobip account with API credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your credentials:
```env
INFOBIP_BASE_URL=https://api.infobip.com
INFOBIP_API_KEY=your_api_key_here
```

3. Prepare `messages.csv` with the following format:
```csv
SenderId,MSISDN
InfoSMS,385991234567
InfoSMS,385997654321
```

## Usage

Run the script:
```bash
node index.js
```

Results are saved to `messages_results.csv` with message IDs and delivery status.

## Configuration

- **SenderId**: Found in Infobip Portal
- **MSISDN**: Destination phone number in international format (e.g., 385991234567)
- **API Key**: Generated in Infobip Portal

## Output Format
```csv
SenderId,MSISDN,messageId,description
InfoSMS,385991234567,MSG_1234567890_5678,Message sent to next instance
```

## Troubleshooting

**Invalid phone format**: Ensure MSISDN uses international format without spaces or special characters

**Authentication error**: Verify API key in `.env` matches your Infobip portal credentials

**Rate limit exceeded**: Script includes 100ms delay between requests; upgrade account if sending large volumes

## License

MIT