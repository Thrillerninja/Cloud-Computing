CREATE TABLE IF NOT EXISTS geoip_location (
    geoname_id INT,
    locale_code VARCHAR(255),
    continent_name VARCHAR(255),
    country_name VARCHAR(255),
    subdivision_1_name VARCHAR(255),
    subdivision_2_name VARCHAR(255),
    city_name VARCHAR(255),
    time_zone VARCHAR(255),
    is_in_european_union BOOLEAN,
    PRIMARY KEY (geoname_id, locale_code)
);

CREATE UNIQUE INDEX idx_geoname_locale ON geoip_location (geoname_id, locale_code);
CREATE INDEX idx_locale_code ON geoip_location (locale_code);
CREATE INDEX idx_country_name ON geoip_location (country_name);
CREATE INDEX idx_city_name ON geoip_location (city_name);
