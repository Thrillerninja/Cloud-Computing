CREATE TABLE IF NOT EXISTS geoip_network (
    network VARCHAR(255),
    geoname_id INT,
    registered_country_geoname_id INT,
    represented_country_geoname_id INT,
    is_anonymous_proxy BOOLEAN,
    is_satellite_provider BOOLEAN,
    postal_code VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy_radius INT,
    is_anycast BOOLEAN,
    PRIMARY KEY (network)
);

CREATE INDEX idx_geoname_id ON geoip_network (geoname_id);
CREATE INDEX idx_registered_country_geoname_id ON geoip_network (registered_country_geoname_id);
CREATE INDEX idx_represented_country_geoname_id ON geoip_network (represented_country_geoname_id);