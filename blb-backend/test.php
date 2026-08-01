<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$missions = App\Models\Mission::all();
foreach($missions as $m) {
    echo $m->id . ' - ' . $m->expires_at . PHP_EOL;
}
