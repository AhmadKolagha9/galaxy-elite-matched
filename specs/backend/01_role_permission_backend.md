# 01_role_permission_backend.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match
* **Module:** Backend Authentication, JWT Verification, and Role-Based Access Control (RBAC)
* **Target Environment:** Node.js + Express REST API with TypeScript
* **Data Layer:** Supabase Client SDK for Node.js interacting with PostgreSQL database

---

## 2. Global System Roles Definition
The backend Express server and underlying database must natively enforce and validate the following distinct user role configurations:

* `user`: Base registered tier prior to complete profile specialization.
* `buyer`: Verified entity searching for real estate inventory.
* `tenant`: Verified user looking for residential or commercial rental properties.
* `investor`: Capital allocator, institutional fund, or family office.
* `owner`: Private individual holding property title deeds.
* `landlord`: Property owner providing lease opportunities.
* `developer`: Real estate development firm with off-plan portfolio listings.
* `agent`: Licensed real estate broker registered with local land departments.
* `property_manager`: Operator authorized to manage units on behalf of owners/landlords.
* `representative`: Corporate agent or Power of Attorney (POA) holder acting for a principal.
* `corporate_client`: Institutional entity deploying corporate space requirements.
* `family_office`: Wealth management firm executing private portfolio placements.
* `admin`: Brokerage operation team member running moderation queues.
* `compliance`: Legal/regulatory reviewer auditing uploaded identity documents and permits.
* `super_admin`: System architect with unrestricted global access and configuration overrides.

---

## 3. Database Default Configuration
To prevent unauthorized public exposure, all newly initialized user records and content data modifications must default to the following strict, server-side parameter values:

### 3.1 Initial Account Default Role
* Upon user signup, the user profiles record must default to:
  ```text
  primary_role = "user"
  verification_level = "unverified"