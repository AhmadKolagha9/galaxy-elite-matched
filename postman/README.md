# Galaxy Elite Backend Postman Pack

Generated for the live backend base URL:

```text
https://api.yourpropertymatch.cloud
```

## Files

- `Galaxy_Elite_Private_Match_Backend.postman_collection.json`
- `Galaxy_Elite_Backend_Production.postman_environment.json`

## Import

1. Open Postman.
2. Import both JSON files.
3. Select environment: `Galaxy Elite Backend - Production`.
4. Run `System > Health Check`.
5. Run `Auth > Register User - Owner`, then `Auth > Login User`.

The auth requests automatically save:

- `userToken`
- `userId`
- `userEmail`

## Admin Routes

Admin/compliance/super admin routes require one of these:

- `adminToken` for admin routes.
- `complianceToken` for identity/document review routes.
- `superAdminToken` for taxonomy/audit routes.
- Or set `internalApiKey` from backend `.env` and enable the disabled `x-internal-api-key` header on privileged requests.

Normal self-registration cannot create staff roles. Generate staff JWTs on the server with:

```bash
cd /var/www/galaxy-elite-private-match-ultimate/galaxy-elite-matched/backend
AUTH_JWT_SECRET="$(grep '^AUTH_JWT_SECRET=' .env | cut -d= -f2-)" npm run auth:token -- 00000000-0000-0000-0000-000000000101 admin@example.com admin
AUTH_JWT_SECRET="$(grep '^AUTH_JWT_SECRET=' .env | cut -d= -f2-)" npm run auth:token -- 00000000-0000-0000-0000-000000000102 compliance@example.com compliance
AUTH_JWT_SECRET="$(grep '^AUTH_JWT_SECRET=' .env | cut -d= -f2-)" npm run auth:token -- 00000000-0000-0000-0000-000000000103 super@example.com super_admin
```

Paste those tokens into the Postman environment variables.

## Upload Flow

1. Run `Auth > Register User - Owner`.
2. Run `Uploads And Verification > Create Signed Upload URL - Owner ID`.
3. Upload the file to `signedUploadUrl` if your storage provider is configured.
4. Run `Submit User Verification Documents`.

The local placeholder storage service returns a signed URL/token shape for API testing; real object upload still depends on production storage provider configuration.

## Safety

This collection points at production. Use QA emails and test-only records. Avoid running approve/reject/archive requests on real customer data unless that is the intended admin action.
