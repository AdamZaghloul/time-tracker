-- name: GetReportYearsCategories :many
DROP FUNCTION get_activity_summary(uuid);

CREATE OR REPLACE FUNCTION get_activity_summary(input_user_id UUID)
RETURNS TABLE(return_year INT, data JSONB) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        sub.year::INT AS return_year,  
        jsonb_object_agg(COALESCE(sub.category_id::TEXT, 'null'), sub.duration) 
    FROM (
        SELECT 
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.category_id, 
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS duration
        FROM activities a 
        WHERE a.user_id = input_user_id  -- ✅ Do not filter out NULL values
        GROUP BY year, a.category_id
    ) sub
    GROUP BY sub.year
    ORDER BY sub.year DESC;
END;
$$ LANGUAGE plpgsql;

-- Test UUID 4f0081b0-2e30-47c7-836a-0bc06f7baaab
SELECT * FROM get_activity_summary($1);