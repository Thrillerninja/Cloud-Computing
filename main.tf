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
  location = "westeurope"
}

# Create a virtual network
resource "azurerm_virtual_network" "vnet" {
  name                = "app-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# Create a subnet
resource "azurerm_subnet" "subnet" {
  name                 = "app-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Create network interfaces for each service
resource "azurerm_network_interface" "db_nic" {
  name                = "db-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.db_pip.id
  }
}

# Create multiple NICs for app VMs
resource "azurerm_network_interface" "app_nic" {
  count               = 2
  name                = "app-nic-${count.index}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_network_interface" "monitoring_nic" {
  name                = "monitoring-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.monitoring_pip.id
  }
}

# Allocate public IP addresses for each service
resource "azurerm_public_ip" "db_pip" {
  name                = "db-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Dynamic"
  sku                 = "Basic"
}

# Create public IP for load balancer
resource "azurerm_public_ip" "lb_pip" {
  name                = "lb-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

# Create load balancer
resource "azurerm_lb" "app_lb" {
  name                = "app-lb"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard"

  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.lb_pip.id
  }
}

# Create backend address pool
resource "azurerm_lb_backend_address_pool" "app_backend_pool" {
  loadbalancer_id = azurerm_lb.app_lb.id
  name            = "AppBackendPool"
}

# Associate NICs with backend pool
resource "azurerm_network_interface_backend_address_pool_association" "app_pool_association" {
  count                   = 2
  network_interface_id    = azurerm_network_interface.app_nic[count.index].id
  ip_configuration_name   = "internal"
  backend_address_pool_id = azurerm_lb_backend_address_pool.app_backend_pool.id
}

# Create health probe
resource "azurerm_lb_probe" "app_probe" {
  loadbalancer_id     = azurerm_lb.app_lb.id
  name                = "http-running-probe"
  port                = 3000
  protocol            = "Http"
  request_path        = "/"
  interval_in_seconds = 15
  number_of_probes    = 2
}

# Create LB rule
resource "azurerm_lb_rule" "app_rule" {
  loadbalancer_id                = azurerm_lb.app_lb.id
  name                           = "http"
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 3000
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.app_backend_pool.id]
  probe_id                       = azurerm_lb_probe.app_probe.id
}

# Create LB rule for SSH
resource "azurerm_lb_rule" "ssh_rule" {
  loadbalancer_id                = azurerm_lb.app_lb.id
  name                           = "ssh"
  protocol                       = "Tcp"
  frontend_port                  = 22
  backend_port                   = 22
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.app_backend_pool.id]
  probe_id                       = azurerm_lb_probe.app_probe.id
}

resource "azurerm_public_ip" "monitoring_pip" {
  name                = "monitoring-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
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

# Associate NSG with network interfaces
resource "azurerm_network_interface_security_group_association" "db_nic_nsg" {
  network_interface_id      = azurerm_network_interface.db_nic.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

resource "azurerm_network_interface_security_group_association" "app_nic_nsg" {
  count                     = 2
  network_interface_id      = azurerm_network_interface.app_nic[count.index].id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

resource "azurerm_network_interface_security_group_association" "monitoring_nic_nsg" {
  network_interface_id      = azurerm_network_interface.monitoring_nic.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# Create virtual machines for each service
resource "azurerm_linux_virtual_machine" "db_vm" {
  name                = "db-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_DS1_v2"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.db_nic.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("${path.module}/.ssh/ssh_key.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts"
    version   = "latest"
  }
}

# Create multiple app VMs
resource "azurerm_linux_virtual_machine" "app_vm" {
  count               = 2  # Create 2 instances
  name                = "app-vm-${count.index}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_DS1_v2"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.app_nic[count.index].id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("${path.module}/.ssh/ssh_key.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts"
    version   = "latest"
  }
}

resource "azurerm_linux_virtual_machine" "monitoring_vm" {
  name                = "monitoring-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_DS1_v2"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.monitoring_nic.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("${path.module}/.ssh/ssh_key.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts"
    version   = "latest"
  }
}

# Output public IP addresses of the services
output "db_public_ip" {
  value       = azurerm_public_ip.db_pip.ip_address   # No public IP address for the database -> Safer configuration  
  depends_on  = [azurerm_public_ip.db_pip]            # Also, the student version has a max of 3 pips
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

# max of 3 public IPs and 4 VMs in student plan

# Create inventory.ini file directly with the correct format
resource "local_file" "update_inventory_script" {
  filename = "${path.module}/ansible/inventory.ini"
  content = <<-EOT
[database]
db ansible_host=${azurerm_public_ip.db_pip.ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key

[app]
app-0 ansible_host=${azurerm_network_interface.app_nic[0].private_ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ProxyCommand="ssh -W %h:%p -i ../.ssh/ssh_key -o StrictHostKeyChecking=no adminuser@${azurerm_public_ip.db_pip.ip_address}"'
app-1 ansible_host=${azurerm_network_interface.app_nic[1].private_ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ProxyCommand="ssh -W %h:%p -i ../.ssh/ssh_key -o StrictHostKeyChecking=no adminuser@${azurerm_public_ip.db_pip.ip_address}"'

[monitoring]
monitoring ansible_host=${azurerm_public_ip.monitoring_pip.ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key

[loadbalancer]
loadbalancer ansible_host=${azurerm_public_ip.lb_pip.ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key
EOT

  depends_on = [
    azurerm_public_ip.db_pip,
    azurerm_public_ip.monitoring_pip,
    azurerm_public_ip.lb_pip,
    azurerm_linux_virtual_machine.app_vm
  ]
}