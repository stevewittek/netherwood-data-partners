# Private business operations starter kit

These files are blank operational templates. They are not a CRM, accounting
system, contract, privacy policy or substitute for legal/tax advice.

- `inquiry-register.csv` records minimal inquiry status and next actions.
- `owner-decisions.md` records the business choices that code cannot make.
- `engagement-checklist.md` controls scope, access, testing, acceptance and
  closeout for a real engagement.

Do not populate these tracked copies. Use `pnpm business:prepare --
--destination /approved/private/path` to create owner-only working copies outside
the repository after approving a storage location and retention policy. The
initializer does not overwrite files.

Never record passwords, tokens, private keys, payment-card information, patient
records, full production exports or unnecessary personal information. Keep
client-specific evidence only in the approved client record.
