## Self Attack: Merica

| Item           | Result                                                                     |
| -------------- | -------------------------------------------------------------------------- |
| Date           | December 3, 2025                                                           |
| Target         | pizza.merica.click                                                         |
| Classification | Security Misconfiguration                                                  |
| Severity       | 2                                                                          |
| Description    | Logged in as admin (default password), franchisee, and default diner user. |
| Images         | ![merica admin login](images/merica_admin_login.png)                       |
| Corrections    | Change default passwords.                                                  |

| Item           | Result                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Date           | December 3, 2025                                                                                                                            |
| Target         | pizza.merica.click                                                                                                                          |
| Classification | Insecure Design                                                                                                                             |
| Severity       | 2                                                                                                                                           |
| Description    | Can create multiple users with the same username. Even after being created, only the first user with that username can log in successfully. |
| Images         | ![merica same email](images/merica_same_email.png)                                                                                          |
| Corrections    | Add check to make sure that email is not already in use. If it is, require the user to enter a different email.                             |

| Item           | Result                                                                                                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date           | December 3, 2025                                                                                                                                                                                                                                   |
| Target         | pizza.merica.click                                                                                                                                                                                                                                 |
| Classification | Injection                                                                                                                                                                                                                                          |
| Severity       | 1                                                                                                                                                                                                                                                  |
| Description    | Changed all usernames and passwords via SQL injection. This **really** messed up my database and made it so that no users could log in.                                                                                                            |
| Images         | ![merica sql inject](images/merica_sql_inject.png)                                                                                                                                                                                                 |
| Corrections    | First, fix the database by reverting to a previous point in time in the database. Then, change updateUser to use parameterized SQL input. Also made sure all other database calls used parameterized input to prevent other SQL injection attacks. |

