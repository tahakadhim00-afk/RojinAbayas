# عبايات روجين — Order Completion Page

A single-page Arabic (RTL) order form. A customer submits their details and the
order is delivered to the store's Telegram chat. No database, no accounts, no
payment — V1 collects order information and gets it to whoever processes orders.

Built with Next.js (App Router), TypeScript, Tailwind CSS, React Hook Form and Zod.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:3000
```

### Telegram credentials

| Variable | How to get it |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Create a bot with [@BotFather](https://t.me/BotFather) and copy the token. |
| `TELEGRAM_CHAT_ID` | Send any message to the bot, open `https://api.telegram.org/bot<TOKEN>/getUpdates`, read `result[0].message.chat.id`. |

Both are read only on the server. They are never bundled into client JavaScript
and never sent to the browser.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel — the Next.js preset needs no configuration.
3. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` under **Settings → Environment
   Variables** (Production, and Preview if you want previews to work).
4. Deploy, then submit one real order to confirm it arrives in Telegram.

Changing environment variables requires a redeploy to take effect.

## Project layout

```
src/
  app/
    layout.tsx           RTL document, local font loading, metadata
    page.tsx             Logo, title, form
    globals.css          Tailwind theme + brand tokens
    api/order/route.ts   POST /api/order — validate, rate limit, send
  components/
    OrderForm.tsx        The form: client validation, submit, error state
    Field.tsx            Label + error + shared control styling
    SuccessState.tsx     Post-submission confirmation
  lib/
    schema.ts            Zod schema shared by client and server
    constants.ts         Governorates, sizes, measurement bounds
    telegram.ts          Message formatting and Bot API call
    rate-limit.ts        In-memory sliding window
    order-id.ts          ROJIN-XXXXXX generation
public/
  logo.png               Brand logo
  fonts/                 Thmanyah Sans (Regular/Medium/Bold)
```

## Notes for whoever picks this up next

- **Validation lives in one place.** `src/lib/schema.ts` is used by both the form
  and the API route, so client and server can't drift apart. Server-side
  validation is the one that counts — the client's copy is only for fast feedback.
- **Phone numbers are normalized, not just checked.** `07..`, `+964..`, `00964..`,
  spaces, dashes and Arabic-Indic digits all reduce to `07XXXXXXXXX` before
  validation, so Telegram always shows one consistent format.
- **Rate limiting is per serverless instance.** It uses in-memory state, which
  means limits are not global across Vercel instances. That is a deliberate V1
  tradeoff (zero added infrastructure) and it stops casual scripted spam. If spam
  becomes a real problem, replace `src/lib/rate-limit.ts` with Vercel KV/Upstash
  or add Cloudflare Turnstile — nothing else needs to change.
- **A filled honeypot gets a fake success.** Bots receive `200` with an order ID
  but nothing is sent to Telegram, so they get no signal about what was detected.
- **Customer text is HTML-escaped** before being placed in the Telegram message,
  which uses HTML parse mode. Don't switch to Markdown parse mode without
  changing the escaping in `src/lib/telegram.ts` to match.
- **Adding a governorate** means editing `src/lib/constants.ts` only; the dropdown
  and the validation both read from there.
- **Size is free text, not a dropdown.** Rojin uses brand-specific numeric sizes
  (42, 46) alongside letter sizes (L, XL), so an enum would reject legitimate
  values. It is bounded by length (`SIZE_MAX_LENGTH`) and still required, and
  Arabic-Indic digits are normalized so "٤٢" reaches Telegram as "42".
- **The note field is optional and normalizes to `undefined`.** Empty and
  whitespace-only values are dropped by the schema, and the Telegram message
  omits the whole 📝 section rather than showing an empty heading.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```
