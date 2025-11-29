# EmailJS Setup Instructions for OTP Verification

## Step 1: Configure EmailJS Template

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Email Templates** → Select your template (`template_38yu1rk`)
3. In the template editor, find the **"To Email"** field
4. Set it to use a template variable: `{{to_email}}` or `{{user_email}}` or `{{email}}`
5. Save the template

## Step 2: Verify Template Variables

Make sure your template includes these variables:
- `{{to_email}}` or `{{user_email}}` - Recipient email address (REQUIRED)
- `{{user_name}}` - User's name
- `{{otp_code}}` - 6-digit OTP code
- `{{expiry_minutes}}` - OTP expiry time in minutes

## Step 3: Test the Configuration

The code automatically sends all common parameter names:
- `to_email`
- `user_email`
- `email`
- `reply_to`

Use whichever parameter name you configured in your EmailJS template's "To Email" field.

## Common Issues

### "The recipients address is empty"
- **Solution**: Make sure the "To Email" field in your EmailJS template uses `{{to_email}}` or `{{user_email}}` or `{{email}}`
- The parameter name in the template must match one of the parameters we're sending

### Email not received
- Check EmailJS dashboard → Logs to see if email was sent
- Verify your email service (Gmail, Outlook, etc.) is properly configured
- Check spam folder

## Current Configuration

- **Service ID**: `service_vkf7xvp`
- **Template ID**: `template_38yu1rk`
- **User ID**: `mR0yvpHHY7lPhkQ9o`

