# Vexa Documentation

## SendPulse API Integration

The beta signup form integrates with SendPulse to collect and manage applicant information. Follow these steps to set up the integration:

1. Create a SendPulse account at [sendpulse.com](https://sendpulse.com) if you don't have one
2. Get your API credentials:
   - Go to your SendPulse account settings
   - Navigate to the API tab
   - Note your User ID and Secret key
3. Create a mailing list in SendPulse to store the beta applicants
   - Create custom variables that match the form fields (company, company_business, company_size, etc.)
   - Note the mailing list ID
4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set the following variables:
     ```
     SENDPULSE_USER_ID=your_sendpulse_user_id
     SENDPULSE_SECRET=your_sendpulse_secret
     SENDPULSE_MAILING_LIST_ID=your_mailing_list_id
     ```

## Development

Install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The following environment variables are used in the project:

| Variable | Description |
|----------|-------------|
| `SENDPULSE_USER_ID` | Your SendPulse API User ID |
| `SENDPULSE_SECRET` | Your SendPulse API Secret |
| `SENDPULSE_MAILING_LIST_ID` | The ID of your SendPulse mailing list for beta applicants |
| `NEXT_PUBLIC_SITE_URL` | The URL of your site (used for SEO) |

## API Routes

### Beta Signup

Endpoint: `/api/beta-signup`

Method: `POST`

Adds a new beta program applicant to your SendPulse mailing list. The form data is stored as contact variables in SendPulse.

Example request:

```json
{
  "email": "applicant@example.com",
  "company": "Example Corp",
  "companyBusiness": "We create AI solutions for healthcare",
  "companySize": "11-50",
  "linkedIn": "linkedin.com/in/example",
  "twitter": "@example",
  "mainPlatform": "zoom",
  "useCase": "We plan to integrate with our telemedicine platform"
}
```

Example response:

```json
{
  "success": true
}
``` 