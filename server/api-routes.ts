import express from "express";
import { storage } from "./storage";
import { createHabitSchema } from "@shared/schema";

export function createApiRoutes() {
  const router = express.Router();

  // Habit routes
  router.get("/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  router.post("/habits", async (req, res) => {
    try {
      const validatedData = createHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData.name, validatedData.type);
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(400).json({ error: "Invalid habit data" });
    }
  });

  router.delete("/habits/:id", async (req, res) => {
    try {
      await storage.deleteHabit(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  // Habit log routes
  router.get("/habits/:id/logs", async (req, res) => {
    try {
      const logs = await storage.getLogsByHabit(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  router.post("/habits/:id/track", async (req, res) => {
    try {
      const { completed } = req.body;
      const log = await storage.createLog(req.params.id, completed);
      res.json(log);
    } catch (error) {
      console.error("Error tracking habit:", error);
      res.status(500).json({ error: "Failed to track habit" });
    }
  });

  // Settings routes
  router.get("/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  router.put("/settings", async (req, res) => {
    try {
      await storage.updateSettings(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  return router;
}
