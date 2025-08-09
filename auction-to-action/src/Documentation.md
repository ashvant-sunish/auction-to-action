## Documentation and Description for all updates and edits

- Updates the relevant data structures or state based on the provided input.
- Performs necessary checks and validations before applying updates.
- Ensures that all changes are propagated to dependent components or modules.
- Handles error cases gracefully and logs any issues encountered during the update process.
- Triggers any required events or notifications after successful updates.

<!--  -->

## This update introduces several improvements to the Website:

## 05/08/2025 - Tuesday - 4:10pm [ Update 0.0.1 ]

- Added Chakra UI Version 2
- Added a custom theme provider
- for defining a new color add it to src>Theme>theme.js and use it across all pages.

## 07/08/2025 - Thursday - 11:31pm [ Update 0.0.2 ]

- Added React Router Dom
- Added file inventory paths [ Follow that method ]

# 09/08/2025 - Saturday - 7:32 PM [ Update 0.0.3]

## Refactored Login Flow

- Implemented a new, robust authentication structure to support **separate login experiences** for admins and users.

## Created Login Selection Page

- The main `Login.jsx` now serves as a **clear selection screen**, directing users to the appropriate login portal.

## Built Dedicated Admin Login Page

- Added a **fully functional** `AdminLogin.jsx` page with:
  - Its own **form**
  - **Validation** logic
  - **Redirection** after successful login

## Added User Login Placeholder

- Created a **blank** `UserLogin.jsx` placeholder to allow **parallel development** of the user authentication flow.

## Updated App Routing

- Modified the main router in `App.jsx` to include the new routes.
- Ensures **seamless navigation** between:
  - Selection screen
  - Admin login page
  - User login page
