# Add a random string resource to generate a unique suffix
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Create a database subnet with proper delegation
resource "azurerm_subnet" "db_subnet" {
  name                 = "db-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
  service_endpoints    = ["Microsoft.Storage"]
  
  delegation {
    name = "db-delegation"

    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# Create a private DNS zone for the database
resource "azurerm_private_dns_zone" "db" {
  name                = "uniquedb-${random_string.suffix.result}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "db" {
  name                  = "postgres-dns-link"
  private_dns_zone_name = azurerm_private_dns_zone.db.name
  resource_group_name   = azurerm_resource_group.rg.name
  virtual_network_id    = azurerm_virtual_network.vnet.id
  registration_enabled  = true
}

# Create a firewall rule to allow service access to MySQL server
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}



# MySQL Flexible Server
resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "postgres-${random_string.suffix.result}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  administrator_login    = module.keys.administrator_login
  administrator_password = module.keys.administrator_password
  backup_retention_days  = 7
  version                = "13" # PostgreSQL version
  
  sku_name               = "B_Standard_B1ms" # Adjust SKU as needed
  
  delegated_subnet_id    = azurerm_subnet.db_subnet.id
  private_dns_zone_id    = azurerm_private_dns_zone.db.id
  
  public_network_access_enabled = false # Ensure public network access is disabled

  depends_on = [
    azurerm_private_dns_zone_virtual_network_link.db
  ]
}

# Create database
resource "azurerm_postgresql_flexible_server_database" "default_db" {
  name                = module.keys.database_name
  server_id           = azurerm_postgresql_flexible_server.db.id
}