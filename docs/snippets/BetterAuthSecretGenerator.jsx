export const BetterAuthSecretGenerator = () => {
  const [secret, setSecret] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~"
    const arr = new Uint8Array(32)
    crypto.getRandomValues(arr)
    const secret = [...arr].map(b => chars[b % 62]).join("")
    return setSecret(secret)
  }

  useEffect(() => {
    generate()
  }, [])

  const copy = () => {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-xl not-prose">
      <div className="font-mono text-sm break-all bg-zinc-950/5 dark:bg-white/5 p-3 rounded-lg">
        {secret || "Generating…"}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={generate}
          className="px-3 py-1.5 text-sm rounded-lg bg-sky-600 text-white dark:bg-sky-600 dark:text-white cursor-pointer"
        >
          Regenerate
        </button>
        <button
          onClick={copy}
          className="px-3 py-1.5 text-sm rounded-lg border dark:border-white/20 cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  )
}