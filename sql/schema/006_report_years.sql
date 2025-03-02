-- +goose Up
CREATE OR REPLACE FUNCTION get_report_years(input_user_id UUID)
RETURNS TABLE(return_year INT, avg_start_time TIME, category_data JSONB, project_data JSONB) AS $$ 
BEGIN 
    RETURN QUERY 
    WITH category_agg AS (
        SELECT 
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.category_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY year, a.category_id
    ),
    project_agg AS (
        SELECT 
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.project_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY year, a.project_id
    ),
    daily_start_times AS (
        SELECT 
            EXTRACT(YEAR FROM a.start_time)::INT AS year,
            MIN(a.start_time) AS earliest_start_time
        FROM activities a
        WHERE a.user_id = input_user_id
        GROUP BY year, DATE(a.start_time)
    ),
    avg_start_time_agg AS (
        SELECT 
            year,
            -- Use BIGINT for epoch time conversion (seconds since epoch)
            TO_TIMESTAMP(CAST(AVG(EXTRACT(EPOCH FROM earliest_start_time)) AS BIGINT))::TIME AS avg_start_time
        FROM daily_start_times
        GROUP BY year
    )
    SELECT 
        COALESCE(cat.year, proj.year) AS return_year,
        COALESCE(avg.avg_start_time, '00:00'::TIME) AS avg_start_time,  
        COALESCE(jsonb_object_agg(COALESCE(cat.category_id::TEXT, 'null'), cat.total_duration), '{}'::JSONB) AS category_data,  
        COALESCE(jsonb_object_agg(COALESCE(proj.project_id::TEXT, 'null'), proj.total_duration), '{}'::JSONB) AS project_data
    FROM category_agg cat
    FULL JOIN project_agg proj
    ON cat.year = proj.year  
    LEFT JOIN avg_start_time_agg avg
    ON cat.year = avg.year OR proj.year = avg.year
    GROUP BY COALESCE(cat.year, proj.year), avg.avg_start_time
    ORDER BY return_year DESC; 
END;
$$ LANGUAGE plpgsql;

-- +goose Down
DROP FUNCTION get_report_years(uuid);