| Item           | Result                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Date           | December 3, 2025                                                                                                                          |
| Target         | pizza.merica.click                                                                                                                        |
| Classification | Broken Access Control                                                                                                                     |
| Severity       | 4                                                                                                                                         |
| Description    | Anyone can access the create franchise and create store screens (although they don't appear to be able to create a store or a franchise). |
| Images         | ![](images/merica_view_create_franchise.png)<br>![](images/merica_view_create_store.png)                                                  |
| Corrections    | Reconfigure app setup to only allow authorized users to view these pages.                                                                 |

| Item           | Result                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                                                  |
| Target         | pizza.merica.click                                                                                                |
| Classification | Identification and Authentication Failures                                                                        |
| Severity       | 3                                                                                                                 |
| Description    | Users can execute brute force attacks by attempting to log in with different passwords repeatedly, without limit. |
| Images         | ![](images/merica_brute_force.png)<br>After fix:<br>![](images/merica_brute_force_fix.png)                        |
| Corrections    | Add rate limiters to login and register so that only 5 attempts may be made per minute.                           |

| Item           | Result                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                                                                                                      |
| Target         | pizza.merica.click                                                                                                                                                    |
| Classification | Broken Access Control                                                                                                                                                 |
| Severity       | 2                                                                                                                                                                     |
| Description    | Anyone can access the delete franchise endpoint.                                                                                                                      |
| Images         | Before:<br>![](images/merica_franchise_delete_1.png)<br>Deletion:<br>![](images/merica_franchise_delete_2.png)<br>After:<br>![](images/merica_franchise_delete_3.png) |
| Corrections    | Fix endpoint so that only authorized admins can delete franchises.                                                                                                    |

| Item           | Result                                                                   |
| -------------- | ------------------------------------------------------------------------ |
| Date           | December 4, 2025                                                         |
| Target         | pizza.merica.click                                                       |
| Classification | Injection                                                                |
| Severity       | 1 (depending on the injection)                                           |
| Description    | User could potentially add different parameters into pagination queries. |
| Images         | (With corrections here)<br>![](images/merica_query_injection.png)        |
| Corrections    | Add verification that page and limit are valid integers.                 |

## Self Attack: Devin

| Item           | Result                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                        |
| Target         | pizza.devin-williams.click                                                              |
| Classification | Server side request forgery                                                             |
| Severity       | 3                                                                                       |
| Description    | Ordered pizza for -100 Bitcoin, store now says its in debt. Using a simple curl request |
| Images         | ![devin negative](images/devin_negative_money.png)                                      |
| Corrections    | Verify who order request and dont allow different prices to be used                     |

| Item           | Result                                                          |
| -------------- | --------------------------------------------------------------- |
| Date           | December 5, 2025                                                |
| Target         | pizza.devin-williams.click                                      |
| Classification | Security Misconfiguration                                       |
| Severity       | 2                                                               |
| Description    | Using defualt account credentials for a@jwt.com, d@jwt.com, etc |
| Images         | ![admin login](images/admin_login.png)                          |
| Corrections    | update login credentials                                        |

| Item           | Result                                               |
| -------------- | ---------------------------------------------------- |
| Date           | December 5, 2025                                     |
| Target         | pizza.devin-williams.click                           |
| Classification | Broken Access Control                                |
| Severity       | 1                                                    |
| Description    | deleted a franchise as a regular user                |
| Images         | ![delete franchise](images/delete_franchise.png)     |
| Corrections    | Have better auth in place for administrative actions |

| Item           | Result                                               |
| -------------- | ---------------------------------------------------- |
| Date           | December 5, 2025                                     |
| Target         | pizza.devin-williams.click                           |
| Classification | Information Disclosure                               |
| Severity       | 3                                                    |
| Description    | Shows internal file paths - showing stack trace      |
| Images         | ![sql stack trace](images/sql_stack_trace.png)       |
| Corrections    | Dont report full stack trace and file path in errors |

| Item           | Result                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date           | December 5, 2025                                                                                                                                     |
| Target         | pizza.devin-williams.click                                                                                                                           |
| Classification | Missing Security Headers                                                                                                                             |
| Severity       | 4                                                                                                                                                    |
| Description    | No security headers and exposes tech stack `express`                                                                                                 |
| Images         | ![missing security headers](images/missing_security_headers.png)                                                                                     |
| Corrections    | Add security headers for better security i.e. `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, and dont expose tech stack. |

## Peer Attack: Merica

| Item           | Result                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                 |
| Target         | pizza.devin-williams.click                                                       |
| Classification | Security Misconfiguration                                                        |
| Severity       | 2                                                                                |
| Description    | Logged in as admin (default password), franchisee, default diner, and test user. |
| Images         | ![](images/devin_admin_login.png)                                                |
| Corrections    | Change passwords for default users.                                              |

| Item           | Result                                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Date           | December 4, 2025                                                                                                                                                         |
| Target         | pizza.devin-williams.click                                                                                                                                               |
| Classification | Insecure Design                                                                                                                                                          |
| Severity       | 2                                                                                                                                                                        |
| Description    | Multiple users can be created with the same email. After logging out, only the original user can still log in with that email. Other users with that email can't log in. |
| Images         | ![](images/devin_same_email_1.png)<br>![](images/devin_same_email_2.png)                                                                                                 |
| Corrections    | Verify emails so that emails can only be used once to log in.                                                                                                            |

| Item           | Result                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                                                                                                                                                                                                                                        |
| Target         | pizza.devin-williams.click                                                                                                                                                                                                                                                                              |
| Classification | Broken Access Control                                                                                                                                                                                                                                                                                   |
| Severity       | 4                                                                                                                                                                                                                                                                                                       |
| Description    | Anyone (logged in or not) can look at the create franchise and create store pages on the admin dashboard and the create store page on the franchise dashboard. However, creating a franchise or store doesn't appear to actually work; the person can just see the page when they shouldn't be able to. |
| Images         | ![](images/devin_view_create_franchise.png)<br>![](images/devin_view_create_store.png)                                                                                                                                                                                                                  |
| Corrections    | Fix who can see the franchise and store creation pages (only an admin should see the franchise creation page and only admins and franchisees should be able to see the store creation page).                                                                                                            |

| Item           | Result                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Date           | December 4, 2025                                                                                 |
| Target         | pizza.devin-williams.click                                                                       |
| Classification | Security Misconfiguration                                                                        |
| Severity       | 4                                                                                                |
| Description    | Errors print out stack trace (which I've been told is bad practice).                             |
| Images         | ![](images/devin_stack_trace.png)                                                                |
| Corrections    | Make sure sensitive information (such as stack traces) aren't accessible by unauthorized people. |

| Item           | Result                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                    |
| Target         | pizza.devin-williams.click                                                          |
| Classification | Identification and Authentication Failures                                          |
| Severity       | 3                                                                                   |
| Description    | Attackers could launch a brute force attack. There are no limits on login attempts. |
| Images         | ![](images/devin_brute_force.png)                                                   |
| Corrections    | Throttle login attempts to make it difficult to launch brute force attacks.         |

| Item           | Result                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                                |
| Target         | pizza.devin-williams.click                                                                      |
| Classification | Broken Access Control                                                                           |
| Severity       | 2 (doesn't bring the whole site down, but still causes major issues)                            |
| Description    | Anyone can delete franchises without being logged in as long as they have the franchise number. |
| Images         | ![](images/devin_franchise_delete_curl.png)<br>![](images/devin_franchise_delete_2.png)         |
| Corrections    | Protect the delete franchise endpoint with appropriate authorization checks.                    |

| Item           | Result                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Date           | December 6, 2025                                                                                                                        |
| Target         | pizza.devin-williams.click                                                                                                              |
| Classification | Injection                                                                                                                               |
| Severity       | 1                                                                                                                                       |
| Description    | Injected SQL code into the update user name box and changed all user's names and passwords, which makes it so that no users can log in. |
| Images         | ![](images/devin_sql_inject_1.png)<br>![](images/devin_sql_inject_2.png)<br>![](images/devin_sql_inject_3.png)                          |
| Corrections    | Sanitize user input and use SQL parameterization to prevent SQL injection attacks.                                                      |

## Peer Attack: Devin

| Item           | Result                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| Date           | December 4, 2025                                                                        |
| Target         | pizza.merica.click                                                                      |
| Classification | Server side request forgery                                                             |
| Severity       | 3                                                                                       |
| Description    | Ordered pizza for -100 Bitcoin, store now says its in debt. Using a simple curl request |
| Images         | ![](images/merica_franchise_debt.png)                                                   |
| Corrections    | Verify who order request and dont allow different prices to be used                     |

| Item           | Result                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Date           | December 5, 2025                                                       |
| Target         | pizza.merica.click                                                     |
| Classification | Security Misconfiguration                                              |
| Severity       | 0                                                                      |
| Description    | Blocks using defualt account credentials for a@jwt.com, d@jwt.com, etc |
| Images         | ![block admin login](images/merica_block_admin.png)                    |
| Corrections    | N/A                                                                    |

| Item           | Result                                                    |
| -------------- | --------------------------------------------------------- |
| Date           | December 5, 2025                                          |
| Target         | pizza.merica.click                                        |
| Classification | Broken Access Control                                     |
| Severity       | 0                                                         |
| Description    | Blocks deleted a franchise as a regular user              |
| Images         | ![block delete franchise](images/merica_block_delete.png) |
| Corrections    | N/A                                                       |

## Learnings

- **Server-side validation is critical** - Never trust client input. Validate all data server-side (prices, quantities, permissions).
- **Authorization ≠ Authentication** - Knowing who the user is doesn't mean they should access everything. Check permissions for every action.
- **Verbose errors expose attack vectors** - Stack traces reveal internal paths and structure. Use generic error messages in production.
- **Security headers provide defense in depth** - CSP, X-Frame-Options, and HSTS are simple additions that significantly improve security posture.
- **Business logic flaws are hard to detect** - Automated scanners miss issues like negative prices. Manual testing and code review are essential.
- **Think like an attacker** - Test unexpected inputs (negative numbers, SQL syntax, unauthorized actions) on every endpoint.
- **Fix the basics first** - Simple exploits (default credentials, missing validation, broken access control) are often the most damaging.
