"""Canonical, hash-linked audit evidence. Tamper-evident, not immutable storage."""

import hashlib
import json

from src.sentinel.contracts import AuditEvent


def canonical(event: AuditEvent) -> str:
    data = event.model_dump(mode="json", exclude={"previous_audit_hash", "audit_hash"})
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def extend(event: AuditEvent, previous: str) -> AuditEvent:
    digest = hashlib.sha256((previous + canonical(event)).encode()).hexdigest()
    return event.model_copy(update={"previous_audit_hash": previous, "audit_hash": digest})


def verify(events: list[AuditEvent]) -> bool:
    previous = ""
    for event in events:
        blank = event.model_copy(update={"previous_audit_hash": "", "audit_hash": ""})
        if (
            event.previous_audit_hash != previous
            or extend(blank, previous).audit_hash != event.audit_hash
        ):
            return False
        previous = event.audit_hash
    return True
