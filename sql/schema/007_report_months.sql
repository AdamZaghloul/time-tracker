-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION get_report_months(input_user_id UUID, input_year INT)
RETURNS TABLE(return_month TEXT, return_year INT, avg_start_time TEXT, category_data JSONB, project_data JSONB) AS $$
BEGIN
    RETURN QUERY
    WITH category_agg AS (
        SELECT 
            EXTRACT(MONTH FROM a.start_time)::INT AS month_num,  
            TO_CHAR(a.start_time, 'FMMonth') AS month,
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.category_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY month_num, month, year, a.category_id
    ),
    project_agg AS (
        SELECT 
            EXTRACT(MONTH FROM a.start_time)::INT AS month_num,
            TO_CHAR(a.start_time, 'FMMonth') AS month,
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            a.project_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY month_num, month, year, a.project_id
    ),
    daily_start_times AS (
    SELECT 
        EXTRACT(MONTH FROM a.start_time)::INT AS month_num,
        TO_CHAR(a.start_time, 'FMMonth') AS month,
        EXTRACT(YEAR FROM a.start_time)::INT AS year,
        EXTRACT(EPOCH FROM MIN(a.start_time) - DATE_TRUNC('day', MIN(a.start_time))) AS seconds_since_midnight
    FROM activities a
    WHERE a.user_id = input_user_id
    GROUP BY month_num, month, year, DATE(a.start_time)
    ),
    avg_start_time_agg AS (
        SELECT 
            month_num,
            month,
            year,
            TO_CHAR(TO_TIMESTAMP(AVG(seconds_since_midnight)) AT TIME ZONE 'UTC', 'HH24:MI') AS avg_start_time
        FROM daily_start_times
        GROUP BY month_num, month, year
    )
    SELECT 
        COALESCE(cat.month, proj.month) AS return_month,
        COALESCE(cat.year, proj.year) AS return_year,
        COALESCE(avg.avg_start_time, '00:00') AS avg_start_time,  
        COALESCE(jsonb_object_agg(COALESCE(cat.category_id::TEXT, 'null'), cat.total_duration), '{}'::JSONB) AS category_data,  
        COALESCE(jsonb_object_agg(COALESCE(proj.project_id::TEXT, 'null'), proj.total_duration), '{}'::JSONB) AS project_data
    FROM category_agg cat
    FULL JOIN project_agg proj
    ON cat.month_num = proj.month_num AND cat.year = proj.year
    LEFT JOIN avg_start_time_agg avg
    ON COALESCE(cat.month, proj.month) = avg.month AND COALESCE(cat.year, proj.year) = avg.year
    GROUP BY COALESCE(cat.month_num, proj.month_num), COALESCE(cat.month, proj.month), COALESCE(cat.year, proj.year), avg.avg_start_time
    HAVING COALESCE(cat.year, proj.year) = input_year
    ORDER BY COALESCE(cat.month_num, proj.month_num) DESC;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
DROP FUNCTION get_report_months(uuid, INT);