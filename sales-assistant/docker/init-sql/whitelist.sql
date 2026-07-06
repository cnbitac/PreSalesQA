INSERT INTO user_whitelist (username)
VALUES
    ('栾志宇'),
    ('金毅彬'),
    ('谭家睿'),
    ('刘剑男'),
    ('俞亮'),
    ('侯杨'),
    ('沈师航'),
    ('敬铠临'),
    ('彭川'),
    ('冯金泉')
    ON CONFLICT (username) DO NOTHING;