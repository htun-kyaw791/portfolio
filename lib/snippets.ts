// Code for the arcade typing test. Lines stay under ~32 characters so they fit
// the 240px board without wrapping.

export type Snippet = { file: string; code: string };

export const snippets: readonly Snippet[] = [
  {
    file: "OrderController.php",
    code: `$orders = Order::query()
  ->where('status', 'paid')
  ->with('customer')
  ->latest()
  ->paginate(20);`,
  },
  {
    file: "Counter.tsx",
    code: `const [count, setCount] =
  useState(0);

useEffect(() => {
  document.title = \`\${count}\`;
}, [count]);`,
  },
  {
    file: "approval.py",
    code: `class Request(models.Model):
    _name = 'approval.request'
    name = fields.Char()
    amount = fields.Float()`,
  },
  {
    file: "result.ts",
    code: `type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };`,
  },
  {
    file: "List.vue",
    code: `const props = defineProps<{
  items: string[]
}>()
const total = computed(
  () => props.items.length
)`,
  },
  {
    file: "server.js",
    code: `app.get('/health', (_, res) =>
  res.json({ ok: true })
);`,
  },
];
