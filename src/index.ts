import { Elysia, t } from "elysia";
import { AntigravityEngine } from "./engines/AntigravityEngine";

const engine = new AntigravityEngine(process.env.GOOGLE_GEMINI_API_KEY || "");

const app = new Elysia()
  .get("/", () => ({ status: "online", message: "Antigravity Engine Active" }))
  .group("/api/v1", (group) =>
    group
      .onBeforeHandle(({ set, headers }) => {
        // Shielding Pattern: Validate GeoFence for all /api/v1 routes
        const lat = parseFloat(headers["x-latitude"] || "");
        const lon = parseFloat(headers["x-longitude"] || "");

        if (isNaN(lat) || isNaN(lon)) {
          set.status = 403;
          return "Luar Jangkauan (Coordinates Missing)";
        }

        if (!engine.validateGeoFence(lat, lon)) {
          set.status = 403;
          return "Luar Jangkauan";
        }
      })
      .post("/leave", async ({ body, set }) => {
        const { reason } = body as { reason: string };
        const filterResult = await engine.smartFilter(reason);

        if (!filterResult.isProfessional) {
          set.status = 400;
          return {
            error: "Unprofessional Content Detected",
            reason: filterResult.reason,
          };
        }

        return { status: "success", message: "Leave request submitted" };
      }, {
        body: t.Object({
          reason: t.String()
        })
      })
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
