terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "app_network" {
  name = "app_network"
  ipam_config {
    subnet = "172.22.0.0/16"
  }
}

# PostgreSQL container
resource "docker_container" "db" {
  name  = "postgres-server"
  image = "postgres:14"
  
  networks_advanced {
    name         = docker_network.app_network.name
    ipv4_address = "172.22.0.2"
  }
  
  ports {
    internal = 5432
    external = 5432
  }
  
  volumes {
    container_path = "/var/lib/postgresql/data"
    host_path      = "${path.cwd}/postgres-data"
  }
  
  env = [
    "POSTGRES_USER=geoip",
    "POSTGRES_PASSWORD=password",
    "POSTGRES_DB=geoipdb"
  ]
  
  # Install Python when container starts
  command = [
    "sh", "-c", 
    "apt-get update && apt-get install -y python3 && docker-entrypoint.sh postgres"
  ]
}

# pgAdmin container
resource "docker_container" "pgadmin" {
  name  = "pgadmin-server"
  image = "dpage/pgadmin4"
  
  networks_advanced {
    name         = docker_network.app_network.name
    ipv4_address = "172.22.0.4"
  }
  
  ports {
    internal = 80
    external = 8080
  }
  
  env = [
    "PGADMIN_DEFAULT_EMAIL=admin@admin.com",
    "PGADMIN_DEFAULT_PASSWORD=admin"
  ]
}

# Next.js container
resource "docker_container" "app" {
  name  = "nextjs-server"
  image = "node:18"
  
  networks_advanced {
    name         = docker_network.app_network.name
    ipv4_address = "172.22.0.3"
  }
  
  ports {
    internal = 3000
    external = 3000
  }
  
  volumes {
    container_path = "/app"
    host_path      = "${path.cwd}/geoip-frontend"
  }
  
  env = [
    "DB_USER=geoip",
    "DB_HOST=172.22.0.2",
    "DB_NAME=geoipdb",
    "DB_PASSWORD=password",
    "DB_PORT=5432"
  ]
  
  # Install Python when container starts and keep running
  command = [
    "sh", "-c", 
    "apt-get update && apt-get install -y python3 && tail -f /dev/null"
  ]
}

output "db_ip" {
  value = "172.22.0.2"
}

output "app_ip" {
  value = "172.22.0.3"
}

output "pgadmin_ip" {
  value = "172.22.0.4"
}
