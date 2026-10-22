"""Read-only investigation assistant over completed authoritative evidence."""

from src.sentinel.contracts import CopilotResponse, DecisionResult, RiskAssessment

ACTION_REQUESTS = (
    "ignore previous",
    "change the decision",
    "approve this transaction",
    "release this transaction",
    "set the score",
    "change the threshold",
    "execute the payment",
)


def classify_question(question: str) -> str:
    normalized = question.casefold()
    if any(term in normalized for term in ACTION_REQUESTS):
        return "read_only"
    if any(term in normalized for term in ("next step", "what can i do", "what should i do")):
        return "next_steps"
    if any(term in normalized for term in ("signal", "contribut", "made this high risk")):
        return "signals"
    if any(term in normalized for term in ("difference", "compare", "versus", " vs ")):
        return "compare"
    if any(term in normalized for term in ("why", "decision", "risk", "unusual", "hold")):
        return "assessment"
    return "unsupported"


def investigate(
    question: str, assessment: RiskAssessment, decision: DecisionResult
) -> CopilotResponse:
    intent = classify_question(question)
    if intent == "read_only":
        answer = (
            "This copilot is read-only. It cannot alter the authoritative "
            "score, confidence, thresholds, or decision. "
        )
    elif intent == "unsupported":
        answer = (
            "Ask about the flag, signals, unusualness, decision, "
            "baseline comparison, or analyst case summary. "
        )
    elif intent == "next_steps":
        answer = (
            "You can request additional verification or prepare a simulated support case. "
            "Both actions require confirmation and do not change the transaction. "
        )
    elif intent == "compare":
        answer = (
            "Approval would continue with residual risk; a hold routes the transaction "
            "to review. The recorded policy decision below remains authoritative. "
        )
    else:
        answer = ""
    signals = ", ".join(assessment.contributing_signals) or "no material anomaly signals"
    answer += (
        f"Authoritative assessment: {assessment.risk_level.value} risk"
        f" ({assessment.final_risk_score:.2f}),"
        f" fraud probability {assessment.fraud_probability:.2f},"
        f" anomaly score {assessment.anomaly_score:.2f},"
        f" confidence {assessment.confidence_score:.2f}. Signals: {signals}. "
        f"Policy decision: {decision.decision.value}; {decision.recommended_action}. "
        f"Reasoning: {assessment.reasoning}"
    )
    return CopilotResponse(
        transaction_id=assessment.transaction_id,
        answer=answer,
        source="DETERMINISTIC_READ_ONLY_FALLBACK",
    )
