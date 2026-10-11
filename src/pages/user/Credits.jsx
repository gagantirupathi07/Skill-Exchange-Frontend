import { useEffect, useState } from "react";
import {
  getCreditBalance,
  getCreditTransactions,
} from "../../api/creditApi";
import "../../styles/credits.css";

function Credits() {
  const [balance, setBalance] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadCreditData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        balanceData,
        transactionData,
      ] = await Promise.all([
        getCreditBalance(),
        getCreditTransactions(),
      ]);

      setBalance(balanceData);

      setTransactions(
        transactionData || []
      );
    } catch (err) {
      console.error(
        "Error loading credit data:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load credit information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreditData();
  }, []);

  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined
    ) {
      return "0.00";
    }

    return Number(amount).toFixed(2);
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getTransactionAmount = (
    transaction
  ) => {
    const amount =
      Number(transaction.amount) || 0;

    return transaction.type === "EARN"
      ? `+${amount.toFixed(2)}`
      : `-${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="credits-page">
        <div className="credits-loading-container">
          <p className="credits-loading-text">
            Loading your credits...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="credits-page">

      <div className="credits-header">
        <h1 className="credits-title">
          Credits
        </h1>

        <p className="credits-description">
          Manage your credit balance and view
          your complete transaction history.
        </p>
      </div>

      {error && (
        <div className="credits-error">
          {error}
        </div>
      )}

      <div className="credits-balance-card">

        <div className="credits-balance-header">

          <div className="credits-balance-content">

            <p className="credits-balance-label">
              Available Credit Balance
            </p>

            <div className="credits-balance-value-row">

              <span className="credits-balance-value">
                {formatAmount(
                  balance?.balance
                )}
              </span>

            </div>

            <p className="credits-balance-subtitle">
              Skill Exchange Credits
            </p>

          </div>

        </div>

        <div className="credits-wallet-info">

          <div className="credits-wallet-item">
            <p className="credits-wallet-label">
              Username
            </p>

            <p className="credits-wallet-value">
              {balance?.username || "—"}
            </p>
          </div>

          <div className="credits-wallet-item">
            <p className="credits-wallet-label">
              User ID
            </p>

            <p className="credits-wallet-value">
              #{balance?.userId || "—"}
            </p>
          </div>

          <div className="credits-wallet-item">
            <p className="credits-wallet-label">
              Wallet ID
            </p>

            <p className="credits-wallet-value">
              #{balance?.walletId || "—"}
            </p>
          </div>

        </div>

      </div>

      <div className="credits-history-header">

        <h2 className="credits-history-title">
          Credit History
        </h2>

        <p className="credits-history-description">
          Your recent credit earnings and spending.
        </p>

      </div>

      {transactions.length === 0 ? (

        <div className="credits-empty-card">

          <div className="credits-empty-icon">
            C
          </div>

          <h3 className="credits-empty-title">
            No transactions yet
          </h3>

          <p className="credits-empty-description">
            Your credit transactions will appear
            here when you earn or spend credits.
          </p>

        </div>

      ) : (

        <div className="credits-transaction-list">

          {transactions.map(
            (transaction, index) => (

              <div
                key={transaction.id}
                className={`credits-transaction ${
                  index !==
                  transactions.length - 1
                    ? "credits-transaction-border"
                    : ""
                }`}
              >

                <div className="credits-transaction-content">

                  <div className="credits-transaction-left">

                    <div
                      className={`credits-transaction-icon ${
                        transaction.type === "EARN"
                          ? "credits-earn-icon"
                          : "credits-spend-icon"
                      }`}
                    >
                      <span
                        className={`credits-transaction-icon-symbol ${
                          transaction.type === "EARN"
                            ? "credits-earn-symbol"
                            : "credits-spend-symbol"
                        }`}
                      >
                        {transaction.type ===
                        "EARN"
                          ? "+"
                          : "−"}
                      </span>
                    </div>

                    <div className="credits-transaction-details">

                      <div className="credits-transaction-title-row">

                        <h3 className="credits-transaction-title">
                          {transaction.type ===
                          "EARN"
                            ? "Credits Earned"
                            : "Credits Spent"}
                        </h3>

                        <span
                          className={`credits-transaction-type ${
                            transaction.type === "EARN"
                              ? "credits-earn-badge"
                              : "credits-spend-badge"
                          }`}
                        >
                          {transaction.type}
                        </span>

                      </div>

                      <p className="credits-transaction-description">
                        {transaction.description ||
                          "Credit transaction"}
                      </p>

                      <div className="credits-transaction-meta">

                        <span>
                          Exchange #
                          {transaction.exchangeId}
                        </span>

                        <span>
                          {formatDateTime(
                            transaction.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="credits-transaction-right">

                    <p
                      className={`credits-transaction-amount ${
                        transaction.type === "EARN"
                          ? "credits-earn-amount"
                          : "credits-spend-amount"
                      }`}
                    >
                      {getTransactionAmount(
                        transaction
                      )}
                    </p>

                    <p className="credits-balance-after">
                      Balance:{" "}
                      <span>
                        {formatAmount(
                          transaction.balanceAfter
                        )}
                      </span>
                    </p>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

export default Credits;