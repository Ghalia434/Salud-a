-- Business change: no formula includes a free detox drink or gourmandise
-- anymore. The ordering flow (pack selection, extras step, receipts) only
-- shows/grants these gifts when a program_packs row has the flag set, so
-- turning both off here removes the feature everywhere without any
-- frontend changes.
update program_packs set gift_detox = false, gift_gourmandise = false;
