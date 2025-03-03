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
  
  ports {
    internal = 3001
    external = 3001
  }
  
  ports {
    internal = 3002
    external = 3002
  }
  
  ports {
    internal = 3003
    external = 3003
  }
  
  ports {
    internal = 3004
    external = 3004
  }
  
  ports {
    internal = 3005
    external = 3005
  }
  
  ports {
    internal = 3006
    external = 3006
  }
  
  ports {
    internal = 3007
    external = 3007
  }
  
  ports {
    internal = 3008
    external = 3008
  }
  
  ports {
    internal = 3009
    external = 3009
  }
  
  ports {
    internal = 3010
    external = 3010
  }
  
  ports {
    internal = 3011
    external = 3011
  }
  
  ports {
    internal = 3012
    external = 3012
  }
  
  ports {
    internal = 3013
    external = 3013
  }
  
  ports {
    internal = 3014
    external = 3014
  }
  
  ports {
    internal = 3015
    external = 3015
  }
  
  ports {
    internal = 3016
    external = 3016
  }
  
  ports {
    internal = 3017
    external = 3017
  }
  
  ports {
    internal = 3018
    external = 3018
  }
  
  ports {
    internal = 3019
    external = 3019
  }
  
  ports {
    internal = 3020
    external = 3020
  }
  
  ports {
    internal = 3021
    external = 3021
  }
  
  ports {
    internal = 3022
    external = 3022
  }
  
  ports {
    internal = 3023
    external = 3023
  }
  
  ports {
    internal = 3024
    external = 3024
  }
  
  ports {
    internal = 3025
    external = 3025
  }
  
  ports {
    internal = 3026
    external = 3026
  }
  
  ports {
    internal = 3027
    external = 3027
  }
  
  ports {
    internal = 3028
    external = 3028
  }
  
  ports {
    internal = 3029
    external = 3029
  }
  
  ports {
    internal = 3030
    external = 3030
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
