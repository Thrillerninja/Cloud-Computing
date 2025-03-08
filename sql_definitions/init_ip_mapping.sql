CREATE TABLE IF NOT EXISTS geoip_ip_mapping (
    ip VARCHAR(255),
    network VARCHAR(255),
    PRIMARY KEY (ip)
);