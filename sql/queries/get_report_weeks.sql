-- name: GetReportWeeks :many
-- Test UUID 4f0081b0-2e30-47c7-836a-0bc06f7baaab
SELECT 
    (r).return_week::DATE as week,
    (r).return_month::TEXT as month,
    (r).return_year::INT as year,
    (r).avg_start_time as start_time,
    (r).category_data::JSONB as category_data,
    (r).project_data::JSONB as project_data 
FROM get_report_weeks($1, $2, $3) AS r;