[View Source Code](https://github.com/EnockMagara/DATABASESFINAL/blob/master/routes/auth.mjs)

1. **Customer Authentication**
   - **Strategy**: `customer-local`
   - **Logic**: 
     - Uses email and password for authentication.
     - Verifies password using Argon2.
     - Retrieves customer details from the database.
   - **Explanation**: Authenticates customers by checking their email and password against stored credentials.

2. **Staff Authentication**
   - **Strategy**: `staff-local`
   - **Logic**: 
     - Uses username and password for authentication.
     - Verifies password using Argon2.
     - Retrieves staff details from the database.
   - **Explanation**: Authenticates airline staff by checking their username and password against stored credentials.

3. **User Serialization**
   - **Logic**: 
     - Serializes user by storing email or username in the session.
   - **Explanation**: Maintains user session by storing a unique identifier.

4. **User Deserialization**
   - **Logic**: 
     - Deserializes user by retrieving full user details using the stored identifier.
   - **Explanation**: Restores user session by fetching user details from the database.

5. **Customer Registration**
   - **Endpoint**: `/register`
   - **Logic**: 
     - Hashes password using Argon2.
     - Stores customer details in the database.
   - **Explanation**: Registers a new customer with their personal and account details.

6. **Staff Registration**
   - **Endpoint**: `/register`
   - **Logic**: 
     - Hashes password using Argon2.
     - Stores staff details, including emails and phone numbers, in the database.
   - **Explanation**: Registers a new staff member with their personal and account details.

7. **Login**
   - **Endpoint**: `/login`
   - **Logic**: 
     - Authenticates user using the appropriate strategy based on user type.
     - Redirects to the appropriate dashboard upon successful login.
   - **Explanation**: Logs in a user (customer or staff) and redirects them to their respective dashboard.

8. **Logout**
   - **Endpoint**: `/logout`
   - **Logic**: 
     - Logs out the user and redirects to a goodbye page.
   - **Explanation**: Ends the user session and redirects to a farewell page.
