<?php
// Lightweight cPanel-compatible enquiry endpoint.
// For production, configure your hosting mail/SMTP and SPF/DKIM/DMARC properly.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('Method Not Allowed'); }
if (!empty($_POST['website'])) { http_response_code(400); exit('Invalid submission'); }
function clean($v){ $v=trim((string)$v); return str_replace(["\r","\n"], ' ', $v); }
$name=clean($_POST['Name'] ?? ''); $phone=clean($_POST['Phone'] ?? ''); $email=clean($_POST['Email'] ?? '');
$matter=clean($_POST['Matter'] ?? ''); $desc=trim((string)($_POST['Description'] ?? ''));
if ($name==='' || !filter_var($email,FILTER_VALIDATE_EMAIL) || $desc==='') { http_response_code(422); exit('Please provide a valid name, email and description.'); }
$to='info@shethassociates.in';
$subject='Website enquiry — SHETH ASSOCIATES';
$body="Name: $name\nPhone: $phone\nEmail: $email\nMatter: $matter\n\nDescription:\n$desc\n\nSubmitted via SHETH ASSOCIATES website.";
$headers="From: website@shethassociates.in\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8\r\n";
@mail($to,$subject,$body,$headers);
header('Location: thank-you.html'); exit;
?>