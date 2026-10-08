"""Read-only investigation assistant over completed authoritative evidence."""
from src.sentinel.contracts import CopilotResponse, DecisionResult, RiskAssessment

ALLOWED = ("why", "which", "how unusual", "compare", "summarise", "summarize", "signals", "decision")
BLOCKED = ("ignore previous", "change", "approve", "hold", "threshold", "execute", "score")

def investigate(question: str, assessment: RiskAssessment, decision: DecisionResult) -> CopilotResponse:
    normalized = question.lower()
    if any(term in normalized for term in BLOCKED):
        answer = "This copilot is read-only. It cannot alter the authoritative score, confidence, thresholds, or decision. "
    elif not any(term in normalized for term in ALLOWED):
        answer = "Ask about the flag, signals, unusualness, decision, baseline comparison, or analyst case summary. "
    else:
        answer = ""
    signals = ", ".join(assessment.contributing_signals) or "no material anomaly signals"
    answer += (f"Authoritative assessment: {assessment.risk_level.value} risk ({assessment.final_risk_score:.2f}), "
               f"fraud probability {assessment.fraud_probability:.2f}, anomaly score {assessment.anomaly_score:.2f}, "
               f"confidence {assessment.confidence_score:.2f}. Signals: {signals}. "
               f"Policy decision: {decision.decision.value}; {decision.recommended_action}. "
               f"Reasoning: {assessment.reasoning}")
    return CopilotResponse(transaction_id=assessment.transaction_id, answer=answer, source="DETERMINISTIC_READ_ONLY_FALLBACK")
