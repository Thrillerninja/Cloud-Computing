#!/bin/bash

# Debug: Print the current directory and list files
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -l

# Debug: Print the content of update_inventory.sh
echo "Content of update_inventory.sh:"
cat ./update_inventory.sh

# Load the IP addresses from the environment variables
source ./update_inventory.sh

# Debug: Print the loaded environment variables
echo "Loaded environment variables:"
echo "db_public_ip=${db_public_ip}"
echo "pgadmin_public_ip=${pgadmin_public_ip}"
echo "load_balancer_ip=${load_balancer_ip}"

# Update the inventory.ini file
cat <<EOL > inventory.ini
[db]
db ansible_host=${db_public_ip} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key

[pgadmin]
pgadmin ansible_host=${pgadmin_public_ip} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key

[load_balancer]
load_balancer ansible_host=${load_balancer_ip} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key

[app]
app-0 ansible_host=${azurerm_network_interface.app_nic[0].private_ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key
app-1 ansible_host=${azurerm_network_interface.app_nic[1].private_ip_address} ansible_user=adminuser ansible_ssh_private_key_file=../.ssh/ssh_key
EOL

# Debug: Print the content of inventory.ini
echo "Content of inventory.ini:"
cat inventory.ini
pgadmin_public_ip=52.166.169.202 
monitoring_public_ip=40.68.138.43 
