
import { useCallback, useEffect, useState } from "react";
import { getMyExchanges } from "../../api/exchangeApi";
import { getExchangeSessions } from "../../api/exchangeSessionApi";
import ScheduleSessionModal from "./ScheduleSessionModal";
import "../../styles/My-Exchanges.css";

function MyExchanges() {
  const [exchanges, setExchanges] = useState([]);
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [scheduleExchange, setScheduleExchange] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadExchanges = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const data = await getMyExchanges();
      const exchangeList = data || [];

      setExchanges(exchangeList);

      const sessionResults = await Promise.all(
        exchangeList.map(async (exchange) => {
          try {
            const exchangeSessions = await getExchangeSessions(
              exchange.id
            );

            return {
              exchangeId: exchange.id,
              sessions: exchangeSessions || [],
            };
          } catch (err) {
            console.error(
              `Error loading sessions for exchange ${exchange.id}:`,
              err
            );

            return {
              exchangeId: exchange.id,
              sessions: [],
            };
          }
        })
      );

      const sessionMap = {};

      sessionResults.forEach(({ exchangeId, sessions }) => {
        sessionMap[exchangeId] = sessions;
      });

      setSessions(sessionMap);
    } catch (err) {
      console.error("Error loading exchanges:", err);

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
              "Failed to load exchanges."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadExchanges(true);

    // Refresh the page data to detect backend automatic completion.
    const refreshInterval = window.setInterval(() => {
      loadExchanges(false);
    }, 30000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, [loadExchanges]);

  const handleScheduleSuccess = (exchangeId, newSession) => {
    setSessions((previous) => ({
      ...previous,
      [exchangeId]: [
        ...(previous[exchangeId] || []),
        newSession,
      ],
    }));

    setSuccess("Session scheduled successfully.");
    setError("");

    // Fetch the saved state from the backend.
    loadExchanges(false);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const match = String(date).match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!match) return "—";

    const [, year, month, day] = match;

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthIndex = Number(month) - 1;

    if (monthIndex < 0 || monthIndex > 11) return "—";

    return `${day} ${months[monthIndex]} ${year}`;
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const match = String(date).match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
    );

    if (!match) return "—";

    const [, year, month, day, hour, minute] = match;
    const hourNumber = Number(hour);
    const monthIndex = Number(month) - 1;

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    if (
      monthIndex < 0 ||
      monthIndex > 11 ||
      hourNumber < 0 ||
      hourNumber > 23
    ) {
      return "—";
    }

    const period = hourNumber >= 12 ? "PM" : "AM";
    const displayHour = hourNumber % 12 || 12;

    return `${day} ${months[monthIndex]} ${year}, ${String(
      displayHour
    ).padStart(2, "0")}:${minute} ${period}`;
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const match = String(time).match(/^(\d{2}):(\d{2})/);

    if (!match) return "—";

    const [, hour, minute] = match;
    const hourNumber = Number(hour);
    const minuteNumber = Number(minute);

    if (
      hourNumber < 0 ||
      hourNumber > 23 ||
      minuteNumber < 0 ||
      minuteNumber > 59
    ) {
      return "—";
    }

    const period = hourNumber >= 12 ? "PM" : "AM";
    const displayHour = hourNumber % 12 || 12;

    return `${String(displayHour).padStart(2, "0")}:${minute} ${period}`;
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "ACTIVE":
        return "status-active";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getSessionStatusClasses = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "status-scheduled";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getCurrentUserRole = (exchange) => {
    const token = localStorage.getItem("token");

    if (!token) return "PARTICIPANT";

    try {
      const base64Payload = token.split(".")[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const payload = JSON.parse(atob(base64Payload));
      const username = payload.sub || payload.username || "";

      if (exchange.teacherUsername === username) {
        return "TEACHER";
      }

      if (exchange.learnerUsername === username) {
        return "LEARNER";
      }

      return "PARTICIPANT";
    } catch (err) {
      console.error("Unable to read token:", err);
      return "PARTICIPANT";
    }
  };

  const getSessionsForExchange = (exchangeId) =>
    sessions[exchangeId] || [];

  const getScheduledSession = (exchangeId) =>
    getSessionsForExchange(exchangeId).find(
      (session) => session.status === "SCHEDULED"
    );

  if (loading) {
    return (
      <div className="my-exchanges-page">
        <div className="exchange-loading">
          <div className="exchange-spinner" />
          <p>Loading your exchanges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-exchanges-page">
      <header className="exchanges-header">
        <h1>My Exchanges</h1>
        <p>
          Manage your active and completed skill learning exchanges.
        </p>
      </header>

      {success && (
        <div className="exchange-alert exchange-alert-success">
          {success}
        </div>
      )}

      {error && (
        <div className="exchange-alert exchange-alert-error">
          {error}
        </div>
      )}

      <section className="exchange-stats">
        <div className="exchange-stat-card">
          <p>Total Exchanges</p>
          <strong>{exchanges.length}</strong>
        </div>

        <div className="exchange-stat-card">
          <p>Active</p>
          <strong className="stat-blue">
            {
              exchanges.filter(
                (exchange) => exchange.status === "ACTIVE"
              ).length
            }
          </strong>
        </div>

        <div className="exchange-stat-card">
          <p>Completed</p>
          <strong className="stat-green">
            {
              exchanges.filter(
                (exchange) => exchange.status === "COMPLETED"
              ).length
            }
          </strong>
        </div>
      </section>

      {exchanges.length === 0 ? (
        <div className="exchange-empty">
          <div className="exchange-empty-icon">↔</div>
          <h2>No exchanges yet</h2>
          <p>
            Once an exchange request is accepted, your exchange
            will appear here.
          </p>
        </div>
      ) : (
        <div className="exchange-list">
          {exchanges.map((exchange) => {
            const currentRole = getCurrentUserRole(exchange);
            const exchangeSessions = getSessionsForExchange(
              exchange.id
            );
            const scheduledSession = getScheduledSession(
              exchange.id
            );

            return (
              <article
                key={exchange.id}
                className="exchange-card"
              >
                <div className="exchange-top">
                  <div>
                    <div className="exchange-title-row">
                      <h2>{exchange.skillName}</h2>

                      <span
                        className={`exchange-badge ${getStatusClasses(
                          exchange.status
                        )}`}
                      >
                        {exchange.status}
                      </span>

                      <span className="exchange-badge status-role">
                        {currentRole}
                      </span>
                    </div>

                    <p className="exchange-id">
                      Exchange #{exchange.id}
                    </p>
                  </div>

                  <div className="exchange-credit">
                    <p>Credits</p>
                    <strong>
                      {exchange.creditAmount ?? "5.00"}
                    </strong>
                  </div>
                </div>

                <div className="participants-grid">
                  <div className="participant-card">
                    <p className="section-label">Teacher</p>

                    <strong>
                      {exchange.teacherFirstName ||
                      exchange.teacherLastName
                        ? `${exchange.teacherFirstName || ""} ${
                            exchange.teacherLastName || ""
                          }`.trim()
                        : exchange.teacherUsername}
                    </strong>

                    <span>@{exchange.teacherUsername}</span>
                  </div>

                  <div className="participant-card">
                    <p className="section-label">Learner</p>

                    <strong>
                      {exchange.learnerFirstName ||
                      exchange.learnerLastName
                        ? `${exchange.learnerFirstName || ""} ${
                            exchange.learnerLastName || ""
                          }`.trim()
                        : exchange.learnerUsername}
                    </strong>

                    <span>@{exchange.learnerUsername}</span>
                  </div>
                </div>

                <div className="exchange-info-grid">
                  <div>
                    <p className="section-label">Started</p>
                    <span>
                      {formatDateTime(exchange.startedAt)}
                    </span>
                  </div>

                  <div>
                    <p className="section-label">Created</p>
                    <span>
                      {formatDateTime(exchange.createdAt)}
                    </span>
                  </div>

                  <div>
                    <p className="section-label">Completed</p>
                    <span>
                      {formatDateTime(exchange.completedAt)}
                    </span>
                  </div>

                  <div>
                    <p className="section-label">Last Updated</p>
                    <span>
                      {formatDateTime(exchange.updatedAt)}
                    </span>
                  </div>
                </div>

                <section className="sessions-section">
                  <div className="sessions-heading">
                    <div>
                      <h3>Learning Sessions</h3>
                      <p>
                        Sessions scheduled for this exchange.
                      </p>
                    </div>

                    {exchange.status === "ACTIVE" &&
                      currentRole === "TEACHER" &&
                      !scheduledSession && (
                        <button
                          type="button"
                          onClick={() =>
                            setScheduleExchange(exchange)
                          }
                          className="exchange-button button-blue"
                        >
                          Schedule Session
                        </button>
                      )}
                  </div>

                  {exchangeSessions.length === 0 ? (
                    <div className="no-sessions">
                      {exchange.status === "ACTIVE" &&
                      currentRole === "TEACHER" ? (
                        <>
                          <strong>No session scheduled yet.</strong>
                          <p>
                            Schedule a learning session for the learner.
                          </p>
                        </>
                      ) : exchange.status === "ACTIVE" &&
                        currentRole === "LEARNER" ? (
                        <>
                          <strong>No session scheduled yet.</strong>
                          <p>
                            Waiting for the teacher to schedule the
                            learning session.
                          </p>
                        </>
                      ) : (
                        <p>
                          No sessions were scheduled for this exchange.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="session-list">
                      {exchangeSessions.map((session) => (
                        <article
                          key={session.id}
                          className="session-card"
                        >
                          <div className="session-top">
                            <div className="session-title-row">
                              <h4>Session #{session.id}</h4>

                              <span
                                className={`exchange-badge ${getSessionStatusClasses(
                                  session.status
                                )}`}
                              >
                                {session.status}
                              </span>
                            </div>

                            <span className="meeting-platform">
                              {session.meetingPlatform}
                            </span>
                          </div>

                          <div className="session-info-grid">
                            <div>
                              <p className="section-label">Date</p>
                              <strong>
                                {formatDate(session.scheduledDate)}
                              </strong>
                            </div>

                            <div>
                              <p className="section-label">Time</p>
                              <strong>
                                {formatTime(session.startTime)}
                                {" - "}
                                {formatTime(session.endTime)}
                              </strong>
                            </div>

                            <div>
                              <p className="section-label">Duration</p>
                              <strong>
                                {session.durationMinutes} minutes
                              </strong>
                            </div>
                          </div>

                          <div className="meeting-section">
                            <p className="section-label">Meeting</p>

                            <div className="meeting-actions">
                              {session.meetingLink ? (
                                <>
                                  {session.status === "SCHEDULED" &&
                                  exchange.status === "ACTIVE" ? (
                                    <a
                                      href={session.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="exchange-button button-blue"
                                    >
                                      Join Meeting
                                    </a>
                                  ) : null}

                                  <span className="meeting-url">
                                    {session.meetingLink}
                                  </span>
                                </>
                              ) : (
                                <span className="muted-text">
                                  No meeting link provided.
                                </span>
                              )}
                            </div>
                          </div>

                          {session.notes && (
                            <div className="session-notes">
                              <p className="section-label">Notes</p>
                              <p>{session.notes}</p>
                            </div>
                          )}

                          <div className="session-created">
                            Scheduled on{" "}
                            <strong>
                              {formatDateTime(session.createdAt)}
                            </strong>
                          </div>

                          {session.status === "SCHEDULED" &&
                            exchange.status === "ACTIVE" && (
                              <div className="learner-notice">
                                This session will be completed
                                automatically after its
                                scheduled end time. Keep in mind that
                                the page refreshes periodically to show
                                updated statuses.
                              </div>
                            )}

                          {session.status === "COMPLETED" && (
                            <div className="exchange-bottom-notice completed-notice">
                              This session has been completed.
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}

                  {exchange.status === "ACTIVE" &&
                    currentRole === "LEARNER" &&
                    scheduledSession && (
                      <div className="learner-notice">
                        Your session is scheduled. Join using the
                        meeting link at the scheduled time. The backend
                        will automatically process completion after
                        the session ends.
                      </div>
                    )}
                </section>

                {exchange.status === "ACTIVE" && (
                  <div className="exchange-bottom-notice">
                    {scheduledSession
                      ? "This exchange is active. This will automatically complete it after the scheduled session ends."
                      : "This exchange is active. Once the teacher schedules a session, it can automatically complete the exchange after that session ends."}
                  </div>
                )}

                {exchange.status === "COMPLETED" && (
                  <div className="exchange-bottom-notice completed-notice">
                    This exchange has been successfully completed.
                    Credit transfer and notifications are handled by
                    the backend.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {scheduleExchange && (
        <ScheduleSessionModal
          exchange={scheduleExchange}
          onClose={() => setScheduleExchange(null)}
          onSuccess={(newSession) => {
            handleScheduleSuccess(
              scheduleExchange.id,
              newSession
            );
            setScheduleExchange(null);
          }}
        />
      )}
    </div>
  );
}

export default MyExchanges;
