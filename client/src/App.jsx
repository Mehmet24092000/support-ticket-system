import { useEffect, useMemo, useState } from "react";
import "./index.css";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5002"
}/api/tickets`;

function App() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("Support");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Alle");
  const [priorityFilter, setPriorityFilter] = useState("Alle");

  const [commentInputs, setCommentInputs] = useState({});
  const [assignInputs, setAssignInputs] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Hardware",
    priority: "Mittel",
    createdBy: "",
  });

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setIsLoading(true);

    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Fehler beim Laden der Tickets:", error);
      alert("Backend nicht erreichbar. Prüfe, ob der Server auf Port 5002 läuft.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createTicket(event) {
    event.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.priority ||
      !formData.createdBy
    ) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Ticket konnte nicht erstellt werden.");
        return;
      }

      setTickets((currentTickets) => [data, ...currentTickets]);

      setFormData({
        title: "",
        description: "",
        category: "Hardware",
        priority: "Mittel",
        createdBy: "",
      });
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      alert("Ticket konnte nicht erstellt werden.");
    }
  }

  async function updateStatus(ticketId, newStatus) {
    try {
      const response = await fetch(`${API_URL}/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedTicket = await response.json();

      if (!response.ok) {
        alert(updatedTicket.message || "Status konnte nicht geändert werden.");
        return;
      }

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket
        )
      );
    } catch (error) {
      console.error("Fehler beim Status-Update:", error);
      alert("Status konnte nicht geändert werden.");
    }
  }

  async function assignTicket(ticketId) {
    const assignedTo = assignInputs[ticketId];

    if (!assignedTo || !assignedTo.trim()) {
      alert("Bitte Bearbeiter eingeben.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${ticketId}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignedTo }),
      });

      const updatedTicket = await response.json();

      if (!response.ok) {
        alert(updatedTicket.message || "Bearbeiter konnte nicht geändert werden.");
        return;
      }

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket
        )
      );

      setAssignInputs((currentInputs) => ({
        ...currentInputs,
        [ticketId]: "",
      }));
    } catch (error) {
      console.error("Fehler beim Zuweisen:", error);
      alert("Bearbeiter konnte nicht geändert werden.");
    }
  }

  async function addComment(ticketId) {
    const commentText = commentInputs[ticketId];

    if (!commentText || !commentText.trim()) {
      alert("Bitte Kommentar eingeben.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: role,
          text: commentText,
        }),
      });

      const updatedTicket = await response.json();

      if (!response.ok) {
        alert(updatedTicket.message || "Kommentar konnte nicht hinzugefügt werden.");
        return;
      }

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket
        )
      );

      setCommentInputs((currentInputs) => ({
        ...currentInputs,
        [ticketId]: "",
      }));
    } catch (error) {
      console.error("Fehler beim Kommentar:", error);
      alert("Kommentar konnte nicht hinzugefügt werden.");
    }
  }

  async function deleteTicket(ticketId) {
    const confirmDelete = confirm("Möchtest du dieses Ticket wirklich löschen?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${ticketId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Ticket konnte nicht gelöscht werden.");
        return;
      }

      setTickets((currentTickets) =>
        currentTickets.filter((ticket) => ticket.id !== ticketId)
      );
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      alert("Ticket konnte nicht gelöscht werden.");
    }
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = `${ticket.title} ${ticket.description} ${ticket.createdBy} ${ticket.assignedTo}`.toLowerCase();

      const matchesSearch = searchText.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "Alle" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "Alle" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Offen").length,
      inProgress: tickets.filter((ticket) => ticket.status === "In Bearbeitung")
        .length,
      done: tickets.filter((ticket) => ticket.status === "Erledigt").length,
      high: tickets.filter((ticket) => ticket.priority === "Hoch").length,
    };
  }, [tickets]);

  function getPriorityClass(priority) {
    if (priority === "Hoch") return "priority-high";
    if (priority === "Mittel") return "priority-medium";
    return "priority-low";
  }

  function getStatusClass(status) {
    if (status === "Offen") return "status-open";
    if (status === "In Bearbeitung") return "status-progress";
    return "status-done";
  }

  const canManageTickets = role === "Support" || role === "Admin";
  const canDeleteTickets = role === "Admin";

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="label">IT Support Ticket System</p>
          <h1>Tickets verwalten, Workflows steuern und Support-Prozesse überblicken</h1>
          <p>
            Eine Fullstack-Web-App für interne IT-Support-Prozesse mit Dashboard,
            Ticket-Erstellung, Status-Workflow, Kommentaren und einfacher Rollenlogik.
          </p>
        </div>

        <div className="role-card">
          <span>Aktuelle Rolle</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option>Mitarbeiter</option>
            <option>Support</option>
            <option>Admin</option>
          </select>
          <p>
            {role === "Mitarbeiter" &&
              "Mitarbeiter können neue Tickets erstellen und Tickets ansehen."}
            {role === "Support" &&
              "Support kann Tickets bearbeiten, zuweisen und kommentieren."}
            {role === "Admin" &&
              "Admin kann zusätzlich Tickets löschen."}
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Gesamt</span>
          <strong>{stats.total}</strong>
        </article>

        <article className="stat-card">
          <span>Offen</span>
          <strong>{stats.open}</strong>
        </article>

        <article className="stat-card">
          <span>In Bearbeitung</span>
          <strong>{stats.inProgress}</strong>
        </article>

        <article className="stat-card">
          <span>Erledigt</span>
          <strong>{stats.done}</strong>
        </article>

        <article className="stat-card warning">
          <span>Hohe Priorität</span>
          <strong>{stats.high}</strong>
        </article>
      </section>

      <section className="content-grid">
        <section className="form-card">
          <div className="section-header">
            <p className="label">Neues Ticket</p>
            <h2>Support-Anfrage erstellen</h2>
          </div>

          <form onSubmit={createTicket}>
            <input
              placeholder="Titel, z. B. Laptop startet nicht"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
            />

            <textarea
              placeholder="Beschreibung des Problems..."
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
            />

            <div className="form-row">
              <select
                value={formData.category}
                onChange={(event) =>
                  setFormData({ ...formData, category: event.target.value })
                }
              >
                <option>Hardware</option>
                <option>Software</option>
                <option>Account</option>
                <option>Netzwerk</option>
                <option>Sonstiges</option>
              </select>

              <select
                value={formData.priority}
                onChange={(event) =>
                  setFormData({ ...formData, priority: event.target.value })
                }
              >
                <option>Niedrig</option>
                <option>Mittel</option>
                <option>Hoch</option>
              </select>
            </div>

            <input
              placeholder="Erstellt von, z. B. Tunc Mehmet"
              value={formData.createdBy}
              onChange={(event) =>
                setFormData({ ...formData, createdBy: event.target.value })
              }
            />

            <button type="submit">Ticket erstellen</button>
          </form>
        </section>

        <section className="ticket-section">
          <div className="section-header">
            <p className="label">Dashboard</p>
            <h2>Ticket-Übersicht</h2>
          </div>

          <div className="filters">
            <input
              placeholder="Tickets suchen..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Alle</option>
              <option>Offen</option>
              <option>In Bearbeitung</option>
              <option>Erledigt</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option>Alle</option>
              <option>Niedrig</option>
              <option>Mittel</option>
              <option>Hoch</option>
            </select>
          </div>

          {isLoading && <p className="info-text">Tickets werden geladen...</p>}

          {!isLoading && filteredTickets.length === 0 && (
            <p className="info-text">Keine Tickets gefunden.</p>
          )}

          <div className="ticket-list">
            {filteredTickets.map((ticket) => (
              <article className="ticket-card" key={ticket.id}>
                <div className="ticket-top">
                  <div>
                    <h3>{ticket.title}</h3>
                    <p>{ticket.description}</p>
                  </div>

                  <div className="badge-group">
                    <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`badge ${getStatusClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div className="meta-grid">
                  <span>
                    <strong>Kategorie:</strong> {ticket.category}
                  </span>
                  <span>
                    <strong>Erstellt von:</strong> {ticket.createdBy}
                  </span>
                  <span>
                    <strong>Bearbeiter:</strong> {ticket.assignedTo}
                  </span>
                  <span>
                    <strong>Datum:</strong> {ticket.createdAt}
                  </span>
                </div>

                {canManageTickets && (
                  <div className="actions">
                    <select
                      value={ticket.status}
                      onChange={(event) =>
                        updateStatus(ticket.id, event.target.value)
                      }
                    >
                      <option>Offen</option>
                      <option>In Bearbeitung</option>
                      <option>Erledigt</option>
                    </select>

                    <input
                      placeholder="Bearbeiter zuweisen"
                      value={assignInputs[ticket.id] || ""}
                      onChange={(event) =>
                        setAssignInputs({
                          ...assignInputs,
                          [ticket.id]: event.target.value,
                        })
                      }
                    />

                    <button onClick={() => assignTicket(ticket.id)}>
                      Zuweisen
                    </button>

                    {canDeleteTickets && (
                      <button
                        className="danger-btn"
                        onClick={() => deleteTicket(ticket.id)}
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                )}

                <div className="comments">
                  <h4>Kommentare</h4>

                  {ticket.comments.length === 0 && (
                    <p className="muted-text">Noch keine Kommentare.</p>
                  )}

                  {ticket.comments.map((comment) => (
                    <div className="comment" key={comment.id}>
                      <strong>{comment.author}</strong>
                      <p>{comment.text}</p>
                    </div>
                  ))}

                  {canManageTickets && (
                    <div className="comment-form">
                      <input
                        placeholder="Kommentar hinzufügen..."
                        value={commentInputs[ticket.id] || ""}
                        onChange={(event) =>
                          setCommentInputs({
                            ...commentInputs,
                            [ticket.id]: event.target.value,
                          })
                        }
                      />

                      <button onClick={() => addComment(ticket.id)}>
                        Kommentieren
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;