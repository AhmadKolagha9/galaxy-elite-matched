# USER_ROLES_AND_PERMISSIONS.md

## Role model

The platform must use role-based access control.

## Public visitor

Can:

- View public pages
- View approved public Interest Board items
- Sign up
- Join newsletter

Cannot:

- See private property details
- See documents
- Contact users directly
- Access dashboard/admin

## Registered user

Can:

- Access dashboard
- Create interest signals
- Submit private availability
- Submit verified listing request
- Submit investor post
- View own submissions

Cannot:

- Publish without approval
- Mark themselves verified
- See other users' private details

## Buyer / Tenant / Investor / Land seeker

Can:

- Create demand/interest profile
- Choose budget visibility
- Accept or reject match requests
- Join match room after approval

Cannot:

- See private availability details without match approval

## Owner / Landlord

Can:

- Submit private availability
- Request verified listing
- Review matched buyer/tenant interest
- Approve/reject match request

Cannot:

- Publish verified listing without admin approval

## Developer

Can:

- Submit private availability or project opportunities
- Respond to approved investor/buyer demand
- Request verification

Requires:

- Company/project verification where applicable

## Licensed agent

Can:

- Register as agent
- Upload licence
- Disclose who they represent
- Respond to opportunities where agents are accepted

Cannot:

- Pretend to be direct owner/landlord/buyer/tenant
- Contact users before approval
- Submit property without authority
- Hide commission/representation role where required

## Property manager / Representative

Can:

- Submit availability on behalf of someone only with authority
- Upload authority documents

Cannot:

- Act as direct owner unless verified as owner

## Admin

Can:

- View all submissions
- Approve/reject/archive
- Request documents
- Change public status
- Add notes
- Create match requests
- Manage users in limited scope

## Compliance reviewer

Can:

- View verification documents
- Mark documents verified/failed
- Place compliance hold
- Complete compliance checklists

Cannot:

- Change brand/content unless also admin

## Super admin

Can:

- Manage all settings
- Manage admins
- Override statuses
- Manage taxonomy
- Access audit logs

## Permission matrix

| Action | Visitor | User | Agent | Admin | Compliance | Super Admin |
|---|---:|---:|---:|---:|---:|---:|
| View public pages | Yes | Yes | Yes | Yes | Yes | Yes |
| Submit interest | No | Yes | Yes | Yes | Yes | Yes |
| Submit availability | No | Yes | Yes | Yes | Yes | Yes |
| Submit verified listing | No | Yes | Yes | Yes | Yes | Yes |
| Upload verification docs | No | Own only | Own only | Yes | Yes | Yes |
| Approve post | No | No | No | Yes | Limited | Yes |
| Verify documents | No | No | No | Limited | Yes | Yes |
| Access admin | No | No | No | Yes | Yes | Yes |
| Manage taxonomy | No | No | No | Limited | No | Yes |
| View audit log | No | No | No | Yes | Yes | Yes |
| Delete/archive records | No | Own draft only | Own draft only | Yes | Limited | Yes |

## Key rule

No role should be able to self-verify or bypass Galaxy Elite approval.
