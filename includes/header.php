<?php require_once 'config.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FYOF - Find Your Own Food</title>
    <!-- Boxicons CSS -->
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="logo">
                <a href="/">FYOF</a>
            </div>
            <div class="nav-links">
                <a href="/" class="nav-link">Home</a>
                <a href="/restaurants.php" class="nav-link">Restaurants</a>
                <?php if (is_logged_in()): ?>
                    <?php if (is_vendor()): ?>
                        <a href="/vendor/dashboard.php" class="nav-link">Vendor Dashboard</a>
                    <?php else: ?>
                        <a href="/user/dashboard.php" class="nav-link">My Dashboard</a>
                    <?php endif; ?>
                    <a href="/logout.php" class="nav-link">Logout</a>
                <?php else: ?>
                    <a href="/login.php" class="nav-link">Login</a>
                    <a href="/register.php" class="nav-link">Register</a>
                <?php endif; ?>
            </div>
        </nav>
    </header>
    <main class="main-content">
        <?php if (isset($_SESSION['message'])): ?>
            <div class="alert alert-<?php echo $_SESSION['message_type']; ?>">
                <?php 
                    echo $_SESSION['message'];
                    unset($_SESSION['message']);
                    unset($_SESSION['message_type']);
                ?>
            </div>
        <?php endif; ?> 