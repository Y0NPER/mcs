<?php
// Generate password hash for admin account
$password = 'r0uv2d!ynk';
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

echo "Password: $password\n";
echo "Hash: $hash\n";
echo "\nSQL Update Command:\n";
echo "UPDATE admin_users SET password_hash = '$hash' WHERE email = 'yonper26';\n";
?>