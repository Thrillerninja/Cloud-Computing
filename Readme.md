## Cloud Computing

### Anforderungen
Eine Web-App, die auf Azure-Cloud läuft und einen SaaS und einen PaaS Service nutzt.

- Die Infrastruktur soll in Azure aufgebaut und durch Terraform verwaltet werden
    (Soll theorethisch in mehreren Regionen replizierbar sein)
- Deployment Automatisierung mit Ansible
    Hierbei können ihr entweder den Code aus einem GitHub
    Repository ziehen und installieren oder ein fertiges Container-Image starten. Die
    Konfiguration der App soll ebenfalls über Ansible erfolgen, vorzugsweise über
    Umgebungsvariablen.

Bonus Punkte:
- Tests für die Web-App
- Aufbau einer CI/CD Pipeline
- Load balancing