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

resource "azurerm_network_interface_security_group_association" "monitoring_nic_nsg" {
  network_interface_id      = azurerm_network_interface.monitoring_nic.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}



resource "azurerm_public_ip" "monitoring_pip" {
  name                = "monitoring-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
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