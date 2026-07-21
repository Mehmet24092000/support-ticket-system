const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

let tickets = [
  {
    id: 1,
    title: "Laptop startet nicht",
    description:
      "Der Laptop fährt seit heute Morgen nicht mehr hoch und zeigt nur einen schwarzen Bildschirm.",
    category: "Hardware",
    priority: "Hoch",
    status: "Offen",
    createdBy: "Max Müller",
    assignedTo: "Support Team",
    createdAt: "2026-07-11",
    comments: [
      {
        id: 1,
        author: "Support Team",
        text: "Ticket wurde aufgenommen und wird geprüft.",
      },
    ],
  },
  {
    id: 2,
    title: "Passwort zurücksetzen",
    description:
      "Ich kann mich nicht mehr im internen System anmelden und benötige ein neues Passwort.",
    category: "Account",
    priority: "Mittel",
    status: "In Bearbeitung",
    createdBy: "Anna Schmidt",
    assignedTo: "Mehmet",
    createdAt: "2026-07-11",
    comments: [],
  },
  {
    id: 3,
    title: "Drucker verbindet sich nicht",
    description: "Der Bürodrucker wird nicht mehr im Netzwerk angezeigt.",
    category: "Netzwerk",
    priority: "Niedrig",
    status: "Erledigt",
    createdBy: "Lukas Weber",
    assignedTo: "Support Team",
    createdAt: "2026-07-10",
    comments: [
      {
        id: 1,
        author: "Mehmet",
        text: "Drucker wurde neu verbunden. Problem gelöst.",
      },
    ],
  },
];

app.get("/", (req, res) => {
  res.json({
    message: "IT Support Ticket System API läuft",
  });
});

app.get("/api/tickets", (req, res) => {
  res.json(tickets);
});

app.post("/api/tickets", (req, res) => {
  const { title, description, category, priority, createdBy } = req.body;

  if (!title || !description || !category || !priority || !createdBy) {
    return res.status(400).json({
      message: "Bitte alle Pflichtfelder ausfüllen.",
    });
  }

  const newTicket = {
    id: Date.now(),
    title,
    description,
    category,
    priority,
    status: "Offen",
    createdBy,
    assignedTo: "Nicht zugewiesen",
    createdAt: new Date().toISOString().split("T")[0],
    comments: [],
  };

  tickets.unshift(newTicket);

  res.status(201).json(newTicket);
});

app.patch("/api/tickets/:id/status", (req, res) => {
  const ticketId = Number(req.params.id);
  const { status } = req.body;

  const allowedStatuses = ["Offen", "In Bearbeitung", "Erledigt"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Ungültiger Status.",
    });
  }

  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket nicht gefunden.",
    });
  }

  ticket.status = status;

  res.json(ticket);
});

app.patch("/api/tickets/:id/assign", (req, res) => {
  const ticketId = Number(req.params.id);
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({
      message: "Bitte einen Bearbeiter angeben.",
    });
  }

  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket nicht gefunden.",
    });
  }

  ticket.assignedTo = assignedTo;

  res.json(ticket);
});

app.post("/api/tickets/:id/comments", (req, res) => {
  const ticketId = Number(req.params.id);
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({
      message: "Autor und Kommentar sind erforderlich.",
    });
  }

  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket nicht gefunden.",
    });
  }

  const newComment = {
    id: Date.now(),
    author,
    text,
  };

  ticket.comments.push(newComment);

  res.status(201).json(ticket);
});

app.delete("/api/tickets/:id", (req, res) => {
  const ticketId = Number(req.params.id);

  tickets = tickets.filter((ticket) => ticket.id !== ticketId);

  res.json({
    message: "Ticket gelöscht.",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`IT Support Ticket System API läuft auf Port ${PORT}`);
});