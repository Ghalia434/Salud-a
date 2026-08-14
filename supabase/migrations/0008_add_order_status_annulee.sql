-- New terminal status the admin can set on an order. Kept out of the
-- client-facing step tracker (which only shows the normal progression) —
-- it's an exception state, not a step.

alter type order_status add value 'annulee';
