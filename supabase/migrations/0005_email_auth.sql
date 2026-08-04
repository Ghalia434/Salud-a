-- Client login switched from phone OTP (SMS, required a paid Twilio account)
-- to email OTP (works with Supabase's built-in email sending). The phone
-- number is now just a plain delivery-contact field filled in at checkout,
-- not an auth identifier — so it must no longer be forced unique (e.g. two
-- family members ordering under different emails may share one phone).

alter table profiles drop constraint profiles_phone_key;
