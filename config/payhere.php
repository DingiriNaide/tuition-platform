<?php

declare(strict_types=1);

return [
    'merchant_id'     => env('PAYHERE_MERCHANT_ID', 'MOCK_MERCHANT'),
    'merchant_secret' => env('PAYHERE_MERCHANT_SECRET', 'MOCK_SECRET'),
    'currency'        => env('PAYHERE_CURRENCY', 'LKR'),
    'sandbox'         => env('PAYHERE_SANDBOX', true),
    'notify_url'      => env('PAYHERE_NOTIFY_URL', ''),
    'return_url'      => env('PAYHERE_RETURN_URL', ''),
    'cancel_url'      => env('PAYHERE_CANCEL_URL', ''),

    // Real PayHere endpoints (for later):
    'checkout_url'      => 'https://sandbox.payhere.lk/pay/checkout',
    'checkout_url_live' => 'https://www.payhere.lk/pay/checkout',
];
