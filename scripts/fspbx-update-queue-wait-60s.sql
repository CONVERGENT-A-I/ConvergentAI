-- FusionPBX: extend all Community MTG MLO queues to a 60-second wait.
-- Run against the FusionPBX PostgreSQL database after taking a backup.

BEGIN;

-- Safety guard: this release expects exactly 51 state queues.
DO $$
DECLARE
  queue_count integer;
BEGIN
  SELECT count(*)
    INTO queue_count
    FROM v_call_center_queues
   WHERE queue_name LIKE 'communitymtg_mlo_%';

  IF queue_count <> 51 THEN
    RAISE EXCEPTION
      'Expected 51 communitymtg_mlo queues, found %. No rows were updated.',
      queue_count;
  END IF;
END $$;

UPDATE v_call_center_queues
   SET queue_max_wait_time = '60',
       queue_max_wait_time_with_no_agent = '60'
 WHERE queue_name LIKE 'communitymtg_mlo_%';

-- Verify every target row before committing.
SELECT queue_name,
       queue_extension,
       queue_max_wait_time,
       queue_max_wait_time_with_no_agent
  FROM v_call_center_queues
 WHERE queue_name LIKE 'communitymtg_mlo_%'
 ORDER BY queue_extension;

COMMIT;
