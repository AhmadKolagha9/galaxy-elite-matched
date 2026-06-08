-- Allow agent applications to be edited/resubmitted without requiring a company name.

alter table agent_applications
  modify column company_name varchar(255) null;
