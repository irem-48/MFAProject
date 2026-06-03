# MFA Project

## Overview

This project is a Multi-Factor Authentication (MFA) simulation developed using ASP.NET Core MVC. It demonstrates how multiple authentication layers can be used to improve account security and reduce the risks associated with weak authentication mechanisms.

The project was created for educational purposes to illustrate modern authentication concepts and security practices used in web applications.

---

## Features

### Password Authentication
- User login with email and password
- Password strength evaluation
- Password show/hide functionality
- Passphrase support

### Security Question Verification
- Additional authentication layer after password validation
- Security question verification before MFA step

### Email-Based MFA
- Random 6-digit verification code generation
- Code delivery through Gmail SMTP
- Verification code expiration timer
- Resend verification code option

### Account Protection
- Account lockout after 3 failed login attempts
- Protection against brute-force attacks
- Session-based authentication flow

### Student Information Portal Simulation
After successful authentication, users gain access to a simulated student portal containing:

- Student information
- Student number
- Department information
- GPA information
- Active courses
- Weekly course schedule

All displayed student information is fictional and used only for demonstration purposes.

---

## Technologies Used

- ASP.NET Core MVC
- C#
- JavaScript
- HTML5
- CSS3
- Gmail SMTP Service

---

## Security Concepts Demonstrated

- Single-Factor Authentication (SFA)
- Multi-Factor Authentication (MFA)
- Password Security
- Passphrase Authentication
- Email Verification
- Account Lockout Mechanisms
- Layered Security Approach

---

## Project Workflow

1. User enters email and password/passphrase.
2. Password strength is evaluated.
3. Security question is validated.
4. MFA code is generated and sent via email.
5. User enters the verification code.
6. Access is granted to the student portal dashboard.

---

## Educational Purpose

The main goal of this project is to demonstrate how Multi-Factor Authentication enhances web application security by adding multiple verification layers beyond traditional password-based authentication.

---

## Author

İrem Nisa Sözen

Software Engineering Student
Manisa Celal Bayar University
