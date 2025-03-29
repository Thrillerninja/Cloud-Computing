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

# Allocate public IP addresses for each service
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

# Associate NSG with network interfaces
resource "azurerm_network_interface_security_group_association" "app_nic_nsg" {
  count                     = 2
  network_interface_id      = azurerm_network_interface.app_nic[count.index].id
  network_security_group_id = azurerm_network_security_group.nsg.id
  depends_on                = [azurerm_network_interface.app_nic]
}

# VMs
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
    public_key = file("${path.module}/../.ssh/ssh_key.pub")
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