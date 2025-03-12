-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION get_report_weeks(input_user_id UUID, input_year INT, input_month TEXT)
RETURNS TABLE(return_week DATE, return_month TEXT, return_year INT, avg_start_time TEXT, category_data JSONB, project_data JSONB) AS $$
BEGIN
    RETURN QUERY
    WITH category_agg AS (
        SELECT 
            date_trunc('week', a.start_time)::DATE as week,
            TO_CHAR(a.start_time, 'FMMonth') AS month,
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.category_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY week, month, year, a.category_id
    ),
    project_agg AS (
        SELECT 
            date_trunc('week', a.start_time)::DATE as week,
            TO_CHAR(a.start_time, 'FMMonth') AS month,
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.project_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY week, month, year, a.project_id
    ),
    daily_start_times AS (
    SELECT 
        date_trunc('week', a.start_time)::DATE as week,
        TO_CHAR(a.start_time, 'FMMonth') AS month,
        EXTRACT(YEAR FROM a.start_time)::INT AS year,
        EXTRACT(EPOCH FROM MIN(a.start_time) - DATE_TRUNC('day', MIN(a.start_time))) AS seconds_since_midnight
    FROM activities a
    WHERE a.user_id = input_user_id
    GROUP BY week, month, year, DATE(a.start_time)
    ),
    avg_start_time_agg AS (
        SELECT 
            week,
            month,
            year,
            TO_CHAR(TO_TIMESTAMP(AVG(seconds_since_midnight)) AT TIME ZONE 'UTC', 'HH24:MI') AS avg_start_time
        FROM daily_start_times
        GROUP BY week, month, year
    )
    SELECT 
        COALESCE(cat.week, proj.week) AS return_week,
        COALESCE(cat.month, proj.month) AS return_month,
        COALESCE(cat.year, proj.year) AS return_year,
        COALESCE(avg.avg_start_time, '00:00') AS avg_start_time,  
        COALESCE(jsonb_object_agg(COALESCE(cat.category_id::TEXT, 'null'), cat.total_duration), '{}'::JSONB) AS category_data,  
        COALESCE(jsonb_object_agg(COALESCE(proj.project_id::TEXT, 'null'), proj.total_duration), '{}'::JSONB) AS project_data
    FROM category_agg cat
    FULL JOIN project_agg proj
    ON cat.week = proj.week  
    LEFT JOIN avg_start_time_agg avg
    ON COALESCE(cat.week, proj.week) = avg.week AND COALESCE(cat.month, proj.month) = avg.month AND COALESCE(cat.year, proj.year) = avg.year
    GROUP BY COALESCE(cat.week, proj.week), COALESCE(cat.month, proj.month), COALESCE(cat.year, proj.year), avg.avg_start_time
    HAVING COALESCE(cat.year, proj.year) = input_year AND COALESCE(cat.month, proj.month) = input_month
    ORDER BY return_week, return_month, return_year DESC;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
DROP FUNCTION get_report_weeks(uuid, INT, TEXT);