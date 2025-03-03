CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  ip VARCHAR(15) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

INSERT INTO locations (ip, country, city, latitude, longitude)
VALUES ('8.8.8.8', 'United States', 'Mountain View', 37.38801, -122.07403)
ON CONFLICT DO NOTHING;
