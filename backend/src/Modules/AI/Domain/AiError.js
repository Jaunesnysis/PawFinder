// DI sluoksnio klaidos. Turi status ir message, todėl esami sendError
// pagalbininkai maršrutuose jas apdoroja be pakeitimų.

class AiUnavailableError extends Error {
  constructor(detail) {
    super("DI paslauga šiuo metu nepasiekiama.");
    this.name = "AiUnavailableError";
    this.status = 503;
    this.detail = detail;
  }
}

class AiInvalidResponseError extends Error {
  constructor(detail) {
    super("DI grąžino netinkamą atsakymą.");
    this.name = "AiInvalidResponseError";
    this.status = 502;
    this.detail = detail;
  }
}

module.exports = { AiUnavailableError, AiInvalidResponseError };
