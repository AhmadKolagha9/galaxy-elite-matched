-- Interest Board member match requests with owner approval before admin processing.

create table if not exists interest_match_requests (
  id char(36) primary key default (uuid()),
  interest_signal_id char(36) not null,
  interest_owner_user_id varchar(128) not null,
  requester_user_id varchar(128) not null,
  requester_role enum('the owner', 'the landlord', 'an agent', 'Buyer', 'tenant', 'prospective tenant') not null,
  message text not null,
  status enum('pending_owner', 'owner_approved', 'owner_rejected', 'cancelled', 'admin_review', 'admin_processing', 'admin_approved', 'admin_rejected', 'closed') not null default 'pending_owner',
  admin_status enum('not_sent', 'pending_review', 'in_progress', 'approved', 'rejected', 'closed') not null default 'not_sent',
  owner_note text null,
  admin_note text null,
  owner_reviewed_at timestamp null,
  admin_reviewed_at timestamp null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  index interest_match_interest_idx (interest_signal_id, status, created_at),
  index interest_match_owner_idx (interest_owner_user_id, status, created_at),
  index interest_match_requester_idx (requester_user_id, status, created_at),
  index interest_match_admin_idx (admin_status, status, created_at),
  constraint interest_match_interest_fk foreign key (interest_signal_id) references interest_signals(id) on delete cascade
);
