"""Structured logging configuration for ArthaMind backend."""

import logging
import sys

from src.config.settings import get_settings


def setup_logging() -> logging.Logger:
    """Configure and return the root application logger."""
    settings = get_settings()

    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Quieten noisy third-party loggers
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return logging.getLogger("arthamind")


logger: logging.Logger = setup_logging()


def get_logger(name: str) -> logging.Logger:
    """Return a child logger scoped to *name*."""
    return logging.getLogger(f"arthamind.{name}")
