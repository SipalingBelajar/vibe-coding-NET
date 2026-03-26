import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { Antigravity } from "./engine/antigravity";
import { db } from "./db";
import { attendances, submissions } from "./db/schema";

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'SCD Smart Attendance API',
        version: '1.0.0'
      }
    }
  }))
  .get("/", () => ({ status: "online", message: "SCD Smart Attendance Active" }))
  .group("/api/v1", (group) =>
    group
      .post("/attendance/check-in", async ({ body, set }) => {
        const { userId, lat, lng } = body;
        
        const geoCheck = Antigravity.validateRequest(lat, lng);
        if (!geoCheck.allowed) {
          set.status = 403;
          return { error: geoCheck.message };
        }

        // Save to Database
        await db.insert(attendances).values({
          userId: userId,
          clockIn: new Date(),
          status: "Present"
        });

        return { status: "success", message: "Check-in successful" };
      }, {
        body: t.Object({
          userId: t.Number(),
          lat: t.Number(),
          lng: t.Number()
        })
      })
      .post("/submission/leave", async ({ body, set }) => {
        const { reason } = body;
        
        const reasonCheck = await Antigravity.checkReason(reason);
        if (!reasonCheck.valid) {
          set.status = 400;
          return { error: "Alasan tidak sopan atau tidak profesional!" };
        }

        // Save to Database
        await db.insert(submissions).values({
          reason: reason,
          valid: "true",
          createdAt: new Date()
        });

        return { status: "success", message: "Leave request submitted" };
      }, {
        body: t.Object({
          reason: t.String()
        })
      })
  )
  .listen(3000);

console.log(
  `🚀 SCD Smart Attendance is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(`📑 Swagger docs available at http://localhost:3000/docs`);
