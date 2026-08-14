<?php
// Lightweight cPanel / PHP compatible enquiry endpoint using Resend API.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('Method Not Allowed'); }
if (!empty($_POST['website'])) { http_response_code(200); exit('OK'); }

function clean($v){ return str_replace(["\r","\n"], ' ', trim((string)$v)); }
$name = clean($_POST['Name'] ?? '');
$phone = clean($_POST['Phone'] ?? '');
$email = clean($_POST['Email'] ?? '');
$matter = clean($_POST['Matter'] ?? '');
$desc = trim((string)($_POST['Description'] ?? ''));

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $desc === '') {
    http_response_code(422);
    exit('Please provide a valid name, email, and description.');
}

$apiKey = getenv('RESEND_API_KEY');

$htmlContent = "
<h2>SHETH ASSOCIATES — Website Inquiry</h2>
<p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>
<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
<p><strong>Phone:</strong> " . htmlspecialchars($phone ?: 'Not provided') . "</p>
<p><strong>Matter:</strong> " . htmlspecialchars($matter ?: 'General') . "</p>
<hr>
<p><strong>Description:</strong></p>
<p>" . nl2br(htmlspecialchars($desc)) . "</p>
";

$payload = json_encode([
    'from' => 'SHETH ASSOCIATES Website <info@shethassociates.in>',
    'to' => ['info@shethassociates.in'],
    'reply_to' => $email,
    'subject' => "New Inquiry: " . ($matter ?: 'Legal Matter') . " — " . $name,
    'html' => $htmlContent
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status >= 200 && $status < 300) {
    header('Location: thank-you.html');
    exit;
} else {
    // Fallback to PHP mail if cURL fails
    $to = 'info@shethassociates.in';
    $subject = 'Website enquiry — SHETH ASSOCIATES';
    $body = "Name: $name\nPhone: $phone\nEmail: $email\nMatter: $matter\n\nDescription:\n$desc";
    $headers = "From: info@shethassociates.in\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    @mail($to, $subject, $body, $headers);
    header('Location: thank-you.html');
    exit;
}
?>