<?php
/**
 * Relais API same-origin : contourne les problèmes de résolution DNS de
 * api.jmrtextile.com chez certains clients. Le navigateur appelle
 * /api.php/<endpoint> sur le domaine qu'il arrive déjà à ouvrir.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Authorization, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

$target = 'https://api.jmrtextile.com/api';
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
if ($path === '' && isset($_GET['path'])) $path = '/' . ltrim((string)$_GET['path'], '/');
$url = $target . $path;

$query = [];
if (!empty($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $query);
    unset($query['path']);
    if ($query) $url .= '?' . http_build_query($query);
}

$headers = [];
$authHeader = null;
$xauthHeader = null;
if (function_exists('getallheaders')) {
    foreach (getallheaders() as $name => $value) {
        $lower = strtolower($name);
        if ($lower === 'authorization') { $authHeader = $value; continue; }
        if ($lower === 'x-authorization') { $xauthHeader = $value; continue; }
        if (in_array($lower, ['host', 'connection', 'content-length', 'accept-encoding'], true)) continue;
        $headers[] = $name . ': ' . $value;
    }
}
// En FastCGI, getallheaders() peut être absent ou vide : on relit les clés $_SERVER.
if ($authHeader === null) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
}
if ($xauthHeader === null) {
    $xauthHeader = $_SERVER['HTTP_X_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_X_AUTHORIZATION'] ?? null;
}
if ($authHeader !== null) $headers[] = 'Authorization: ' . $authHeader;
if ($xauthHeader !== null) $headers[] = 'X-Authorization: ' . $xauthHeader;
if (!empty($_SERVER['CONTENT_TYPE'])) $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_FOLLOWLOCATION => false,
]);
if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

http_response_code($status ?: 502);
if ($contentType) header('Content-Type: ' . $contentType);
header('Cache-Control: no-store');
echo $response ?: '';
