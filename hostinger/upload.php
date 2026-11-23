<?php
/**
 * Petrosphere CMS media uploader — deploy to Hostinger public_html.
 *
 * Suggested path: public_html/_cms/upload.php
 * Public URLs:    https://YOUR-DOMAIN/news/...  and  .../videos/...
 * (Uses existing public_html/news and public_html/videos folders.)
 *
 * Set $UPLOAD_SECRET below (must match HOSTINGER_UPLOAD_SECRET in Vercel).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$UPLOAD_SECRET = '@Petrospherelangsakalam2026!';

$allowedFolders = ['news', 'videos'];
$allowedImageTypes = [
    'image/png' => 'png',
    'image/jpeg' => 'jpg',
    'image/jpg' => 'jpg',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/svg+xml' => 'svg',
];
$allowedVideoTypes = [
    'video/mp4' => 'mp4',
    'video/webm' => 'webm',
    'video/quicktime' => 'mov',
];

function respond(int $code, array $payload): void {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

$secret = $_SERVER['HTTP_X_UPLOAD_SECRET'] ?? '';
if (!hash_equals($UPLOAD_SECRET, $secret)) {
    respond(401, ['ok' => false, 'error' => 'Unauthorized']);
}

$folder = $_POST['folder'] ?? '';
if (!in_array($folder, $allowedFolders, true)) {
    respond(400, ['ok' => false, 'error' => 'Invalid folder']);
}

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    respond(400, ['ok' => false, 'error' => 'Missing file']);
}

$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    respond(400, ['ok' => false, 'error' => 'Upload error']);
}

$mime = mime_content_type($file['tmp_name']) ?: ($file['type'] ?? '');
$allowed = $folder === 'news' ? $allowedImageTypes : $allowedVideoTypes;
if (!isset($allowed[$mime])) {
    respond(415, ['ok' => false, 'error' => 'Unsupported file type: ' . $mime]);
}

$maxBytes = $folder === 'news' ? 6 * 1024 * 1024 : 50 * 1024 * 1024;
if (($file['size'] ?? 0) > $maxBytes) {
    respond(413, ['ok' => false, 'error' => 'File too large']);
}

$requestedName = basename((string)($_POST['filename'] ?? ''));
$ext = $allowed[$mime];
if (!preg_match('/^[a-z0-9-]+\.[a-z0-9]+$/i', $requestedName)) {
    $requestedName = $folder . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
}

$docRoot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
$targetDir = $docRoot . '/' . $folder;
if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
    respond(500, ['ok' => false, 'error' => 'Could not create upload directory']);
}

$targetPath = $targetDir . '/' . $requestedName;
if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    respond(500, ['ok' => false, 'error' => 'Could not save file']);
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$publicUrl = $scheme . '://' . $host . '/' . $folder . '/' . $requestedName;

respond(200, ['ok' => true, 'url' => $publicUrl]);
