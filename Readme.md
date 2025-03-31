# Cloud Computing Project

## Projektbeschreibung
Dieses Projekt umfasst die Entwicklung und Bereitstellung einer Web-App, die auf der Azure-Cloud läuft. Die App nutzt sowohl IaaS-, SaaS- als auch PaaS-Dienste und wird mit DevOps-Tools wie Terraform und Ansible verwaltet.

## Anforderungen
### Hauptanforderungen
1. **Infrastruktur**:
   - Aufbau der Infrastruktur in Azure.
   - Verwaltung der Infrastruktur mit Terraform.
   - Replizierbarkeit in mehreren Regionen.

2. **Deployment Automatisierung**:
   - Automatisierung des Deployments mit Ansible.
   - Möglichkeit, entweder:
     - Den Code aus einem GitHub-Repository zu ziehen und zu installieren.
     - Ein fertiges Container-Image zu starten.
   - Konfiguration der App über Ansible, vorzugsweise mit Umgebungsvariablen.

### Bonus Aufgaben
- Implementierung von Tests für die Web-App.
- Aufbau einer CI/CD-Pipeline.
- Einrichtung von Load Balancing.

## Voraussetzungen
- **Azure-Konto**: Für die Bereitstellung der Infrastruktur.
- **Terraform**: Zur Verwaltung der Infrastruktur.
- **Ansible**: Für die Automatisierung des Deployments.
- **Git**: Für die Versionskontrolle.

## Einrichtung
1. **Infrastruktur mit Terraform bereitstellen**:
   - Konfigurieren Sie die Terraform-Skripte für Ihre Azure-Regionen.
   - Führen Sie `terraform init` und `terraform apply` im terraform Ordner aus.

2. **Deployment mit Ansible**:
   - Passen Sie die Ansible-Playbooks an Ihre Anforderungen an.
   - Führen Sie die Playbooks aus, um die App zu deployen und zu konfigurieren. (vom ansible Ordner aus)

3. **Optionale Schritte**:
   - Tests für die Web-App ausführen.

## Bonus Aufgaben
- Alle erwähnten Bonusanforderungen wurden umgesetzt.