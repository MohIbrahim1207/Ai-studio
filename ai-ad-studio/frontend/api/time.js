export default (req, res) => {
  const now = new Date()
  res.status(200).json({ ok: true, time: now.toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
}
