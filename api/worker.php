<?php

/**
 * Vercel Cron Job entrypoint for Laravel Queue Worker
 */

require __DIR__ . '/../vendor/autoload.php';

// Security check: Only allow Vercel Cron or specific token
$isCron = isset($_SERVER['HTTP_X_VERCEL_CRON']) && $_SERVER['HTTP_X_VERCEL_CRON'] === '1';
$isAuthorized = isset($_GET['token']) && $_GET['token'] === env('APP_KEY'); // Fallback manual trigger

if (!$isCron && !$isAuthorized) {
    http_response_code(403);
    exit('Forbidden');
}

$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Process the queue and stop when it's empty.
// Vercel serverless functions have a timeout (usually 10s for Hobby, 60s for Pro),
// so we shouldn't run a continuous daemon.
$status = $kernel->call('queue:work', [
    '--stop-when-empty' => true,
    '--max-time' => 50, // stop after 50 seconds to avoid function timeout
]);

echo "Worker executed. Status: " . $status;
