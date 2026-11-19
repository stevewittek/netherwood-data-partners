# Chatbot API implementation review — 2026-11-19

Owner direction: build the Netherwood website assistant using the supplied dedicated OpenAI key; preserve the site; restrict scope to business/technical discovery; use available credits and stop when unavailable. This work adds an independent service; existing SQL/Ollama/API consumers are preserved. Local key reuse and build were explicitly reconfirmed by the owner. No additional credential permissions, publication or spending plan was enabled.

| Guidance | Applicability and decision | Implementation/evidence |
|---|---|---|
| Model selection | Preserve the existing appropriate gpt-5.4-mini model for short business replies; no silent upgrade | provider.ts; live service answer and source links verified |
| Instruction filenames | No migration of repository instructions | AGENTS.md unchanged |
| Responses API | Supported, adopted for new dedicated path | POST /v1/responses; legacy providers unchanged |
| Streaming | Complete-response validation preferred for citations and cost settlement | No partial/unvalidated answer published |
| WebSockets | Not applicable to bounded text turns without tool loops | HTTP with a 25-second model timeout; no auto retry |
| Zero Data Retention | Not asserted or requested as an account entitlement | store:false; explicit privacy explanation of separate provider retention |
| Data residency | No regional restriction supplied; existing Global project verified | Standard endpoint; no claimed regional processing |
| Processing tiers | Standard selected for predictable price | service_tier:default; no Priority, Flex, Batch or Reserved workload |
| Prompt cache keys | Stable business instructions on a pre-5.6 model | netherwood-website-v1; no visitor-specific prefix |
| Extended cache retention | Not adopted; no need to expand retention | Default retention only |
| Explicit cache breakpoints | Not applicable to this selected model | No unsupported fields sent |
| Cache diagnostics | Not applicable to this small model-specific integration | No comparison IDs or 5.6-specific fields |
| State management | Short local history; no server-side OpenAI chain | Random bearer token hashed at rest; tab storage; bounded history restored from own session |
| Instruction persistence | Resend durable instructions on every turn | Top-level instructions and approved evidence precede history |
| Encrypted reasoning | Not applicable to reasoning:none text turns without tools | No reasoning items synthesized or replayed |
| Reasoning effort | Preserve supported default none for latency/cost | Explicit field; live request succeeded |
| Reasoning preservation | No reasoning loop; short history | Last four prior turns sent; local last five exchanges retained |
| Reasoning summaries/preambles | Not applicable; no tools or visible reasoning stream | Business answer only |
| Verbosity | Concise application instruction; no new model verbosity override | Existing output budget retained |
| Maximum output tokens | Existing 500-token cap retained | Cost reservation covers full output allowance; incomplete answers rejected |
| Assistant phases | Not applicable to one final answer and no tool loop | Structured result validated before publish |
| Compaction | Not applicable to 20-turn sessions with bounded replay | No paid compaction or infinite conversation |
| Structured outputs | Adopted for answer, source IDs and topic | Strict JSON schema; source allowlist and usage validation tests |
| Tool choice | No model tools; owner requested bounded representative | No browse, SQL execution, shell, email, booking or spending tool |
| Tool search/additional tools | Not applicable | Small local read-only retrieval, no tool catalog |
| Parallel tools | Not applicable | Two bounded independent model calls; one per session |
| Programmatic tool calling | Not applicable | No model-controlled execution environment |
| Model-aligned tool interfaces | Not applicable | No repository or patch tools exposed to visitors |
| Scope evaluation | One live test offered unrelated fiction; corrected before handoff | Deterministic redirects + stronger instructions; regression test added |
| Credit and usage | Persistent conservative reservations; no calendar reset | Concurrent/duplicate/quota/expiry/overrun tests; actual account credits verified with auto-reload off |
| Voice | Local device read-aloud implemented when a local voice is available | Custom microphone/Realtime deferred pending a separate bounded audio design and testing |

Official references checked: [gpt-5.4-mini model and pricing](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs), [API data controls](https://platform.openai.com/docs/guides/your-data).

Remaining release work: approved HTTPS hosting/gateway, renewable credit verification, public-origin end-to-end checks, manual VoiceOver/NVDA/mobile keyboard checks, owner notification destination and delivery validation. The local build is not a production deployment. No broader provider migration is proposed.
