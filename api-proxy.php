<?php
/**
 * Reverse proxy — relie /api/* sur ce domaine vers l'API backend.
 *
 * Exemple : GET https://jmrtextile.com/api/quotes/abc
 *          -> GET https://api.jmrtextile.com/api/quotes/abc
 *
 * Le navigateur ne voit qu'une seule origine : plus aucun CORS.
 * La méthode, le body et les headers (dont Authorization) sont conservés.
 */

$backendBase = getenv('JMR_API_BACKEND') ?: 'https://api.jmrtextile.com';

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$target = $backendBase . $uri;

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$headers = [];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if ($lower === 'host' || $lower === 'content-length' || $lower === 'connection') {
        continue;
    }
    $headers[] = $name . ': ' . $value;
}

$body = file_get_contents('php://input');

$ch = curl_init($target);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
if ($body !== '' && $body !== false) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Proxy: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$headerText = substr($response, 0, $headerSize);
$bodyOut = substr($response, $headerSize);

foreach (preg_split("/\r?\n/", $headerText) as $line) {
    if (stripos($line, 'HTTP/') === 0) {
        continue;
    }
    $pos = strpos($line, ':');
    if ($pos === false) {
        continue;
    }
    $name = trim(substr($line, 0, $pos));
    $value = trim(substr($line, $pos + 1));
    $lower = strtolower($name);
    if ($lower === 'content-length' || $lower === 'transfer-encoding' || $lower === 'connection') {
        continue;
    }
    header($name . ': ' . $value);
}

http_response_code($status);
echo $bodyOut;
