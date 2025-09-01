<x-mail::message>
# @if($type === 'email_verification') Email Verification @else Password Reset @endif

@if($userName)
Hello {{ $userName }},
@else
Hello,
@endif

@if($type === 'email_verification')
Thank you for registering with MarketSpaze! To complete your account setup, please use the verification code below:
@else
You have requested to reset your password. Please use the code below to proceed:
@endif

<x-mail::panel>
## Your verification code is:

<div style="font-size: 32px; font-weight: bold; color: #f97316; text-align: center; letter-spacing: 8px; margin: 20px 0;">
{{ $code }}
</div>
</x-mail::panel>

**Important:** This code will expire in 10 minutes for security reasons.

@if($type === 'email_verification')
Once verified, you'll have full access to all MarketSpaze features.
@else
If you didn't request a password reset, please ignore this email.
@endif

Thanks,<br>
{{ config('app.name') }} Team

---

<small style="color: #6b7280;">
For security reasons, please do not share this code with anyone. If you didn't request this verification, please contact our support team.
</small>
</x-mail::message>
