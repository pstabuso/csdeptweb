# CS Department Portal STRIDE Notes

This portal now uses STRIDE as a lightweight design check for the highest-risk flows.

## Spoofing

- Email and password are validated on the server.
- Role access is checked against the database, not only the session token.
- Password changes require the current password.

## Tampering

- Concern, profile, schedule, and admin updates are server-validated with Zod.
- Post-action redirects are limited to approved internal paths.

## Repudiation

- Login, failed login, lockout, concern, schedule, and admin access changes are logged in `AuditLog`.

## Information Disclosure

- Login failures use a generic error for invalid credentials.
- Disabled accounts are blocked from starting a session.

## Denial Of Service

- Accounts are locked for 15 minutes after 5 failed sign-in attempts.

## Elevation Of Privilege

- Session tokens carry a `sessionVersion`.
- Password, role, status, and security-sensitive account changes rotate the session version.
- Old sessions are forced back to sign-in when the stored version changes.
- Admins cannot disable or demote the account currently running the admin session.
