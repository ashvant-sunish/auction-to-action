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

# 10/08/2025 - Sunday - 3:20 AM [ Update 0.0.4]

## Implemented User Login Functionality

- Developed the `Login.jsx` page with:
  - Styles
  - Header & Footer

## File Directory Adjusted

- Some Components , Pages and File Directory Changed

## UI/UX Improvements

- Updated button styles and input fields for consistency with the custom theme
- Improved accessibility for login forms

# 10/08/2025 - Sunday - 5:30 AM [ Update 0.0.5 ]

## Implemented User Login Component

    - Created LoginComponentUser.jsx based on the design and logic of LoginComponentAdmin.jsx.
    - Added form fields for Team Name and Team Code.

# 23/08/2025 - Saturday 3:15 PM [ Update 0.0.6 ]

- User and admin login connection to the database completed

# 27/08/2025 - Wednesday 12:25 AM [ Update 0.0.7 ]

## Major Design Overhaul for Authentication Pages

- Implemented a complete visual redesign of the **User** and **Admin** login pages to create a more modern and immersive user experience.

---

## New Two-Column Layout

- **Login.jsx** and **Admin.Login.jsx** were refactored to use a two-column layout.
- **Left column**: Dedicated branding panel with event title, tagline, and illustration.
- **Right column**: Focused on the login form.

---

## Enhanced Background and Styling

- Replaced the simple background with a **multi-layered CSS gradient** and **pseudo-elements** for depth.
- Login form cards (**LoginComponent.User** and **LoginComponent.Admin**) updated with a **glassmorphism effect**, including `backdrop-filter` blur.

---

## Theme and Typography Update

- Primary font updated to **Inter** for a cleaner, modern look.
- Updates applied in both `theme.js` and `index.html`.

---

## UX and Component Refinements

- Removed the **"Sign up"** link from the user login component for a streamlined UI.
- Disabled hover effect on the **password visibility (eye) icon** for cleaner interactions.
