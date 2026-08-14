-- New 4th objective. Run this on its own (Postgres won't let a newly added
-- enum value be used in the same transaction it was added in), then run
-- 0007_pricing_and_delivery.sql separately afterwards.

alter type program_type add value 'transformation_corporelle';
