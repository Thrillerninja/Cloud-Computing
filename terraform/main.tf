# Terraform configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 0.12"
}

# Import keys.tf
module "keys" {
  source = "./keys"
}

# Use keys from keys.tf
provider "azurerm" {
  features {}
  resource_provider_registrations = "none"

  subscription_id = module.keys.subscription_id
  client_id       = module.keys.client_id
  client_secret   = module.keys.client_secret
  tenant_id       = module.keys.tenant_id
}

# Create a resource group
resource "azurerm_resource_group" "rg" {
  name     = "cloud-computing-rg"
  location = "francecentral"
}

# Create a virtual network
resource "azurerm_virtual_network" "vnet" {
  name                = "app-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# Create an application subnet
resource "azurerm_subnet" "subnet" {
  name                 = "app-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Create a Network Security Group
resource "azurerm_network_security_group" "nsg" {
  name                = "vm-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# Allow inbound traffic on ports 22, 80, 3000, 5432, 8080
resource "azurerm_network_security_rule" "allow_ports" {
  count                      = 8
  name                       = "allow-port-${element(["22", "80", "3000", "5050", "5432", "8080", "9090", "19999"], count.index)}"
  priority                   = 100 + count.index
  direction                  = "Inbound"
  access                     = "Allow"
  protocol                   = "Tcp"
  source_port_range          = "*"
  destination_port_range     = element(["22", "80", "3000", "5050", "5432", "8080", "9090", "19999"], count.index)
  source_address_prefix      = "*"
  destination_address_prefix = "*"
  resource_group_name        = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
}

# Associate the NSG with the app subnet
resource "azurerm_subnet_network_security_group_association" "app_subnet_nsg" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# Output MySQL server details
output "azurerm_postgresql_flexible_server_fqdn" {
  value = azurerm_postgresql_flexible_server.db.fqdn
}

output "monitoring_public_ip" {
  value       = azurerm_public_ip.monitoring_pip.ip_address
  depends_on  = [azurerm_public_ip.monitoring_pip]
}

# Output load balancer IP
output "load_balancer_ip" {
  value = azurerm_public_ip.lb_pip.ip_address
}

# Output private IP addresses of the app VMs
output "app_vm_0_private_ip" {
  value = azurerm_network_interface.app_nic[0].private_ip_address
}

output "app_vm_1_private_ip" {
  value = azurerm_network_interface.app_nic[1].private_ip_address
}

# Create inventory.ini file directly with the correct format
resource "local_file" "update_inventory_script" {
  filename = "${path.module}/../ansible/inventory.ini"
  content = <<-EOT
[database]
db ansible_host=${azurerm_postgresql_flexible_server.db.fqdn} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key

[app]
app-0 ansible_host=${azurerm_network_interface.app_nic[0].private_ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ProxyCommand="ssh -W %h:%p -i ../.ssh/ssh_key -o StrictHostKeyChecking=no adminuser@${azurerm_public_ip.monitoring_pip.ip_address}"'
app-1 ansible_host=${azurerm_network_interface.app_nic[1].private_ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ProxyCommand="ssh -W %h:%p -i ../.ssh/ssh_key -o StrictHostKeyChecking=no adminuser@${azurerm_public_ip.monitoring_pip.ip_address}"'

[monitoring]
monitoring ansible_host=${azurerm_public_ip.monitoring_pip.ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key

[loadbalancer]
loadbalancer ansible_host=${azurerm_public_ip.lb_pip.ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key
EOT

  depends_on = [
    azurerm_postgresql_flexible_server.db,
    azurerm_public_ip.monitoring_pip,
    azurerm_public_ip.lb_pip,
    azurerm_linux_virtual_machine.app_vm
  ]
}
