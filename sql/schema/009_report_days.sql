-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION get_report_days(input_user_id UUID, input_year INT, input_month TEXT, input_week DATE)
RETURNS TABLE(return_day DATE, return_week DATE, return_month TEXT, return_year INT, avg_start_time TEXT, category_data JSONB, project_data JSONB) AS $$
BEGIN
    RETURN QUERY
    WITH category_agg AS (
        SELECT 
            a.start_time::DATE AS day,
            date_trunc('week', a.start_time)::DATE AS week,
            TO_CHAR(a.start_time, 'FMMonth') AS month,
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            COALESCE(a.category_id::TEXT, 'null') AS category_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60 / 60, 2)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY day, week, month, year, category_id
    ),
    project_agg AS (
        SELECT 
            a.start_time::DATE AS day,
            date_trunc('week', a.start_time)::DATE AS week,
            TO_CHAR(a.start_time, 'FMMonth') AS month,
            EXTRACT(YEAR FROM a.start_time)::INT AS year,  
            COALESCE(a.project_id::TEXT, 'null') AS project_id,  
            SUM(ROUND(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60 / 60, 2)) AS total_duration
        FROM activities a  
        WHERE a.user_id = input_user_id  
        GROUP BY day, week, month, year, project_id
    ),
    avg_start_time_agg AS (
        SELECT 
            a.start_time::DATE AS day,
            date_trunc('week', a.start_time)::DATE AS week,
            TO_CHAR(a.start_time, 'FMMonth') AS month,
            EXTRACT(YEAR FROM a.start_time)::INT AS year,
            TO_CHAR(TO_TIMESTAMP(AVG(EXTRACT(EPOCH FROM a.start_time - DATE_TRUNC('day', a.start_time)))) AT TIME ZONE 'UTC', 'HH24:MI') AS avg_start_time
        FROM activities a
        WHERE a.user_id = input_user_id
        GROUP BY day, week, month, year
    )
    SELECT 
        COALESCE(cat.day, proj.day) AS return_day,
        COALESCE(cat.week, proj.week) AS return_week,
        COALESCE(cat.month, proj.month) AS return_month,
        COALESCE(cat.year, proj.year) AS return_year,
        COALESCE(avg.avg_start_time, '00:00') AS avg_start_time,  
        COALESCE(jsonb_object_agg(cat.category_id, cat.total_duration) FILTER (WHERE cat.category_id IS NOT NULL), '{}'::JSONB) AS category_data,  
        COALESCE(jsonb_object_agg(proj.project_id, proj.total_duration) FILTER (WHERE proj.project_id IS NOT NULL), '{}'::JSONB) AS project_data
    FROM category_agg cat
    FULL JOIN project_agg proj ON cat.day = proj.day  
    FULL JOIN avg_start_time_agg avg ON COALESCE(cat.day, proj.day) = avg.day
    GROUP BY return_day, return_week, return_month, return_year, avg.avg_start_time
    HAVING COALESCE(cat.year, proj.year) = input_year 
       AND COALESCE(cat.month, proj.month) = input_month 
       AND COALESCE(cat.week, proj.week) = input_week
    ORDER BY return_day DESC;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
DROP FUNCTION get_report_days(uuid, INT, TEXT, DATE);