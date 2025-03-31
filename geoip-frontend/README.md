# GeoIP Frontend

## Projektbeschreibung
Die GeoIP-Frontend-Anwendung ermöglicht es Benutzern, IP-Adressen einzugeben und deren geografische Informationen wie Stadt, Land und Koordinaten abzurufen. Die Anwendung nutzt eine Kombination aus APIs und Datenbanken, um präzise Informationen bereitzustellen. Sie wurde mit [Next.js](https://nextjs.org) entwickelt und bietet eine interaktive Benutzeroberfläche.

## Features
- Eingabe von IP-Adressen zur Standortbestimmung.
- Anzeige von Standortinformationen wie Stadt, Land und Koordinaten.
- Interaktive Karte mit Markierungen für die IP-Standorte.
- Unterstützung für mehrere Sprachen und Themes (hell/dunkel).
- Integration von MaxMind GeoIP API(SaaS) und PostgreSQL-Datenbank(PaaS).

## Voraussetzungen
- **Node.js**: Version 16 oder höher.
- **npm**, **yarn**, **pnpm** oder **bun**: Für die Paketverwaltung.
- **PostgreSQL**: Für die Speicherung von Standortdaten.
- **Azure-Konto**: Für die Bereitstellung der Infrastruktur (optional).
- **MaxMind API-Zugangsdaten**: Für die GeoIP-Abfragen.

## Installation
1. **Repository klonen**:
   ```bash
   git clone <repository-url>
   cd geoip-frontend
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   # oder
   yarn install
   ```

3. **Umgebungsvariablen konfigurieren**:
   Erstellen Sie eine `.env`-Datei im Projektverzeichnis und fügen Sie die folgenden Variablen hinzu:
   ```env
   DB_USER=<Ihr-Datenbank-Benutzername>
   DB_HOST=<Ihre-Datenbank-Host-Adresse>
   DB_NAME=<Ihr-Datenbank-Name>
   DB_PASSWORD=<Ihr-Datenbank-Passwort>
   DB_PORT=<Ihr-Datenbank-Port>
   MAXMIND_USER_ID=<Ihr-MaxMind-Benutzername>
   MAXMIND_LICENSE_KEY=<Ihr-MaxMind-Lizenzschlüssel>
   ```

4. **Datenbank einrichten**:
   - Stellen Sie sicher, dass PostgreSQL läuft.
   - Erstellen Sie die erforderlichen Tabellen und initialisieren Sie die Datenbank (SQL-Skripte sind im Projekt enthalten).

5. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   # oder
   yarn dev
   ```

6. **Anwendung öffnen**:
   Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## Tests
- **Unit- und Integrationstests ausführen**:
   ```bash
   npm test
   ```