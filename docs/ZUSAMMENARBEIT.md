# Zusammenarbeit im Repo

Zwei Claude-Instanzen arbeiten hier, Dominik gibt frei. Keine der beiden kann der anderen direkt schreiben. Die Abstimmung läuft deshalb über Dateien und Pull Requests in diesem Repo.

## Rollen

| Wer | Macht | Besitzt (nur diese Instanz ändert die Dateien) |
|---|---|---|
| Coding-Instanz | App, Backend, Tests, CI, technische Doku und alle Texte, auch `content/` (seit 01.10.2026, Entscheidung Dominik) | alles außer den zwei Dateien der Begleitinstanz |
| Begleitinstanz | Reviews und Feedback zu Code und Texten, Recherche (Regionen, Anbieter, Recht), Einrichtung mit Dominik | `docs/REVIEW.md`, `docs/ZUSAMMENARBEIT.md` |
| Dominik | Konten, Schlüssel, Entscheidungen, Freigaben | – |

Eine Instanz ändert nie Dateien der anderen. Braucht sie dort etwas, schreibt sie es auf (siehe Kanäle).

## Branches

- `main` ist der einzige gemeinsame Branch. Kein `--force`, kein Rebase und kein Amend auf `main`.
- Coding-Instanz: ein Pull Request pro Thema gegen `main`. Sie mergt selbst, wenn `npm run check:all` grün ist.
- Begleitinstanz: arbeitet auf `begleit/<thema>` und mergt nur Änderungen an ihren eigenen Dateien selbst nach `main`.
- Vor jeder neuen Arbeit: `git fetch origin` und auf dem aktuellen `main` aufsetzen.

## Kanäle

- **Coding-Instanz → Begleitinstanz:** Abschnitt „Frage an die Begleitinstanz“ in der Beschreibung des Pull Requests. Die Begleitinstanz liest jeden PR.
- **Begleitinstanz → Coding-Instanz:** `docs/REVIEW.md`. Einträge haben eine ID (R1, R2 …) und eine Stufe: MUSS vor dem nächsten Merge, SOLLTE im nächsten passenden PR, INFO. Die Coding-Instanz liest die Datei vor jedem neuen PR und nennt im PR die IDs, die er erledigt. Die Begleitinstanz hakt sie nach Prüfung ab.
- **Beide → Dominik:** direkt im jeweiligen Chat, nur wenn wirklich er gebraucht wird (Konto, Schlüssel, Entscheidung). Was er für den ersten Testbuild tun muss, steht gesammelt in `docs/SETUP.md`.

## Inhalte

- Alle Texte, auch `content/`, schreibt und pflegt die Coding-Instanz. Die Begleitinstanz gibt Feedback in `docs/REVIEW.md` und ändert keine Texte selbst.
- Rechtstexte in `content/rechtliches/` sind Entwürfe, bis Dominik sie freigibt (Feld `status` im Frontmatter). Die App zeigt sie mit sichtbarer Kennzeichnung „Entwurf“, solange `status: entwurf` gilt.
- Alle Texte müssen die Claims-Prüfung der App bestehen und durchgehend in einer Sprache erscheinen.
