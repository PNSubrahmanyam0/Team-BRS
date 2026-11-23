-- Run only AFTER creating the admin Auth user in Supabase Dashboard.
-- Supabase Dashboard > Authentication > Users > Add user
-- Use the approved admin email. Set a strong password privately; never put it in source control.
update public.profiles
set organization_id = (select id from public.organizations where slug = 'brs-career-dream-jobs'),
    role = 'owner',
    status = 'active',
    full_name = coalesce(nullif(full_name, ''), 'BRS Administrator')
where lower(email) = lower('brscareerdreamjobs@gmail.com');

-- Verify exactly one profile was updated and that it has role=owner.
select id, email, role, organization_id, status
from public.profiles
where lower(email) = lower('brscareerdreamjobs@gmail.com');

-- If the update returns zero rows, first confirm the Auth user exists and that its email is correct.
