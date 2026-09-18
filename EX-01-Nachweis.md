# EX-01: GitHub Actions auf AWS EC2

Tim Held · M324 · 18.09.2026

## Ausgangslage

Mein privates Repository ist [AdminGodZ/bbw-m324-biztrips-actions-aws-ec2](https://github.com/AdminGodZ/bbw-m324-biztrips-actions-aws-ec2). Die ausführliche Anleitung liegt unter [docs/exercises/EX-01-deploy-AWS-EC2.md](docs/exercises/EX-01-deploy-AWS-EC2.md).

Der erste Workflow lief am 18.09.2026 bei Commit `a553a2c`. Test und Build waren erfolgreich. Der Job `Deploy auf EC2` scheiterte bei `SSH-Key einrichten`, weil im Environment `production` die drei EC2-Secrets fehlten.

## Umsetzung

1. Die bestehende React/Vite-Vorlage im eigenen Repository verwendet. Sie enthielt bereits die Musterlösung mit Deployment und Docker Hub. Für diese erste Übung den Docker-Hub-Job entfernt.
2. Die Pipeline auf `test → build → deploy` begrenzt. Ein Pull Request führt Test und Build aus. Nur `main` darf deployen, auch beim manuellen Start.
3. Die zwei Rechenbeispiele durch drei Tests der tatsächlichen App ersetzt: alle Reisen anzeigen, nach Februar filtern und zurücksetzen, leeren Januar anzeigen.
4. Den Deploy-Job um eine Prüfung der Secrets ergänzt. Der private Schlüssel wird über eine Umgebungsvariable in eine temporäre Datei geschrieben und anschliessend auch bei Fehlern entfernt.
5. Eine eigene EC2-Instanz `biztrips-github` erstellt: `i-05d176764e9006549`, Typ `t3.micro`, Amazon Linux 2023, Region `us-east-1`. Die bestehende Instanz `biztrips-gitlab` bleibt unverändert. Die neue Instanz nutzt denselben Lab-Schlüssel und die vorhandenen Netzwerkregeln.
6. nginx und rsync über das mitgelieferte [Setup-Script](docs/deployment/setup-ec2.sh) eingerichtet. Die Ubuntu-Befehle aus der Vorlage passen nicht direkt zu Amazon Linux.

## Konfiguration

| Einstellung | Wert bzw. Ablage |
| --- | --- |
| GitHub Environment | `production` |
| `EC2_HOST` | Environment-Secret, aktuelle öffentliche EC2-Adresse |
| `EC2_USER` | Environment-Secret, `ec2-user` |
| `EC2_SSH_KEY` | Environment-Secret, privater Lab-Schlüssel, niemals im Repository |
| `VITE_API_BASE_URL` | Repository-Variable; die aktuelle Reiseanzeige nutzt feste Daten und ruft keine API auf |
| `VITE_IMGS` | Repository-Variable, `items` |
| Build-Verzeichnis | `dist/` |
| Webverzeichnis | `/var/www/biztrips` |

Die Build-Dateien werden als GitHub-Artefakt gespeichert. Der Deploy-Job lädt dieses Artefakt herunter, überträgt es per SSH/rsync und prüft nginx vor dem Neuladen.

## Weshalb die Anleitung zuerst unklar war

Das PDF enthält nur den Arbeitsauftrag und verweist auf eine Markdown-Datei. Im Repository ist sie unter `docs/exercises/EX-01-deploy-AWS-EC2.md` zu finden. Ausserdem wurde hier bereits `main` mit der Musterlösung übernommen. Der in der Anleitung erwähnte Ausgangspunkt `v1-start` enthält dagegen nur Test und Build. Diese Abweichung ist im Nachweis bewusst festgehalten.

Auf Amazon Linux wäre die einmalige Installation `sudo dnf install -y nginx rsync`. Das Setup für die neue GitHub-Instanz steht vollständig im Repository. nginx verwendet hier `/etc/nginx/nginx.conf` und liefert `/var/www/biztrips` auf Port 80 aus.

## Prüfstand

- Lokal: drei App-Tests erfolgreich, Produktions-Build erfolgreich.
- GitHub mit den neuen Änderungen: noch ausstehend.
- Deployment und Browsernachweis: noch ausstehend.

## Reflexion

1. Environment-Secrets stehen Jobs zur Verfügung, die `production` verwenden. Zusätzliche Freigabe- und Branchregeln können den Zugriff weiter begrenzen.
2. Der Build verwendet Repository-Variables, weil er kein Environment zugewiesen hat. `VITE_`-Werte können im Browser-Bundle sichtbar werden und dürfen keine Geheimnisse enthalten.
3. Die Bedingung auf `main` verhindert, dass ein Pull Request den laufenden Stand ersetzt. Fork-Pull-Requests erhalten standardmässig ohnehin keine normalen Actions-Secrets. Die Branchbedingung ersetzt keine sorgfältige Rechtevergabe.
4. `if: always()` sorgt dafür, dass der Aufräumschritt auch nach einem Fehler ausgeführt wird. Bei einem vollständigen Ausfall des Runners kann kein Schritt garantiert ausgeführt werden.

## Quellen

- [Übungsanleitung im Projekt](docs/exercises/EX-01-deploy-AWS-EC2.md)
- [GitHub: Deployment-Environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [AWS: Paketverwaltung von Amazon Linux 2023](https://docs.aws.amazon.com/linux/al2023/ug/package-management.html)
