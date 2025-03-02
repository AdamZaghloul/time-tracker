-- +goose Up
CREATE OR REPLACE FUNCTION get_report_years(input_user_id UUID)
RETURNS TABLE(isCategory INT, return_year INT, data JSONB) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        1 AS isCategory,
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
    UNION
    SELECT 
        0 AS isCategory,
        sub2.year::INT AS return_year,  
        jsonb_object_agg(COALESCE(sub2.project_id::TEXT, 'null'), sub2.duration) 
    FROM (
        SELECT 
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.project_id, 
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS duration
        FROM activities a 
        WHERE a.user_id = input_user_id  -- ✅ Do not filter out NULL values
        GROUP BY year, a.project_id
    ) sub2
    GROUP BY sub2.year
    ORDER BY return_year DESC;
END;
$$ LANGUAGE plpgsql;

-- +goose Down
DROP FUNCTION get_report_years(uuid);