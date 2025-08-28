import { Router, Request, Response } from "express";

const router = Router();

// Example API endpoint
router.get("/example", (_req: Request, res: Response) => {
  res.json({
    message: "This is an example API endpoint",
    data: {
      id: 1,
      name: "Example",
      timestamp: new Date().toISOString(),
    },
  });
});

// Example POST endpoint
router.post("/example", (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Name is required",
    });
  }

  return res.status(201).json({
    message: "Example created successfully",
    data: {
      id: Date.now(),
      name,
      description: description || "",
      timestamp: new Date().toISOString(),
    },
  });
});

export { router as apiRoutes };
