-- New 5th objective: Formule Athlète. Run this on its own (Postgres won't
-- let a newly added enum value be used in the same transaction it was
-- added in), then run 0014_athlete_formula.sql separately afterwards.

alter type program_type add value if not exists 'athlete';
